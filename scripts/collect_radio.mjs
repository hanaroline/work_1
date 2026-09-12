#!/usr/bin/env node
// 보이는 라디오 — 채널 확인과 라이브 수집
//
// 브리핑 세션은 사내 이그레스 정책 때문에 유튜브·방송사·radio-browser 에 직접 붙지
// 못한다(radio-browser 는 CONNECT 단계에서 403 으로 막히는 것을 확인했다). GitHub
// 러너는 그 정책 밖에서 돌므로 여기서 대신 받아 저장소에 커밋하고, radio.html 은
// 커밋된 JSON 만 읽는다. scripts/fetch_market.py 와 같은 구조다.
//
// 하는 일
//   1. data/radio/curated.json 의 handles 후보로 유튜브 채널을 찾는다 (→ channelId)
//   2. 그 채널이 지금 라이브면 영상 ID 를 받아 온다
//   3. oEmbed 로 그 영상이 외부 사이트에서 재생 가능한지(embeddable) 확인한다
//   4. 공식 시청 주소가 살아 있는지 확인하고, 죽었으면 방송사 홈으로 내린다
//   5. data/radio/channels.json (채널) 과 data/radio/live.json (지금 라이브) 을 쓴다
//
// API 키를 쓰지 않는다. 공개 페이지를 채널당 한두 번 받아 오는 것이 전부이고,
// 할당량도 로그인도 없다. 유튜브 Data API 로 바꾸고 싶으면 resolveChannel() 과
// resolveLive() 두 함수만 갈아 끼우면 된다.
//
// 실행: node scripts/collect_radio.mjs [--channels-only] [--quiet]

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CURATED = resolve(ROOT, 'data/radio/curated.json')
const CHANNELS = resolve(ROOT, 'data/radio/channels.json')
const LIVE = resolve(ROOT, 'data/radio/live.json')
const STATIONS = resolve(ROOT, 'data/radio/stations.json')

const UA = 'Mozilla/5.0 (compatible; work1-radio/1.0; +https://github.com/hanaroline/work_1)'
const TIMEOUT = 15000
const args = new Set(process.argv.slice(2))
const QUIET = args.has('--quiet')

const log = (...m) => { if (!QUIET) console.log(...m) }

// 채널 확인은 하루에 한 번이면 충분하다. 라이브는 계속 바뀌므로 매번 받는다.
const CHANNEL_TTL_MS = 20 * 60 * 60 * 1000

async function get (url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.5',
        // 동의 페이지가 대신 오면 라이브 정보가 통째로 없다. 미리 넘긴다.
        'Cookie': 'SOCS=CAI; CONSENT=YES+1'
      }
    })
    return { ok: res.ok, status: res.status, url: res.url, text: res.ok ? await res.text() : '' }
  } catch (err) {
    return { ok: false, status: 0, url, text: '', error: String(err.message || err) }
  } finally {
    clearTimeout(timer)
  }
}

async function head (url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const res = await fetch(url, {
      method: 'GET', // HEAD 를 막아 둔 방송사 서버가 있어 GET 으로 확인한다
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA }
    })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

// ── 1. 채널 찾기 ───────────────────────────────────────────────────────────
// @handle 페이지에서 canonical 채널 주소와 channelId 를 뽑는다.
//
// handle 은 빈 이름을 아무나 선점할 수 있다. 첫 수집에서 @MBCradio 가 "테스트.",
// @CBSradio 가 "마이홈", @wbsi 가 "Maximilian Obenaus" 라는 개인 채널에 붙었다.
// 그래서 찾은 채널 이름이 방송사 이름을 담고 있는지 반드시 대조한다.
// 대조에 실패하면 다음 후보로 넘어가고, 전부 실패하면 영상 없이 공식 사이트로 간다.
// 엉뚱한 채널을 트는 것보다 영상이 없는 편이 낫다.
// 채널 "이름"만 본다. handle 은 지금 검증하려는 대상이므로 증거로 쓰면 안 된다.
// 2차 수집에서 @kbsnews 가 "byung joo lee", @jtbcnews 가 "자영업자", @natv 가
// "恩威TV" 인데도 handle 에 kbs·jtbc·natv 가 들어 있다는 이유로 통과했다.
// expect 는 넉넉한 약자(MBC)가 아니라 그 채널의 실제 이름에 가깝게 적는다 —
// @MBCNEWS 가 사우디 "MBC الأخبار" 였는데 expect 가 ["MBC"] 라 통과했다.
function titleMatches (title, expect) {
  if (!title) return false
  const hay = title.toLowerCase()
  return expect.some(word => hay.includes(String(word).toLowerCase()))
}

// 채널 번호(UC...)를 직접 적어 둔 경우. RSS 에 채널 이름이 들어 있으므로
// 그것으로 대조한다. handle 과 달리 번호는 남이 가로챌 수 없지만, 내가 잘못
// 적었을 수 있으니 확인은 똑같이 거친다.
async function resolveChannelById (channelId, expect) {
  const feed = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
  if (!feed.ok) {
    log(`   ✗ ${channelId} → RSS 실패 (status=${feed.status})`)
    return null
  }
  const m = feed.text.match(/<title>([^<]{1,120})<\/title>/)
  const title = m ? m[1] : null

  if (expect && expect.length && !titleMatches(title, expect)) {
    log(`   ✗ ${channelId} → "${title}" — 방송사 이름과 맞지 않아 버린다`)
    return null
  }
  log(`   ✓ ${channelId} → ${title}`)
  return { channelId, handle: null, title }
}

async function resolveChannel (handles, expect) {
  for (const handle of handles) {
    const clean = String(handle).replace(/^@/, '').trim()
    if (!clean) continue

    const res = await get(`https://www.youtube.com/@${encodeURIComponent(clean)}`)
    if (!res.ok) continue

    const byCanonical = res.text.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{20,})"/)
    const byMeta = res.text.match(/"channelId":"(UC[\w-]{20,})"/)
    const channelId = (byCanonical && byCanonical[1]) || (byMeta && byMeta[1])
    if (!channelId) continue

    const m = res.text.match(/<meta\s+property="og:title"\s+content="([^"]+)"/)
    const title = m ? m[1] : null

    if (expect && expect.length && !titleMatches(title, expect)) {
      log(`   ✗ @${clean} → "${title}" — 방송사 이름과 맞지 않아 버린다`)
      continue
    }

    log(`   ✓ @${clean} → ${channelId}${title ? ` (${title})` : ''}`)
    return { channelId, handle: clean, title }
  }
  return null
}

// ── 2. 지금 라이브인지 ─────────────────────────────────────────────────────
// /live 는 방송 중이면 watch 페이지로, 아니면 채널 페이지로 간다.
// 채널 RSS → 최근 영상 후보 → 임베드 페이지에서 생방송인지 확인.
//
// /live 페이지는 러너 IP 에 동의 페이지가 내려와 못 쓴다(로그로 확인). RSS 는
// 동의 페이지가 없고 키도 필요 없다. 임베드 페이지도 마찬가지다. 그래서 이 둘을
// 엮어 영상 ID 를 찾는다.
async function resolveLiveViaFeed (channelId) {
  const feed = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
  if (!feed.ok) {
    log(`   ! RSS 실패 (status=${feed.status})`)
    return null
  }

  const ids = [...feed.text.matchAll(/<yt:videoId>([\w-]{11})<\/yt:videoId>/g)].map(m => m[1])
  if (!ids.length) {
    log('   ! RSS 에 영상이 없다')
    return null
  }

  // 생방송은 대개 맨 앞에 온다. 앞쪽 몇 개만 본다.
  // (24시간 라이브는 RSS 에 아예 안 올라오는 일이 많다 — 그때는 /live 쪽이 맡는다)
  for (const id of ids.slice(0, 3)) {
    const emb = await get(`https://www.youtube.com/embed/${id}`)
    if (!emb.ok) continue
    const isLive = emb.text.includes('"isLive":true') ||
                   emb.text.includes('"isLiveNow":true') ||
                   emb.text.includes('hlsManifestUrl')
    if (!isLive) continue

    const t = emb.text.match(/"title":"([^"]{1,120})"/)
    log(`   ● RSS 로 찾음 ${id}`)
    return { videoId: id, title: t ? t[1] : null }
  }
  log(`   · RSS 앞 ${Math.min(4, ids.length)}개 중 생방송 없음`)
  return null
}

// 지금 보고 있는 영상의 번호를 고른다.
//
// canonical 이나 videoDetails 만 보다가 놓쳤다 — YTN·MBC 뉴스·SBS 뉴스·TV조선이
// '라이브 표시는 있는데 영상 id 를 못 찾았다' 로 떨어졌다. 열쇠 순서가 다르거나
// 페이지 모양이 조금만 달라도 빗나간다.
//
// 페이지에 나오는 모든 영상 번호를 세어 가장 많이 나온 것을 고른다. 지금 트는
// 영상은 페이지 곳곳에 되풀이되고, 추천 영상은 한두 번씩만 나온다.
function pickVideoId (html) {
  const exact = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)
  if (exact) return exact[1]

  const count = new Map()
  for (const m of html.matchAll(/"videoId":"([\w-]{11})"/g)) {
    count.set(m[1], (count.get(m[1]) || 0) + 1)
  }
  if (!count.size) return null

  let best = null, bestN = 0
  for (const [id, n] of count) {
    if (n > bestN) { best = id; bestN = n }
  }
  // 한 번밖에 안 나온 것은 추천 목록일 가능성이 크다
  return bestN >= 2 ? best : null
}

async function resolveLive (channelId) {
  const viaFeed = await resolveLiveViaFeed(channelId)
  if (viaFeed) return viaFeed

  const res = await get(`https://www.youtube.com/channel/${channelId}/live`)
  if (!res.ok) {
    log(`   ! /live 응답 실패 (status=${res.status}${res.error ? ' ' + res.error : ''})`)
    return null
  }

  // 진짜 생방송일 때만 받는다. 지난 방송의 다시보기를 라이브로 올리면 안 된다.
  const isLive = res.text.includes('"isLiveNow":true') ||
                 res.text.includes('"isLive":true') ||
                 res.text.includes('hlsManifestUrl')
  if (!isLive) {
    // 왜 아닌지 남긴다. 24시간 라이브를 도는 뉴스 채널까지 '라이브 아님' 으로
    // 나오면 응답 자체가 다른 판(동의 페이지·봇 차단)일 가능성이 크다.
    const looksLikePlayer = res.text.includes('"videoDetails"')
    const looksLikeConsent = res.text.includes('consent.youtube.com') || res.text.includes('CONSENT')
    log(`   · 라이브 아님 (길이=${res.text.length} 플레이어=${looksLikePlayer} 동의페이지=${looksLikeConsent})`)
    return null
  }

  // canonical 이 가장 정확하지만, 동의 페이지나 다른 판이 오면 없을 수 있다.
  // 그때는 videoDetails 의 videoId 를 쓴다 — 추천 영상 목록의 id 가 아니라
  // 지금 보고 있는 영상의 id 다.
  const videoId = pickVideoId(res.text)
  if (!videoId) {
    log(`   ! 라이브 표시는 있는데 영상 id 를 못 찾았다 (길이=${res.text.length})`)
    return null
  }

  const title = res.text.match(/<meta\s+name="title"\s+content="([^"]+)"/)
  return { videoId, title: title ? title[1] : null }
}

// ── 3. 외부 사이트에서 재생 가능한지 ────────────────────────────────────────
// 임베드를 막아 둔 영상은 oEmbed 가 401/403 을 돌려준다.
async function checkEmbeddable (videoId) {
  const res = await get(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
  )
  return res.ok
}

// ── 확인 2 ─────────────────────────────────────────────────────────────────
// 채널 ID 만으로 '지금 라이브' 를 띄우는 옛 임베드 주소가 아직 도는지 본다.
// 이게 되면 영상 ID 를 쫓아다닐 필요가 없어지고(수집 지연 문제도 사라진다),
// 단일 파일 판도 낡지 않는다. 판정만 하고 쓰지는 않는다 — 쓸지는 로그를 보고 정한다.
async function probeChannelEmbed (channelId, name) {
  const res = await get(`https://www.youtube.com/embed/live_stream?channel=${channelId}`)
  if (!res.ok) {
    log(`   [확인2] ${name}: 응답 실패 (status=${res.status})`)
    return false
  }
  const hasVideo = /"videoId":"([\w-]{11})"/.test(res.text)
  const unavailable = res.text.includes('UNPLAYABLE') || res.text.includes('ERROR')
  log(`   [확인2] ${name}: 영상있음=${hasVideo} 막힘=${unavailable} 길이=${res.text.length}`)
  return hasVideo && !unavailable
}

async function readJson (path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return fallback
  }
}

async function writeJson (path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

async function main () {
  const curated = await readJson(CURATED, null)
  if (!curated || !Array.isArray(curated.channels)) {
    console.error('data/radio/curated.json 을 읽지 못했다.')
    process.exit(1)
  }

  const previous = await readJson(CHANNELS, { channels: [] })
  const prevById = new Map((previous.channels || []).map(c => [c.id, c]))
  const now = Date.now()

  const channels = []
  const live = []

  for (const seed of curated.channels) {
    const prev = prevById.get(seed.id) || {}
    const out = {
      id: seed.id,
      name: seed.name,
      org: seed.org,
      freq: seed.freq || {},
      band: seed.band || 'radio',   // radio | tv
      kind: seed.kind || 'talk',
      official: { url: seed.official?.url || seed.official?.home || null, verified: false },
      youtube: { channelId: null, handle: null, verified: false, embeddable: null, checked: null }
    }

    log(`\n${seed.name}`)

    // 공식 시청 주소 — 죽었으면 방송사 홈으로 내린다
    if (seed.official?.url && await head(seed.official.url)) {
      out.official = { url: seed.official.url, verified: true }
      log(`   ✓ 공식 ${seed.official.url}`)
    } else if (seed.official?.home && await head(seed.official.home)) {
      out.official = { url: seed.official.home, verified: true, fallback: true }
      log(`   ◐ 공식 주소 실패 → 홈으로 ${seed.official.home}`)
    } else {
      out.official = { url: seed.official?.url || seed.official?.home || null, verified: false }
      log('   ✗ 공식 주소 확인 실패')
    }

    // 채널 ID — 이미 확인해 둔 게 있고 아직 싱싱하면 그대로 쓴다
    const prevYt = prev.youtube || {}
    const expect = (seed.youtube?.expect && seed.youtube.expect.length)
      ? seed.youtube.expect
      : [seed.org]
    // 캐시도 지금 기준으로 다시 판정한다. 그러지 않으면 예전 규칙으로 통과한
    // 엉뚱한 채널이 TTL 동안 그대로 살아남는다(실제로 그랬다). 판정은 이미
    // 받아 둔 이름으로 하므로 네트워크를 더 쓰지 않는다.
    const fresh = prevYt.verified && prevYt.checked &&
      (now - Date.parse(prevYt.checked) < CHANNEL_TTL_MS) &&
      titleMatches(prevYt.title, expect)

    if (fresh) {
      out.youtube = { ...prevYt }
      log(`   · 채널 확인 생략 (${prevYt.channelId})`)
    } else {
      // 채널 번호를 적어 둔 것이 있으면 그것부터 본다 (handle 보다 확실하다)
      let found = null
      for (const cid of (seed.youtube?.channelIds || [])) {
        found = await resolveChannelById(cid, expect)
        if (found) break
      }
      if (!found) found = await resolveChannel(seed.youtube?.handles || [], expect)
      if (found) {
        out.youtube = {
          channelId: found.channelId,
          handle: found.handle,
          title: found.title,
          verified: true,
          embeddable: prevYt.embeddable ?? null,
          checked: new Date().toISOString()
        }
      } else {
        out.youtube = { channelId: null, handle: null, verified: false, embeddable: null, checked: new Date().toISOString() }
        log('   ✗ 유튜브 채널을 찾지 못했다 — curated.json 의 handles 를 고쳐 넣으면 된다')
      }
    }

    channels.push(out)

    // 라이브
    if (args.has('--channels-only') || !out.youtube.channelId) continue

    const onAir = await resolveLive(out.youtube.channelId)

    // 24시간 라이브를 도는 뉴스 채널 몇 개로만 확인 2 를 돌린다.
    if (['ytn-tv', 'yonhap-tv', 'mbn-news', 'arirang-tv'].includes(out.id)) {
      await probeChannelEmbed(out.youtube.channelId, out.name)
    }

    if (!onAir) continue

    const embeddable = await checkEmbeddable(onAir.videoId)
    out.youtube.embeddable = embeddable
    log(`   ● 라이브 ${onAir.videoId}${embeddable ? '' : ' (임베드 막힘 → 공식 사이트로)'}`)

    if (!embeddable) continue

    live.push({
      channel: out.id,
      videoId: onAir.videoId,
      title: onAir.title,
      resolvedAt: new Date().toISOString()
    })
  }

  await writeJson(CHANNELS, { updated: new Date().toISOString(), channels })
  await writeJson(LIVE, { updated: new Date().toISOString(), live })

  const verified = channels.filter(c => c.youtube.verified).length
  log(`\n채널 ${channels.length}개 · 유튜브 확인 ${verified}개 · 지금 라이브 ${live.length}개`)

  // 공개 스트림 목록. 화면은 사용자 브라우저에서 직접 받지만, 단일 파일 판과
  // 외부 접속이 막힌 곳을 위해 러너도 한 벌 받아 둔다.
  const stations = await collectStations()
  if (stations.length) {
    await writeJson(STATIONS, { updated: new Date().toISOString(), stations })
    log(`공개 스트림 ${stations.length}개`)
  } else {
    log('공개 스트림 목록을 받지 못했다 — 기존 파일을 그대로 둔다')
  }
}

const RB_HOSTS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
  'https://all.api.radio-browser.info'
]

// 이름이 제각각이라 같은 방송국이 서너 개씩 올라와 있다.
// (KBS Classic FM · Clasico kbs · KBS_kor / KBS 1R · KBS 1Radio ...)
// 아는 낱말만 뽑아 정렬해 열쇠로 삼으면 표기가 흔들려도 같은 것으로 묶인다.
const NAME_TOKENS = [
  [/kbs|케이비에스/g, 'kbs'], [/mbc|엠비씨/g, 'mbc'], [/sbs|에스비에스/g, 'sbs'],
  [/cbs/g, 'cbs'], [/ebs/g, 'ebs'], [/ytn/g, 'ytn'], [/tbs/g, 'tbs'],
  [/gugak|국악/g, 'gugak'], [/obs/g, 'obs'],
  [/classic|클래식|clasico/g, 'classic'], [/cool|쿨/g, 'cool'],
  [/happy|해피/g, 'happy'], [/power|파워/g, 'power'], [/love|러브/g, 'love'],
  [/music|음악/g, 'music'], [/standard|표준/g, 'standard'],
  [/fm4u|fmforyou|fm4you/g, 'fm4u'],
  [/1radio|1r|제1라디오|1라디오/g, '1r'],
  [/2radio|2r|제2라디오|2라디오/g, '2r']
]

function canonicalName (name) {
  const flat = String(name).toLowerCase().replace(/[^0-9a-z가-힣]/g, '')
  const found = []
  for (const [re, tag] of NAME_TOKENS) {
    re.lastIndex = 0
    if (re.test(flat)) found.push(tag)
  }
  // 방송사 낱말이 하나도 없으면 이름 그대로를 열쇠로 쓴다(엉뚱하게 묶지 않는다)
  if (found.length < 2) return flat
  return found.sort().join('-')
}

// 정말 소리가 나오는지 직접 틀어 본다. hidebroken 을 걸어도 죽은 주소가 남는다.
async function checkStream (url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA, 'Range': 'bytes=0-2048', 'Icy-MetaData': '1' }
    })
    if (!res.ok && res.status !== 206) return false

    const type = String(res.headers.get('content-type') || '').toLowerCase()
    const soundy = type.startsWith('audio/') || type.includes('mpegurl') ||
                   type.includes('ogg') || type.includes('octet-stream')
    if (!soundy) return false

    // 머리만 받고 정말 바이트가 오는지 본다
    const reader = res.body && res.body.getReader ? res.body.getReader() : null
    if (!reader) return true
    const first = await reader.read()
    try { await reader.cancel() } catch { }
    return !!(first && first.value && first.value.length > 0)
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function collectStations () {
  for (const host of RB_HOSTS) {
    const res = await get(`${host}/json/stations/bycountrycodeexact/KR?hidebroken=true&order=votes&reverse=true&limit=400`)
    if (!res.ok) continue
    let rows
    try { rows = JSON.parse(res.text) } catch { continue }
    if (!Array.isArray(rows)) continue

    const mapped = rows
      .map(s => ({
        id: s.stationuuid,
        name: (s.name || '').trim() || '이름 없음',
        url: s.url_resolved || s.url || '',
        codec: s.codec || '',
        bitrate: s.bitrate || 0,
        tags: String(s.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 6),
        homepage: s.homepage || ''
      }))
      // https 페이지에서 http 스트림은 브라우저가 막는다. 처음부터 뺀다.
      .filter(s => s.url.startsWith('https://'))

    // 같은 방송국끼리 묶고, 비트레이트가 높은 쪽을 대표로 세운다.
    const groups = new Map()
    for (const s of mapped) {
      const k = canonicalName(s.name)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k).push(s)
    }
    for (const list of groups.values()) {
      list.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
    }
    log(`공개 스트림 ${mapped.length}개 → ${groups.size}개로 묶음. 실제로 틀어 본다…`)

    // 묶음마다 위에서부터 틀어 보고, 처음으로 소리가 나오는 것 하나만 남긴다.
    // 한 방송국이 주소를 여러 개 올려 둔 이유가 바로 이것이다 — 하나는 살아 있다.
    const alive = []
    let tried = 0
    for (const [k, list] of groups) {
      for (const s of list.slice(0, 3)) {
        tried++
        if (await checkStream(s.url)) { alive.push(s); break }
      }
    }
    log(`   ${tried}개 시험 → ${alive.length}개가 소리를 냈다`)
    return alive
  }
  return []
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
