document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  /* ================= HELPERS ================= */

  const el = id => document.getElementById(id);
  const $$ = sel => document.querySelector(sel);

  function showView(viewId) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(viewId).classList.remove("hidden-view");

    document.querySelectorAll(".bottom-nav button")
      .forEach(b => b.classList.remove("active"));

    const navBtn = document.querySelector(
      `.bottom-nav button[data-target="${viewId}"]`
    );
    if (navBtn) navBtn.classList.add("active");
  }

  /* ================= ELEMENTS ================= */

  const newLetterBtn = el("newLetterBtn");
  const generatePreviewBtn = el("generatePreviewBtn");
  const editLetterBtn = el("editLetterBtn");
  const saveLetterBtn = el("saveLetterBtn");
  const translateBtn = el("translateBtn");
  const saveSettingsBtn = el("saveSettingsBtn");

  const refInput = el("refInput");
  const dateInput = el("dateInput");
  const toInput = el("toInput");
  const bodyInput = el("bodyInput");

  const printRefCheck = el("printRefCheck");
  const printToCheck = el("printToCheck");
  const printGreetingCheck = el("printGreetingCheck");
  const printHindiNameCheck = el("printHindiNameCheck");
  const printSadarGreetingCheck = el("printSadarGreetingCheck");

  const targetLangSelect = el("targetLangSelect");

  const refText = el("refText");
  const dateText = el("dateText");
  const toText = el("toText");
  const letterBody = el("letterBody");

  const refDisplay = el("refDisplay");
  const toDisplay = el("toDisplay");
  const greetingDisplay = el("greetingDisplay");
  const greetingSubLine = el("greetingSubLine");
  const sadarGreetingLine = el("sadarGreetingLine");

  const historyList = el("historyList");

  /* Letterhead */
  const h1 = el("h1");
  const h2 = el("h2");
  const h3 = el("h3");
  const h4 = el("h4");
  const h5 = el("h5");
  const footerBar = el("footerBar");

  /* Settings */
  const settingH1 = el("settingH1");
  const settingH2 = el("settingH2");
  const settingH3 = el("settingH3");
  const settingH4 = el("settingH4");
  const settingH5 = el("settingH5");
  const settingFooterAddr = el("settingFooterAddr");

  /* ================= INIT ================= */

  initDate();
  loadSettings();
  fetchHistory();

  /* ================= DASHBOARD → CREATE ================= */

  newLetterBtn.onclick = async () => {
    clearForm();
    await setNextRef();
    showView("createLetterView");
  };

  /* ================= PREVIEW ================= */

  generatePreviewBtn.onclick = () => {
    buildPreview();
    showView("previewView");
  };

  editLetterBtn.onclick = () => {
    showView("createLetterView");
  };

  /* ================= SETTINGS ================= */

  saveSettingsBtn.onclick = () => {
    const settings = {
      h1: settingH1.value,
      h2: settingH2.value,
      h3: settingH3.value,
      h4: settingH4.value,
      h5: settingH5.value,
      footer: settingFooterAddr.value
    };
    localStorage.setItem("jmmSettings", JSON.stringify(settings));
    applySettings(settings);
    alert("Settings saved");
  };

  function loadSettings() {
    const s = JSON.parse(localStorage.getItem("jmmSettings")) || {
      h1: "جماعت المسلمین مانچے",
      h2: "जमातुल मुस्लिमीन मणचे",
      h3: "Jamatul Muslimeen Manche",
      h4: "Reg No. F-3495/10/08/10",
      h5: "मुक्काम पोस्ट मणचे, मुस्लिमीन वाडी, तालुका देवगड, जिल्हा सिंधुदुर्ग, महाराष्ट्र.",
      footer:
        "PERMANENT ADDRESS: AT POST MANCHE, TALUKA DEVGAD, DISTRICT SINDHUDURG, PIN - 416811."
    };

    settingH1.value = s.h1;
    settingH2.value = s.h2;
    settingH3.value = s.h3;
    settingH4.value = s.h4;
    settingH5.value = s.h5;
    settingFooterAddr.value = s.footer;

    applySettings(s);
  }

  function applySettings(s) {
    h1.textContent = s.h1;
    h2.textContent = s.h2;
    h3.textContent = s.h3;
    h4.textContent = s.h4;
    h5.textContent = s.h5;
    footerBar.textContent = s.footer;
  }

  /* ================= AUTO REF ================= */

  async function setNextRef() {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "getNextRef" })
      });
      const data = await res.json();
      if (data.nextRef) {
        refInput.value = data.nextRef;
        localStorage.setItem("lastRef", data.nextRef);
        return;
      }
    } catch {}

    const last = localStorage.getItem("lastRef") || "JMM-000";
    const next = incrementRef(last);
    refInput.value = next;
    localStorage.setItem("lastRef", next);
  }

  function incrementRef(ref) {
    const n = parseInt(ref.split("-")[1] || "0", 10) + 1;
    return `JMM-${String(n).padStart(3, "0")}`;
  }

  /* ================= PREVIEW BUILD ================= */

  function buildPreview() {
    refText.textContent = refInput.value;
    toText.textContent = toInput.value;
    letterBody.textContent = bodyInput.value;
    updateDate(dateInput.value);

    toggle(refDisplay, printRefCheck.checked);
    toggle(toDisplay, printToCheck.checked);
    toggle(greetingDisplay, printGreetingCheck.checked);
    toggle(greetingSubLine, printHindiNameCheck.checked);
    toggle(sadarGreetingLine, printSadarGreetingCheck.checked);
  }

  function toggle(node, show) {
    node.style.display = show ? "" : "none";
  }

  /* ================= SAVE LETTER ================= */

  saveLetterBtn.onclick = () => {
    const payload = {
      action: "save",
      data: {
        ref: refInput.value,
        date: dateInput.value,
        to: toInput.value,
        body: bodyInput.value
      }
    };

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(() => {
      alert("Letter saved");
      fetchHistory();
      showView("dashboardView");
    });
  };

  /* ================= TRANSLATION ================= */

  translateBtn.onclick = () => {
    translateBtn.disabled = true;

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "translate",
        targetLang: targetLangSelect.value,
        text: { body: bodyInput.value, to: toInput.value }
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.translated) {
          bodyInput.value = d.translated.body || bodyInput.value;
          toInput.value = d.translated.to || toInput.value;
        }
      })
      .finally(() => translateBtn.disabled = false);
  };

  /* ================= HISTORY ================= */

  function fetchHistory() {
    historyList.innerHTML = "Loading…";
    fetch(GOOGLE_SCRIPT_URL)
      .then(r => r.json())
      .then(items => {
        historyList.innerHTML = "";
        if (!items.length) {
          historyList.innerHTML = "No letters found";
          return;
        }
        items.forEach(l => {
          const d = document.createElement("div");
          d.className = "history-item";
          d.innerHTML = `<b>${l.ref}</b><br><small>${l.date}</small>`;
          d.onclick = () => loadLetter(l.content);
          historyList.appendChild(d);
        });
      });
  }

  function loadLetter(json) {
    const d = JSON.parse(json);
    refInput.value = d.ref || "";
    dateInput.value = d.date || "";
    toInput.value = d.to || "";
    bodyInput.value = d.body || "";
    showView("createLetterView");
  }

  /* ================= UTIL ================= */

  function initDate() {
    const t = new Date().toISOString().split("T")[0];
    dateInput.value = t;
    updateDate(t);
  }

  function updateDate(d) {
    const dt = new Date(d);
    dateText.textContent =
      `${String(dt.getDate()).padStart(2, "0")}/` +
      `${String(dt.getMonth() + 1).padStart(2, "0")}/` +
      dt.getFullYear();
  }

  function clearForm() {
    toInput.value = "";
    bodyInput.value = "";
  }

});
