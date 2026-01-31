document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  /* ================= PAGE SWITCH ================= */

  function show(viewId) {
    document.querySelectorAll(".view-page").forEach(v =>
      v.classList.add("hidden-view")
    );
    const page = el(viewId);
    if (page) page.classList.remove("hidden-view");
  }

  /* ================= LOADER ================= */

  function showLoader(text) {
    el("loaderText").textContent = text || "Loading…";
    el("loader").classList.remove("hidden");
  }

  function hideLoader() {
    el("loader").classList.add("hidden");
  }

  /* ================= INIT ================= */

  show("dashboardView");
  setToday();
  fetchHistory(); // 🔑 MUST RUN

  /* ================= NAV ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.target;
      if (!target) return;

      show(target);

      if (target === "createLetterView") {
        fetchRef(); // 🔑 MUST RUN
      }
    };
  });

  /* ================= DATE ================= */

  function setToday() {
    const d = new Date().toISOString().split("T")[0];
    if (el("dateInput")) el("dateInput").value = d;
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
      alert("Failed to fetch Ref No");
      console.error(e);
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

      if (!Array.isArray(list)) {
        h.innerHTML = "<p>No letters found</p>";
        return;
      }

      list.reverse().forEach(l => {
        const div = document.createElement("div");
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #ddd";
        div.textContent = `${l.ref || ""} — ${l.subject || ""}`;
        h.appendChild(div);
      });

    } catch (e) {
      alert("Failed to load recent letters");
      console.error(e);
    } finally {
      hideLoader();
    }
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = () => {
    el("refText").textContent = el("refInput").value;
    el("dateText").textContent = el("dateInput").value;
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

  /* ================= EDIT ================= */

  el("editLetterBtn")?.addEventListener("click", () => {
    show("createLetterView");
  });

});
