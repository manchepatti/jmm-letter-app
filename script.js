document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  /* ================= DATE ================= */

  function today() {
    return new Date().toISOString().split("T")[0];
  }
  el("dateInput").value = today();

  /* ================= SETTINGS (RESTORED) ================= */

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

      if (b.dataset.target === "createLetterView") {
        peekRef();
      }
    };
  });

  /* ================= PREVIEW (FIXED) ================= */

  el("generatePreviewBtn").onclick = async () => {
    const ref = await peekRef();
    el("refText").textContent = ref;
    el("dateText").textContent = formatDate(el("dateInput").value);
    el("toText").textContent = el("toInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    el("createLetterView").classList.add("hidden-view");
    el("previewView").classList.remove("hidden-view");
  };

  el("editLetterBtn").onclick = () => {
    el("previewView").classList.add("hidden-view");
    el("createLetterView").classList.remove("hidden-view");
  };

  /* ================= SAVE ================= */

  el("saveLetterBtn").onclick = async () => {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "save",
        data: {
          date: el("dateInput").value,
          language: el("targetLangSelect").value,
          subject: el("subjectInput").value,
          address: el("toInput").value,
          content: el("bodyInput").value,
          greetingIncluded: el("printGreetingCheck").checked
        }
      })
    });

    const r = await res.json();
    alert(`Saved as ${r.ref}`);
    fetchHistory();
    show("dashboardView");
  };

  /* ================= HISTORY (FIXED) ================= */

  function fetchHistory() {
    fetch(URL)
      .then(r => r.json())
      .then(list => {
        const h = el("historyList");
        h.innerHTML = "";

        list.reverse().forEach(l => {
          const d = document.createElement("div");
          d.className = "history-item";
          d.innerHTML = `
            <b>${l.ref}</b><br>
            ${l.subject}<br>
            <small>${l.date}</small>
          `;
          h.appendChild(d);
        });
      });
  }
  fetchHistory();

  /* ================= HELPERS ================= */

  async function peekRef() {
    const r = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "peekRef" })
    });
    const j = await r.json();
    el("refInput").value = j.nextRef;
    return j.nextRef;
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
