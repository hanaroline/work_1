import importlib.util, os, io, sys
spec = importlib.util.spec_from_file_location('bh', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build_hub.py'))
bh = importlib.util.module_from_spec(spec)
sys.stdout = io.StringIO()          # build_hub 의 진행 출력 억제
spec.loader.exec_module(bh)
sys.stdout = sys.__stdout__

HUB = 'https://claude.ai/code/artifact/fa511243-84ca-461c-9e58-e373d851e6fa'
L = []
L.append('# 세션 산출물 자료실 — 아티팩트 색인\n')
L.append('클로드 코드 세션이 남긴 **최종 작업본**을 주제별로 아티팩트에 올린 기록입니다. '
         '세션별 브랜치의 마지막 커밋에서 산출물을 뽑았고, 이미 아티팩트가 있던 자료는 '
         '다시 올리지 않고 그 링크를 씁니다.\n')
L.append('- 색인 아티팩트(한/영) — <%s>' % HUB)
L.append('- 기준 2026-08-22 · 저장소 `hanaroline/work_1`')
L.append('- 세션 35개 · 주제 %d개 · 색인 항목 %d개 · 이번에 새로 올린 아티팩트 %d개\n'
         % (len(bh.GROUPS), sum(len(g['items']) for g in bh.GROUPS),
            sum(1 for g in bh.GROUPS for i in g['items'] if i[8])))
L.append('아티팩트는 기본이 비공개입니다. 부서 밖으로 링크를 돌리기 전에 각 아티팩트의 '
         '공유 설정을 확인하십시오.\n')
for g in bh.GROUPS:
    L.append('## %s\n' % g['ko'])
    L.append('%s\n' % g['leadko'])
    L.append('| 산출물 | 세션 | 날짜 | 상태 |')
    L.append('|---|---|---|---|')
    for (tko, ten, dko, den, sko, sen, date, uid, is_new) in g['items']:
        name = '[%s](%s)' % (tko, bh.art(uid)) if uid else tko
        L.append('| %s<br><sub>%s</sub> | %s | %s | %s |'
                 % (name, dko, sko, date, '신규' if is_new else ('기존' if uid else '아카이브 참조')))
    L.append('')
L.append('## 원본 파일\n')
L.append('아티팩트 페이지로 열 수 없어 색인 아티팩트에 첨부한 파일입니다. '
         '다른 발표자료·영상 원본은 각 아티팩트 안에 붙였습니다.\n')
L.append('| 파일 | 저장소 위치 |')
L.append('|---|---|')
L.append('| `퇴직연금DC_제안서_위험자산비중별_202607.pdf` | `claude/irp-product-proposal-ppt-owsbmc` |')
L.append('| `퇴직연금DC_제안서_위험자산비중별_202607.pptx` | `claude/irp-product-proposal-ppt-owsbmc` |')
L.append('| `semiconductor_primer_2026_1_reviewed.pptx` | `claude/semiconductor-review-ui-fix-jnxc84` |')
L.append('| `semiconductor_primer_2026/..._revised.pptx` | `claude/semiconductor-review-ui-fix-i5wfu9` |')
L.append('| `반도체_고객세미나_2026.7.14.pptx` | `claude/data-update-july-2026-k1k3se` |')
L.append('| `반도체_투자_세미나_20260728.pptx` | `claude/semiconductor-seminar-ppt-elk4i4` |')
L.append('| `video/realestate/out/realestate_tax_guide.mp4` | `claude/video-creation-odmttg` |')
L.append('| `video/out/ai_trends_2026.mp4` | `claude/video-creation-odmttg` |')
L.append('')
L.append('## 아티팩트가 없는 세션\n')
for (tko, ten, dko, den) in bh.NOARTIFACT:
    L.append('- **%s** — %s' % (tko, dko))
L.append('')
L.append('## 아는 한계\n')
L.append('- 실시간 시세를 불러오는 화면은 아티팩트 안에서 외부 요청이 막혀 화면 구조와 '
         '예시 데이터까지만 동작합니다. CSV·엑셀 저장 버튼도 눌리지 않습니다.')
L.append('- `부서 자료실` 은 저장소를 통째로 내려받은 상태에서 열어야 자료 링크가 살아 있습니다.')
L.append('- 발표자료 아티팩트는 PPTX 원본에서 텍스트·차트를 추출한 보관본입니다. '
         '원본 서식은 첨부한 파일로 확인해야 합니다.')
L.append('- 세션 목록 API 는 최근 35개만 돌려줍니다. 그보다 앞선 브랜치 두 개'
         '(`singgil-parkzai-brochure`, `new-session-5tllo8`)의 산출물도 함께 실었습니다.')
L.append('')
open('INDEX.md', 'w', encoding='utf-8').write('\n'.join(L))
print('INDEX.md', os.path.getsize('INDEX.md'), 'bytes')
