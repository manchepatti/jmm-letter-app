document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let mode = "new";
  let currentRef = null;
  let currentRowIndex = null;

  /* ================= INIT ================= */

  show("dashboardView");
  setToday();
  fetchHistory();   // 🔑 REQUIRED
  // ref will be fetched when Create opens

  /* ================= DATE ================= */

  function setToday() {
    const d = new Date().toISOString().split("T")[0];
    if (el("dateInput")) el("dateInput").value = d;
  }

  /* ================= NAVIGATION ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.target;
      if (!target) return;

      show(target);

      if (target === "createLetterView") {
        mode = "new";
        currentRowIndex = null;
        peekRef(); // 🔑 REQUIRED
      }
    };
  });

  function show(id) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    const page = el(id);
    if (page) page.classList.remove("hidden-view");
  }

  /* ================= REF (PEEK) ================= */

  async function peekRef() {
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });

      const data = await res.json();
      if (!data.nextRef) throw "no ref";

      currentRef = data.nextRef;
      el("refInput").value = currentRef;
      el("refHelpText").textContent =
        `This letter will be saved with Ref No: ${currentRef}`;

    } catch (e) {
      console.error("peekRef failed", e);
      currentRef = null;
      el("refInput").value = "";
      el("refHelpText").textContent =
        "Ref No will be generated on save";
    }
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = async () => {
    if (!currentRef) await peekRef();

    el("refText").textContent = currentRef || "";
    el("dateText").textContent = el("dateInput").value;
    el("toText").textContent = el("toInput").value;
    el("subjectText").textContent = el("subjectInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    show("previewView");
  };

  el("editLetterBtn").onclick = () => {
    show("createLetterView");
  };

  /* ================= SAVE ================= */

  el("saveLetterBtn").onclick = async () => {
    if (!el("subjectInput").value.trim()) {
      alert("Subject required");
      return;
    }

    if (mode === "new") {
      const r = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "save",
          data: collectData()
        })
      });
      const j = await r.json();
      alert(`Saved as ${j.ref}`);
    } else {
      await fetch(SCRIPT_URL, {
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
    fetchHistory();     // 🔑 REQUIRED
    show("dashboardView");
  };

  /* ================= HISTORY ================= */

  function fetchHistory() {
    fetch(SCRIPT_URL)
      .then(r => r.json())
      .then(list => {
        const h = el("historyList");
        if (!h) return;

        h.innerHTML = "";

        list.reverse().forEach(l => {
          const card = document.createElement("div");
          card.className = "history-item";

          card.innerHTML = `
            <div class="history-info">
              <b>${l.ref}</b><br>
              ${l.subject || ""}<br>
              <small>${l.date || ""}</small>
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
            show("previewView");
          };
          card.querySelector(".del-btn").onclick = () => {
            if (confirm(`Delete ${l.ref}?`)) deleteLetter(l.rowIndex);
          };

          h.appendChild(card);
        });
      })
      .catch(err => {
        console.error("history fetch failed", err);
      });
  }

  /* ================= EDIT ================= */

  function loadForEdit(l) {
    const d = JSON.parse(l.raw || "{}");

    mode = "edit";
    currentRef = l.ref;
    currentRowIndex = l.rowIndex;

    el("refInput").value = currentRef;
    el("refHelpText").textContent =
      `This letter will be saved with Ref No: ${currentRef}`;

    el("dateInput").value = d.date || l.date || "";
    el("subjectInput").value = d.subject || l.subject || "";
    el("toInput").value = d.address || "";
    el("bodyInput").value = d.content || "";

    show("createLetterView");
  }

  /* ================= DELETE ================= */

  function deleteLetter(rowIndex) {
    fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", rowIndex })
    }).then(fetchHistory);
  }

  /* ================= HELPERS ================= */

  function collectData() {
    return {
      date: el("dateInput").value,
      subject: el("subjectInput").value,
      address: el("toInput").value,
      content: el("bodyInput").value
    };
  }

  function resetForm() {
    mode = "new";
    currentRef = null;
    currentRowIndex = null;
    el("refInput").value = "";
    el("refHelpText").textContent = "Ref No will be generated on save";
    setToday();
    el("subjectInput").value = "";
    el("toInput").value = "";
    el("bodyInput").value = "";
  }

});