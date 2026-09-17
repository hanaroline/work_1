/*
 * signal_engine.js — scripts/signal_lib.py 의 **거울**
 * ====================================================
 *
 * 왜 같은 것을 두 벌 만드는가.
 *
 * 지수·KR100·US100 은 서버(GitHub Actions)가 미리 셈해 data/signals/latest.json 에
 * 담아 둔다. 화면은 그것을 옮겨 찍기만 한다 — 변동성 화면이 세운 규율이고, 그래야
 * 검산 대본이 대조할 자리가 남는다.
 *
 * 그런데 **임의 종목**은 서버에 자료가 없다. 브라우저가 네이버·야후에서 일봉을
 * 받아 그 자리에서 셈하는 수밖에 없다. 그래서 파이썬과 같은 셈을 하는 JS 가 필요하다.
 *
 * 두 벌이 되면 언젠가 갈라진다. 갈라지면 화면과 백테스트가 서로 다른 신호를 내는데,
 * 그건 둘 중 하나가 틀린 것보다 나쁘다 — 어느 쪽이 맞는지 알 수 없기 때문이다.
 * 그래서 scripts/make_signal_golden.py 가 파이썬으로 기준값을 뽑아 두고,
 * scripts/check_signal_page.mjs 가 이 파일을 헤드리스 브라우저에서 돌려 그 기준값과
 * 맞는지 본다. 어긋나면 CI 가 멈춘다.
 *
 * **여기를 고치면 파이썬도 같이 고쳐야 한다.** 그 반대도 같다.
 */
(function (global) {
  'use strict';

  var E = {};

  // ── 기본 통계 ────────────────────────────────────────────────────
  function sma(xs, n) {
    var out = new Array(xs.length).fill(null), s = 0, i;
    for (i = 0; i < xs.length; i++) {
      if (xs[i] == null) { s = 0; continue; }
      s += xs[i];
      if (i >= n) s -= xs[i - n];
      if (i >= n - 1) out[i] = s / n;
    }
    return out;
  }

  function ema(xs, n) {
    var out = new Array(xs.length).fill(null), k = 2 / (n + 1), e = null, i, seed = 0;
    for (i = 0; i < xs.length; i++) {
      if (i < n - 1) { seed += xs[i]; continue; }
      if (e === null) { seed += xs[i]; e = seed / n; }
      else e = xs[i] * k + e * (1 - k);
      out[i] = e;
    }
    return out;
  }

  // **표본표준편차(ddof=1).** 교과서 볼린저는 모표준편차를 쓰지만 이 저장소는
  // vol_lib.rolling_std 에서 ÷(n−1) 로 두었다. 두 모델이 같은 밴드를 써야 하므로
  // 여기서도 그대로 따른다. (verify_signals.py 의 v_boll 주석 참고)
  function stdev(w) {
    if (w.length < 2) return 0;
    var m = 0, i;
    for (i = 0; i < w.length; i++) m += w[i];
    m /= w.length;
    var v = 0;
    for (i = 0; i < w.length; i++) v += (w[i] - m) * (w[i] - m);
    return Math.sqrt(v / (w.length - 1));
  }

  function rollingStd(xs, n) {
    var out = new Array(xs.length).fill(null), i;
    for (i = n - 1; i < xs.length; i++) out[i] = stdev(xs.slice(i - n + 1, i + 1));
    return out;
  }

  E.sma = sma; E.ema = ema; E.stdev = stdev;

  // ── 지표 ─────────────────────────────────────────────────────────
  function rsi(c, n) {
    n = n || 14;
    var out = new Array(c.length).fill(null);
    if (c.length < n + 1) return out;
    var g = [], l = [], i;
    for (i = 1; i < c.length; i++) {
      g.push(Math.max(0, c[i] - c[i - 1]));
      l.push(Math.max(0, c[i - 1] - c[i]));
    }
    var ag = 0, al = 0;
    for (i = 0; i < n; i++) { ag += g[i]; al += l[i]; }
    ag /= n; al /= n;
    out[n] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (i = n; i < g.length; i++) {
      ag = (ag * (n - 1) + g[i]) / n;
      al = (al * (n - 1) + l[i]) / n;
      out[i + 1] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
  }

  function macd(c, fast, slow, sig) {
    fast = fast || 12; slow = slow || 26; sig = sig || 9;
    var ef = ema(c, fast), es = ema(c, slow), i;
    var line = c.map(function (_, i) {
      return (ef[i] != null && es[i] != null) ? ef[i] - es[i] : null;
    });
    var dense = [], idx = [];
    for (i = 0; i < line.length; i++) if (line[i] != null) { dense.push(line[i]); idx.push(i); }
    var se = ema(dense, sig);
    var signal = new Array(c.length).fill(null);
    for (i = 0; i < idx.length; i++) signal[idx[i]] = se[i];
    var hist = c.map(function (_, i) {
      return (line[i] != null && signal[i] != null) ? line[i] - signal[i] : null;
    });
    return { line: line, signal: signal, hist: hist };
  }

  function bollinger(c, n, k) {
    n = n || 20; k = k || 2;
    var mid = sma(c, n), sd = rollingStd(c, n);
    var up = [], lo = [], bw = [], pb = [], i;
    for (i = 0; i < c.length; i++) {
      if (mid[i] == null || sd[i] == null) { up.push(null); lo.push(null); bw.push(null); pb.push(null); continue; }
      var u = mid[i] + k * sd[i], l = mid[i] - k * sd[i];
      up.push(u); lo.push(l);
      bw.push(mid[i] ? (u - l) / mid[i] * 100 : null);
      pb.push(u !== l ? (c[i] - l) / (u - l) : null);
    }
    return { mid: mid, up: up, lo: lo, bw: bw, pctb: pb };
  }

  function trueRange(o, h, l, c) {
    var out = [null], i;
    for (i = 1; i < c.length; i++) {
      out.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])));
    }
    return out;
  }

  function atr(o, h, l, c, n) {
    n = n || 14;
    var tr = trueRange(o, h, l, c), out = new Array(c.length).fill(null), i, a = null, s = 0, cnt = 0;
    for (i = 1; i < c.length; i++) {
      if (a === null) {
        s += tr[i]; cnt++;
        if (cnt === n) { a = s / n; out[i] = a; }
      } else { a = (a * (n - 1) + tr[i]) / n; out[i] = a; }
    }
    return out;
  }

  function keltner(o, h, l, c, n, mult) {
    n = n || 20; mult = mult == null ? 1.5 : mult;
    var mid = ema(c, n), a = atr(o, h, l, c, n), i;
    var up = [], lo = [];
    for (i = 0; i < c.length; i++) {
      if (mid[i] == null || a[i] == null) { up.push(null); lo.push(null); }
      else { up.push(mid[i] + mult * a[i]); lo.push(mid[i] - mult * a[i]); }
    }
    return { mid: mid, up: up, lo: lo };
  }

  function realizedVol(c, n, ann) {
    ann = ann || 252;
    var out = new Array(c.length).fill(null), r = [null], i;
    for (i = 1; i < c.length; i++) r.push((c[i] > 0 && c[i - 1] > 0) ? Math.log(c[i] / c[i - 1]) : null);
    for (i = n; i < c.length; i++) {
      var w = r.slice(i - n + 1, i + 1);
      if (w.some(function (x) { return x == null; })) continue;
      out[i] = stdev(w) * Math.sqrt(ann) * 100;
    }
    return out;
  }

  function adx(o, h, l, c, n) {
    n = n || 14;
    var N = c.length, tr = trueRange(o, h, l, c);
    var pdm = new Array(N).fill(null), ndm = new Array(N).fill(null), i;
    for (i = 1; i < N; i++) {
      var up = h[i] - h[i - 1], dn = l[i - 1] - l[i];
      pdm[i] = (up > dn && up > 0) ? up : 0;
      ndm[i] = (dn > up && dn > 0) ? dn : 0;
    }
    function wilder(xs) {
      var out = new Array(N).fill(null), acc = null, j;
      for (j = 0; j < N; j++) {
        if (xs[j] == null) continue;
        if (acc === null) {
          var seed = xs.slice(Math.max(0, j - n + 1), j + 1).filter(function (v) { return v != null; });
          if (seed.length < n) continue;
          acc = seed.reduce(function (a, b) { return a + b; }, 0);
        } else acc = acc - acc / n + xs[j];
        out[j] = acc;
      }
      return out;
    }
    var str = wilder(tr), sp = wilder(pdm), sn = wilder(ndm);
    var pdi = new Array(N).fill(null), ndi = new Array(N).fill(null), dx = new Array(N).fill(null);
    for (i = 0; i < N; i++) {
      if (str[i] && sp[i] != null && sn[i] != null) {
        pdi[i] = sp[i] / str[i] * 100;
        ndi[i] = sn[i] / str[i] * 100;
        var s = pdi[i] + ndi[i];
        dx[i] = s ? Math.abs(pdi[i] - ndi[i]) / s * 100 : 0;
      }
    }
    var out = new Array(N).fill(null), acc = null;
    for (i = 0; i < N; i++) {
      if (dx[i] == null) continue;
      if (acc === null) {
        var seed = dx.slice(Math.max(0, i - n + 1), i + 1).filter(function (v) { return v != null; });
        if (seed.length < n) continue;
        acc = seed.reduce(function (a, b) { return a + b; }, 0) / n;
      } else acc = (acc * (n - 1) + dx[i]) / n;
      out[i] = acc;
    }
    return { adx: out, pdi: pdi, ndi: ndi };
  }

  function mfi(h, l, c, v, n) {
    n = n || 14;
    var out = new Array(c.length).fill(null), tp = [], i, j;
    for (i = 0; i < c.length; i++) tp.push((h[i] + l[i] + c[i]) / 3);
    for (i = n; i < c.length; i++) {
      var pos = 0, neg = 0;
      for (j = i - n + 1; j <= i; j++) {
        var raw = tp[j] * (v[j] || 0);
        if (tp[j] > tp[j - 1]) pos += raw;
        else if (tp[j] < tp[j - 1]) neg += raw;
      }
      out[i] = (pos + neg <= 0) ? 50 : pos / (pos + neg) * 100;
    }
    return out;
  }

  function stochastic(h, l, c, n, d) {
    n = n || 14; d = d || 3;
    var k = new Array(c.length).fill(null), i;
    for (i = n - 1; i < c.length; i++) {
      var hh = Math.max.apply(null, h.slice(i - n + 1, i + 1));
      var ll = Math.min.apply(null, l.slice(i - n + 1, i + 1));
      k[i] = hh === ll ? 50 : (c[i] - ll) / (hh - ll) * 100;
    }
    var dd = new Array(c.length).fill(null);
    for (i = 0; i < c.length; i++) {
      var w = k.slice(Math.max(0, i - d + 1), i + 1);
      if (w.length === d && w.every(function (x) { return x != null; })) {
        dd[i] = w.reduce(function (a, b) { return a + b; }, 0) / d;
      }
    }
    return { k: k, d: dd };
  }

  function obv(c, v) {
    var out = new Array(c.length).fill(null), acc = 0, i;
    if (!c.length) return out;
    out[0] = 0;
    for (i = 1; i < c.length; i++) {
      var vv = v[i] || 0;
      if (c[i] > c[i - 1]) acc += vv;
      else if (c[i] < c[i - 1]) acc -= vv;
      out[i] = acc;
    }
    return out;
  }

  E.rsi = rsi; E.macd = macd; E.bollinger = bollinger; E.atr = atr;
  E.realizedVol = realizedVol; E.adx = adx; E.mfi = mfi;
  E.stochastic = stochastic; E.obv = obv; E.keltner = keltner;

  // ── 백분위·z ─────────────────────────────────────────────────────
  function pctRank(series, i, window, minObs) {
    window = window || 252; minObs = minObs == null ? 60 : minObs;
    var v = series[i];
    if (v == null) return null;
    var w = series.slice(Math.max(0, i - window + 1), i + 1).filter(function (x) { return x != null; });
    if (w.length < minObs) return null;
    var below = 0, ties = 0, j;
    for (j = 0; j < w.length; j++) { if (w[j] < v) below++; else if (w[j] === v) ties++; }
    return (below + 0.5 * ties) / w.length * 100;
  }

  function zscore(series, i, window, minObs) {
    window = window || 60; minObs = minObs == null ? 20 : minObs;
    var v = series[i];
    if (v == null) return null;
    var w = series.slice(Math.max(0, i - window + 1), i + 1).filter(function (x) { return x != null; });
    if (w.length < minObs) return null;
    var m = w.reduce(function (a, b) { return a + b; }, 0) / w.length;
    var s = stdev(w);
    return s ? (v - m) / s : 0;
  }

  function symRank(series, i, window, minObs) {
    var p = pctRank(series, i, window, minObs);
    return p == null ? null : (p - 50) * 2;
  }

  function mean(vals) {
    var xs = vals.filter(function (x) { return x != null; });
    if (!xs.length) return null;
    return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  }

  E.pctRank = pctRank; E.zscore = zscore; E.symRank = symRank;

  // ── 매물대 ───────────────────────────────────────────────────────
  var VP_LOOKBACK = 120, VP_BINS = 24;

  function volumeProfile(bars, i, lookback, bins) {
    lookback = lookback || VP_LOOKBACK; bins = bins || VP_BINS;
    var loI = Math.max(0, i - lookback + 1), seg = bars.slice(loI, i + 1);
    if (seg.length < 20) return null;
    var lo = Math.min.apply(null, seg.map(function (b) { return b.l; }));
    var hi = Math.max.apply(null, seg.map(function (b) { return b.h; }));
    if (!(hi > lo)) return null;
    var width = (hi - lo) / bins, buckets = new Array(bins).fill(0), j, k;
    for (j = 0; j < seg.length; j++) {
      var b = seg[j], bl = b.l, bh = b.h;
      var val = (b.v || 0) * ((bh + bl) / 2);
      if (val <= 0) continue;
      if (bh <= bl) { buckets[Math.min(bins - 1, Math.max(0, Math.floor((bl - lo) / width)))] += val; continue; }
      var k0 = Math.min(bins - 1, Math.max(0, Math.floor((bl - lo) / width)));
      var k1 = Math.min(bins - 1, Math.max(0, Math.floor((bh - lo) / width)));
      var span = bh - bl;
      for (k = k0; k <= k1; k++) {
        var klo = lo + k * width, khi = klo + width;
        var ov = Math.min(bh, khi) - Math.max(bl, klo);
        if (ov > 0) buckets[k] += val * (ov / span);
      }
    }
    var total = buckets.reduce(function (a, b) { return a + b; }, 0);
    if (total <= 0) return null;
    return { lo: lo, hi: hi, bins: bins, width: width, buckets: buckets,
             total: total, sessions: seg.length };
  }

  function vpAt(vb, close) {
    if (!vb) return null;
    var bins = vb.bins, width = vb.width, lo = vb.lo, buckets = vb.buckets, total = vb.total, k;
    var pocK = 0;
    for (k = 1; k < bins; k++) if (buckets[k] > buckets[pocK]) pocK = k;
    var poc = lo + (pocK + 0.5) * width;

    var taken = {}, acc = buckets[pocK];
    taken[pocK] = true;
    while (acc < total * 0.70) {
      var best = -1;
      for (k = 0; k < bins; k++) if (!taken[k] && (best < 0 || buckets[k] > buckets[best])) best = k;
      if (best < 0) break;
      taken[best] = true; acc += buckets[best];
    }
    var ks = Object.keys(taken).map(Number);
    var val = lo + Math.min.apply(null, ks) * width;
    var vah = lo + (Math.max.apply(null, ks) + 1) * width;

    var above = 0, below = 0;
    for (k = 0; k < bins; k++) {
      var klo = lo + k * width, khi = klo + width;
      if (khi <= close) below += buckets[k];
      else if (klo >= close) above += buckets[k];
      else { var f = (close - klo) / width; below += buckets[k] * f; above += buckets[k] * (1 - f); }
    }
    var nUp = null, nDn = null;
    for (k = 0; k < bins; k++) {
      var mid = lo + (k + 0.5) * width;
      if (mid > close && (nUp === null || buckets[k] > buckets[nUp])) nUp = k;
      if (mid < close && (nDn === null || buckets[k] > buckets[nDn])) nDn = k;
    }
    return {
      lo: lo, hi: vb.hi, bins: bins, width: width, buckets: buckets, total: total,
      poc: poc, val: val, vah: vah,
      above_pct: above / total * 100, below_pct: below / total * 100,
      nearest_up: nUp === null ? null : lo + (nUp + 0.5) * width,
      nearest_dn: nDn === null ? null : lo + (nDn + 0.5) * width,
      sessions: vb.sessions
    };
  }

  E.volumeProfile = volumeProfile; E.vpAt = vpAt;

  // ── 지표 묶음 ────────────────────────────────────────────────────
  E.computeIndicators = function (bars, benchClose) {
    var o = bars.map(function (b) { return b.o; });
    var h = bars.map(function (b) { return b.h; });
    var l = bars.map(function (b) { return b.l; });
    var c = bars.map(function (b) { return b.c; });
    var v = bars.map(function (b) { return b.v; });
    var n = c.length, i;

    var bb = bollinger(c, 20, 2), kc = keltner(o, h, l, c, 20, 1.5), m = macd(c);
    var a14 = atr(o, h, l, c, 14), ax = adx(o, h, l, c, 14), stk = stochastic(h, l, c, 14, 3);

    var sq = [], sqd = [], run = 0;
    for (i = 0; i < n; i++) {
      var on = (bb.up[i] != null && kc.up[i] != null) ? (bb.up[i] < kc.up[i] && bb.lo[i] > kc.lo[i]) : null;
      sq.push(on);
      if (on === null) { sqd.push(null); run = 0; }
      else { run = on ? run + 1 : 0; sqd.push(run); }
    }
    // NR7 — 오늘 일중 변동폭이 이레 가운데 가장 좁은가. 압축 축이 쓴다.
    var rng = [], nr7 = new Array(n).fill(null);
    for (i = 0; i < n; i++) rng.push(h[i] - l[i]);
    for (i = 6; i < n; i++) nr7[i] = rng[i] === Math.min.apply(null, rng.slice(i - 6, i + 1));

    var ind = {
      close: c, open: o, high: h, low: l, volume: v,
      ma5: sma(c, 5), ma20: sma(c, 20), ma60: sma(c, 60), ma120: sma(c, 120),
      bb_mid: bb.mid, bb_up: bb.up, bb_lo: bb.lo, bbw: bb.bw, pctb: bb.pctb,
      kc_up: kc.up, kc_lo: kc.lo, squeeze: sq, squeeze_days: sqd,
      macd: m.line, macd_signal: m.signal, macd_hist: m.hist,
      rsi14: rsi(c, 14), atr14: a14,
      rv5: realizedVol(c, 5), rv20: realizedVol(c, 20), rv60: realizedVol(c, 60),
      adx14: ax.adx, plus_di: ax.pdi, minus_di: ax.ndi,
      stoch_k: stk.k, stoch_d: stk.d,
      mfi14: mfi(h, l, c, v, 14), obv: obv(c, v), nr7: nr7
    };
    ind.atrp = c.map(function (x, i) { return (a14[i] != null && x) ? a14[i] / x * 100 : null; });
    ind.rv_ratio = c.map(function (_, i) {
      return (ind.rv5[i] != null && ind.rv20[i]) ? ind.rv5[i] / ind.rv20[i] : null;
    });
    ind.disparity20 = c.map(function (x, i) { return ind.ma20[i] ? x / ind.ma20[i] * 100 - 100 : null; });
    ind.disparity60 = c.map(function (x, i) { return ind.ma60[i] ? x / ind.ma60[i] * 100 - 100 : null; });

    ind.ma20_slope = new Array(n).fill(null);
    for (i = 5; i < n; i++) {
      if (ind.ma20[i] != null && ind.ma20[i - 5]) ind.ma20_slope[i] = (ind.ma20[i] / ind.ma20[i - 5] - 1) * 100;
    }
    ind.ret5 = new Array(n).fill(null);
    for (i = 5; i < n; i++) ind.ret5[i] = (c[i] / c[i - 5] - 1) * 100;
    ind.ret20 = new Array(n).fill(null);
    for (i = 20; i < n; i++) ind.ret20[i] = (c[i] / c[i - 20] - 1) * 100;

    ind.obv_slope20 = new Array(n).fill(null);
    for (i = 20; i < n; i++) {
      if (ind.obv[i] != null && ind.obv[i - 20] != null) {
        var w = v.slice(Math.max(0, i - 20), i + 1).map(function (x) { return Math.abs(x || 0); });
        var base = w.reduce(function (a, b) { return a + b; }, 0) / w.length || 1;
        ind.obv_slope20[i] = (ind.obv[i] - ind.obv[i - 20]) / (base * 20);
      }
    }
    ind.pos52 = new Array(n).fill(null);
    for (i = 0; i < n; i++) {
      var loI = Math.max(0, i - 251);
      if (i - loI < 60) continue;
      var hh = Math.max.apply(null, h.slice(loI, i + 1));
      var ll = Math.min.apply(null, l.slice(loI, i + 1));
      ind.pos52[i] = hh === ll ? 50 : (c[i] - ll) / (hh - ll) * 100;
    }
    ind.rs20 = new Array(n).fill(null);
    if (benchClose) {
      for (i = 20; i < Math.min(n, benchClose.length); i++) {
        if (c[i - 20] && benchClose[i - 20] && benchClose[i]) {
          ind.rs20[i] = ((c[i] / c[i - 20]) - (benchClose[i] / benchClose[i - 20])) * 100;
        }
      }
    }
    return ind;
  };

  // ── 축 ───────────────────────────────────────────────────────────
  function trendTilt(ind, i) {
    var a = ind.adx14[i];
    if (a == null) return null;
    return Math.max(-1, Math.min(1, (a - 25) / 5));
  }

  function axisTrend(ind, i) {
    var parts = {}, c = ind.close[i], ma20 = ind.ma20[i], ma60 = ind.ma60[i];
    if (c && ma20 && ma60) {
      var up = (c > ma20 ? 1 : -1) + (ma20 > ma60 ? 1 : -1) + (c > ma60 ? 1 : -1);
      parts.align = up / 3 * 100;
    }
    if (ind.macd_hist[i] != null) parts.macd_hist = symRank(ind.macd_hist, i);
    if (ind.ma20_slope[i] != null) parts.ma20_slope = symRank(ind.ma20_slope, i);
    if (ind.disparity60[i] != null) parts.disparity60 = symRank(ind.disparity60, i);
    var a = ind.adx14[i], p = ind.plus_di[i], m = ind.minus_di[i];
    if (a != null && p != null && m != null) {
      var s = p + m, d = s ? (p - m) / s : 0;
      parts.di = d * Math.min(1, a / 40) * 100;
    }
    if (ind.rs20[i] != null) parts.rs20 = symRank(ind.rs20, i);
    return { score: mean(Object.keys(parts).map(function (k) { return parts[k]; })), parts: parts };
  }

  function axisMomentum(ind, i, flip) {
    if (flip === undefined) flip = true;
    var raw = {};
    if (ind.rsi14[i] != null) raw.rsi = (ind.rsi14[i] - 50) * 2;
    if (ind.stoch_k[i] != null) raw.stoch = (ind.stoch_k[i] - 50) * 2;
    if (ind.pctb[i] != null) raw.pctb = Math.max(-100, Math.min(100, (ind.pctb[i] - 0.5) * 200));
    if (ind.ret20[i] != null) raw.ret20 = symRank(ind.ret20, i);
    if (ind.ret5[i] != null) raw.ret5 = symRank(ind.ret5, i);
    var keys = Object.keys(raw);
    if (!keys.length) return { score: null, parts: {} };
    if (!flip) return { score: mean(keys.map(function (k) { return raw[k]; })), parts: raw };
    var tilt = trendTilt(ind, i);
    if (tilt == null) return { score: null, parts: {} };
    var parts = {};
    keys.forEach(function (k) {
      parts[k] = raw[k] == null ? null : (k === 'ret20' ? raw[k] : raw[k] * tilt);
    });
    var sc = mean(keys.map(function (k) { return parts[k]; }));
    parts._tilt = tilt * 100;
    return { score: sc, parts: parts };
  }

  function axisFlow(ind, i) {
    var parts = {};
    if (ind.obv_slope20[i] != null) parts.obv = symRank(ind.obv_slope20, i);
    if (ind.mfi14[i] != null) parts.mfi = (ind.mfi14[i] - 50) * 2;
    var vz = zscore(ind.volume.map(function (x) { return x == null ? 0 : x; }), i, 60, 20);
    if (vz != null && ind.ret5[i] != null) {
      parts.volume = Math.max(-100, Math.min(100, vz * 30)) * (ind.ret5[i] > 0 ? 1 : -1);
    }
    return { score: mean(Object.keys(parts).map(function (k) { return parts[k]; })), parts: parts };
  }

  function axisSupply(ind, vp, i) {
    if (!vp) return { score: null, parts: {} };
    var parts = { overhead: vp.below_pct - vp.above_pct };
    var c = ind.close[i], a = ind.atr14[i];
    if (vp.poc && c && a) parts.poc = Math.max(-100, Math.min(100, (c - vp.poc) / a * 25));
    parts.va = c > vp.vah ? 60 : (c < vp.val ? -60 : 0);
    return { score: mean(Object.keys(parts).map(function (k) { return parts[k]; })), parts: parts };
  }

  function axisCompression(ind, i) {
    var parts = {};
    var bw = pctRank(ind.bbw, i);
    parts.bbw_inv = bw == null ? null : 100 - bw;
    var sqd = ind.squeeze_days[i];
    if (sqd != null) parts.squeeze = Math.max(0, Math.min(100, sqd / 10 * 100));
    if (ind.nr7[i] != null) parts.nr7 = ind.nr7[i] ? 100 : 0;
    if (i >= 5 && ind.bbw[i] != null && ind.bbw[i - 5]) {
      parts.bbw_trend = Math.max(0, Math.min(100, 50 - (ind.bbw[i] / ind.bbw[i - 5] - 1) * 250));
    }
    return mean(Object.keys(parts).map(function (k) { return parts[k]; }));
  }

  function confidence(ind, i, axes) {
    var comp = axisCompression(ind, i);
    var vals = Object.keys(axes).map(function (k) { return axes[k]; })
                     .filter(function (x) { return x != null; });
    var agree = null;
    if (vals.length >= 2) {
      var m = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var sd = Math.sqrt(vals.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / vals.length);
      agree = Math.max(0, 100 - sd / 80 * 100);
    }
    return mean([comp, agree, vals.length / 4 * 100]);
  }

  E.trendTilt = trendTilt;

  var PRIOR = { trend: 0.25, momentum: 0.25, flow: 0.25, supply: 0.25 };
  var AXIS_KEYS = [['t', 'trend'], ['m', 'momentum'], ['f', 'flow'], ['s', 'supply']];

  function composite(axes, weights) {
    var w = weights || PRIOR, have = {}, k;
    for (k in axes) if (axes[k] != null) have[k] = axes[k];
    var keys = Object.keys(have);
    if (!keys.length) return { score: null, used: {}, missing: Object.keys(PRIOR) };
    var tw = keys.reduce(function (a, k) { return a + (w[k] || 0); }, 0);
    if (tw <= 0) return { score: null, used: {}, missing: [] };
    var sc = keys.reduce(function (a, k) { return a + (w[k] || 0) * have[k]; }, 0) / tw;
    // 네 자리로 반올림한다 — 점수에 쓰는 것이 아니라 **화면에 적는** 값이다.
    // signal_lib.composite 이 같은 자리에서 같은 반올림을 한다.
    var used = {};
    keys.forEach(function (k) { used[k] = Math.round((w[k] || 0) / tw * 1e4) / 1e4; });
    var missing = Object.keys(PRIOR).filter(function (k) { return !(k in have); });
    return { score: sc, used: used, missing: missing };
  }

  E.scoreSeries = function (ind, bars, flip, vpEvery) {
    if (flip === undefined) flip = true;
    vpEvery = vpEvery || 5;
    var n = ind.close.length, rows = [], vb = null, i;
    for (i = 0; i < n; i++) {
      if (i % vpEvery === 0 || vb === null) vb = volumeProfile(bars, i);
      var vp = vpAt(vb, ind.close[i]);
      var t = axisTrend(ind, i), m = axisMomentum(ind, i, flip);
      var f = axisFlow(ind, i), s = axisSupply(ind, vp, i);
      var axes = { trend: t.score, momentum: m.score, flow: f.score, supply: s.score };
      var comp = composite(axes);
      rows.push({
        i: i, t: t.score, m: m.score, f: f.score, s: s.score,
        total: comp.score, weights_used: comp.used, axes_missing: comp.missing,
        conf: confidence(ind, i, axes), vp: vp,
        parts: { trend: t.parts, momentum: m.parts, flow: f.parts, supply: s.parts }
      });
    }
    return rows;
  };

  // ── 워크포워드 가중 ──────────────────────────────────────────────
  var BURN_IN = 150, REFIT_EVERY = 20, MIN_FIT_OBS = 12, K_PSEUDO = 10;

  function spearman(xs, ys) {
    if (xs.length < 3) return 0;
    function rank(v) {
      var order = v.map(function (x, i) { return i; }).sort(function (a, b) { return v[a] - v[b]; });
      var r = new Array(v.length);
      order.forEach(function (i, p) { r[i] = p; });
      return r;
    }
    var a = rank(xs), b = rank(ys);
    var ma = a.reduce(function (x, y) { return x + y; }, 0) / a.length;
    var mb = b.reduce(function (x, y) { return x + y; }, 0) / b.length;
    function pstd(v, m) {
      return Math.sqrt(v.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / v.length);
    }
    var sa = pstd(a, ma), sb = pstd(b, mb);
    if (!sa || !sb) return 0;
    var s = 0, i;
    for (i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb);
    return s / a.length / (sa * sb);
  }

  function forwardRet(bars, j, h) {
    if (j + h >= bars.length) return null;
    return (bars[j + h].c / bars[j].c - 1) * 100;
  }

  function fitWeights(bars, rows, t, h) {
    var fitted = {}, detail = {}, i;
    AXIS_KEYS.forEach(function (pair) {
      var key = pair[0], name = pair[1], xs = [], ys = [], j;
      for (j = 0; j < Math.max(0, t - h); j++) {
        if (rows[j][key] == null) continue;
        var r = forwardRet(bars, j, h);
        if (r == null) continue;
        xs.push(rows[j][key]); ys.push(r);
      }
      var n = xs.length;
      if (n >= MIN_FIT_OBS) {
        var rho = spearman(xs, ys);
        var ne = Math.max(n / h, 1);
        var lam = ne / (ne + K_PSEUDO);
        var se = 1 / Math.sqrt(Math.max(1, ne - 1));
        var adj = Math.max(0, Math.abs(rho) - se) * (rho >= 0 ? 1 : -1);
        fitted[name] = Math.max(0, adj);
        detail[name] = { rho: rho, se: se, rho_adj: adj, n: n, n_eff: ne, lambda: lam };
      } else {
        detail[name] = { rho: null, n: n, lambda: 0 };
      }
    });
    var s = Object.keys(fitted).reduce(function (a, k) { return a + fitted[k]; }, 0);
    var share = {};
    if (s > 0) Object.keys(fitted).forEach(function (k) { share[k] = fitted[k] / s; });

    // 쏠리는 정도를 잰 상관의 크기만큼으로 묶는다. 넷 중 하나만 표준오차를
    // 넘으면 그 하나가 share 1.0 을 가져가 가중치 80~92% 가 되는데, 문턱을
    // 넘었다는 것은 「0 은 아닌 것 같다」이지 「이 축이 다 설명한다」가 아니다.
    // (signal_lib.fit_weights 의 같은 자리 주석 참고)
    if (s > 0) {
      var strength = Math.min(1, s);
      Object.keys(PRIOR).forEach(function (k) {
        share[k] = strength * (share[k] || 0) + (1 - strength) * PRIOR[k];
      });
    }
    var w = {};
    AXIS_KEYS.forEach(function (pair) {
      var name = pair[1], lam = detail[name].lambda;
      w[name] = lam * (share[name] || 0) + (1 - lam) * PRIOR[name];
    });
    var tot = Object.keys(w).reduce(function (a, k) { return a + w[k]; }, 0);
    if (tot) Object.keys(w).forEach(function (k) { w[k] = w[k] / tot; });
    else w = Object.assign({}, PRIOR);
    return { weights: w, detail: detail };
  }

  E.adaptiveSeries = function (bars, rows, h) {
    h = h || 10;
    var n = bars.length, score = new Array(n).fill(null), wmap = new Array(n).fill(null);
    var cur = null, history = [], t;
    for (t = 0; t < n; t++) {
      if (t >= BURN_IN && (t - BURN_IN) % REFIT_EVERY === 0) {
        var fw = fitWeights(bars, rows, t, h);
        cur = fw.weights;
        history.push({ d: bars[t].d, weights: fw.weights, detail: fw.detail });
      }
      if (cur) {
        var axes = {};
        AXIS_KEYS.forEach(function (p) { axes[p[1]] = rows[t][p[0]]; });
        var c = composite(axes, cur);
        score[t] = c.score; wmap[t] = c.used;
      }
    }
    return { score: score, weights: wmap, history: history };
  };

  E.selfPctSeries = function (scores) {
    return scores.map(function (_, i) { return pctRank(scores, i, 252, 60); });
  };

  // ── 매매 계획 ────────────────────────────────────────────────────
  var BANDS = [[90, 'strong_buy', '적극 매수'], [70, 'buy', '매수'],
               [30, 'hold', '중립'], [10, 'reduce', '비중축소'], [0, 'sell', '매도']];
  var STOP_ATR = 2.0, TRAIL_ATR = 3.0, TARGET_VOL = 20.0, MAX_WEIGHT = 1.0;

  function bandOf(selfPct) {
    if (selfPct == null) return [null, null];
    for (var i = 0; i < BANDS.length; i++) if (selfPct >= BANDS[i][0]) return [BANDS[i][1], BANDS[i][2]];
    return ['sell', '매도'];
  }
  E.bandOf = bandOf;

  E.planOf = function (ind, row, i, horizon, selfPct) {
    var b = bandOf(selfPct), band = b[0], label = b[1];
    var c = ind.close[i], a = ind.atr14[i], rv = ind.rv20[i], vp = row.vp;
    var out = { band: band, band_label: label, horizon: horizon,
                score: row.total, self_pct: selfPct, conf: row.conf, close: c };
    if (band == null || c == null) { out.note = '표본이 모자라 계획을 내지 않습니다'; return out; }

    if (band === 'strong_buy' || band === 'buy') {
      out.action = '매수';
      var stops = [];
      if (a) stops.push(c - STOP_ATR * a);
      if (vp && vp.nearest_dn != null && vp.nearest_dn < c) stops.push(vp.nearest_dn * 0.995);
      out.stop = stops.length ? Math.max.apply(null, stops) : null;
      if (vp && vp.nearest_up != null && vp.nearest_up > c) out.target = vp.nearest_up;
      else if (out.stop) out.target = c + (c - out.stop) * 1.5;
      out.trail = a ? c - TRAIL_ATR * a : null;
    } else if (band === 'sell' || band === 'reduce') {
      out.action = band === 'reduce' ? '비중축소' : '청산';
      out.stop = null; out.target = null;
      out.note = '보유분 정리 신호입니다. 하락 베팅 신호가 아닙니다.';
    } else out.action = '관망';

    if (out.stop && c) out.stop_pct = (out.stop / c - 1) * 100;
    if (out.target && c) out.target_pct = (out.target / c - 1) * 100;
    if (out.stop && out.target && c) {
      var risk = c - out.stop, rew = out.target - c;
      out.rr = risk > 0 ? Math.round(rew / risk * 100) / 100 : null;
    }
    if (rv && rv > 0 && (band === 'strong_buy' || band === 'buy')) {
      var w = TARGET_VOL / rv;
      if (row.conf != null) w *= Math.max(0, Math.min(1, row.conf / 100));
      out.weight = Math.round(Math.min(MAX_WEIGHT, w) * 1000) / 1000;
    }
    return out;
  };

  E.HORIZONS = [5, 10, 20, 60];

  /* 종목 하나를 통째로 셈한다 — 임의 종목 조회가 부르는 자리. */
  E.analyze = function (bars, benchClose) {
    if (!bars || bars.length < BURN_IN + 60) {
      return { error: '일봉 ' + (bars ? bars.length : 0) + ' 세션 — 점수를 내기에 모자랍니다 ' +
                      '(최소 ' + (BURN_IN + 60) + ' 세션)' };
    }
    var ind = E.computeIndicators(bars, benchClose);
    var rows = E.scoreSeries(ind, bars);
    var i = bars.length - 1;
    var out = { asof: bars[i].d, close: bars[i].c, ind: ind, rows: rows, i: i,
                axes: { trend: rows[i].t, momentum: rows[i].m, flow: rows[i].f, supply: rows[i].s },
                conf: rows[i].conf, axes_missing: rows[i].axes_missing,
                volume_profile: rows[i].vp, horizons: {} };
    E.HORIZONS.forEach(function (h) {
      var ad = E.adaptiveSeries(bars, rows, h);
      var sp = E.selfPctSeries(ad.score);
      if (ad.score[i] == null) { out.horizons[h] = { note: '가중치를 재기에 이력이 모자랍니다' }; return; }
      var rw = Object.assign({}, rows[i], { weights_used: ad.weights[i] || rows[i].weights_used });
      out.horizons[h] = {
        score: ad.score[i], self_pct: sp[i], weights: ad.weights[i],
        plan: E.planOf(ind, rw, i, h, sp[i])
      };
    });
    return out;
  };

  global.SignalEngine = E;
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
