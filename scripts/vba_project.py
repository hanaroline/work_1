#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""VBA 프로젝트(`vbaProject.bin`)를 처음부터 만든다 — 매크로 단추를 위해.

왜 직접 만드나
──────────────────────────────────────────────────────────────────────
openpyxl 도 XlsxWriter 도 VBA 프로젝트를 **만들지는** 못한다. 둘 다 「이미
있는 .xlsm 에서 뽑아 쓰라」고 한다. 디스크에 한국투자증권 샘플 .xlsm 이
있긴 하지만 그 안의 127 KB 는 **남의 코드**다 — 회사 고객 문서에 그대로
실을 수는 없다. 그래서 형식을 익혀 우리 매크로만 든 것을 만든다.

형식이 맞는지 어떻게 아나 — 읽을 줄부터 안다
──────────────────────────────────────────────────────────────────────
내가 쓴 것을 내가 읽어서 맞다고 하는 것은 증명이 아니다. 그래서 만들기 전에
**엑셀이 진짜로 만든 파일**을 같은 코드로 풀어 보고, 풀린 값이 뜻이 통하는지
확인했다.

  · 복합파일(CFB) 판독 — 샘플의 스트림 21 개가 이름·크기까지 읽힌다.
  · MS-OVBA 압축 해제 — 샘플의 `dir` 913 바이트가 1448 바이트로 풀리고,
    풀린 것을 다시 압축해 풀면 원본과 같다.
  · 암호화(2.4.3) — 샘플의 CMG·DPB·GC 를 풀면 각각
        CMG → 00000000 (보호 안 함)   DPB → 00 (암호 없음)   GC → ff (보임)
    이 나온다. 세 블롭이 모두 Version=2 와 계산한 ProjKey 0x96 으로 떨어진다.
    우연히 맞을 값이 아니므로 알고리즘이 맞은 것이다.

한계 — 솔직히 적는다
──────────────────────────────────────────────────────────────────────
**이 컨테이너에는 진짜 엑셀이 없다.** 리브레오피스로 열어 모듈이 읽히는 것까지
확인하지만, 리브레오피스의 VBA 판독기는 엑셀과 다른 구현이다. 엑셀에서
「읽을 수 없는 내용」이 뜰 가능성이 0 은 아니다. 그래서 **.xlsx 는 그대로 두고
.xlsm 을 따로 만든다** — 매크로판이 안 열려도 원래 파일은 멀쩡하다.
"""

import struct
import uuid

# ── MS-OVBA 압축 (2.4.1) ────────────────────────────────────────────


def _bits(diff):
    n = 4
    while (1 << n) < diff:
        n += 1
    return max(4, min(12, n))


def decompress(buf):
    assert buf[0] == 1, "압축 컨테이너 서명이 0x01 이 아닙니다"
    out, pos = bytearray(), 1
    while pos < len(buf):
        hdr = struct.unpack_from("<H", buf, pos)[0]
        pos += 2
        size = (hdr & 0x0FFF) + 3
        comp = bool(hdr & 0x8000)
        end = pos + size - 2
        if not comp:
            out += buf[pos:end]
            pos = end
            continue
        start = len(out)
        while pos < end:
            flags = buf[pos]
            pos += 1
            for b in range(8):
                if pos >= end:
                    break
                if not (flags >> b) & 1:
                    out.append(buf[pos])
                    pos += 1
                else:
                    tok = struct.unpack_from("<H", buf, pos)[0]
                    pos += 2
                    nb = _bits(len(out) - start)
                    length = (tok & (0xFFFF >> nb)) + 3
                    offset = (tok >> (16 - nb)) + 1
                    for _ in range(length):
                        out.append(out[len(out) - offset])
    return bytes(out)


def compress(data):
    out = bytearray(b"\x01")
    for c0 in range(0, max(len(data), 1), 4096):
        chunk = data[c0:c0 + 4096]
        body, i = bytearray(), 0
        while i < len(chunk):
            flags, group, fi = 0, bytearray(), 0
            while fi < 8 and i < len(chunk):
                nb = _bits(i)
                max_len = (0xFFFF >> nb) + 3
                max_off = (1 << (16 - nb))
                best_len, best_off = 0, 0
                for j in range(max(0, i - max_off), i):
                    ln = 0
                    while (ln < max_len and i + ln < len(chunk)
                           and chunk[j + ln] == chunk[i + ln]):
                        ln += 1
                    if ln > best_len:
                        best_len, best_off = ln, i - j
                if best_len >= 3:
                    group += struct.pack("<H", ((best_off - 1) << (16 - nb))
                                         | (best_len - 3))
                    flags |= 1 << fi
                    i += best_len
                else:
                    group.append(chunk[i])
                    i += 1
                fi += 1
            body.append(flags)
            body += group
        if len(body) < len(chunk):
            out += struct.pack("<H", 0xB000 | (len(body) + 2 - 3)) + body
        else:
            out += struct.pack("<H", 0x3000 | (len(chunk) + 2 - 3)) + chunk
    return bytes(out)


# ── 프로젝트 속성 암호화 (2.4.3) ────────────────────────────────────


def proj_key(project_id):
    k = 0
    for ch in project_id:
        k = (k + ord(ch)) & 0xFF
    return k


def encrypt(data, project_id, seed=0x0A):
    """CMG·DPB·GC 에 쓰는 16 진 문자열을 만든다.

    상태 셋을 굴린다 — enc[i-1], enc[i-2], plain[i-1]. 처음에 이 인덱스를
    하나씩 밀려 잡았더니 샘플의 CMG 가 길이 41 억으로 풀렸다. 바로잡으니
    00000000 이 나왔다.
    """
    pk = proj_key(project_id)
    version = 2
    eb1 = version ^ seed
    eb2 = pk ^ seed
    out = bytearray([seed, eb1, eb2])
    e_1, e_2, p_1 = eb2, eb1, pk

    def step(plain):
        nonlocal e_1, e_2, p_1
        be = plain ^ ((e_2 + p_1) & 0xFF)
        out.append(be)
        e_2, e_1, p_1 = e_1, be, plain
        return be

    for _ in range((seed & 6) // 2):        # 무시되는 바이트 — 값은 아무거나
        step(0x00)
    for b in struct.pack("<I", len(data)):
        step(b)
    for b in data:
        step(b)
    return out.hex().upper()


def decrypt(hexstr, project_id):
    """검증용 — 엑셀이 만든 값을 풀어 본다."""
    d = bytes.fromhex(hexstr)
    seed, eb1, eb2 = d[0], d[1], d[2]
    version, pk = eb1 ^ seed, eb2 ^ seed
    e_1, e_2, p_1 = eb2, eb1, pk
    i = 3

    def step():
        nonlocal e_1, e_2, p_1, i
        be = d[i]
        i += 1
        b = be ^ ((e_2 + p_1) & 0xFF)
        e_2, e_1, p_1 = e_1, be, b
        return b

    for _ in range((seed & 6) // 2):
        step()
    ln = struct.unpack("<I", bytes(step() for _ in range(4)))[0]
    return {"version": version, "projKey": pk, "length": ln,
            "data": bytes(step() for _ in range(min(ln, len(d) - i)))}


# ── 복합파일(CFB) 쓰기 ──────────────────────────────────────────────

FREE, ENDCHAIN, FATSECT, DIFSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD, 0xFFFFFFFC
SECTOR, MINI, CUTOFF = 512, 64, 4096


class _Node:
    def __init__(self, name, typ, data=None):
        self.name, self.typ, self.data = name, typ, data
        self.kids = []
        self.idx = None
        self.left = self.right = self.child = 0xFFFFFFFF
        self.start, self.size = ENDCHAIN, 0


def _cfb_order(n):
    """복합파일의 형제 정렬 — 이름 길이 먼저, 그다음 대문자 이름."""
    return (len(n.name), n.name.upper())


def _build_tree(kids):
    """정렬된 형제를 균형 이진트리로 엮는다. 한쪽으로 늘어진 사슬도 규격상
    맞지만, 균형을 잡아 두면 읽는 쪽 구현을 덜 탄다."""
    if not kids:
        return 0xFFFFFFFF
    mid = len(kids) // 2
    node = kids[mid]
    node.left = _build_tree(kids[:mid])
    node.right = _build_tree(kids[mid + 1:])
    return node.idx


def write_cfb(root_kids):
    """스트림·저장소 묶음을 복합파일 바이트로 만든다."""
    root = _Node("Root Entry", 5)
    root.kids = root_kids

    # 1) 디렉터리 항목 번호를 매긴다(루트가 0).
    flat = [root]

    def walk(node):
        for k in sorted(node.kids, key=_cfb_order):
            k.idx = len(flat)
            flat.append(k)
            walk(k)
    walk(root)

    # 2) 스트림 자료를 큰 것/작은 것으로 가른다.
    big, small = [], []
    for n in flat[1:]:
        if n.typ != 2 or not n.data:
            continue
        (big if len(n.data) >= CUTOFF else small).append(n)

    # 3) 미니 스트림을 만든다(작은 스트림을 64 바이트 단위로 이어 붙인다).
    mini_blob, minifat = bytearray(), []
    for n in small:
        first = len(mini_blob) // MINI
        n.start, n.size = first, len(n.data)
        pad = (-len(n.data)) % MINI
        mini_blob += n.data + b"\x00" * pad
        cnt = (len(n.data) + MINI - 1) // MINI
        for j in range(cnt):
            minifat.append(first + j + 1 if j < cnt - 1 else ENDCHAIN)

    # 4) 일반 섹터에 들어갈 덩어리들 — 큰 스트림 · 미니스트림 · 미니FAT · 디렉터리
    chunks = []                       # (설정함수, 바이트)
    for n in big:
        n.size = len(n.data)
        chunks.append(("big", n, n.data))
    if mini_blob:
        chunks.append(("mini", root, bytes(mini_blob)))
    mf = b"".join(struct.pack("<I", x) for x in minifat)
    if mf:
        mf += b"\xff" * ((-len(mf)) % SECTOR)
        chunks.append(("minifat", None, mf))

    dirbytes = bytearray()
    for n in flat:
        if n is root:
            n.child = _build_tree(sorted(root.kids, key=_cfb_order))
            n.start = 0 if mini_blob else ENDCHAIN     # 나중에 고친다
            n.size = len(mini_blob)
        elif n.typ == 1:
            n.child = _build_tree(sorted(n.kids, key=_cfb_order))
        nm = n.name.encode("utf-16-le") + b"\x00\x00"
        e = bytearray(128)
        e[0:len(nm)] = nm
        struct.pack_into("<H", e, 64, len(nm))
        e[66] = n.typ
        e[67] = 1                                       # 검정
        struct.pack_into("<III", e, 68, n.left, n.right, n.child)
        struct.pack_into("<I", e, 116, n.start if n.typ != 1 else ENDCHAIN)
        struct.pack_into("<Q", e, 120, n.size if n.typ != 1 else 0)
        dirbytes += e
    dirbytes += b"\x00" * ((-len(dirbytes)) % SECTOR)
    chunks.append(("dir", None, bytes(dirbytes)))

    # 5) 섹터를 나눠 준다. FAT 자체가 몇 섹터인지는 되풀이해 맞춘다.
    def layout(n_fat):
        pos, alloc = 0, []
        for kind, node, data in chunks:
            nsec = (len(data) + SECTOR - 1) // SECTOR
            alloc.append((kind, node, data, pos, nsec))
            pos += nsec
        return alloc, pos

    n_fat = 1
    while True:
        alloc, used = layout(n_fat)
        total = used + n_fat
        if (total + SECTOR // 4 - 1) // (SECTOR // 4) <= n_fat:
            break
        n_fat += 1

    fat = [FREE] * (n_fat * SECTOR // 4)
    body = bytearray()
    minifat_start, dir_start, mini_start = ENDCHAIN, ENDCHAIN, ENDCHAIN
    for kind, node, data, first, nsec in alloc:
        for j in range(nsec):
            fat[first + j] = first + j + 1 if j < nsec - 1 else ENDCHAIN
        if kind == "big":
            node.start = first
        elif kind == "mini":
            mini_start = first
        elif kind == "minifat":
            minifat_start = first
        elif kind == "dir":
            dir_start = first
        body += data + b"\x00" * ((-len(data)) % SECTOR)
    for j in range(n_fat):
        fat[used + j] = FATSECT

    # 루트의 미니스트림 시작 섹터를 이제 안다 — 디렉터리를 다시 찍는다.
    struct.pack_into("<I", dirbytes, 116, mini_start)
    struct.pack_into("<Q", dirbytes, 120, len(mini_blob))
    off = 0
    for kind, node, data, first, nsec in alloc:
        if kind == "dir":
            body[first * SECTOR:first * SECTOR + len(dirbytes)] = dirbytes
        off += 0

    hdr = bytearray(512)
    hdr[0:8] = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"
    struct.pack_into("<HHHHH", hdr, 24, 0x003E, 3, 0xFFFE, 9, 6)
    struct.pack_into("<IIIIIIII", hdr, 44, n_fat, dir_start, 0, CUTOFF,
                     minifat_start,
                     0 if minifat_start == ENDCHAIN
                     else max(1, (len(mf) + SECTOR - 1) // SECTOR),
                     ENDCHAIN, 0)
    difat = [FREE] * 109
    for j in range(n_fat):
        difat[j] = used + j
    struct.pack_into("<109I", hdr, 76, *difat)

    fatbytes = b"".join(struct.pack("<I", x) for x in fat)
    return bytes(hdr) + bytes(body) + fatbytes
