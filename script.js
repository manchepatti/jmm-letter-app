document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  /* ================= HELPERS ================= */

  function show(viewId) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    const page = el(viewId);
    if (page) page.classList.remove("hidden-view");
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

  function safeText(v) {
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

      if (target === "createLetterView") {
        fetchRef();
      }
    };
  });

  /* ================= DATE ================= */

  function setToday() {
    if (el("dateInput")) {
      el("dateInput").value =
        new Date().toISOString().split("T")[0];
    }
  }

  /* ================= FETCH REF ================= */

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
    } catch (e) {
      console.error("Ref fetch failed", e);
      alert("Failed to fetch Ref No");
    } finally {
      hideLoader();
    }
  }

  /* ================= FETCH HISTORY ================= */

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
        card.style.padding = "10px";
        card.style.borderBottom = "1px solid #ddd";

        card.innerHTML = `
          <b>${safeText(l.ref)}</b><br>
          ${safeText(l.subject)}<br>
          <small>${formatDate(l.date)}</small>
        `;

        card.onclick = () => loadForEdit(l);

        h.appendChild(card);
      });

    } catch (e) {
      console.error("History fetch failed", e);
      alert("Failed to load recent letters");
    } finally {
      hideLoader();
    }
  }

  /* ================= LOAD FOR EDIT ================= */

  function loadForEdit(l) {
    show("createLetterView");

    el("refInput").value = safeText(l.ref);
    el("dateInput").value = toInputDate(l.date);
    el("subjectInput").value = safeText(l.subject);
    el("toInput").value = safeText(l.address);
    el("bodyInput").value = safeText(l.content);
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = () => {

    el("refText").textContent = el("refInput").value;
    el("dateText").textContent =
      formatDate(el("dateInput").value);

    el("toText").textContent = el("toInput").value;
    el("subjectText").textContent = el("subjectInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    const lh = el("letterheadSelect").value;
    el("lhEnglish").textContent =
      lh === "mumbai"
        ? "Jamatul Muslimeen Manche – Mumbai"
        : "Jamatul Muslimeen Manche";

    show("previewView");
  };

  /* ================= EDIT FROM PREVIEW ================= */

  el("editLetterBtn")?.addEventListener("click", () => {
    show("createLetterView");
  });

});
