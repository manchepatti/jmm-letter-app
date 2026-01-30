document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let mode = "new";           // new | edit
  let currentRef = null;
  let currentRowIndex = null;

  /* ================= DATE ================= */

  function today() {
    return new Date().toISOString().split("T")[0];
  }
  el("dateInput").value = today();

  /* ================= LETTERHEAD ================= */

  function loadSettings() {
    const s = JSON.parse(localStorage.getItem("jmmSettings")) || {};
    el("h1").textContent = s.h1 || "";
    el("h2").textContent = s.h2 || "";
    el("h3").textContent = s.h3 || "";
    el("h4").textContent = s.h4 || "";
    el("h5").textContent = s.h5 || "";
    el("footerBar").textContent = s.footer || "";
  }
  loadSettings();

  /* ================= NAV ================= */

  document.querySelectorAll(".bottom-nav button").forEach(b => {
    b.onclick = () => {
      document.querySelectorAll(".view-page")
        .forEach(v => v.classList.add("hidden-view"));
      el(b.dataset.target).classList.remove("hidden-view");

      if (b.dataset.target === "createLetterView" && mode === "new") {
        safePeekRef();
      }
    };
  });

  /* ================= SAFE REF ================= */

  async function safePeekRef() {
    try {
      const r = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });
      const j = await r.json();
      el("refInput").value = j.nextRef;
      currentRef = j.nextRef;
    } catch {
      el("refInput").value = "";
    }
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = async () => {

    if (mode === "new") {
      await safePeekRef();
      el("refText").textContent = currentRef || "—";
    } else {
      el("refText").textContent = currentRef;
    }

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
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "save",
          data: collectData()
        })
      });
      const r = await res.json();
      alert(`Saved as ${r.ref}`);
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
            <b>${l.ref}</b><br>
            ${l.subject}<br>
            <small>${l.date}</small>
            <div class="history-actions">
              <button class="edit-btn">✏️</button>
              <button class="dup-btn">📄</button>
              <button class="del-btn">🗑</button>
            </div>
          `;

          card.querySelector(".edit-btn").onclick = e => {
            e.stopPropagation();
            loadForEdit(l);
          };

          card.querySelector(".dup-btn").onclick = e => {
            e.stopPropagation();
            loadForDuplicate(l);
          };

          card.querySelector(".del-btn").onclick = e => {
            e.stopPropagation();
            if (!confirm(`Delete ${l.ref}?`)) return;
            deleteLetter(l.rowIndex);
          };

          h.appendChild(card);
        });
      });
  }
  fetchHistory();

  /* ================= EDIT / DUPLICATE ================= */

  function loadForEdit(l) {
    const d = JSON.parse(l.raw || "{}");

    mode = "edit";
    currentRef = l.ref;
    currentRowIndex = l.rowIndex;

    el("refInput").value = currentRef;
    el("dateInput").value = d.date || l.date;
    el("subjectInput").value = d.subject || l.subject;
    el("toInput").value = d.address || l.address;
    el("bodyInput").value = d.content || l.content;
    el("targetLangSelect").value = d.language || "manual";
    el("printGreetingCheck").checked = !!d.greetingIncluded;

    show("createLetterView");
  }

  function loadForDuplicate(l) {
    const d = JSON.parse(l.raw || "{}");

    mode = "new";
    currentRef = null;
    currentRowIndex = null;

    el("refInput").value = "";
    el("dateInput").value = today();
    el("subjectInput").value = d.subject + " (Copy)";
    el("toInput").value = d.address || "";
    el("bodyInput").value = d.content || "";
    el("targetLangSelect").value = d.language || "manual";
    el("printGreetingCheck").checked = !!d.greetingIncluded;

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
    el("dateInput").value = today();
    el("subjectInput").value = "";
    el("toInput").value = "";
    el("bodyInput").value = "";
  }

  function show(id) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(id).classList.remove("hidden-view");
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  }

});
