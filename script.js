/***********************
 * CONFIG
 ***********************/
const LETTER_SHEET = "Letters";
const REF_SHEET = "RefCounter";

/***********************
 * ENTRY POINTS
 ***********************/
function doGet() {
  const ss = SpreadsheetApp.getActive();
  const sheet = getOrCreateLetterSheet(ss);

  const rows = sheet.getDataRange().getValues();
  rows.shift();

  return json(rows.map((r, i) => ({
    rowIndex: i + 2,
    ref: r[0],
    date: r[1],
    language: r[2],
    subject: r[3],
    address: r[4],
    content: r[5],
    signatories: r[6],
    greetingIncluded: r[7],
    raw: r[8]
  })));
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const ss = SpreadsheetApp.getActive();

  switch (payload.action) {
    case "peekRef":
      return json({ nextRef: peekRef(ss) });

    case "save":
      return json(saveLetter(ss, payload.data));

    case "update":
      updateLetter(ss, payload.rowIndex, payload.data);
      return json({ status: "updated" });

    case "delete":
      deleteLetter(ss, payload.rowIndex);
      return json({ status: "deleted" });

    case "translate":
      return json(translate(payload));

    default:
      return json({ error: "Unknown action" });
  }
}

/***********************
 * SHEET
 ***********************/
function getOrCreateLetterSheet(ss) {
  let sheet = ss.getSheetByName(LETTER_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LETTER_SHEET);
    sheet.appendRow([
      "Letter No",
      "Date",
      "Language",
      "Subject",
      "Address",
      "Content",
      "Signatories",
      "Greeting Included",
      "Raw JSON"
    ]);
  }
  return sheet;
}

/***********************
 * REF LOGIC
 ***********************/
function peekRef(ss) {
  let s = ss.getSheetByName(REF_SHEET);
  if (!s) {
    s = ss.insertSheet(REF_SHEET);
    s.getRange("A1").setValue("JMM-000");
  }
  return incrementRef(s.getRange("A1").getValue());
}

function commitRef(ss) {
  let s = ss.getSheetByName(REF_SHEET);
  if (!s) {
    s = ss.insertSheet(REF_SHEET);
    s.getRange("A1").setValue("JMM-000");
  }
  const next = incrementRef(s.getRange("A1").getValue());
  s.getRange("A1").setValue(next);
  return next;
}

function incrementRef(ref) {
  const n = parseInt(ref.split("-")[1] || "0", 10) + 1;
  return `JMM-${String(n).padStart(3, "0")}`;
}

/***********************
 * SAVE (NEW LETTER)
 ***********************/
function saveLetter(ss, d) {
  const sheet = getOrCreateLetterSheet(ss);
  const ref = commitRef(ss);

  sheet.appendRow([
    ref,
    d.date,
    d.language,
    d.subject,
    d.address,
    d.content,
    d.signatories || "",
    d.greetingIncluded ? "YES" : "NO",
    JSON.stringify(d)
  ]);

  return { ref };
}

/***********************
 * UPDATE (EDIT LETTER)
 ***********************/
function updateLetter(ss, rowIndex, d) {
  const sheet = getOrCreateLetterSheet(ss);
  if (!rowIndex) return;

  sheet.getRange(rowIndex, 2, 1, 7).setValues([[
    d.date,
    d.language,
    d.subject,
    d.address,
    d.content,
    d.signatories || "",
    d.greetingIncluded ? "YES" : "NO"
  ]]);

  sheet.getRange(rowIndex, 9).setValue(JSON.stringify(d));
}

/***********************
 * DELETE
 ***********************/
function deleteLetter(ss, rowIndex) {
  const sheet = getOrCreateLetterSheet(ss);
  if (rowIndex > 1) sheet.deleteRow(rowIndex);
}

/***********************
 * TRANSLATE
 ***********************/
function translate(p) {
  return {
    translated: {
      body: LanguageApp.translate(p.text.body || "", "", p.targetLang),
      to: LanguageApp.translate(p.text.to || "", "", p.targetLang)
    }
  };
}

/***********************
 * UTIL
 ***********************/
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
