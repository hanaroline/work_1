/* 한/영 문자열 테이블 + 토글. 외부 의존성 없음 (오프라인 동작). */
(function (global) {
  "use strict";

  var STRINGS = {
    ko: {
      tag: "사내한",
      login_title: "팀 자료실",
      login_sub: "사내망 전용 파일 공유. 접속하려면 비밀번호를 입력하세요.",
      login_name: "이름 (선택)",
      login_name_ph: "예: 송재섭",
      login_password: "비밀번호",
      login_password_ph: "관리자 또는 조회용 비밀번호",
      login_submit: "접속",
      login_working: "확인 중...",
      login_hint: "비밀번호는 관리자에게 문의하세요.",
      login_offline_note: "이 사이트는 사내망에서만 열립니다. 외부 인터넷 연결이 필요하지 않습니다.",

      nav_admin: "관리자",
      nav_viewer: "조회",
      nav_settings: "설정",
      nav_logout: "로그아웃",

      stat_files: "등록 파일",
      stat_size: "총 용량",
      stat_downloads: "누적 다운로드",
      unit_files: "개",

      search_ph: "파일명 · 설명 · 등록자 검색",
      folder_all: "전체 폴더",
      sort_label: "정렬",
      sort_new: "최신순",
      sort_old: "오래된순",
      sort_name: "이름순",
      sort_size: "용량순",
      sort_downloads: "다운로드순",

      btn_upload: "파일 업로드",
      btn_download_sel: "선택 다운로드 (ZIP)",
      btn_delete_sel: "선택 삭제",
      btn_refresh: "새로고침",

      th_name: "파일명",
      th_folder: "폴더",
      th_note: "설명",
      th_size: "용량",
      th_uploaded: "등록일시",
      th_by: "등록자",
      th_dl: "다운로드",
      th_action: "작업",

      act_download: "받기",
      act_edit: "수정",
      act_delete: "삭제",

      empty_title: "등록된 파일이 없습니다.",
      empty_admin: "위의 [파일 업로드] 버튼을 누르거나 이 영역에 파일을 끌어다 놓으세요.",
      empty_viewer: "관리자가 파일을 등록하면 여기에 표시됩니다.",
      empty_search: "검색 조건에 맞는 파일이 없습니다.",

      up_title: "파일 업로드",
      up_drop: "여기에 파일을 끌어다 놓거나 클릭해서 선택하세요",
      up_folder: "폴더 (선택)",
      up_folder_ph: "예: 2026년 리서치",
      up_note: "설명 (선택)",
      up_note_ph: "예: 8월 월간 시황 자료 최종본",
      up_start: "업로드 시작",
      up_done: "완료",
      up_failed: "실패",
      up_max: "최대 업로드 크기",

      ed_title: "파일 정보 수정",
      ed_name: "파일명",
      ed_save: "저장",

      set_title: "관리자 설정",
      set_tab_general: "일반",
      set_tab_password: "비밀번호",
      set_tab_audit: "접속 기록",
      set_site_title: "사이트 이름",
      set_session_hours: "로그인 유지 시간 (시간)",
      set_max_upload: "최대 업로드 크기 (MB)",
      set_viewer_upload: "조회용 사용자도 업로드 허용",
      set_require_name: "로그인 시 이름 입력 필수",
      set_data_dir: "데이터 저장 위치",
      set_save: "설정 저장",
      set_saved: "저장했습니다.",

      pw_which: "변경할 비밀번호",
      pw_viewer: "조회용 (팀원 접속)",
      pw_admin: "관리자 (본인)",
      pw_current: "현재 관리자 비밀번호",
      pw_new: "새 비밀번호",
      pw_new2: "새 비밀번호 확인",
      pw_submit: "비밀번호 변경",
      pw_changed: "비밀번호를 변경했습니다. 기존 접속자는 다시 로그인해야 합니다.",
      pw_mismatch: "새 비밀번호가 서로 다릅니다.",
      pw_short: "새 비밀번호는 6자 이상이어야 합니다.",

      audit_ts: "시각",
      audit_action: "동작",
      audit_actor: "사용자",
      audit_ip: "IP",
      audit_detail: "내용",
      audit_empty: "기록이 없습니다.",

      confirm_delete: "선택한 파일 {n}개를 삭제합니다. 되돌릴 수 없습니다.",
      err_generic: "요청을 처리하지 못했습니다.",
      err_session: "세션이 만료되었습니다. 다시 로그인해 주세요.",
      close: "닫기",
      cancel: "취소",
      selected_n: "{n}개 선택",
    },
    en: {
      tag: "INTERNAL",
      login_title: "Team File Room",
      login_sub: "Intranet file sharing. Enter the password to continue.",
      login_name: "Name (optional)",
      login_name_ph: "e.g. J. Song",
      login_password: "Password",
      login_password_ph: "Admin or view-only password",
      login_submit: "Sign in",
      login_working: "Checking...",
      login_hint: "Ask the administrator for the password.",
      login_offline_note: "This site runs on the internal network only. No internet access required.",

      nav_admin: "Admin",
      nav_viewer: "Viewer",
      nav_settings: "Settings",
      nav_logout: "Sign out",

      stat_files: "Files",
      stat_size: "Total size",
      stat_downloads: "Downloads",
      unit_files: "",

      search_ph: "Search name, note or uploader",
      folder_all: "All folders",
      sort_label: "Sort",
      sort_new: "Newest",
      sort_old: "Oldest",
      sort_name: "Name",
      sort_size: "Size",
      sort_downloads: "Downloads",

      btn_upload: "Upload files",
      btn_download_sel: "Download selected (ZIP)",
      btn_delete_sel: "Delete selected",
      btn_refresh: "Refresh",

      th_name: "File name",
      th_folder: "Folder",
      th_note: "Note",
      th_size: "Size",
      th_uploaded: "Uploaded",
      th_by: "By",
      th_dl: "Downloads",
      th_action: "Actions",

      act_download: "Get",
      act_edit: "Edit",
      act_delete: "Delete",

      empty_title: "No files yet.",
      empty_admin: "Use the Upload button above, or drop files onto this area.",
      empty_viewer: "Files added by the administrator will appear here.",
      empty_search: "No files match this search.",

      up_title: "Upload files",
      up_drop: "Drop files here, or click to browse",
      up_folder: "Folder (optional)",
      up_folder_ph: "e.g. Research 2026",
      up_note: "Note (optional)",
      up_note_ph: "e.g. August monthly outlook, final",
      up_start: "Start upload",
      up_done: "Done",
      up_failed: "Failed",
      up_max: "Max upload size",

      ed_title: "Edit file details",
      ed_name: "File name",
      ed_save: "Save",

      set_title: "Admin settings",
      set_tab_general: "General",
      set_tab_password: "Passwords",
      set_tab_audit: "Access log",
      set_site_title: "Site name",
      set_session_hours: "Session length (hours)",
      set_max_upload: "Max upload size (MB)",
      set_viewer_upload: "Let view-only users upload",
      set_require_name: "Require a name at sign-in",
      set_data_dir: "Data directory",
      set_save: "Save settings",
      set_saved: "Saved.",

      pw_which: "Password to change",
      pw_viewer: "View-only (team)",
      pw_admin: "Admin (you)",
      pw_current: "Current admin password",
      pw_new: "New password",
      pw_new2: "Confirm new password",
      pw_submit: "Change password",
      pw_changed: "Password changed. Existing users must sign in again.",
      pw_mismatch: "The new passwords do not match.",
      pw_short: "New password must be at least 6 characters.",

      audit_ts: "Time",
      audit_action: "Action",
      audit_actor: "User",
      audit_ip: "IP",
      audit_detail: "Detail",
      audit_empty: "No entries.",

      confirm_delete: "Delete {n} selected file(s)? This cannot be undone.",
      err_generic: "The request could not be completed.",
      err_session: "Your session expired. Please sign in again.",
      close: "Close",
      cancel: "Cancel",
      selected_n: "{n} selected",
    },
  };

  var lang = "ko";
  try {
    var saved = global.localStorage.getItem("fs_lang");
    if (saved === "ko" || saved === "en") lang = saved;
  } catch (e) { /* localStorage 차단 환경 */ }

  function T(key, vars) {
    var table = STRINGS[lang] || STRINGS.ko;
    var text = table[key] != null ? table[key] : (STRINGS.ko[key] != null ? STRINGS.ko[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.split("{" + name + "}").join(String(vars[name]));
      });
    }
    return text;
  }

  function apply(root) {
    var scope = root || document;
    document.documentElement.setAttribute("lang", lang);
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = T(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", T(el.getAttribute("data-i18n-ph")));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", T(el.getAttribute("data-i18n-title")));
    });
    scope.querySelectorAll(".lang-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function setLang(next) {
    if (next !== "ko" && next !== "en") return;
    lang = next;
    try { global.localStorage.setItem("fs_lang", next); } catch (e) { /* ignore */ }
    apply();
    if (typeof global.onLangChange === "function") global.onLangChange(next);
  }

  function mountToggle() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
    });
    apply();
  }

  global.I18N = { T: T, apply: apply, setLang: setLang, mountToggle: mountToggle,
                  get lang() { return lang; } };
})(window);
