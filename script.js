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
          <div class="history-info">
            <b>${l.ref}</b><br>
            ${l.subject}<br>
            <small>${l.date}</small>
          </div>

          <div class="history-actions">
            <button class="edit-btn">✏️</button>
            <button class="preview-btn">👁</button>
            <button class="del-btn">🗑</button>
          </div>
        `;

        card.querySelector(".edit-btn").onclick = () => loadForEdit(l);

        card.querySelector(".preview-btn").onclick = () => {
          loadForEdit(l);
          show("previewView");
        };

        card.querySelector(".del-btn").onclick = () => {
          if (confirm(`Delete ${l.ref}?`)) deleteLetter(l.rowIndex);
        };

        h.appendChild(card);
      });
    });
}
