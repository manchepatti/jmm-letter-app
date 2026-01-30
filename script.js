document.addEventListener("DOMContentLoaded", () => {

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  /* ---------- FORCE REF GENERATION ---------- */
  async function ensureRef() {
    if (el("refInput").value) return;

    try {
      const r = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "getNextRef" })
      });
      const j = await r.json();
      el("refInput").value = j.nextRef || "";
    } catch {
      const last = localStorage.getItem("lastRef") || "JMM-000";
      const n = parseInt(last.split("-")[1]) + 1;
      const next = `JMM-${String(n).padStart(3, "0")}`;
      el("refInput").value = next;
      localStorage.setItem("lastRef", next);
    }
  }

  /* ---------- BOTTOM NAV ---------- */
  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll(".view-page")
        .forEach(v => v.classList.add("hidden-view"));

      el(btn.dataset.target).classList.remove("hidden-view");

      if (btn.dataset.target === "createLetterView") {
        await ensureRef();     // 🔥 FIX
      }
    };
  });

  /* ---------- PREVIEW ---------- */
  el("generatePreviewBtn").onclick = async () => {
    await ensureRef();
    el("refText").textContent = el("refInput").value;
    el("toText").textContent = el("toInput").value;
    el("letterBody").textContent = el("bodyInput").value;
    el("previewView").classList.remove("hidden-view");
    el("createLetterView").classList.add("hidden-view");
  };

  /* ---------- SAVE ---------- */
  el("saveLetterBtn").onclick = async () => {
    await ensureRef();

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "save",
        data: {
          ref: el("refInput").value,     // SAME AS LETTER NO
          letterNo: el("refInput").value,
          date: el("dateInput").value,
          to: el("toInput").value,
          body: el("bodyInput").value,
          greetingIncluded: el("printGreetingCheck").checked
        }
      })
    }).then(() => location.reload());
  };

});
