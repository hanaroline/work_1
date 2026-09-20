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
    # **빈 것은 서명만.** 빈 모듈(ThisWorkbook 처럼 코드가 없는 문서 모듈)에서
    # 길이 0 인 청크를 만들려다 헤더 크기가 -1 이 되어 터졌다.
    if not data:
        return b"\x01"
    out = bytearray(b"\x01")
    for c0 in range(0, len(data), 4096):
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


# ── VBA 프로젝트 조립 (MS-OVBA 2.3.4) ───────────────────────────────

CODEPAGE = 949          # 한국어 Windows. 모듈 이름은 ASCII 로만 짓는다.


def _rec(rid, payload, size_bytes=4):
    """레코드 하나 — Id(2) + Size(4 또는 없음) + 내용."""
    if size_bytes == 4:
        return struct.pack("<HI", rid, len(payload)) + payload
    return struct.pack("<H", rid) + payload


def _mbcs(s):
    return _enc(s)


def _enc(s):
    """모듈 소스·이름을 코드페이지로 담는다. **못 담으면 시끄럽게 실패한다.**

    처음에는 `errors="replace"` 였다. 그러면 못 담는 글자가 조용히 `?` 가
    되는데, 실제로 주석의 줄표(— U+2014)가 `?` 로 바뀐 채 파일에 들어갔다.
    주석이라 기능은 멀쩡했지만 **그것이 식별자였으면 매크로가 깨졌을 것이고,
    깨진 티도 안 났을 것이다.** cp949 는 ✓ ⚠ – 같은 흔한 글자도 못 담는다.

    그래서 바꿔치기하지 않고 멈춘다. 어느 글자가 걸렸는지 말해 준다.
    """
    try:
        return s.encode("cp%d" % CODEPAGE, "strict")
    except UnicodeEncodeError:
        bad = sorted({c for c in s if not _fits(c)})
        raise ValueError(
            "VBA 소스에 코드페이지 %d 로 담을 수 없는 글자가 있습니다: %s\n"
            "  매크로 소스에서 빼거나 담을 수 있는 글자로 바꾸십시오 "
            "(줄표는 — U+2014 대신 ― U+2015 가 담깁니다)."
            % (CODEPAGE, " ".join("%s(U+%04X)" % (c, ord(c)) for c in bad)))


def _fits(ch):
    try:
        ch.encode("cp%d" % CODEPAGE, "strict")
        return True
    except UnicodeEncodeError:
        return False


def build_dir(project_name, modules):
    """`VBA/dir` 스트림(압축 전).

    모듈마다 MODULEOFFSET 을 0 으로 둔다 — 모듈 스트림을 성능 캐시 없이
    소스만 압축해 넣기 때문이다. 엑셀은 열 때 캐시를 스스로 다시 만든다.
    """
    d = bytearray()
    # PROJECTINFORMATION
    d += _rec(0x0001, struct.pack("<I", 1))            # SysKind: 32비트 윈도
    d += _rec(0x0002, struct.pack("<I", 0x0409))       # Lcid
    d += _rec(0x0014, struct.pack("<I", 0x0409))       # LcidInvoke
    d += _rec(0x0003, struct.pack("<H", CODEPAGE))     # CodePage
    d += _rec(0x0004, _mbcs(project_name))             # ProjectName
    d += _rec(0x0005, b"") + _rec(0x0040, b"")         # DocString(+유니코드)
    d += _rec(0x0006, b"") + _rec(0x003D, b"")         # HelpFilePath
    d += _rec(0x0007, struct.pack("<I", 0))            # HelpContext
    d += _rec(0x0008, struct.pack("<I", 0))            # LibFlags
    # PROJECTVERSION — Size 자리가 Reserved(=4)이고 그 뒤에 6 바이트가 온다.
    # 이 레코드만 모양이 다르다. 규격을 안 보고 Size 로 읽으면 여기서부터
    # 나머지 레코드가 전부 밀린다(샘플을 풀 때 실제로 그랬다).
    d += struct.pack("<HIIH", 0x0009, 4, 1, 0)
    d += _rec(0x000C, b"") + _rec(0x003C, b"")         # Constants

    # PROJECTREFERENCES — 없다. VBA 내장 함수만 쓰므로 참조가 필요 없다.

    # PROJECTMODULES
    d += _rec(0x000F, struct.pack("<H", len(modules)))
    d += _rec(0x0013, struct.pack("<H", 0xFFFF))       # ProjectCookie
    for m in modules:
        nm, doc = m["name"], m.get("document")
        d += _rec(0x0019, _mbcs(nm))                   # ModuleName
        d += _rec(0x0047, nm.encode("utf-16-le"))      # ModuleNameUnicode
        d += _rec(0x001A, _mbcs(nm))                   # StreamName
        d += _rec(0x0032, nm.encode("utf-16-le"))      # StreamNameUnicode
        d += _rec(0x001C, b"") + _rec(0x0048, b"")     # ModuleDocString
        d += _rec(0x0031, struct.pack("<I", 0))        # TextOffset = 0
        d += _rec(0x001E, struct.pack("<I", 0))        # HelpContext
        d += _rec(0x002C, struct.pack("<H", 0xFFFF))   # ModuleCookie
        d += _rec(0x0022 if doc else 0x0021, b"")      # 문서모듈 / 표준모듈
        d += _rec(0x002B, b"")                         # 모듈 끝
    d += _rec(0x0010, b"")                             # dir 끝
    return bytes(d)


def build_project(project_id, project_name, modules):
    """`PROJECT` 스트림 — 사람이 읽는 글이다."""
    L = ['ID="%s"' % project_id]
    for m in modules:
        if m.get("document"):
            L.append("Document=%s/&H00000000" % m["name"])
        else:
            L.append("Module=%s" % m["name"])
    L += ['Name="%s"' % project_name,
          'HelpContextID="0"',
          'VersionCompatible32="393222000"',
          'CMG="%s"' % encrypt(struct.pack("<I", 0), project_id, 0x1B),
          'DPB="%s"' % encrypt(b"\x00", project_id, 0x2D),
          'GC="%s"' % encrypt(b"\xff", project_id, 0x3F),
          "",
          "[Host Extender Info]",
          "&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000",
          "",
          "[Workspace]"]
    for m in modules:
        L.append("%s=0, 0, 0, 0, %s" % (m["name"], "C" if m.get("document") else ""))
    return _enc("\r\n".join(L) + "\r\n")


def build_projectwm(modules):
    """`PROJECTwm` — 모듈 이름의 MBCS↔유니코드 짝을 적어 둔 것."""
    out = bytearray()
    for m in modules:
        out += _mbcs(m["name"]) + b"\x00"
        out += m["name"].encode("utf-16-le") + b"\x00\x00"
    out += b"\x00\x00"
    return bytes(out)


def build_vba_project(modules, project_name="VBAProject", project_id=None):
    """모듈 목록 → `vbaProject.bin` 바이트.

    modules: [{"name": "Module1", "code": "...", "document": False}, …]
    """
    pid = project_id or ("{%s}" % str(uuid.uuid4()).upper())
    vba_kids = [
        _Node("_VBA_PROJECT", 2,
              # Reserved1=0x61CC · Version · Reserved2 · Reserved3.
              # 성능 캐시는 비운다 — 엑셀이 열면서 다시 만든다.
              struct.pack("<HHBH", 0x61CC, 0x00AF, 0x00, 0x0001)),
        _Node("dir", 2, compress(build_dir(project_name, modules))),
    ]
    for m in modules:
        # **엑셀은 모듈 소스 첫 줄에 `Attribute VB_Name` 을 둔다.** VBE 에서는
        # 안 보이지만 스트림에는 들어 있다. 이것 없이 만들었더니 리브레오피스가
        # 다시 내보낼 때 스스로 붙였다 — 없어도 읽히긴 하지만, 엑셀이 쓰는
        # 모양에 맞춰 두는 편이 안전하다.
        src = 'Attribute VB_Name = "%s"\r\n' % m["name"]
        if m.get("document"):
            # 문서 모듈은 속성이 몇 줄 더 붙는다. 엑셀이 만든 파일의 모양이다.
            src += ('Attribute VB_Base = "0{00020820-0000-0000-C000-000000000046}"\r\n'
                    if m["name"] != "ThisWorkbook" else
                    'Attribute VB_Base = "0{00020819-0000-0000-C000-000000000046}"\r\n')
            src += ("Attribute VB_GlobalNameSpace = False\r\n"
                    "Attribute VB_Creatable = False\r\n"
                    "Attribute VB_PredeclaredId = True\r\n"
                    "Attribute VB_Exposed = True\r\n"
                    "Attribute VB_TemplateDerived = False\r\n"
                    "Attribute VB_Customizable = True\r\n")
        src += m.get("code", "")
        vba_kids.append(_Node(m["name"], 2,
                              compress(_enc(src))))
    vba = _Node("VBA", 1)
    vba.kids = vba_kids
    kids = [vba,
            _Node("PROJECT", 2, build_project(pid, project_name, modules)),
            _Node("PROJECTwm", 2, build_projectwm(modules))]
    return write_cfb(kids), pid
