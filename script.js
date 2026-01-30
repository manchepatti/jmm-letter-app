document.addEventListener('DOMContentLoaded', () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  /* ================= ELEMENTS ================= */

  const views = {
    dashboard: document.getElementById('dashboardView'),
    create: document.getElementById('createLetterView'),
    preview: document.getElementById('previewView')
  };

  const newLetterBtn = document.getElementById('newLetterBtn');
  const generatePreviewBtn = document.getElementById('generatePreviewBtn');
  const backToCreateBtn = document.getElementById('backToCreateBtn');

  const refInput = document.getElementById('refInput');
  const dateInput = document.getElementById('dateInput');
  const toInput = document.getElementById('toInput');
  const bodyInput = document.getElementById('bodyInput');

  const printRefCheck = document.getElementById('printRefCheck');
  const printToCheck = document.getElementById('printToCheck');
  const printGreetingCheck = document.getElementById('printGreetingCheck');
  const printHindiNameCheck = document.getElementById('printHindiNameCheck');
  const printSadarGreetingCheck = document.getElementById('printSadarGreetingCheck');

  const refText = document.getElementById('refText');
  const dateText = document.getElementById('dateText');
  const toText = document.getElementById('toText');
  const letterBody = document.getElementById('letterBody');

  const refDisplay = document.getElementById('refDisplay');
  const toDisplay = document.getElementById('toDisplay');
  const greetingDisplay = document.getElementById('greetingDisplay');
  const greetingSubLine = document.getElementById('greetingSubLine');
  const sadarGreetingLine = document.getElementById('sadarGreetingLine');

  /* ================= INIT ================= */

  initDate();
  fetchHistory();

  /* ================= NAVIGATION ================= */

  newLetterBtn.addEventListener('click', async () => {
    clearForm();
    await setNextRef();
    switchView('create');
  });

  generatePreviewBtn.addEventListener('click', () => {
    buildPreview();
    switchView('preview');
  });

  backToCreateBtn.addEventListener('click', () => {
    switchView('create');
  });

  /* ================= AUTO REF ================= */

  async function setNextRef() {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getNextRef' })
      });

      const data = await res.json();
      if (data.nextRef) {
        refInput.value = data.nextRef;
        localStorage.setItem('lastRef', data.nextRef);
        return;
      }
    } catch (e) {
      // fallback
    }

    const last = localStorage.getItem('lastRef') || 'JMM-000';
    refInput.value = incrementRef(last);
    localStorage.setItem('lastRef', refInput.value);
  }

  function incrementRef(ref) {
    const num = parseInt(ref.split('-')[1] || '0', 10) + 1;
    return `JMM-${String(num).padStart(3, '0')}`;
  }

  /* ================= PREVIEW ================= */

  function buildPreview() {
    refText.textContent = refInput.value;
    toText.textContent = toInput.value;
    letterBody.textContent = bodyInput.value;
    updateDate(dateInput.value);

    toggle(refDisplay, printRefCheck.checked);
    toggle(toDisplay, printToCheck.checked);
    toggle(greetingDisplay, printGreetingCheck.checked);
    toggle(greetingSubLine, printHindiNameCheck.checked);
    toggle(sadarGreetingLine, printSadarGreetingCheck.checked);
  }

  function toggle(el, show) {
    el.classList.toggle('hidden-print', !show);
  }

  /* ================= HISTORY ================= */

  function fetchHistory() {
    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(() => {}) // already shown on dashboard
      .catch(() => {});
  }

  /* ================= HELPERS ================= */

  function switchView(name) {
    Object.values(views).forEach(v => v.classList.add('hidden-view'));
    views[name].classList.remove('hidden-view');
  }

  function initDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    updateDate(today);
  }

  function updateDate(dateStr) {
    const d = new Date(dateStr);
    dateText.textContent =
      `${String(d.getDate()).padStart(2, '0')}/` +
      `${String(d.getMonth() + 1).padStart(2, '0')}/` +
      d.getFullYear();
  }

  function clearForm() {
    refInput.value = '';
    toInput.value = '';
    bodyInput.value = '';
  }

});
