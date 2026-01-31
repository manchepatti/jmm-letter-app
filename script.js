document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let currentRowIndex = null;

  /* ================= HELPERS ================= */

  function show(viewId) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(viewId)?.classList.remove("hidden-view");
  }

  function showLoader(text) {
    if (!el("loader")) return;
    el("loaderText").textContent = text || "Loading…";
    el("loader").classList.remove("hidden");
  }

  function hideLoader() {
    if (!el("loader")) return;
    el("loader").classList.add("hidden");
  }

  function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB");
  }

  function toInputDate(d) {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  }

  function safe(v) {
    return v === null || v === undefined ? "" : String(v);
  }

  /* ================= INIT ================= */

  show("dashboardView");
  setToday();
  fetchHistory();

  /* ================= NAV ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.target;
      if (!target) return;
      show(target);
      if (target === "createLetterView") fetchRef();
    };
  });

  /* ================= DATE ================= */

  function setToday() {
    el("dateInput").value =
      new Date().toISOString().split("T")[0];
  }

  /* ================= REF ================= */

  async function fetchRef() {
    showLoader("Fetching Ref No…");
    try {
      const r = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });
      const j = await r.json();
      el("refInput").value = j.nextRef || "";
    } finally {
      hideLoader();
    }
  }

  /* ================= HISTORY ================= */

  async function fetchHistory() {
    showLoader("Loading recent letters…");
    try {
      const r = await fetch(SCRIPT_URL);
      const list = await r.json();

      const h = el("historyList");
      h.innerHTML = "";

      if (!Array.isArray(list) || list.length === 0) {
        h.innerHTML = "<p>No letters found</p>";
        return;
      }

      list.reverse().forEach(l => {
        const card = document.createElement("div");
        card.style.padding = "12px";
        card.style.borderBottom = "1px solid #ddd";
        card.style.display = "flex";
        card.style.justifyContent = "space-between";
        card.style.alignItems = "center";

        card.innerHTML = `
          <div>
            <b>${safe(l.ref)}</b><br>
            ${safe(l.subject)}<br>
            <small>${formatDate(l.date)}</small>
          </div>
          <div>
            <button class="hist-btn edit">✏️</button>
            <button class="hist-btn preview">👁</button>
            <button class="hist-btn delete">🗑</button>
          </div>
        `;

        card.querySelector(".edit").onclick = () => loadForEdit(l);
        card.querySelector(".preview").onclick = () => {
          loadForEdit(l);
          generatePreview();
        };
        card.querySelector(".delete").onclick = () => {
          if (confirm(`Delete ${l.ref}?`)) deleteLetter(l.rowIndex);
        };

        h.appendChild(card);
      });

    } finally {
      hideLoader();
    }
  }

  /* ================= EDIT ================= */

  function loadForEdit(l) {
    currentRowIndex = l.rowIndex;

    el("refInput").value = safe(l.ref);
    el("dateInput").value = toInputDate(l.date);
    el("subjectInput").value = safe(l.subject);
    el("toInput").value = safe(l.address);
    el("bodyInput").value = safe(l.content);

    show("createLetterView");
  }

  /* ================= DELETE ================= */

  async function deleteLetter(rowIndex) {
    showLoader("Deleting…");
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", rowIndex })
    });
    fetchHistory();
    hideLoader();
  }

  /* ================= PREVIEW ================= */

  function generatePreview() {
    el("refText").textContent = el("refInput").value;
    el("dateText").textContent = formatDate(el("dateInput").value);
    el("toText").textContent = el("toInput").value;
    el("subjectText").textContent = el("subjectInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    const lh = el("letterheadSelect").value;
    el("lhEnglish").textContent =
      lh === "mumbai"
        ? "Jamatul Muslimeen Manche – Mumbai"
        : "Jamatul Muslimeen Manche";

    show("previewView");
  }

  el("generatePreviewBtn").onclick = generatePreview;

  el("editLetterBtn")?.addEventListener("click", () => {
    show("createLetterView");
  });

});
