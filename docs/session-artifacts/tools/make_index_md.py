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
L.append('- 기준 2026-08-31 · 저장소 `hanaroline/work_1`')
L.append('- 세션 40개 · 주제 %d개 · 색인 항목 %d개 · 이번에 새로 올린 아티팩트 %d개\n'
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
        if uid:
            status = '신규' if is_new else '기존'
        elif isinstance(is_new, tuple):
            status = is_new[0]
        else:
            status = '아카이브 참조'
        L.append('| %s<br><sub>%s</sub> | %s | %s | %s |' % (name, dko, sko, date, status))
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
L.append('- 엑셀 산식 계열은 세션이 브랜치를 푸시하지 않아 저장소에 파일이 없습니다. '
         '아티팩트가 원본입니다.')
L.append('- 시장 팩트시트 2건은 아티팩트 목록에서 찾았으나, 어느 세션이 만든 것인지는 '
         '세션 목록으로 확인되지 않았습니다.')
L.append('- `국내 설정 공모펀드 조회` 는 데이터 파일만 25.9MB 라 아티팩트 상한(16MB)을 '
         '넘습니다. 저장소에서 파일을 내려받아 열어야 합니다.')
L.append('')

L.append('## 자동 갱신\n')
L.append('이 색인은 예약 작업(Routine)으로 스스로 갱신됩니다.\n')
L.append('| 항목 | 값 |')
L.append('|---|---|')
L.append('| 주기 | 주 2회 · 월·목 08:00 KST (`0 23 * * 0,3` UTC) |')
L.append('| 실행 방식 | 세션 `session_01CrrJp8ryCeMx9e3uFSNoUp` 을 깨워 같은 대화에서 이어 작업 |')
L.append('| 트리거 ID | `trig_01HMZAKCJH5WM31DSKz4FfNM` |')
L.append('| 새 산출물 처리 | 확인 후 바로 게시하고 색인·이 문서까지 갱신 |')
L.append('')
L.append('한 번 도는 동안 하는 일\n')
L.append('1. `git fetch origin --prune` 으로 모든 브랜치의 최종 산출물을 다시 훑고, '
         '세션 목록에서 새 세션을 확인한다.')
L.append('2. 이 문서의 대응표와 아티팩트 목록을 대조해 **새로 생긴 것**과 '
         '**최종본이 갱신된 것**만 골라낸다.')
L.append('3. 게시 전에 파일 내용을 확인한다(가시 텍스트·외부 요청·자격정보 점검). '
         '자체 완결이 아닌 파일은 standalone 판을 쓴다.')
L.append('4. HTML 은 그대로 게시하고, PPTX·MP4 는 `tools/` 의 생성기로 '
         '미리보기 + 원본 내려받기 페이지를 만든다.')
L.append('5. 같은 산출물의 새 판이면 기존 아티팩트 URL 을 덮어써 링크를 유지한다.')
L.append('6. 색인 아티팩트와 이 문서를 다시 만들어 '
         '`claude/organize-session-artifacts-fbg82m` 에 커밋·푸시한다.')
L.append('')
L.append('주기를 바꾸거나 멈추려면 claude.ai 의 Routines 화면에서 위 트리거를 수정하거나, '
         '세션에\n"자료실 갱신 주기 바꿔줘" 라고 말하면 됩니다. 예정된 시각 밖에 바로 '
         '돌리고 싶으면\n아무 세션에서 "자료실 업데이트해줘" 라고 하면 됩니다.')
L.append('')
open('INDEX.md', 'w', encoding='utf-8').write('\n'.join(L))
print('INDEX.md', os.path.getsize('INDEX.md'), 'bytes')
