document.addEventListener('DOMContentLoaded', () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const isMobile = () => window.innerWidth <= 768;

  /* ================= ELEMENTS ================= */

  const dashboardView = document.getElementById('dashboardView');
  const previewView = document.getElementById('previewView');

  const historyMobileView = document.getElementById('historyMobileView');
  const settingsMobileView = document.getElementById('settingsMobileView');

  const openHistoryBtn = document.getElementById('openHistoryBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const backFromHistory = document.getElementById('backFromHistory');
  const backFromSettings = document.getElementById('backFromSettings');

  const historyList = document.getElementById('historyList');
  const historyListMobile = document.getElementById('historyListMobile');

  const refInput = document.getElementById('refInput');
  const dateInput = document.getElementById('dateInput');
  const toInput = document.getElementById('toInput');
  const bodyInput = document.getElementById('bodyInput');

  const refText = document.getElementById('refText');
  const dateText = document.getElementById('dateText');
  const toText = document.getElementById('toText');
  const letterBody = document.getElementById('letterBody');

  const generatePreviewBtn = document.getElementById('generatePreviewBtn');
  const backToDashboardBtn = document.getElementById('backToDashboardBtn');
  const saveLetterBtn = document.getElementById('saveLetterBtn');

  const settingsModal = document.getElementById('settingsModal');

  /* ================= INIT ================= */

  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;
  updateDate(today);

  fetchHistory();

  /* ================= DASHBOARD → PREVIEW ================= */

  generatePreviewBtn?.addEventListener('click', () => {
    refText.textContent = refInput.value;
    updateDate(dateInput.value);
    toText.textContent = toInput.value;
    letterBody.textContent = bodyInput.value;

    dashboardView.classList.add('hidden-view');
    previewView.classList.remove('hidden-view');
  });

  backToDashboardBtn?.addEventListener('click', () => {
    previewView.classList.add('hidden-view');
    dashboardView.classList.remove('hidden-view');
  });

  /* ================= SAVE LETTER ================= */

  saveLetterBtn?.addEventListener('click', () => {
    const payload = {
      action: 'save',
      data: {
        ref: refInput.value,
        date: dateInput.value,
        to: toInput.value,
        body: bodyInput.value
      }
    };

    saveLetterBtn.textContent = 'Saving…';
    saveLetterBtn.disabled = true;

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(() => {
      saveLetterBtn.textContent = '💾 Save';
      saveLetterBtn.disabled = false;
      fetchHistory();
      alert('Letter saved');
    });
  });

  /* ================= HISTORY ================= */

  function fetchHistory() {
    if (!historyList) return;

    historyList.innerHTML = '<div style="padding:10px;color:#888">Loading…</div>';

    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(renderHistory)
      .catch(() => {
        historyList.innerHTML =
          '<div style="padding:10px;color:red">Failed to load history</div>';
      });
  }

  function renderHistory(letters) {
    historyList.innerHTML = '';
    if (!letters || !letters.length) {
      historyList.innerHTML =
        '<div style="padding:10px;color:#888">No letters found</div>';
      return;
    }

    letters.forEach(letter => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-info">
          <strong>${letter.ref || 'No Ref'}</strong><br>
          <small>${letter.date || ''}</small>
        </div>
        <button>✏️</button>
      `;

      div.querySelector('button').onclick = () => loadLetter(letter.content);
      historyList.appendChild(div);
    });
  }

  function loadLetter(json) {
    try {
      const data = JSON.parse(json);
      refInput.value = data.ref || '';
      dateInput.value = data.date || '';
      toInput.value = data.to || '';
      bodyInput.value = data.body || '';

      historyMobileView?.classList.add('hidden-view');
      dashboardView.classList.remove('hidden-view');
    } catch {
      alert('Failed to load letter');
    }
  }

  /* ================= MOBILE NAVIGATION ================= */

  openHistoryBtn?.addEventListener('click', () => {
    if (!isMobile()) return;

    historyListMobile.innerHTML = historyList.innerHTML;
    dashboardView.classList.add('hidden-view');
    historyMobileView.classList.remove('hidden-view');
  });

  backFromHistory?.addEventListener('click', () => {
    historyMobileView.classList.add('hidden-view');
    dashboardView.classList.remove('hidden-view');
  });

  openSettingsBtn?.addEventListener('click', () => {
    if (!isMobile()) {
      settingsModal.style.display = 'block';
      return;
    }

    dashboardView.classList.add('hidden-view');
    settingsMobileView.classList.remove('hidden-view');
  });

  backFromSettings?.addEventListener('click', () => {
    settingsMobileView.classList.add('hidden-view');
    dashboardView.classList.remove('hidden-view');
  });

  /* ================= HELPERS ================= */

  function updateDate(dateStr) {
    if (!dateStr || !dateText) return;
    const d = new Date(dateStr);
    dateText.textContent =
      `${String(d.getDate()).padStart(2,'0')}/` +
      `${String(d.getMonth()+1).padStart(2,'0')}/` +
      d.getFullYear();
  }

});
