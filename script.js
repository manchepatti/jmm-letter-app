document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let mode = "new";
  let currentRef = null;
  let currentRowIndex = null;

  /* ================= INITIAL PAGE ================= */
  show("dashboardView");

  /* ================= DATE ================= */
  const today = () => new Date().toISOString().split("T")[0];
  el("dateInput").value = today();

  /* ================= LETTERHEAD ================= */
  function loadLetterhead() {
    const s = JSON.parse(localStorage.getItem("jmmSettings")) || {};

    el("h1").textContent = s.h1 || "";
    el("h2").textContent = s.h2 || "";
    el("h3").textContent = s.h3 || "";
    el("h4").textContent = s.h4 || "";
    el("h5").textContent = s.h5 || "";
    el("footerBar").textContent = s.footer || "";
  }
  loadLetterhead();

  /* ================= SETTINGS SAVE ================= */
  el("saveSettingsBtn").onclick = () => {
    const settings = {
      h1: el("settingH1").value,
      h2: el("settingH2").value,
      h3: el("settingH3").value,
      h4: el("settingH4").value,
      h5: el("settingH5").value,
      footer: el("settingFooterAddr").value
    };
    localStorage.setItem("jmmSettings", JSON.stringify(settings));
    alert("Settings saved");
    loadLetterhead();
  };

  /* ================= NAVIGATION ================= */
  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (!target) return;

      show(target);

      if (target === "createLetterView") {
        mode = "new";
        currentRowIndex = null;
        peekRef();
      }
    });
  });

  /* ================= SHOW PAGE ================= */
  function show(viewId) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(viewId).classList.remove("hidden-view");
  }

  /* ================= REF ================= */
  async function peekRef() {
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });
      const data = await res.json();
      if (!data.nextRef) throw "bad";

      currentRef = data.nextRef;
      el("refInput").value = currentRef;
      el("refHelpText").textContent =
        `This letter will be saved with Ref No: ${currentRef}`;
    } catch {
      currentRef = null;
      el("refInput").value = "";
      el("refHelpText").textContent = "Ref No will be generated on save";
    }
  }

  /* ================= PREVIEW ================= */
  el("generatePreviewBtn").onclick = async () => {
    if (!currentRef) await peekRef();

    loadLetterhead(); // 🔑 FIX

    el("refText").textContent = currentRef || "";
    el("dateText").textContent = formatDate(el("dateInput").value);
    el("toText").textContent = el("toInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    show("previewView");
  };

  el("editLetterBtn").onclick = () => show("createLetterView");

  /* ================= SAVE ================= */
  el("saveLetterBtn").onclick = async () => {
    if (!el("subjectInput").value.trim()) {
      alert("Subject is required");
      return;
    }

    if (mode === "new") {
      const r = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "save", data: collectData() })
      });
      const j = await r.json();
      alert(`Saved as ${j.ref}`);
    } else {
      await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "update",
          rowIndex: currentRowIndex,
          data: collectData()
        })
      });
      alert(`Updated ${currentRef}`);
    }

    resetForm();
    fetchHistory();
    show("dashboardView");
  };

  /* ================= HISTORY ================= */
  function fetchHistory() {
    fetch(URL)
      .then(r => r.json())
      .then(list => {
        const h = el("historyList");
        h.innerHTML = "";

        list.reverse().forEach(l => {
          const card = document.createElement("div");
          card.className = "history-item";
          card.innerHTML = `
            <div class="history-info">
              <b>${l.ref}</b><br>
              ${l.subject}<br>
              <small>${l.date}</small>
            </div>
            <div class="history-actions">
              <button class="edit-btn">✏️</button>
              <button class="preview-btn">👁</button>
              <button class="del-btn">🗑</button>
            </div>
          `;

          card.querySelector(".edit-btn").onclick = () => loadForEdit(l);
          card.querySelector(".preview-btn").onclick = () => {
            loadForEdit(l);
            loadLetterhead();
            show("previewView");
          };
          card.querySelector(".del-btn").onclick = () => {
            if (confirm(`Delete ${l.ref}?`)) deleteLetter(l.rowIndex);
          };

          h.appendChild(card);
        });
      });
  }
  fetchHistory();

  /* ================= EDIT ================= */
  function loadForEdit(l) {
    const d = JSON.parse(l.raw || "{}");
    mode = "edit";
    currentRef = l.ref;
    currentRowIndex = l.rowIndex;

    el("refInput").value = currentRef;
    el("refHelpText").textContent =
      `This letter will be saved with Ref No: ${currentRef}`;

    el("dateInput").value = d.date || l.date;
    el("subjectInput").value = d.subject || l.subject;
    el("toInput").value = d.address || l.address;
    el("bodyInput").value = d.content || l.content;

    show("createLetterView");
  }

  /* ================= DELETE ================= */
  function deleteLetter(rowIndex) {
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", rowIndex })
    }).then(fetchHistory);
  }

  /* ================= HELPERS ================= */
  function collectData() {
    return {
      date: el("dateInput").value,
      language: el("targetLangSelect").value,
      subject: el("subjectInput").value,
      address: el("toInput").value,
      content: el("bodyInput").value,
      greetingIncluded: el("printGreetingCheck").checked
    };
  }

  function resetForm() {
    mode = "new";
    currentRef = null;
    currentRowIndex = null;
    el("refInput").value = "";
    el("refHelpText").textContent = "Ref No will be generated on save";
    el("dateInput").value = today();
    el("subjectInput").value = "";
    el("toInput").value = "";
    el("bodyInput").value = "";
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  }

});
