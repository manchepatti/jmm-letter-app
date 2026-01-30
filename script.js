document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let mode = "new";
  let currentRef = null;
  let currentRowIndex = null;

  /* ================= LETTERHEAD DATA ================= */

  const LETTERHEADS = {
    manche: {
      hindi: "जमातुल मुस्लिमीन मणचे",
      english: "Jamatul Muslimeen Manche",
      reg: "Reg No. F-3495/10/08/10"
    },
    mumbai: {
      hindi: "जमातुल मुस्लिमीन मणचे - मुंबई",
      english: "Jamatul Muslimeen Manche - Mumbai",
      reg: "Reg No. F-3495/10/08/10"
    }
  };

  function applyLetterhead(type) {
    const lh = LETTERHEADS[type] || LETTERHEADS.manche;
    el("lhHindi").textContent = lh.hindi;
    el("lhEnglish").textContent = lh.english;
    el("lhReg").textContent = lh.reg;
  }

  /* ================= INIT ================= */

  show("dashboardView");
  el("letterheadSelect").value = "manche";

  el("letterheadSelect").onchange = () => {
    applyLetterhead(el("letterheadSelect").value);
  };

  /* ================= NAV ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.onclick = () => {
      show(btn.dataset.target);
      if (btn.dataset.target === "createLetterView") {
        mode = "new";
        peekRef();
      }
    };
  });

  function show(id) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(id).classList.remove("hidden-view");
  }

  /* ================= REF ================= */

  async function peekRef() {
    const r = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "peekRef" })
    });
    const j = await r.json();
    currentRef = j.nextRef;
    el("refInput").value = currentRef;
    el("refHelpText").textContent =
      `This letter will be saved as ${currentRef}`;
  }

  /* ================= PREVIEW ================= */

  el("generatePreviewBtn").onclick = () => {
    applyLetterhead(el("letterheadSelect").value);

    el("refText").textContent = currentRef;
    el("dateText").textContent = el("dateInput").value;
    el("toText").textContent = el("toInput").value;
    el("subjectText").textContent = el("subjectInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    show("previewView");
  };

});