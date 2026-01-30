document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  let mode = "new";
  let currentRef = null;
  let currentRowIndex = null;

  /* ---------------- DATE ---------------- */
  const today = () => new Date().toISOString().split("T")[0];
  el("dateInput").value = today();

  /* ---------------- FORCE REF FETCH ---------------- */
  async function peekRef() {
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "peekRef" })
      });

      const data = await res.json();

      if (!data || !data.nextRef) throw "bad";

      currentRef = data.nextRef;
      el("refInput").value = currentRef;
      el("refHelpText").textContent =
        `This letter will be saved with Ref No: ${currentRef}`;

    } catch (e) {
      currentRef = null;
      el("refInput").value = "";
      el("refHelpText").textContent = "Ref No will be generated on save";
    }
  }

  /* ---------------- NAV (FINAL) ---------------- */
  document.querySelectorAll(".bottom-nav button").forEach(b => {
    b.onclick = () => {

      show(b.dataset.target);

      // 🔴 ALWAYS fetch ref when Create Letter opens
      if (b.dataset.target === "createLetterView") {
        mode = "new";
        currentRowIndex = null;
        peekRef();
      }
    };
  });

  /* ---------------- PREVIEW ---------------- */
  el("generatePreviewBtn").onclick = async () => {
    if (!currentRef) await peekRef();

    el("refText").textContent = currentRef || "Will be generated on save";
    el("dateText").textContent = formatDate(el("dateInput").value);
    el("toText").textContent = el("toInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    show("previewView");
  };

  el("editLetterBtn").onclick = () => show("createLetterView");

  /* ---------------- SAVE ---------------- */
  el("saveLetterBtn").onclick = async () => {

    if (!el("subjectInput").value.trim()) {
      alert("Subject is required");
      return;
    }

    if (mode === "new") {
      const r = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "save",
          data: collectData()
        })
      });
      const j = await r.json();
      alert(`Saved as ${j.ref}`);
    } else {
      await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "update",
          rowIndex: currentRowIndex,
          data: collectData()
        })
      });
      alert(`Updated ${currentRef}`);
    }

    resetForm();
    fetchHistory();
    show("dashboardView");
  };

  /* ---------------- HISTORY ---------------- */
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
            <div class="history-actions">
              <button class="edit-btn">✏️</button>
              <button class="dup-btn">📄</button>
              <button class="del-btn">🗑</button>
            </div>
          `;

          d.querySelector(".edit-btn").onclick = () => loadForEdit(l);
          d.querySelector(".dup-btn").onclick = () => loadForDuplicate(l);
          d.querySelector(".del-btn").onclick = () => {
            if (confirm(`Delete ${l.ref}?`)) deleteLetter(l.rowIndex);
          };

          h.appendChild(d);
        });
      });
  }
  fetchHistory();

  /* ---------------- EDIT / DUPLICATE ---------------- */
  function loadForEdit(l) {
    const d = JSON.parse(l.raw || "{}");

    mode = "edit";
    currentRef = l.ref;
    currentRowIndex = l.rowIndex;

    el("refInput").value = currentRef;
    el("refHelpText").textContent =
      `This letter will be saved with Ref No: ${currentRef}`;

    el("dateInput").value = d.date || l.date;
    el("subjectInput").value = d.subject || l.subject;
    el("toInput").value = d.address || l.address;
    el("bodyInput").value = d.content || l.content;

    show("createLetterView");
  }

  function loadForDuplicate(l) {
    const d = JSON.parse(l.raw || "{}");

    mode = "new";
    currentRef = null;
    currentRowIndex = null;

    el("refInput").value = "";
    el("refHelpText").textContent = "Ref No will be generated on save";

    el("dateInput").value = today();
    el("subjectInput").value = (d.subject || "") + " (Copy)";
    el("toInput").value = d.address || "";
    el("bodyInput").value = d.content || "";

    show("createLetterView");
    peekRef();
  }

  /* ---------------- DELETE ---------------- */
  function deleteLetter(rowIndex) {
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", rowIndex })
    }).then(fetchHistory);
  }

  /* ---------------- HELPERS ---------------- */
  function collectData() {
    return {
      date: el("dateInput").value,
      language: el("targetLangSelect").value,
      subject: el("subjectInput").value,
      address: el("toInput").value,
      content: el("bodyInput").value,
      greetingIncluded: el("printGreetingCheck").checked
    };
  }

  function resetForm() {
    mode = "new";
    currentRef = null;
    currentRowIndex = null;
    el("refInput").value = "";
    el("refHelpText").textContent = "Ref No will be generated on save";
    el("dateInput").value = today();
    el("subjectInput").value = "";
    el("toInput").value = "";
    el("bodyInput").value = "";
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
