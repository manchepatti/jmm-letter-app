document.addEventListener('DOMContentLoaded', () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  const isMobile = () => window.innerWidth <= 768;

  /* ================= ELEMENTS ================= */

  const views = {
    dashboard: document.getElementById('dashboardView'),
    create: document.getElementById('createLetterView'),
    preview: document.getElementById('previewView'),
    settings: document.getElementById('settingsView')
  };

  const refInput = document.getElementById('refInput');
  const dateInput = document.getElementById('dateInput');
  const toInput = document.getElementById('toInput');
  const bodyInput = document.getElementById('bodyInput');

  const printRefCheck = document.getElementById('printRefCheck');
  const printToCheck = document.getElementById('printToCheck');
  const printGreetingCheck = document.getElementById('printGreetingCheck');
  const printHindiNameCheck = document.getElementById('printHindiNameCheck');
  const printSadarGreetingCheck = document.getElementById('printSadarGreetingCheck');

  const targetLangSelect = document.getElementById('targetLangSelect');
  const translateBtn = document.getElementById('translateBtn');

  const footerVersionRadios = document.getElementsByName('footerVersion');

  const refText = document.getElementById('refText');
  const dateText = document.getElementById('dateText');
  const toText = document.getElementById('toText');
  const letterBody = document.getElementById('letterBody');

  const refDisplay = document.getElementById('refDisplay');
  const toDisplay = document.getElementById('toDisplay');
  const greetingDisplay = document.getElementById('greetingDisplay');
  const greetingSubLine = document.getElementById('greetingSubLine');
  const sadarGreetingLine = document.getElementById('sadarGreetingLine');

  const generatePreviewBtn = document.getElementById('generatePreviewBtn');
  const backToCreateBtn = document.getElementById('backToCreateBtn');

  const historyList = document.getElementById('historyList');

  /* ================= INIT ================= */

  dateInput.value = new Date().toISOString().split('T')[0];
  updateDate(dateInput.value);
  fetchHistory();

  /* ================= VIEW SWITCH ================= */

  function switchView(target) {
    Object.values(views).forEach(v => v.classList.add('hidden-view'));
    target.classList.remove('hidden-view');
  }

  /* ================= PREVIEW ================= */

  generatePreviewBtn.addEventListener('click', () => {

    refText.textContent = refInput.value;
    toText.textContent = toInput.value;
    letterBody.textContent = bodyInput.value;
    updateDate(dateInput.value);

    toggle(refDisplay, printRefCheck.checked);
    toggle(toDisplay, printToCheck.checked);
    toggle(greetingDisplay, printGreetingCheck.checked);
    toggle(greetingSubLine, printHindiNameCheck.checked);
    toggle(sadarGreetingLine, printSadarGreetingCheck.checked);

    switchView(views.preview);
  });

  backToCreateBtn.addEventListener('click', () => {
    switchView(views.create);
  });

  function toggle(el, show) {
    el.classList.toggle('hidden-print', !show);
  }

  /* ================= TRANSLATION ================= */

  translateBtn.addEventListener('click', () => {
    if (!GOOGLE_SCRIPT_URL) {
      alert('Google Script URL not configured');
      return;
    }

    const payload = {
      action: 'translate',
      text: {
        body: bodyInput.value,
        to: toInput.value
      },
      targetLang: targetLangSelect.value
    };

    translateBtn.disabled = true;
    translateBtn.textContent = 'Translating…';

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.translated) {
          if (data.translated.body) bodyInput.value = data.translated.body;
          if (data.translated.to) toInput.value = data.translated.to;
        }
      })
      .catch(() => alert('Translation failed'))
      .finally(() => {
        translateBtn.disabled = false;
        translateBtn.textContent = '🌐 Translate Body & To';
      });
  });

  /* ================= HISTORY ================= */

  function fetchHistory() {
    historyList.innerHTML = '<div style="color:#888">Loading…</div>';

    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(renderHistory)
      .catch(() => {
        historyList.innerHTML = '<div style="color:red">Failed to load</div>';
      });
  }

  function renderHistory(letters) {
    historyList.innerHTML = '';
    if (!letters || !letters.length) {
      historyList.innerHTML = '<div>No letters found</div>';
      return;
    }

    letters.forEach(l => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<strong>${l.ref}</strong><br><small>${l.date}</small>`;
      div.onclick = () => loadLetter(l.content);
      historyList.appendChild(div);
    });
  }

  function loadLetter(json) {
    const data = JSON.parse(json);
    refInput.value = data.ref || '';
    dateInput.value = data.date || '';
    toInput.value = data.to || '';
    bodyInput.value = data.body || '';
    switchView(views.create);
  }

  /* ================= HELPERS ================= */

  function updateDate(dateStr) {
    const d = new Date(dateStr);
    dateText.textContent =
      `${String(d.getDate()).padStart(2, '0')}/` +
      `${String(d.getMonth() + 1).padStart(2, '0')}/` +
      d.getFullYear();
  }

});
