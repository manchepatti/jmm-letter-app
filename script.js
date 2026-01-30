document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  /* ================= HELPERS ================= */

  const el = id => document.getElementById(id);

  function todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  function showView(viewId) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));

    el(viewId).classList.remove("hidden-view");
  }

  /* ================= STATE ================= */

  let currentRef = null;

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

  /* ================= NEW LETTER (FIXED) ================= */

  async function startNewLetter() {
    // Always set today's date
    el("dateInput").value = todayISO();

    // If ref already generated for this letter, do nothing
    if (currentRef) {
      el("refInput").value = currentRef;
      return;
    }

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "commitRef" })
      });

      const data = await res.json();

      if (!data || !data.nextRef) {
        throw new Error("Invalid ref response");
      }

      currentRef = data.nextRef;
      el("refInput").value = currentRef;

    } catch (e) {
      // Offline / fallback
      const last = localStorage.getItem("lastRef") || "JMM-000";
      const n = parseInt(last.split("-")[1] || "0", 10) + 1;
      currentRef = `JMM-${String(n).padStart(3, "0")}`;
      localStorage.setItem("lastRef", currentRef);
      el("refInput").value = currentRef;
    }
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = () => {
    el("refText").textContent = el("refInput").value || "";
    el("toText").textContent = el("toInput").value || "";
    el("letterBody").textContent = el("bodyInput").value || "";

    el("dateText").textContent = formatDate(el("dateInput").value);

    el("createLetterView").classList.add("hidden-view");
    el("previewView").classList.remove("hidden-view");
  };

  el("editLetterBtn").onclick = () => {
    el("previewView").classList.add("hidden-view");
    el("createLetterView").classList.remove("hidden-view");
  };

  /* ================= SAVE ================= */

  el("saveLetterBtn").onclick = async () => {
    if (!currentRef) {
      alert("Ref No missing. Please reopen New Letter.");
      return;
    }

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "save",
        data: {
          ref: currentRef,
          letterNo: currentRef,
          date: el("dateInput").value,
          language: el("targetLangSelect").value,
          subject: extractSubject(el("bodyInput").value),
          to: el("toInput").value,
          body: el("bodyInput").value,
          greetingIncluded: el("printGreetingCheck").checked
        }
      })
    });

    currentRef = null; // reset after save
    location.reload();
  };

  /* ================= UTIL ================= */

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  }

  function extractSubject(body) {
    if (!body) return "";
    return body.split("\n")[0].slice(0, 100);
  }

});
