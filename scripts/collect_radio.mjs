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
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.5'
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
async function resolveChannel (handles) {
  for (const handle of handles) {
    const clean = String(handle).replace(/^@/, '').trim()
    if (!clean) continue

    const res = await get(`https://www.youtube.com/@${encodeURIComponent(clean)}`)
    if (!res.ok) continue

    const byCanonical = res.text.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{20,})"/)
    const byMeta = res.text.match(/"channelId":"(UC[\w-]{20,})"/)
    const channelId = (byCanonical && byCanonical[1]) || (byMeta && byMeta[1])
    if (!channelId) continue

    const title = res.text.match(/<meta\s+property="og:title"\s+content="([^"]+)"/)
    log(`   ✓ @${clean} → ${channelId}${title ? ` (${title[1]})` : ''}`)
    return { channelId, handle: clean, title: title ? title[1] : null }
  }
  return null
}

// ── 2. 지금 라이브인지 ─────────────────────────────────────────────────────
// /live 는 방송 중이면 watch 페이지로, 아니면 채널 페이지로 간다.
async function resolveLive (channelId) {
  const res = await get(`https://www.youtube.com/channel/${channelId}/live`)
  if (!res.ok) return null

  const canonical = res.text.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)
  if (!canonical) return null

  // canonical 만으로는 지난 방송의 다시보기일 수 있다. 진짜 생방송인지 본다.
  const isLive = res.text.includes('"isLiveNow":true') ||
                 res.text.includes('"isLive":true') ||
                 res.text.includes('hlsManifestUrl')
  if (!isLive) return null

  const title = res.text.match(/<meta\s+name="title"\s+content="([^"]+)"/)
  return { videoId: canonical[1], title: title ? title[1] : null }
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
    const fresh = prevYt.verified && prevYt.checked && (now - Date.parse(prevYt.checked) < CHANNEL_TTL_MS)

    if (fresh) {
      out.youtube = { ...prevYt }
      log(`   · 채널 확인 생략 (${prevYt.channelId})`)
    } else {
      const found = await resolveChannel(seed.youtube?.handles || [])
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
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
