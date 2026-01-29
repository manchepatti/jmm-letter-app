document.addEventListener('DOMContentLoaded', () => {
    // CONFIGURATION
    // PASTE YOUR GOOGLE SCRIPT WEB APP URL HERE
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGj5sUuVii6WYen7Gp6kER-8CbPBqp9yXK_q0th3i7vaqbvxUtbM3dyQszmHNZzSwSiw/exec";

    // Default Data
    const defaultData = {
        variants: {
            default: {
                header: {
                    line1: "جماعت المسلمین مانچے",
                    line2: "जमातुल मुस्लिमीन मणचे",
                    line3: "Jamatul Muslimeen Manche",
                    line4: "Reg No. F-3495/10/08/10",
                    line5: "मुक्काम पोस्ट मणचे, मुस्लिमीन वाडी, तालुका देवगड, जिल्हा सिंधुदुर्ग, महाराष्ट्र."
                },
                committee: [
                    { role: "Sadar", name: "Faiyyaz Pawaskar", phone: "" },
                    { role: "Vice Sadar", name: "Asif Solkar", phone: "" },
                    { role: "Secretary", name: "Amjad Solkar", phone: "" },
                    { role: "Treasurer", name: "Faeem Mulla", phone: "" },
                    { role: "Member", name: "Rafiq Pawaskar", phone: "" },
                    { role: "Member", name: "Hamid Pawaskar", phone: "" }
                ],
                footerAddress: "PERMANENT ADDRESS: AT POST MANCHE, TALUKA DEVGAD, DISTRICT SINDHUDURG, PIN - 416811."
            },
            mumbai: {
                header: {
                    line1: "جماعت المسلمین مانچے - ممبئی",
                    line2: "जमातुल मुस्लिमीन मणचे - मुंबई",
                    line3: "Jamatul Muslimeen Manche - Mumbai",
                    line4: "Reg No. F-3495/10/08/10",
                    line5: "102, VRUNDAS APARTMENT C.H.S. LTD., PATEL PAKHADI LANE, OFF YARI ROAD, VERSOVA, MUMBAI - 400 061"
                },
                committee: [
                    { role: "Sadar", name: "Mumbai Member 1", phone: "" },
                    { role: "Vice Sadar", name: "Mumbai Member 2", phone: "" },
                    { role: "Secretary", name: "Mumbai Member 3", phone: "" },
                    { role: "Treasurer", name: "Mumbai Member 4", phone: "" },
                    { role: "Member", name: "Mumbai Member 5", phone: "" },
                    { role: "Member", name: "Mumbai Member 6", phone: "" }
                ],
                footerAddress: "PERMANENT ADDRESS: AT POST MANCHE, TALUKA DEVGAD, DISTRICT SINDHUDURG, PIN - 416811."
            }
        },
        activeVariant: 'default'
    };

    // State
    let letterData = loadFromStorage() || defaultData;
    
    // Migration for older data structures
    if (letterData.committeeVariants || letterData.header) {
        if (!letterData.variants) {
             const oldCommittee = letterData.committeeVariants ? letterData.committeeVariants.default : (letterData.committee || defaultData.variants.default.committee);
             // Create new structure
             const newData = JSON.parse(JSON.stringify(defaultData));
             newData.variants.default.committee = oldCommittee;
             if (letterData.committeeVariants && letterData.committeeVariants.mumbai) {
                 newData.variants.mumbai.committee = letterData.committeeVariants.mumbai;
             }
             letterData = newData;
        }
    }

    // Elements - Input Controls (Dashboard)
    const refInput = document.getElementById('refInput');
    const printRefCheck = document.getElementById('printRefCheck');
    const dateInput = document.getElementById('dateInput');
    const toInput = document.getElementById('toInput');
    const bodyInput = document.getElementById('bodyInput'); // New input
    const printToCheck = document.getElementById('printToCheck');
    const printGreetingCheck = document.getElementById('printGreetingCheck');
    const printHindiNameCheck = document.getElementById('printHindiNameCheck');
    const printSadarGreetingCheck = document.getElementById('printSadarGreetingCheck');
    const targetLangSelect = document.getElementById('targetLangSelect');
    const translateBtn = document.getElementById('translateBtn');
    
    const generatePreviewBtn = document.getElementById('generatePreviewBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const saveLetterBtn = document.getElementById('saveLetterBtn'); // Now in preview
    // const loadLetterBtn = document.getElementById('loadLetterBtn'); // Removed
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    const historyList = document.getElementById('historyList');
    const footerVersionRadios = document.getElementsByName('footerVersion');

    // Elements - Views
    const dashboardView = document.getElementById('dashboardView');
    const previewView = document.getElementById('previewView');

    // Elements - Preview / Print
    const headerLine1 = document.getElementById('headerLine1');
    const headerLine2 = document.getElementById('headerLine2');
    const headerLine3 = document.getElementById('headerLine3');
    const headerLine4 = document.getElementById('headerLine4');
    const headerLine5 = document.getElementById('headerLine5');
    
    const refDisplay = document.getElementById('refDisplay');
    const refText = document.getElementById('refText');
    const dateText = document.getElementById('dateText');
    const toDisplay = document.getElementById('toDisplay');
    const toText = document.getElementById('toText');
    const greetingDisplay = document.getElementById('greetingDisplay');
    const greetingSubLine = document.getElementById('greetingSubLine');
    const sadarGreetingLine = document.getElementById('sadarGreetingLine');
    const letterBody = document.getElementById('letterBody'); // Read-only in preview? 
    // Actually contenteditable="true" is in HTML, but we sync from bodyInput
    const committeeGrid = document.getElementById('committeeGrid');
    const footerBar = document.getElementById('footerBar');

    // Elements - Modal
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.querySelector('.close-modal');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const committeeSettings = document.getElementById('committeeSettings');

    const settingH1 = document.getElementById('settingH1');
    const settingH2 = document.getElementById('settingH2');
    const settingH3 = document.getElementById('settingH3');
    const settingH4 = document.getElementById('settingH4');
    const settingH5 = document.getElementById('settingH5');
    const settingFooterAddr = document.getElementById('settingFooterAddr');

    // Initialization
    function init() {
        // Set Date to Today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        updateDateDisplay(today);

        // Data Migration for Multi-Language
        const variants = ['default', 'mumbai'];
        variants.forEach(v => {
            if (letterData.variants[v]) {
                letterData.variants[v].committee.forEach(member => {
                    if (!member.languages) {
                        member.languages = {
                            en: { role: member.role || "", name: member.name || "" },
                            hi: { role: "", name: "" },
                            mr: { role: "", name: "" }
                        };
                        // Cleanup flat keys if desired, or keep for safety
                    }
                });
            }
        });

        // Apply Data
        applyLetterData();

        // Build Committee Inputs in Settings
        buildCommitteeSettings();
        
        // Initialize Footer Variant Radio
        if (letterData.activeVariant) {
            for (const radio of footerVersionRadios) {
                if (radio.value === letterData.activeVariant) {
                    radio.checked = true;
                    break;
                }
            }
        }

        // Initialize Toggles (Sync Preview with Controls)
        syncPreview();

        // Load History
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "PASTE_YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
            fetchHistory();
        } else {
            // If no cloud connection, start with default Ref No
            console.log("No Google Script URL configured in script.js");
            generateNextRef([]);
        }
        
        showDashboard();
    }
    
    // View Switching
    function showDashboard() {
        dashboardView.classList.remove('hidden-view');
        previewView.classList.add('hidden-view');
    }
    
    function showPreview() {
        // Update Preview Elements from Inputs
        refText.textContent = refInput.value;
        updateDateDisplay(dateInput.value);
        toText.textContent = toInput.value;
        letterBody.innerText = bodyInput.value;
        
        // Handle Toggles
        if (printRefCheck.checked) refDisplay.classList.remove('hidden-print');
        else refDisplay.classList.add('hidden-print');
        
        if (printToCheck.checked) toDisplay.classList.remove('hidden-print');
        else toDisplay.classList.add('hidden-print');
        
        if (printGreetingCheck.checked) greetingDisplay.classList.remove('hidden-print');
        else greetingDisplay.classList.add('hidden-print');
        
        if (printHindiNameCheck.checked) greetingSubLine.classList.remove('hidden-print');
        else greetingSubLine.classList.add('hidden-print');
        
        if (printSadarGreetingCheck.checked) sadarGreetingLine.classList.remove('hidden-print');
        else sadarGreetingLine.classList.add('hidden-print');

        // Switch View
        dashboardView.classList.add('hidden-view');
        previewView.classList.remove('hidden-view');
    }

    function syncPreview() {
        // Helper to sync initial state without switching view
         if (printHindiNameCheck.checked) {
             greetingSubLine.classList.remove('hidden-print');
        } else {
             greetingSubLine.classList.add('hidden-print');
        }
    }

    // --- Data Application ---

    function applyLetterData() {
        const currentVariant = letterData.variants[letterData.activeVariant];
        
        // Header
        headerLine1.textContent = currentVariant.header.line1;
        headerLine2.textContent = currentVariant.header.line2;
        headerLine3.textContent = currentVariant.header.line3;
        headerLine4.textContent = currentVariant.header.line4;
        headerLine5.textContent = currentVariant.header.line5;

        // Footer
        renderCommittee();
        
        // Footer Address
        footerBar.innerHTML = currentVariant.footerAddress;
        
        // Update Modal Inputs
        settingH1.value = currentVariant.header.line1;
        settingH2.value = currentVariant.header.line2;
        settingH3.value = currentVariant.header.line3;
        settingH4.value = currentVariant.header.line4;
        settingH5.value = currentVariant.header.line5;
        settingFooterAddr.value = currentVariant.footerAddress;

        // Update Greeting
        updateSadarGreeting();
    }

    function updateSadarGreeting() {
        const currentCommittee = letterData.variants[letterData.activeVariant].committee;
        // Find member with role containing 'Sadar' or 'सदर' but NOT 'Vice' or 'नायब' if strict, 
        // but usually just finding the first "Sadar" is enough.
        // In default data, "सदर" is first.
        const sadar = currentCommittee.find(m => m.role.includes('Sadar') || m.role.includes('सदर'));
        const sadarName = sadar ? sadar.name : "................";
        
        sadarGreetingLine.textContent = `सदर साहब ${sadarName} और पनच कमेटी । जमातुलमुसलीमीन मणचे को सलाम दुआएँ ।`;
    }

    function renderCommittee() {
        committeeGrid.innerHTML = '';
        const currentCommittee = letterData.variants[letterData.activeVariant].committee;
        const lang = targetLangSelect.value; // 'en', 'hi', 'mr'
        
        currentCommittee.forEach(member => {
            // Fallback to EN if specific lang is empty
            const role = (member.languages && member.languages[lang] && member.languages[lang].role) ? member.languages[lang].role : (member.languages?.en?.role || member.role);
            const name = (member.languages && member.languages[lang] && member.languages[lang].name) ? member.languages[lang].name : (member.languages?.en?.name || member.name);
            
            const div = document.createElement('div');
            div.className = 'committee-member';
            div.innerHTML = `
                <span class="member-role">${role}</span>
                <span class="member-name">${name}</span>
                ${member.phone ? `<span class="member-phone">${member.phone}</span>` : ''}
            `;
            committeeGrid.appendChild(div);
        });
    }

    function buildCommitteeSettings() {
        committeeSettings.innerHTML = '';
        const currentCommittee = letterData.variants[letterData.activeVariant].committee;
        
        currentCommittee.forEach((member, index) => {
            const div = document.createElement('div');
            div.style.marginBottom = '15px';
            div.style.borderBottom = '1px solid #eee';
            div.style.paddingBottom = '10px';
            div.className = 'member-block';
            
            const langData = member.languages || { en: {role: member.role, name: member.name}, hi: {}, mr: {} };
            
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>Member ${index + 1}</strong>
                    <button class="delete-member-btn" data-index="${index}" style="background: #ff4444; color: white; border: none; padding: 2px 8px; cursor: pointer; border-radius: 4px; font-size: 0.7rem;">Delete</button>
                </div>
                
                <!-- English -->
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <span style="font-size:0.8rem; width: 30px; padding-top:5px;">EN:</span>
                    <input type="text" placeholder="Role (EN)" value="${langData.en.role || ''}" class="comm-role-en" data-index="${index}" style="flex: 1;">
                    <input type="text" placeholder="Name (EN)" value="${langData.en.name || ''}" class="comm-name-en" data-index="${index}" style="flex: 1.5;">
                </div>
                
                <!-- Hindi -->
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <span style="font-size:0.8rem; width: 30px; padding-top:5px;">HI:</span>
                    <input type="text" placeholder="Role (HI)" value="${langData.hi?.role || ''}" class="comm-role-hi" data-index="${index}" style="flex: 1;">
                    <input type="text" placeholder="Name (HI)" value="${langData.hi?.name || ''}" class="comm-name-hi" data-index="${index}" style="flex: 1.5;">
                </div>
                
                <!-- Marathi -->
                <div style="display:flex; gap:5px; margin-bottom: 5px;">
                    <span style="font-size:0.8rem; width: 30px; padding-top:5px;">MR:</span>
                    <input type="text" placeholder="Role (MR)" value="${langData.mr?.role || ''}" class="comm-role-mr" data-index="${index}" style="flex: 1;">
                    <input type="text" placeholder="Name (MR)" value="${langData.mr?.name || ''}" class="comm-name-mr" data-index="${index}" style="flex: 1.5;">
                </div>

                <input type="text" placeholder="Phone (Optional)" value="${member.phone || ''}" class="comm-phone" data-index="${index}" style="width: 100%;">
            `;
            committeeSettings.appendChild(div);
        });

        // Add Member Button
        const addBtn = document.createElement('button');
        addBtn.textContent = "+ Add Member";
        addBtn.style.width = "100%";
        addBtn.style.marginTop = "10px";
        addBtn.style.backgroundColor = "#4CAF50";
        addBtn.style.color = "white";
        addBtn.style.border = "none";
        addBtn.style.padding = "8px";
        addBtn.style.borderRadius = "4px";
        addBtn.style.cursor = "pointer";
        addBtn.onclick = addCommitteeMember;
        committeeSettings.appendChild(addBtn);

        // Attach Delete Listeners
        const deleteBtns = document.querySelectorAll('.delete-member-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeCommitteeMember(index);
            });
        });
    }

    function scrapeCommitteeInputs() {
        // Helper to update state from current inputs
        const phones = document.querySelectorAll('.comm-phone');
        
        // We select by class pattern
        const enRoles = document.querySelectorAll('.comm-role-en');
        const enNames = document.querySelectorAll('.comm-name-en');
        const hiRoles = document.querySelectorAll('.comm-role-hi');
        const hiNames = document.querySelectorAll('.comm-name-hi');
        const mrRoles = document.querySelectorAll('.comm-role-mr');
        const mrNames = document.querySelectorAll('.comm-name-mr');
        
        const currentCommittee = [];
        
        phones.forEach((phoneInput, i) => {
            currentCommittee.push({
                role: enRoles[i].value, // Backwards compat
                name: enNames[i].value, // Backwards compat
                phone: phoneInput.value,
                languages: {
                    en: { role: enRoles[i].value, name: enNames[i].value },
                    hi: { role: hiRoles[i].value, name: hiNames[i].value },
                    mr: { role: mrRoles[i].value, name: mrNames[i].value }
                }
            });
        });
        
        letterData.variants[letterData.activeVariant].committee = currentCommittee;
    }

    function addCommitteeMember() {
        scrapeCommitteeInputs(); // Save current state
        // Add empty member with structure
        letterData.variants[letterData.activeVariant].committee.push({ 
            role: "", name: "", phone: "",
            languages: { en: {role:"", name:""}, hi: {role:"", name:""}, mr: {role:"", name:""} }
        });
        buildCommitteeSettings(); // Re-render
    }

    function removeCommitteeMember(index) {
        scrapeCommitteeInputs(); // Save current state
        letterData.variants[letterData.activeVariant].committee.splice(index, 1);
        buildCommitteeSettings(); // Re-render
    }

    // --- Event Listeners ---

    // Navigation
    generatePreviewBtn.addEventListener('click', showPreview);
    backToDashboardBtn.addEventListener('click', showDashboard);

    // Note: Live updates removed in favor of Generate Preview, 
    // but we can keep data bindings if needed. 
    // Actually, 'showPreview' syncs everything.
    
    // Language Switch triggers footer update
    targetLangSelect.addEventListener('change', () => {
        applyLetterData(); // Re-renders committee based on new lang
    });

    // Footer Version Switch
    footerVersionRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                letterData.activeVariant = e.target.value;
                applyLetterData();
                buildCommitteeSettings(); // Update settings view to match new variant
            }
        });
    });
    
    // Translation
    translateBtn.addEventListener('click', () => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
            alert('Please configure the GOOGLE_SCRIPT_URL in script.js');
            return;
        }
        
        const bodyText = bodyInput.value; // Use Input
        const toTextVal = toInput.value;
        const targetLang = targetLangSelect.value;
        
        if (!bodyText.trim() && !toTextVal.trim()) {
            alert('Nothing to translate (Body and To fields are empty).');
            return;
        }
        
        translateBtn.textContent = "Translating...";
        translateBtn.disabled = true;
        
        const payload = {
            action: 'translate',
            text: {
                body: bodyText,
                to: toTextVal
            },
            targetLang: targetLang
        };

        // Add Committee Members to payload
        const currentCommittee = letterData.variants[letterData.activeVariant].committee;
        currentCommittee.forEach((member, index) => {
            payload.text[`role_${index}`] = member.role;
            payload.text[`name_${index}`] = member.name;
        });
        
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            translateBtn.textContent = "🌐 Translate Body & To";
            translateBtn.disabled = false;
            
            if (data.status === 'success') {
                if (data.translated) {
                     if (confirm('Translation received. Replace current text?')) {
                        if (data.translated.body) bodyInput.value = data.translated.body;
                        if (data.translated.to) toInput.value = data.translated.to;
                        
                        // Update Committee
                        let committeeUpdated = false;
                        for (const key in data.translated) {
                            if (key.startsWith('role_')) {
                                const index = parseInt(key.split('_')[1]);
                                if (currentCommittee[index]) {
                                    currentCommittee[index].role = data.translated[key];
                                    committeeUpdated = true;
                                }
                            } else if (key.startsWith('name_')) {
                                const index = parseInt(key.split('_')[1]);
                                if (currentCommittee[index]) {
                                    currentCommittee[index].name = data.translated[key];
                                    committeeUpdated = true;
                                }
                            }
                        }
                        
                        if (committeeUpdated) {
                            applyLetterData();
                            buildCommitteeSettings();
                        }
                    }
                }
            } else {
                alert('Translation failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Translation failed.');
            translateBtn.textContent = "🌐 Translate Body & To";
            translateBtn.disabled = false;
        });
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    }

    saveSettingsBtn.addEventListener('click', () => {
        const currentVariant = letterData.variants[letterData.activeVariant];

        // Collect Header Data
        currentVariant.header.line1 = settingH1.value;
        currentVariant.header.line2 = settingH2.value;
        currentVariant.header.line3 = settingH3.value;
        currentVariant.header.line4 = settingH4.value;
        currentVariant.header.line5 = settingH5.value;

        // Collect Footer Data
        currentVariant.footerAddress = settingFooterAddr.value;

        // Collect Committee Data (Reuse helper)
        scrapeCommitteeInputs();

        applyLetterData();
        settingsModal.style.display = 'none';
        
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
            fetchHistory();
        }
    });

    // Cloud Storage Integration
    saveLetterBtn.addEventListener('click', () => {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
            alert('Please configure the GOOGLE_SCRIPT_URL in script.js');
            return;
        }

        const currentContent = {
            ref: refInput.value,
            date: dateInput.value,
            to: toInput.value,
            body: bodyInput.value, // Use input value
            toggles: {
                ref: printRefCheck.checked,
                to: printToCheck.checked,
                greeting: printGreetingCheck.checked,
                hindiName: printHindiNameCheck.checked,
                sadarGreeting: printSadarGreetingCheck.checked
            }
        };

        const payload = {
            action: 'save',
            data: {
                ref: refInput.value,
                date: dateInput.value,
                to: toInput.value,
                settings: letterData,
                content: currentContent
            }
        };

        saveLetterBtn.textContent = "Saving...";
        saveLetterBtn.disabled = true;

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            alert('Request sent to save letter.');
            saveLetterBtn.textContent = "💾 Save to Cloud";
            saveLetterBtn.disabled = false;
            fetchHistory(); // Refresh list
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save.');
            saveLetterBtn.textContent = "💾 Save to Cloud";
            saveLetterBtn.disabled = false;
        });
    });
    
    refreshHistoryBtn.addEventListener('click', fetchHistory);

    function fetchHistory() {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
             historyList.innerHTML = '<div style="font-size: 0.8rem; color: #aaa; text-align: center;">Set Google Script URL in script.js</div>';
             return;
        }
        
        historyList.innerHTML = '<div style="color:white; text-align:center;">Loading...</div>';

        fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                historyList.innerHTML = `<div style="color:red;">Error: ${data.error}</div>`;
                return;
            }
            renderHistoryList(data);
        })
        .catch(err => {
            console.error(err);
            historyList.innerHTML = `<div style="color:red;">Failed to load. CORS/Network error?</div>`;
        });
    }
    
    function renderHistoryList(letters) {
        historyList.innerHTML = '';
        if (letters.length === 0) {
            historyList.innerHTML = '<div style="color:#aaa; text-align:center; padding:10px;">No letters found.</div>';
            generateNextRef([]);
            return;
        }
        
        letters.forEach(letter => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            // Info Section (Click to Edit)
            const infoDiv = document.createElement('div');
            infoDiv.className = 'history-info';
            infoDiv.innerHTML = `
                <span class="history-ref">${letter.ref || '(No Ref)'}</span>
                <span class="history-date">${letter.date || ''} - To: ${(letter.to || '').substring(0, 15)}...</span>
            `;
            infoDiv.addEventListener('click', () => {
                loadLetterData(letter.content);
            });
            
            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'history-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Edit';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                loadLetterData(letter.content);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = 'Delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('Are you sure you want to delete this letter?')) {
                    deleteLetter(letter.id);
                }
            };
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            div.appendChild(infoDiv);
            div.appendChild(actionsDiv);
            historyList.appendChild(div);
        });

        generateNextRef(letters);
    }
    
    function deleteLetter(id) {
        if (!GOOGLE_SCRIPT_URL) return;
        
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify({ action: 'delete', id: id })
        })
        .then(() => {
            alert('Delete request sent.');
            fetchHistory();
        })
        .catch(err => alert('Delete failed.'));
    }

    function loadLetterData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Load Settings if present
            if (data.settings) {
                letterData = data.settings;
                applyLetterData();
                buildCommitteeSettings();
            }

            // Load Content
            if (data.content) {
                refInput.value = data.content.ref || '';
                
                dateInput.value = data.content.date || '';
                
                toInput.value = data.content.to || '';

                bodyInput.value = data.content.body || ''; // Load into Input

                // Toggles
                if (data.content.toggles) {
                    printRefCheck.checked = data.content.toggles.ref;
                    printToCheck.checked = data.content.toggles.to;
                    printGreetingCheck.checked = data.content.toggles.greeting;
                    
                    if (data.content.toggles.hindiName !== undefined) printHindiNameCheck.checked = data.content.toggles.hindiName;
                    if (data.content.toggles.sadarGreeting !== undefined) printSadarGreetingCheck.checked = data.content.toggles.sadarGreeting;
                }
                
                // Show dashboard to edit
                showDashboard();
            }
        } catch (e) {
            console.error("Error parsing letter content", e);
            alert("Error loading letter content.");
        }
    }


    // Helper
    function updateDateDisplay(dateStr) {
        if (!dateStr) return;
        const d = new Date(dateStr);
        // Format as DD/MM/YYYY
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        dateText.textContent = `${day}/${month}/${year}`;
    }

    function generateNextRef(letters) {
        let maxRef = 0;
        letters.forEach(l => {
            if (l.ref && l.ref.startsWith('JMM-')) {
                const numPart = parseInt(l.ref.split('-')[1]);
                if (!isNaN(numPart) && numPart > maxRef) {
                    maxRef = numPart;
                }
            }
        });

        const nextNum = maxRef + 1;
        const paddedNum = String(nextNum).padStart(3, '0');
        const nextRef = `JMM-${paddedNum}`;
        
        // Only auto-populate if input is empty or matches pattern (to avoid overwriting manual custom edits if user is working)
        // Or if we just loaded history (init phase). 
        // Simple logic: If input is empty, fill it.
        if (refInput.value === '') {
            refInput.value = nextRef;
            refText.textContent = nextRef;
        }
    }

    // Helper: LocalStorage
    function loadFromStorage() {
        // Try to load just the settings if we want persistence across sessions
        // For now, we only load explicit saves.
        return null; 
    }

    // Run Init
    init();
});
