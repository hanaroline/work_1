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
async function resolveLive (channelId) {
  const res = await get(`https://www.youtube.com/channel/${channelId}/live`)
  if (!res.ok) return null

  // 진짜 생방송일 때만 받는다. 지난 방송의 다시보기를 라이브로 올리면 안 된다.
  const isLive = res.text.includes('"isLiveNow":true') ||
                 res.text.includes('"isLive":true') ||
                 res.text.includes('hlsManifestUrl')
  if (!isLive) return null

  // canonical 이 가장 정확하지만, 동의 페이지나 다른 판이 오면 없을 수 있다.
  // 그때는 videoDetails 의 videoId 를 쓴다 — 추천 영상 목록의 id 가 아니라
  // 지금 보고 있는 영상의 id 다.
  const canonical = res.text.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)
  const details = res.text.match(/"videoDetails":\s*\{"videoId":"([\w-]{11})"/)
  const videoId = (canonical && canonical[1]) || (details && details[1])
  if (!videoId) return null

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
      const found = await resolveChannel(seed.youtube?.handles || [], expect)
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
    if (!onAir) {
      log('   · 지금은 라이브 아님')
      continue
    }

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

async function collectStations () {
  for (const host of RB_HOSTS) {
    const res = await get(`${host}/json/stations/bycountrycodeexact/KR?hidebroken=true&order=votes&reverse=true&limit=400`)
    if (!res.ok) continue
    let rows
    try { rows = JSON.parse(res.text) } catch { continue }
    if (!Array.isArray(rows)) continue

    return rows
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
  }
  return []
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
