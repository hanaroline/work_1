/**
 * 펀드 투자설명서 — DART 공시에서 수집·파싱한 결과
 *
 * 생성 : scripts/fetch_fund_prospectus.mjs (GitHub Actions 러너에서 실행)
 * FUND_PROSPECTUS.items[펀드명] = { fields, docUrl, mgr, docDate, ... }
 *
 * sales-script.html 이 펀드 선택 시 명칭으로 찾아 등록된 투자설명서로 적용한다.
 * 원문에 없는 값은 담지 않으므로 화면에서 「확인필요」로 남는다.
 *
 * 아직 수집 전이라 비어 있다 — 개발 컨테이너는 dart.fss.or.kr 이 egress 차단이다.
 * 파일 자체를 두는 이유: sales-script.html 이 이 파일을 <script> 로 읽으므로
 * 없으면 브라우저 콘솔에 404 가 남고, 단일 파일 빌드(scripts/build_sales_script.mjs)가
 * 인라인할 대상을 못 찾는다.
 */
window.FUND_PROSPECTUS = { updatedAt: null, source: 'DART 투자설명서 공시', count: 0, items: {} };
