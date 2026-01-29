document.addEventListener('DOMContentLoaded', () => {

  /* ================= CONFIG ================= */

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

  /* ================= STATE ================= */

  let letterData = {
    variants: {
      default: {
        header: {
          line1: "جماعت المسلمین مانچے",
          line2: "जमातुल मुस्लिमीन मणचे",
          line3: "Jamatul Muslimeen Manche",
          line4: "Reg No. F-3495/10/08/10",
          line5:
            "मुक्काम पोस्ट मणचे, मुस्लिमीन वाडी, तालुका देवगड, जिल्हा सिंधुदुर्ग, महाराष्ट्र."
        },
        committee: [],
        footerAddress:
          "PERMANENT ADDRESS: AT POST MANCHE, TALUKA DEVGAD, DISTRICT SINDHUDURG, PIN - 416811."
      }
    },
    activeVariant: "default"
  };

  /* ================= ELEMENTS ================= */

  const dashboardView = document.getElementById("dashboardView");
  const previewView = document.getElementById("previewView");

  const refInput = document.getElementById("refInput");
  const dateInput = document.getElementById("dateInput");
  const toInput = document.getElementById("toInput");
  const bodyInput = document.getElementById("bodyInput");

  const generatePreviewBtn = document.getElementById("generatePreviewBtn");
  const backToDashboardBtn = document.getElementById("backToDashboardBtn");
  const saveLetterBtn = document.getElementById("saveLetterBtn");

  const refText = document.getElementById("refText");
  const dateText = document.getElementById("dateText");
  const toText = document.getElementById("toText");
  const letterBody = document.getElementById("letterBody");

  const historyList = document.getElementById("historyList");

  /* ================= INIT ================= */

  const today = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.value = today;
  updateDate(today);

  fetchHistory();

  /* ================= VIEW SWITCH ================= */

  generatePreviewBtn.addEventListener("click", () => {
    refText.textContent = refInput.value;
    updateDate(dateInput.value);
    toText.textContent = toInput.value;
    letterBody.textContent = bodyInput.value;

    dashboardView.classList.add("hidden-view");
    previewView.classList.remove("hidden-view");
  });

  backToDashboardBtn.addEventListener("click", () => {
    previewView.classList.add("hidden-view");
    dashboardView.classList.remove("hidden-view");
  });

  /* ================= SAVE ================= */

  saveLetterBtn.addEventListener("click", () => {
    if (!GOOGLE_SCRIPT_URL) return alert("Script URL missing");

    const payload = {
      action: "save",
      data: {
        ref: refInput.value,
        date: dateInput.value,
        to: toInput.value,
        body: bodyInput.value
      }
    };

    saveLetterBtn.textContent = "Saving...";
    saveLetterBtn.disabled = true;

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(() => {
      saveLetterBtn.textContent = "💾 Save";
      saveLetterBtn.disabled = false;
      fetchHistory();
      alert("Letter saved");
    });
  });

  /* ================= HISTORY ================= */

  function fetchHistory() {
    if (!GOOGLE_SCRIPT_URL) return;

    historyList.innerHTML =
      '<div style="padding:10px;color:#888">Loading...</div>';

    fetch(GOOGLE_SCRIPT_URL)
      .then(res => res.json())
      .then(data => renderHistory(data))
      .catch(() => {
        historyList.innerHTML =
          '<div style="padding:10px;color:red">Failed to load history</div>';
      });
  }

  function renderHistory(letters) {
    historyList.innerHTML = "";
