# -*- coding: utf-8 -*-
"""
배경음악 생성기 — 순수 numpy 로 은은한 앰비언트 트랙을 합성해 WAV 로 저장.

영상(realestate_tax_guide.mp4)의 배경음으로 사용. 차분하고 방해되지 않는
브랜드 분위기(따뜻한 F 메이저 패드 + 가벼운 아르페지오 + 부드러운 베이스).

사용:
    python3 make_music.py                 # -> out/bgm.wav (길이 = 영상 길이)
그 후 mux_audio.sh 로 영상에 입힘.
"""
import os

import wave
import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out")

try:
    from make_realestate_video import TOTAL as DUR
except Exception:
    DUR = 216.0

BAR = 4.0                       # 한 코드 지속(초)
PEAK = 0.22                     # 최종 피크(배경용, 낮게)

# F 메이저 진행 (Fmaj7 - Dm7 - Bbmaj7 - Csus/C) — 코드별 주파수(Hz)
def n(name):
    base = {"C": 261.63, "D": 293.66, "E": 329.63, "F": 349.23,
            "G": 392.00, "A": 440.00, "B": 493.88, "Bb": 466.16}
    return base[name]

# 옥타브 조정 헬퍼
def o(freq, octaves):
    return freq * (2.0 ** octaves)

CHORDS = [
    # (bass, [pad tones ...], [arp tones ...])
    (o(n("F"), -2), [o(n("F"), -1), o(n("A"), -1), o(n("C"), 0), o(n("E"), 0)],
     [o(n("F"), 0), o(n("A"), 0), o(n("C"), 1), o(n("E"), 0)]),
    (o(n("D"), -2), [o(n("D"), -1), o(n("F"), -1), o(n("A"), -1), o(n("C"), 0)],
     [o(n("D"), 0), o(n("F"), 0), o(n("A"), 0), o(n("C"), 1)]),
    (o(n("Bb"), -2), [o(n("Bb"), -1), o(n("D"), 0), o(n("F"), 0), o(n("A"), 0)],
     [o(n("Bb"), 0), o(n("D"), 1), o(n("F"), 0), o(n("A"), 0)]),
    (o(n("C"), -2), [o(n("C"), -1), o(n("E"), 0), o(n("G"), -1), o(n("C"), 0)],
     [o(n("C"), 1), o(n("E"), 0), o(n("G"), 0), o(n("E"), 0)]),
]


def pad_note(freq, dur, detune=0.0):
    """부드러운 패드 음: 배음 합 + 느린 어택/릴리즈."""
    t = np.arange(int(dur * SR)) / SR
    sig = np.zeros_like(t)
    for h, amp in [(1, 1.0), (2, 0.45), (3, 0.22), (4, 0.10)]:
        f = freq * h * (1.0 + detune)
        sig += amp * np.sin(2 * np.pi * f * t)
    sig /= 1.77
    # 어택 0.6s / 릴리즈 0.9s (사인형 페이드)
    env = np.ones_like(t)
    a = int(0.6 * SR); r = int(0.9 * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.sin(np.linspace(np.pi / 2, 0, r)) ** 2
    return sig * env


def pluck(freq, dur=0.9):
    """부드러운 아르페지오 음: 빠른 어택 + 지수 감쇠."""
    t = np.arange(int(dur * SR)) / SR
    sig = (np.sin(2 * np.pi * freq * t)
           + 0.3 * np.sin(2 * np.pi * 2 * freq * t))
    env = np.exp(-t * 4.5)
    env[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))
    return sig * env


def build_channel(detune, arp_offset):
    N = int(DUR * SR)
    buf = np.zeros(N + SR)      # 여유 tail
    nbars = int(np.ceil(DUR / BAR)) + 1
    for b in range(nbars):
        bass_f, pad_fs, arp_fs = CHORDS[b % len(CHORDS)]
        start = int(b * BAR * SR)
        if start >= N:
            break
        # 패드(코드)
        chord = np.zeros(int((BAR + 0.9) * SR))
        for f in pad_fs:
            pn = pad_note(f, BAR + 0.9, detune)
            chord[:len(pn)] += pn
        chord *= 0.16 / len(pad_fs) * 4
        _add(buf, chord, start)
        # 베이스
        bn = pad_note(bass_f, BAR + 0.6, detune) * 0.14
        _add(buf, bn, start)
        # 아르페지오: 0.5s 간격
        step = 0.5
        k = 0
        tpos = arp_offset
        while tpos < BAR:
            f = arp_fs[k % len(arp_fs)]
            pl = pluck(f) * 0.06
            _add(buf, pl, start + int(tpos * SR))
            tpos += step
            k += 1
    return buf[:N]


def _add(buf, seg, start):
    end = min(start + len(seg), len(buf))
    if start >= len(buf):
        return
    buf[start:end] += seg[:end - start]


def simple_reverb(x):
    y = x.copy()
    for delay, g in [(0.11, 0.28), (0.19, 0.20), (0.31, 0.14), (0.43, 0.08)]:
        d = int(delay * SR)
        y[d:] += g * x[:-d]
    return y


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"배경음악 합성: {DUR:.0f}s @ {SR}Hz")
    L = build_channel(detune=+0.0012, arp_offset=0.0)
    R = build_channel(detune=-0.0012, arp_offset=0.25)
    L = simple_reverb(L)
    R = simple_reverb(R)
    # 다운샘플 저역통과는 무거우니 벡터화 IIR 근사(lfilter 없이 간단 스무딩)
    L = _smooth(L); R = _smooth(R)
    stereo = np.stack([L, R], axis=1)
    # 전체 페이드 인/아웃
    n_in = int(2.0 * SR); n_out = int(3.0 * SR)
    stereo[:n_in] *= np.linspace(0, 1, n_in)[:, None]
    stereo[-n_out:] *= np.linspace(1, 0, n_out)[:, None]
    # 정규화
    peak = np.max(np.abs(stereo)) + 1e-9
    stereo = stereo / peak * PEAK
    data = (stereo * 32767).astype(np.int16)
    path = os.path.join(OUT_DIR, "bgm.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"완료: {path}  ({os.path.getsize(path)/1024/1024:.1f} MB)")


def _smooth(x, taps=12):
    """FIR 이동평균(Hann)으로 고음 완화 — numpy 벡터 연산, scipy 불필요."""
    k = np.hanning(taps + 2)[1:-1]
    k = k / k.sum()
    return np.convolve(x, k, mode="same")


if __name__ == "__main__":
    main()
