/* 팀 자료실 — 목록 / 업로드 / 관리. 외부 의존성 없음 (오프라인 동작). */
(function () {
  "use strict";
  var T = I18N.T;

  var state = {
    role: "viewer",
    canUpload: false,
    maxUploadMb: 1024,
    files: [],
    folders: [],
    stats: { count: 0, bytes: 0, downloads: 0 },
    selected: {},
    queue: [],
  };

  var $ = function (id) { return document.getElementById(id); };

  // ---------- 공통 ----------
  function api(path, options) {
    var opts = options || {};
    opts.credentials = "same-origin";
    opts.headers = Object.assign({ "X-Fileshare": "1" }, opts.headers || {});
    if (opts.json !== undefined) {
      opts.method = opts.method || "POST";
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.json);
      delete opts.json;
    }
    return fetch(path, opts).then(function (res) {
      if (res.status === 401) { location.href = "/login"; throw new Error("unauthorized"); }
      var type = res.headers.get("Content-Type") || "";
      if (type.indexOf("application/json") === -1) {
        if (!res.ok) throw new Error(T("err_generic"));
        return res;
      }
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.message || T("err_generic"));
        return data;
      });
    });
  }

  var toastTimer = null;
  function toast(message) {
    var box = $("toast");
    box.textContent = message;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.hidden = true; }, 3200);
  }

  function showMsg(el, message, ok) {
    el.textContent = message;
    el.classList.toggle("ok", !!ok);
    el.classList.add("is-on");
  }
  function hideMsg(el) { el.classList.remove("is-on"); }

  function formatBytes(bytes) {
    var n = Number(bytes) || 0;
    var units = ["B", "KB", "MB", "GB", "TB"];
    var i = 0;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
    return (i === 0 ? n : n.toFixed(n >= 100 ? 0 : 1)) + " " + units[i];
  }

  function formatTime(epochSeconds) {
    var d = new Date((Number(epochSeconds) || 0) * 1000);
    if (isNaN(d.getTime())) return "-";
    var p = function (v) { return String(v).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
           " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function openModal(id) { $(id).hidden = false; }
  function closeModal(id) { $(id).hidden = true; }

  document.addEventListener("click", function (event) {
    var closer = event.target.closest("[data-close]");
    if (closer) {
      var back = closer.closest(".modal-back");
      if (back) back.hidden = true;
    }
    if (event.target.classList.contains("modal-back")) event.target.hidden = true;
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-back:not([hidden])").forEach(function (m) { m.hidden = true; });
    }
  });

  // ---------- 세션 ----------
  function loadSession() {
    return api("/api/session").then(function (data) {
      if (!data.authenticated) { location.href = "/login"; return; }
      state.role = data.role;
      state.canUpload = !!data.can_upload;
      state.maxUploadMb = data.max_upload_mb || 1024;

      $("siteTitle").textContent = data.site_title || "";
      document.title = data.site_title || "";
      var chip = $("roleChip");
      chip.textContent = T(data.role === "admin" ? "nav_admin" : "nav_viewer");
      chip.classList.toggle("admin", data.role === "admin");

      $("settingsBtn").hidden = data.role !== "admin";
      $("deleteBtn").hidden = data.role !== "admin";
      $("uploadBtn").hidden = !state.canUpload;
      $("maxSize").textContent = state.maxUploadMb + " MB";
    });
  }

  // ---------- 파일 목록 ----------
  function loadFiles() {
    return api("/api/files").then(function (data) {
      state.files = data.files || [];
      state.folders = data.folders || [];
      state.stats = data.stats || state.stats;
      var alive = {};
      state.files.forEach(function (f) { if (state.selected[f.id]) alive[f.id] = true; });
      state.selected = alive;
      renderStats();
      renderFolderOptions();
      render();
    });
  }

  function renderStats() {
    $("statCount").textContent = state.stats.count;
    $("statSize").textContent = formatBytes(state.stats.bytes);
    $("statDownloads").textContent = state.stats.downloads;
  }

  function renderFolderOptions() {
    var select = $("folderFilter");
    var current = select.value;
    select.innerHTML = "";
    var all = document.createElement("option");
    all.value = "";
    all.textContent = T("folder_all");
    select.appendChild(all);
    state.folders.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
    select.value = state.folders.indexOf(current) >= 0 ? current : "";

    var list = $("folderList");
    list.innerHTML = "";
    state.folders.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      list.appendChild(option);
    });
  }

  function visibleFiles() {
    var term = $("search").value.trim().toLowerCase();
    var folder = $("folderFilter").value;
    var sort = $("sort").value;

    var rows = state.files.filter(function (f) {
      if (folder && (f.folder || "") !== folder) return false;
      if (!term) return true;
      return [f.name, f.note, f.folder, f.uploaded_by].some(function (v) {
        return String(v || "").toLowerCase().indexOf(term) >= 0;
      });
    });

    var comparators = {
      new: function (a, b) { return (b.uploaded_at || 0) - (a.uploaded_at || 0); },
      old: function (a, b) { return (a.uploaded_at || 0) - (b.uploaded_at || 0); },
      name: function (a, b) { return String(a.name).localeCompare(String(b.name), "ko"); },
      size: function (a, b) { return (b.size || 0) - (a.size || 0); },
      downloads: function (a, b) { return (b.downloads || 0) - (a.downloads || 0); },
    };
    return rows.sort(comparators[sort] || comparators.new);
  }

  function cell(row, text, className) {
    var td = document.createElement("td");
    if (className) td.className = className;
    if (text !== undefined) td.textContent = text;
    row.appendChild(td);
    return td;
  }

  function render() {
    var area = $("listArea");
    var rows = visibleFiles();
    area.innerHTML = "";

    if (!rows.length) {
      var empty = document.createElement("div");
      empty.className = "empty";
      var title = document.createElement("h3");
      var note = document.createElement("p");
      if (state.files.length) {
        title.textContent = T("empty_search");
      } else {
        title.textContent = T("empty_title");
        note.textContent = state.canUpload ? T("empty_admin") : T("empty_viewer");
      }
      empty.appendChild(title);
      empty.appendChild(note);
      area.appendChild(empty);
      updateSelectionUI();
      return;
    }

    var wrap = document.createElement("div");
    wrap.className = "table-wrap";
    var table = document.createElement("table");
    table.className = "files";

    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");
    var checkTh = document.createElement("th");
    checkTh.className = "cell-check";
    var checkAll = document.createElement("input");
    checkAll.type = "checkbox";
    checkAll.checked = rows.every(function (f) { return state.selected[f.id]; });
    checkAll.addEventListener("change", function () {
      rows.forEach(function (f) {
        if (checkAll.checked) state.selected[f.id] = true;
        else delete state.selected[f.id];
      });
      render();
    });
    checkTh.appendChild(checkAll);
    headRow.appendChild(checkTh);

    [["th_name", ""], ["th_folder", ""], ["th_note", ""], ["th_size", "num"],
     ["th_uploaded", ""], ["th_by", ""], ["th_dl", "num"], ["th_action", "actions"]]
      .forEach(function (pair) {
        var th = document.createElement("th");
        th.className = pair[1];
        th.textContent = T(pair[0]);
        headRow.appendChild(th);
      });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    rows.forEach(function (file) {
      var tr = document.createElement("tr");
      if (state.selected[file.id]) tr.classList.add("is-sel");

      var checkTd = document.createElement("td");
      checkTd.className = "cell-check";
      var check = document.createElement("input");
      check.type = "checkbox";
      check.checked = !!state.selected[file.id];
      check.addEventListener("change", function () {
        if (check.checked) state.selected[file.id] = true;
        else delete state.selected[file.id];
        tr.classList.toggle("is-sel", check.checked);
        updateSelectionUI();
      });
      checkTd.appendChild(check);
      tr.appendChild(checkTd);

      var nameTd = cell(tr);
      var link = document.createElement("a");
      link.className = "fname";
      link.href = "/api/download/" + file.id;
      link.textContent = file.name;
      link.setAttribute("download", file.name);
      nameTd.appendChild(link);

      var folderTd = cell(tr);
      if (file.folder) {
        var chip = document.createElement("span");
        chip.className = "folder-chip";
        chip.textContent = file.folder;
        folderTd.appendChild(chip);
      }

      cell(tr, file.note || "", "fnote");
      cell(tr, formatBytes(file.size), "num nowrap");
      cell(tr, formatTime(file.uploaded_at), "nowrap");
      cell(tr, file.uploaded_by || "-", "nowrap");
      cell(tr, String(file.downloads || 0), "num");

      var actionTd = cell(tr, undefined, "actions");
      var getBtn = document.createElement("button");
      getBtn.type = "button";
      getBtn.className = "btn-link";
      getBtn.textContent = T("act_download");
      getBtn.addEventListener("click", function () { downloadOne(file); });
      actionTd.appendChild(getBtn);

      if (state.role === "admin") {
        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn-link";
        editBtn.textContent = T("act_edit");
        editBtn.addEventListener("click", function () { openEdit(file); });
        actionTd.appendChild(editBtn);

        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-link danger";
        delBtn.textContent = T("act_delete");
        delBtn.addEventListener("click", function () { removeFiles([file.id]); });
        actionTd.appendChild(delBtn);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    area.appendChild(wrap);
    updateSelectionUI();
  }

  function selectedIds() { return Object.keys(state.selected); }

  function updateSelectionUI() {
    var count = selectedIds().length;
    $("selCount").textContent = count ? T("selected_n", { n: count }) : "";
    $("zipBtn").disabled = count === 0;
    $("deleteBtn").disabled = count === 0;
  }

  // ---------- 다운로드 ----------
  function downloadOne(file) {
    var frame = document.createElement("a");
    frame.href = "/api/download/" + file.id;
    frame.setAttribute("download", file.name);
    document.body.appendChild(frame);
    frame.click();
    frame.remove();
    setTimeout(loadFiles, 1200);
  }

  function downloadZip() {
    var ids = selectedIds();
    if (!ids.length) return;
    $("zipBtn").disabled = true;
    api("/api/zip", { json: { ids: ids } })
      .then(function (data) {
        location.href = "/api/zip/" + data.token;
        setTimeout(loadFiles, 1500);
      })
      .catch(function (error) { toast(error.message); })
      .then(function () { updateSelectionUI(); });
  }

  // ---------- 업로드 ----------
  function queueFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (file) {
      state.queue.push({ file: file, status: "wait", progress: 0 });
    });
    renderQueue();
  }

  function renderQueue() {
    var list = $("upList");
    list.innerHTML = "";
    state.queue.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "uprow";
      var top = document.createElement("div");
      top.className = "top";
      var name = document.createElement("span");
      name.className = "nm";
      name.textContent = item.file.name;
      var status = document.createElement("span");
      status.className = "st" + (item.status === "done" ? " ok" : item.status === "error" ? " err" : "");
      status.textContent = item.status === "done" ? T("up_done")
        : item.status === "error" ? T("up_failed") + (item.message ? " · " + item.message : "")
        : item.status === "sending" ? item.progress + "%"
        : formatBytes(item.file.size);
      top.appendChild(name);
      top.appendChild(status);
      row.appendChild(top);

      var bar = document.createElement("progress");
      bar.className = "bar";
      bar.max = 100;
      bar.value = item.status === "done" ? 100 : item.progress;
      row.appendChild(bar);
      list.appendChild(row);
    });
    $("upStart").disabled = !state.queue.some(function (i) { return i.status === "wait"; });
  }

  function uploadOne(item, folder, note) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.withCredentials = true;
      xhr.setRequestHeader("X-Fileshare", "1");
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(item.file.name));
      xhr.setRequestHeader("X-Folder", encodeURIComponent(folder));
      xhr.setRequestHeader("X-Note", encodeURIComponent(note));

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          item.status = "sending";
          item.progress = Math.round((event.loaded / event.total) * 100);
          renderQueue();
        }
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          item.status = "done";
          item.progress = 100;
        } else {
          item.status = "error";
          try { item.message = JSON.parse(xhr.responseText).message; } catch (e) { item.message = ""; }
        }
        renderQueue();
        resolve();
      };
      xhr.onerror = function () {
        item.status = "error";
        item.message = "";
        renderQueue();
        resolve();
      };
      xhr.send(item.file);
    });
  }

  function startUpload() {
    hideMsg($("upErr"));
    var folder = $("upFolder").value.trim();
    var note = $("upNote").value.trim();
    var pending = state.queue.filter(function (i) { return i.status === "wait"; });
    if (!pending.length) return;

    var limit = state.maxUploadMb * 1024 * 1024;
    var tooBig = pending.filter(function (i) { return i.file.size > limit; });
    tooBig.forEach(function (i) { i.status = "error"; i.message = "> " + state.maxUploadMb + "MB"; });
    pending = pending.filter(function (i) { return i.status === "wait"; });
    renderQueue();
    if (!pending.length) return;

    $("upStart").disabled = true;
    var chain = Promise.resolve();
    pending.forEach(function (item) {
      chain = chain.then(function () { return uploadOne(item, folder, note); });
    });
    chain.then(function () {
      loadFiles();
      var failed = state.queue.filter(function (i) { return i.status === "error"; });
      if (failed.length) showMsg($("upErr"), T("up_failed") + " · " + failed.length);
      else {
        toast(T("up_done"));
        setTimeout(function () {
          closeModal("uploadModal");
          state.queue = [];
          renderQueue();
        }, 700);
      }
    });
  }

  // ---------- 수정 / 삭제 ----------
  var editingId = null;

  function openEdit(file) {
    editingId = file.id;
    $("edName").value = file.name;
    $("edFolder").value = file.folder || "";
    $("edNote").value = file.note || "";
    openModal("editModal");
    $("edName").focus();
  }

  function saveEdit() {
    if (!editingId) return;
    api("/api/file/update", {
      json: {
        id: editingId,
        name: $("edName").value.trim(),
        folder: $("edFolder").value.trim(),
        note: $("edNote").value.trim(),
      },
    })
      .then(function () { closeModal("editModal"); return loadFiles(); })
      .catch(function (error) { toast(error.message); });
  }

  function removeFiles(ids) {
    if (!ids.length) return;
    if (!confirm(T("confirm_delete", { n: ids.length }))) return;
    api("/api/file/delete", { json: { ids: ids } })
      .then(function () {
        ids.forEach(function (id) { delete state.selected[id]; });
        return loadFiles();
      })
      .catch(function (error) { toast(error.message); });
  }

  // ---------- 설정 ----------
  function openSettings() {
    hideMsg($("setMsg"));
    hideMsg($("pwMsg"));
    api("/api/settings").then(function (data) {
      $("setTitle").value = data.site_title || "";
      $("setHours").value = data.session_hours;
      $("setMaxMb").value = data.max_upload_mb;
      $("setViewerUpload").checked = !!data.viewer_can_upload;
      $("setRequireName").checked = !!data.require_name;
      $("setDataDir").textContent = data.data_dir;
      openModal("settingsModal");
    }).catch(function (error) { toast(error.message); });
  }

  function saveSettings() {
    api("/api/settings", {
      json: {
        site_title: $("setTitle").value.trim(),
        session_hours: Number($("setHours").value),
        max_upload_mb: Number($("setMaxMb").value),
        viewer_can_upload: $("setViewerUpload").checked,
        require_name: $("setRequireName").checked,
      },
    })
      .then(function (data) {
        showMsg($("setMsg"), T("set_saved"), true);
        state.maxUploadMb = data.max_upload_mb;
        $("maxSize").textContent = data.max_upload_mb + " MB";
        return loadSession();
      })
      .catch(function (error) { showMsg($("setMsg"), error.message); });
  }

  function changePassword() {
    var next = $("pwNew").value;
    if (next !== $("pwNew2").value) { showMsg($("pwMsg"), T("pw_mismatch")); return; }
    if (next.length < 6) { showMsg($("pwMsg"), T("pw_short")); return; }
    api("/api/password", {
      json: { target: $("pwTarget").value, current: $("pwCurrent").value, new: next },
    })
      .then(function () {
        showMsg($("pwMsg"), T("pw_changed"), true);
        $("pwCurrent").value = ""; $("pwNew").value = ""; $("pwNew2").value = "";
      })
      .catch(function (error) { showMsg($("pwMsg"), error.message); });
  }

  function loadAudit() {
    api("/api/audit?limit=300").then(function (data) {
      var body = $("auditBody");
      body.innerHTML = "";
      if (!data.entries.length) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = T("audit_empty");
        tr.appendChild(td);
        body.appendChild(tr);
        return;
      }
      data.entries.forEach(function (entry) {
        var tr = document.createElement("tr");
        cell(tr, entry.ts, "ts");
        cell(tr, entry.action);
        cell(tr, entry.actor || "-");
        cell(tr, entry.ip || "-", "ip");
        cell(tr, entry.detail || "");
        body.appendChild(tr);
      });
    }).catch(function (error) { toast(error.message); });
  }

  // ---------- 이벤트 ----------
  function bind() {
    $("search").addEventListener("input", render);
    $("folderFilter").addEventListener("change", render);
    $("sort").addEventListener("change", render);
    $("zipBtn").addEventListener("click", downloadZip);
    $("deleteBtn").addEventListener("click", function () { removeFiles(selectedIds()); });

    $("uploadBtn").addEventListener("click", function () {
      hideMsg($("upErr"));
      state.queue = [];
      renderQueue();
      openModal("uploadModal");
    });
    $("dropzone").addEventListener("click", function () { $("fileInput").click(); });
    $("fileInput").addEventListener("change", function () {
      queueFiles($("fileInput").files);
      $("fileInput").value = "";
    });
    ["dragenter", "dragover"].forEach(function (name) {
      $("dropzone").addEventListener(name, function (event) {
        event.preventDefault();
        $("dropzone").classList.add("is-over");
      });
    });
    ["dragleave", "drop"].forEach(function (name) {
      $("dropzone").addEventListener(name, function (event) {
        event.preventDefault();
        $("dropzone").classList.remove("is-over");
      });
    });
    $("dropzone").addEventListener("drop", function (event) {
      if (event.dataTransfer && event.dataTransfer.files.length) queueFiles(event.dataTransfer.files);
    });
    window.addEventListener("dragover", function (e) { e.preventDefault(); });
    window.addEventListener("drop", function (e) { e.preventDefault(); });
    $("upStart").addEventListener("click", startUpload);

    $("edSave").addEventListener("click", saveEdit);

    $("settingsBtn").addEventListener("click", openSettings);
    $("setSave").addEventListener("click", saveSettings);
    $("pwSave").addEventListener("click", changePassword);
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.getAttribute("data-tab");
        document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
        document.querySelectorAll(".tabpane").forEach(function (pane) {
          pane.hidden = pane.getAttribute("data-pane") !== name;
        });
        if (name === "audit") loadAudit();
      });
    });

    $("logoutBtn").addEventListener("click", function () {
      api("/api/logout", { method: "POST" })
        .then(function () { location.href = "/login"; })
        .catch(function () { location.href = "/login"; });
    });
  }

  window.onLangChange = function () {
    var chip = $("roleChip");
    chip.textContent = T(state.role === "admin" ? "nav_admin" : "nav_viewer");
    render();
    renderQueue();
    renderFolderOptions();
  };

  I18N.mountToggle();
  bind();
  loadSession().then(loadFiles).catch(function () { /* 401 시 로그인으로 이동 */ });
})();
