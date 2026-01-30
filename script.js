document.addEventListener("DOMContentLoaded", () => {

  const URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const el = id => document.getElementById(id);

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  /* INIT DATE */
  el("dateInput").value = today();

  /* NAV */
  document.querySelectorAll(".bottom-nav button").forEach(b => {
    b.onclick = () => {
      document.querySelectorAll(".view-page")
        .forEach(v => v.classList.add("hidden-view"));
      el(b.dataset.target).classList.remove("hidden-view");
    };
  });

  /* PREVIEW */
  el("generatePreviewBtn").onclick = () => {
    el("refText").textContent = "Will be generated on save";
    el("dateText").textContent = el("dateInput").value;
    el("toText").textContent = el("toInput").value;
    el("letterBody").textContent = el("bodyInput").value;

    el("createLetterView").classList.add("hidden-view");
    el("previewView").classList.remove("hidden-view");
  };

  el("editLetterBtn").onclick = () => {
    el("previewView").classList.add("hidden-view");
    el("createLetterView").classList.remove("hidden-view");
  };

  /* SAVE */
  el("saveLetterBtn").onclick = async () => {
    if (!el("subjectInput").value.trim()) {
      alert("Subject is required");
      return;
    }

    const payload = {
      action: "save",
      data: {
        date: el("dateInput").value,
        language: el("targetLangSelect").value || "manual",
        subject: el("subjectInput").value,
        address: el("toInput").value,
        content: el("bodyInput").value,
        greetingIncluded: el("printGreetingCheck").checked,
        fullState: collectState()
      }
    };

    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const r = await res.json();
    alert(`Letter saved as ${r.ref}`);
    location.reload();
  };

  /* HISTORY + DELETE */
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
          <button class="delete-btn">🗑</button>
        `;

        d.querySelector(".delete-btn").onclick = e => {
          e.stopPropagation();
          if (!confirm(`Delete ${l.ref}?`)) return;
          deleteLetter(l.rowIndex);
        };

        h.appendChild(d);
      });
    });

  function deleteLetter(row) {
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", rowIndex: row })
    }).then(() => location.reload());
  }

  function collectState() {
    return {
      to: el("toInput").value,
      body: el("bodyInput").value,
      subject: el("subjectInput").value,
      printGreeting: el("printGreetingCheck").checked
    };
  }

});
