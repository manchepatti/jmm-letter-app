document.addEventListener("DOMContentLoaded", () => {

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);
  let currentRef = null; // 🔥 SINGLE SOURCE

  /* ================= BOTTOM NAV ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll(".view-page")
        .forEach(v => v.classList.add("hidden-view"));

      el(btn.dataset.target).classList.remove("hidden-view");

      if (btn.dataset.target === "createLetterView") {
        await startNewLetter();
      }
    };
  });

  /* ================= NEW LETTER ================= */

  async function startNewLetter() {
    if (currentRef) return; // already started

    const r = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "commitRef" }) // 🔥 ONLY HERE
    });

    const j = await r.json();
    currentRef = j.nextRef;
    el("refInput").value = currentRef;
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = () => {
    el("refText").textContent = el("refInput").value;
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

  el("saveLetterBtn").onclick = () => {
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "save",
        data: {
          ref: currentRef,
          date: el("dateInput").value,
          to: el("toInput").value,
          body: el("bodyInput").value,
          greetingIncluded: el("printGreetingCheck").checked
        }
      })
    }).then(() => {
      currentRef = null; // 🔥 reset only after save
      location.reload();
    });
  };

});
