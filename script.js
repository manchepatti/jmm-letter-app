document.addEventListener("DOMContentLoaded", () => {

  const el = id => document.getElementById(id);

  const LETTERHEAD = {
    manche: {
      title: "जमातुल मुस्लिमीन मणचे",
      sub: "Jamatul Muslimeen Manche"
    },
    mumbai: {
      title: "जमातुल मुस्लिमीन मणचे - मुंबई",
      sub: "Jamatul Muslimeen Manche - Mumbai"
    }
  };

  /* Navigation */
  document.querySelectorAll(".bottom-nav button").forEach(b => {
    b.onclick = () => {
      document.querySelectorAll(".view-page")
        .forEach(v => v.classList.add("hidden-view"));
      el(b.dataset.target).classList.remove("hidden-view");
    };
  });

  /* Default */
  el("dashboardView").classList.remove("hidden-view");
  el("dateInput").value = new Date().toISOString().split("T")[0];

  /* Save signatories */
  el("saveSettingsBtn").onclick = () => {
    localStorage.setItem("signatories", el("signatoryInput").value);
    alert("Saved");
  };

  /* Preview */
  el("generatePreviewBtn").onclick = () => {
    const lh = LETTERHEAD[el("letterheadSelect").value];
    el("lhTitle").textContent = lh.title;
    el("lhSub").textContent = lh.sub;

    el("refText").textContent = el("refInput").value;
    el("dateText").textContent = el("dateInput").value;
    el("toText").textContent = el("toInput").value;
    el("subjectText").textContent = el("subjectInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    renderSignatories();

    show("previewView");
  };

  function renderSignatories() {
    const raw = localStorage.getItem("signatories") || "";
    el("signatoryBlock").innerHTML = raw
      .split("\n")
      .map(l => `<div>${l.replace("|","<br>")}</div>`)
      .join("");
  }

  function show(id) {
    document.querySelectorAll(".view-page")
      .forEach(v => v.classList.add("hidden-view"));
    el(id).classList.remove("hidden-view");
  }
});