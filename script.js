document.addEventListener("DOMContentLoaded", () => {

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  function show(view) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(view).classList.remove("hidden-view");
  }

  function showLoader(text) {
    el("loaderText").textContent = text || "Loading…";
    el("loader").classList.remove("hidden");
  }

  function hideLoader() {
    el("loader").classList.add("hidden");
  }

  /* INIT */
  show("dashboardView");
  fetchHistory();

  /* NAV */
  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = () => {
      show(btn.dataset.target);
      if (btn.dataset.target === "createLetterView") {
        fetchRef();
      }
    };
  });

  /* FETCH REF */
  async function fetchRef() {
    showLoader("Fetching Ref No…");
    try {
      const r = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });
      const j = await r.json();
      el("refInput").value = j.nextRef;
    } finally {
      hideLoader();
    }
  }

  /* HISTORY */
  async function fetchHistory() {
    showLoader("Loading recent letters…");
    try {
      const r = await fetch(SCRIPT_URL);
      const list = await r.json();
      const h = el("historyList");
      h.innerHTML = "";

      list.reverse().forEach(l => {
        const d = document.createElement("div");
        d.textContent = `${l.ref} — ${l.subject || ""}`;
        h.appendChild(d);
      });
    } finally {
      hideLoader();
    }
  }

});