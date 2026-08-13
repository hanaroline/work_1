/* 로그인 화면 */
(function () {
  "use strict";
  var T = I18N.T;

  var form = document.getElementById("loginForm");
  var errBox = document.getElementById("err");
  var submitBtn = document.getElementById("submitBtn");
  var nameField = document.getElementById("nameField");
  var nameInput = document.getElementById("name");

  I18N.mountToggle();

  function showError(message) {
    errBox.textContent = message;
    errBox.classList.add("is-on");
  }

  fetch("/api/session", { credentials: "same-origin" })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.authenticated) { location.href = "/app"; return; }
      if (data.site_title) {
        document.getElementById("siteTitle").textContent = data.site_title;
        document.title = data.site_title;
      }
      if (data.require_name) {
        nameInput.required = true;
        nameField.querySelector("label").textContent =
          T("login_name").replace(/\s*\(.*\)$/, "") + " *";
      }
    })
    .catch(function () { /* 오프라인/서버 재시작 — 폼은 그대로 사용 */ });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errBox.classList.remove("is-on");
    submitBtn.disabled = true;
    submitBtn.textContent = T("login_working");

    fetch("/api/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: document.getElementById("password").value,
        name: nameInput.value,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (result.ok) { location.href = "/app"; return; }
        showError(result.data.message || T("err_generic"));
        submitBtn.disabled = false;
        submitBtn.textContent = T("login_submit");
        document.getElementById("password").select();
      })
      .catch(function () {
        showError(T("err_generic"));
        submitBtn.disabled = false;
        submitBtn.textContent = T("login_submit");
      });
  });
})();
