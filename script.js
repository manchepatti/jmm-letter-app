document.addEventListener("DOMContentLoaded", () => {

  const el = (id) => document.getElementById(id);

  /* ================= PAGE SWITCH ================= */

  function show(viewId) {
    document.querySelectorAll(".view-page").forEach(v => {
      v.classList.add("hidden-view");
    });
    const page = el(viewId);
    if (page) page.classList.remove("hidden-view");
  }

  // Default page
  show("dashboardView");

  /* ================= NAVIGATION ================= */

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) show(target);
    });
  });

  /* ================= PREVIEW BUTTON (FIX) ================= */

  const previewBtn = el("generatePreviewBtn");

  if (!previewBtn) {
    alert("Preview button not found in HTML");
    return;
  }

  previewBtn.addEventListener("click", () => {

    // Fill preview fields
    el("refText").textContent = el("refInput")?.value || "";
    el("dateText").textContent = el("dateInput")?.value || "";
    el("toText").textContent = el("toInput")?.value || "";
    el("subjectText").textContent = el("subjectInput")?.value || "";
    el("letterBody").textContent = el("bodyInput")?.value || "";

    // Letterhead toggle (safe)
    const lh = el("letterheadSelect")?.value;
    el("lhEnglish").textContent =
      lh === "mumbai"
        ? "Jamatul Muslimeen Manche – Mumbai"
        : "Jamatul Muslimeen Manche";

    // SHOW PREVIEW PAGE  ✅
    show("previewView");
  });

  /* ================= EDIT BUTTON ================= */

  el("editLetterBtn")?.addEventListener("click", () => {
    show("createLetterView");
  });

});