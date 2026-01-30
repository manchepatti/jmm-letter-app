document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  /* ================= DATE ================= */

  function today() {
    return new Date().toISOString().split("T")[0];
  }
  el("dateInput").value = today();

  /* ================= LETTERHEAD ================= */

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

  /* ================= PREVIEW ================= */

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
    if (!el("subjectInput").value.trim()) {
      alert("Subject is required");
      return;
    }

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
          greetingIncluded: el("printGreetingCheck").checked,
          rawState: collectState()
        }
      })
    });

    const r = await res.json();
    alert(`Saved as ${r.ref}`);
    resetForm();
    fetchHistory();
    show("dashboardView");
  };

  /* ================= HISTORY ================= */

  function fetchHistory() {
    fetch(URL)
      .then(r => r.json())
      .then(list => {
        const h = el("historyList");
        h.innerHTML = "";

        list.reverse().forEach(l => {
          const card = document.createElement("div");
          card.className = "history-item";

          card.innerHTML = `
            <b>${l.ref}</b><br>
            ${l.subject}<br>
            <small>${l.date}</small>
            <div class="history-actions">
              <button class="edit-btn">✏️</button>
              <button class="dup-btn">📄</button>
              <button class="del-btn">🗑</button>
            </div>
          `;

          card.querySelector(".edit-btn").onclick = e => {
            e.stopPropagation();
            editLetter(l.raw);
          };

          card.querySelector(".dup-btn").onclick = e => {
            e.stopPropagation();
            duplicateLetter(l.raw);
          };

          card.querySelector(".del-btn").onclick = e => {
            e.stopPropagation();
            if (!confirm(`Delete ${l.ref}?`)) return;
            deleteLetter(l.rowIndex);
          };

          h.appendChild(card);
        });
      });
  }
  fetchHistory();

  /* ================= EDIT ================= */

  function editLetter(raw) {
    const d = JSON.parse(raw);

    el("subjectInput").value = d.subject || "";
    el("toInput").value = d.address || "";
    el("bodyInput").value = d.content || "";
    el("targetLangSelect").value = d.language || "manual";
    el("printGreetingCheck").checked = d.greetingIncluded || false;

    show("createLetterView");
  }

  /* ================= DUPLICATE ================= */

  function duplicateLetter(raw) {
    const d = JSON.parse(raw);

    el("subjectInput").value = d.subject + " (Copy)";
    el("toInput").value = d.address || "";
    el("bodyInput").value = d.content || "";
    el("targetLangSelect").value = d.language || "manual";
    el("printGreetingCheck").checked = d.greetingIncluded || false;

    el("dateInput").value = today();
    el("refInput").value = ""; // NEW ref on save

    show("createLetterView");
  }

  /* ================= DELETE ================= */

  function deleteLetter(rowIndex) {
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "delete",
        rowIndex
      })
    }).then(() => fetchHistory());
  }

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

  function resetForm() {
    el("subjectInput").value = "";
    el("toInput").value = "";
    el("bodyInput").value = "";
    el("refInput").value = "";
    el("dateInput").value = today();
  }

  function collectState() {
    return {
      subject: el("subjectInput").value,
      address: el("toInput").value,
      content: el("bodyInput").value,
      language: el("targetLangSelect").value,
      greetingIncluded: el("printGreetingCheck").checked
    };
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  }

});
