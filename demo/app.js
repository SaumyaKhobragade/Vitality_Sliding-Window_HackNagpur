// VITALITY SIMULATION CONTROL PANEL CLIENT LOGIC

const API_BASE_URL = 'http://localhost:9090';

// State Management
let isConnected = false;
let eventSourceStats = null;
let eventSourceHospital = null;
let eventSourceEvents = null;
let hospitalsList = [];

// DOM Elements
const connectionBadge = document.getElementById('connection-badge');
const statTotalPatients = document.getElementById('stat-total-patients');
const statWaitingPatients = document.getElementById('stat-waiting-patients');
const statTreatedPatients = document.getElementById('stat-treated-patients');
const statActiveDoctors = document.getElementById('stat-active-doctors');
const statRedirections = document.getElementById('stat-redirections');
const statFairness = document.getElementById('stat-fairness');

const btnInit = document.getElementById('btn-init');
const initHospitalsInput = document.getElementById('init-hospitals');
const btnSurge = document.getElementById('btn-surge');
const surgeCountInput = document.getElementById('surge-count');
const btnFlood = document.getElementById('btn-flood');
const floodCountInput = document.getElementById('flood-count');

const btnShortage60 = document.getElementById('btn-shortage-60');
const btnShortage30 = document.getElementById('btn-shortage-30');

const formAdmit = document.getElementById('form-admit');
const admitHospitalSelect = document.getElementById('admit-hospital');
const admitSeveritySlider = document.getElementById('admit-severity');
const severityVal = document.getElementById('severity-val');

const formDistress = document.getElementById('form-distress');
const distressPatientInput = document.getElementById('distress-patient-id');
const distressLevelSlider = document.getElementById('distress-level');
const distressVal = document.getElementById('distress-val');
const btnTriggerDistress = document.getElementById('btn-trigger-distress');
const btnConfirmDistress = document.getElementById('btn-confirm-distress');
const btnDismissDistress = document.getElementById('btn-dismiss-distress');

const formRedirect = document.getElementById('form-redirect');
const redirectPatientInput = document.getElementById('redirect-patient-id');
const redirectHospitalSelect = document.getElementById('redirect-hospital');
const redirectResultBox = document.getElementById('redirect-result');
const recDecision = document.getElementById('rec-decision');
const recDetails = document.getElementById('rec-details');

const policyConfigContainer = document.getElementById('policy-config-container');
const hospitalsGrid = document.getElementById('hospitals-grid');
const hospitalCountBadge = document.getElementById('hospital-count-badge');
const logConsole = document.getElementById('log-console');
const btnClearLogs = document.getElementById('btn-clear-logs');

// Initial Setup & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Sliders
    admitSeveritySlider.addEventListener('input', (e) => {
        severityVal.textContent = e.target.value;
    });
    distressLevelSlider.addEventListener('input', (e) => {
        distressVal.textContent = e.target.value;
    });

    // Logger
    btnClearLogs.addEventListener('click', () => {
        logConsole.innerHTML = '<div class="log-entry system"><span class="log-time">' + getFormattedTime() + '</span> Console cleared.</div>';
    });

    // Simulation controls
    btnInit.addEventListener('click', initializeCity);
    btnSurge.addEventListener('click', triggerSurge);
    btnFlood.addEventListener('click', triggerFlood);
    btnShortage60.addEventListener('click', () => triggerShortage(0.6));
    btnShortage30.addEventListener('click', () => triggerShortage(0.3));

    // Form Admissions
    formAdmit.addEventListener('submit', admitPatient);

    // Distress Actions
    btnTriggerDistress.addEventListener('click', () => submitDistress('trigger'));
    btnConfirmDistress.addEventListener('click', () => submitDistress('confirm'));
    btnDismissDistress.addEventListener('click', () => submitDistress('dismiss'));

    // Redirection Evaluator
    formRedirect.addEventListener('submit', evaluateRedirection);

    // Initial Health and Connect
    checkBackendHealth();
    setInterval(checkBackendHealth, 5000);
});

// Helper: Formatted Timestamp
function getFormattedTime() {
    const d = new Date();
    return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

// Log Message to UI Console
function logMessage(text, type = 'info', badgeText = 'sys') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = getFormattedTime();
    
    const badge = document.createElement('span');
    badge.className = `log-badge badge-${badgeText}`;
    badge.textContent = badgeText;
    
    const textNode = document.createTextNode(' ' + text);
    
    entry.appendChild(timeSpan);
    entry.appendChild(badge);
    entry.appendChild(textNode);
    
    logConsole.appendChild(entry);
    logConsole.scrollTop = logConsole.scrollHeight;
}

// API Health Check
async function checkBackendHealth() {
    try {
        const res = await fetch(`${API_BASE_URL}/actuator/health`);
        if (res.ok) {
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false);
        }
    } catch (err) {
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(connected) {
    if (connected === isConnected) return;

    isConnected = connected;
    if (connected) {
        connectionBadge.textContent = 'CONNECTED';
        connectionBadge.className = 'badge connected';
        logMessage('Backend server connection established.', 'success', 'sys');
        
        // Fetch baseline data
        fetchStats();
        fetchHospitals();
        fetchPolicies();
        
        // Subscribe to SSE
        startSSEListeners();
    } else {
        connectionBadge.textContent = 'DISCONNECTED';
        connectionBadge.className = 'badge disconnected';
        logMessage('Backend server disconnected. Ensure Java app is running on port 9090.', 'danger', 'sys');
        stopSSEListeners();
    }
}

// REST: Initialize City
async function initializeCity() {
    if (!isConnected) return;
    const count = initHospitalsInput.value;
    logMessage(`Initializing city with count: ${count}...`, 'info', 'sys');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: String(count) })
        });
        
        const data = await res.text();
        logMessage(data, 'success', 'sys');
        fetchHospitals();
        fetchStats();
    } catch (err) {
        logMessage(`Initialization failed: ${err.message}`, 'danger', 'sys');
    }
}

// REST: Trigger Surge
async function triggerSurge() {
    if (!isConnected) return;
    const count = surgeCountInput.value;
    logMessage(`Triggering surge with ${count} patients...`, 'warning', 'srg');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/surge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: String(count) })
        });
        
        const data = await res.text();
        logMessage(data, 'success', 'srg');
    } catch (err) {
        logMessage(`Surge failed: ${err.message}`, 'danger', 'srg');
    }
}

// REST: Trigger Flood
async function triggerFlood() {
    if (!isConnected) return;
    const count = floodCountInput.value;
    logMessage(`Flooding city with ${count} patients per hospital...`, 'danger', 'srg');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/flood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientsPerHospital: parseInt(count), hospitalsToFlood: 3 })
        });
        
        const data = await res.json();
        if (data.success) {
            logMessage(`Flood successful! Added ${data.totalPatients} patients to ${data.hospitalsFlooded.join(', ')}`, 'success', 'srg');
        } else {
            logMessage(`Flood failed: ${data.message}`, 'danger', 'srg');
        }
    } catch (err) {
        logMessage(`Flood failed: ${err.message}`, 'danger', 'srg');
    }
}

// REST: Trigger Staff Shortage
async function triggerShortage(factor) {
    if (!isConnected) return;
    logMessage(`Applying doctor shortage with factor ${factor}...`, 'danger', 'sys');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/staffing/shortage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ factor: parseFloat(factor) })
        });
        
        const data = await res.text();
        logMessage(data, 'warning', 'sys');
        fetchHospitals();
    } catch (err) {
        logMessage(`Shortage configuration failed: ${err.message}`, 'danger', 'sys');
    }
}

// REST: Admit Patient
async function admitPatient(e) {
    e.preventDefault();
    if (!isConnected) return;
    
    const hospitalId = admitHospitalSelect.value;
    const severity = parseInt(admitSeveritySlider.value);
    
    if (!hospitalId) {
        alert('Please select a hospital.');
        return;
    }
    
    logMessage(`Admitting patient with severity ${severity} to ${hospitalId}...`, 'info', 'adm');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hospitalId, severity })
        });
        
        const data = await res.json();
        if (data.status === 'success') {
            logMessage(`Patient ${data.patientId} admitted successfully.`, 'success', 'adm');
            
            // Auto fill distress and redirect forms with this patient ID for easier testing
            distressPatientInput.value = data.patientId;
            redirectPatientInput.value = data.patientId;
            redirectHospitalSelect.value = hospitalId;
        } else {
            logMessage('Failed to admit patient.', 'danger', 'adm');
        }
    } catch (err) {
        logMessage(`Admission error: ${err.message}`, 'danger', 'adm');
    }
}

// REST: Distress Signals
async function submitDistress(action) {
    if (!isConnected) return;
    
    const patientId = distressPatientInput.value.trim();
    const distressLevel = parseInt(distressLevelSlider.value);
    
    if (!patientId) {
        alert('Please input a Patient ID.');
        return;
    }
    
    let url = `${API_BASE_URL}/api/simulation/distress`;
    let body = { patientId };
    
    if (action === 'trigger') {
        body.distressLevel = distressLevel;
        // In simulation, we need a hospital. Let's find patient's hospital or use first one.
        const currentHosp = redirectHospitalSelect.value || (hospitalsList[0] ? hospitalsList[0].id : 'H1');
        body.hospitalId = currentHosp;
        logMessage(`Triggering provisional distress for patient ${patientId} (Severity: ${distressLevel})...`, 'warning', 'dst');
    } else if (action === 'confirm') {
        url = `${API_BASE_URL}/api/simulation/distress/confirm`;
        logMessage(`Confirming permanent distress for patient ${patientId} (Human-in-the-loop)...`, 'success', 'dst');
    } else if (action === 'dismiss') {
        url = `${API_BASE_URL}/api/simulation/distress/dismiss`;
        logMessage(`Dismissing distress for patient ${patientId}...`, 'info', 'dst');
    }
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await res.text();
        logMessage(data, 'success', 'dst');
    } catch (err) {
        logMessage(`Distress signal failed: ${err.message}`, 'danger', 'dst');
    }
}

// REST: Evaluate Redirection
async function evaluateRedirection(e) {
    e.preventDefault();
    if (!isConnected) return;
    
    const patientId = redirectPatientInput.value.trim();
    const currentHospitalId = redirectHospitalSelect.value;
    
    if (!patientId || !currentHospitalId) {
        alert('Please select current hospital and fill patient ID.');
        return;
    }
    
    logMessage(`Evaluating redirection eligibility for patient ${patientId} at ${currentHospitalId}...`, 'info', 'red');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/redirect/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, currentHospitalId })
        });
        
        const target = await res.text();
        
        redirectResultBox.classList.remove('hidden');
        if (target !== currentHospitalId) {
            recDecision.textContent = 'REDIRECT';
            recDecision.className = 'badge connected'; // Green
            recDetails.innerHTML = `Orchestrator recommends redirecting patient <strong>${patientId}</strong> from <strong>${currentHospitalId}</strong> to <strong>${target}</strong> to optimize treatment delay.`;
            logMessage(`[ADVICE] Patient ${patientId} redirect recommended: ${currentHospitalId} ➜ ${target}`, 'success', 'red');
        } else {
            recDecision.textContent = 'STAY';
            recDecision.className = 'badge badge-info'; // Blue
            recDetails.innerHTML = `Orchestrator recommends patient <strong>${patientId}</strong> remain at <strong>${currentHospitalId}</strong>. Local queue is optimal.`;
            logMessage(`[ADVICE] Patient ${patientId} should stay at ${currentHospitalId}.`, 'info', 'red');
        }
    } catch (err) {
        logMessage(`Redirection evaluation failed: ${err.message}`, 'danger', 'red');
    }
}

// REST: Fetch Stats
async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/stats`);
        const stats = await res.json();
        updateStatsUI(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
}

// REST: Fetch Hospitals
async function fetchHospitals() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/simulation/hospitals`);
        const hospitals = await res.json();
        hospitalsList = hospitals;
        updateHospitalsUI(hospitals);
        updateHospitalDropdowns(hospitals);
    } catch (err) {
        console.error('Error fetching hospitals:', err);
    }
}

// REST: Fetch Policies
async function fetchPolicies() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/policies`);
        const policies = await res.json();
        updatePoliciesUI(policies);
    } catch (err) {
        console.error('Error fetching policies:', err);
    }
}

// REST: Update Policy live
async function updatePolicyParam(key, value) {
    logMessage(`Updating policy parameter: ${key} = ${value}...`, 'info', 'sys');
    try {
        const res = await fetch(`${API_BASE_URL}/api/policies/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: parseFloat(value) })
        });
        const msg = await res.text();
        logMessage(msg, 'success', 'sys');
        fetchPolicies();
    } catch (err) {
        logMessage(`Failed to update policy: ${err.message}`, 'danger', 'sys');
    }
}

// UI: Update Stats
function updateStatsUI(stats) {
    statTotalPatients.textContent = stats.totalPatientsRegistered || 0;
    statWaitingPatients.textContent = stats.totalPatientsWaiting || 0;
    statTreatedPatients.textContent = stats.totalPatientsTreated || 0;
    statActiveDoctors.textContent = stats.totalDoctorsActive || 0;
    statRedirections.textContent = stats.totalRedirections || 0;
    statFairness.textContent = parseFloat(stats.fairnessIndex || 0).toFixed(2);
}

// UI: Update dropdown selectors
function updateHospitalDropdowns(hospitals) {
    const prevAdmitVal = admitHospitalSelect.value;
    const prevRedirectVal = redirectHospitalSelect.value;

    admitHospitalSelect.innerHTML = '<option value="">-- Select Hospital --</option>';
    redirectHospitalSelect.innerHTML = '<option value="">-- Select Hospital --</option>';

    hospitals.forEach(h => {
        const opt1 = document.createElement('option');
        opt1.value = h.id;
        opt1.textContent = `${h.name} (${h.id.substring(0, 5)})`;
        admitHospitalSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = h.id;
        opt2.textContent = `${h.name} (${h.id.substring(0, 5)})`;
        redirectHospitalSelect.appendChild(opt2);
    });

    admitHospitalSelect.value = prevAdmitVal;
    redirectHospitalSelect.value = prevRedirectVal;
}

// UI: Update active policy list
function updatePoliciesUI(policies) {
    policyConfigContainer.innerHTML = '';
    
    Object.entries(policies).forEach(([key, val]) => {
        const item = document.createElement('div');
        item.className = 'policy-item';
        
        const header = document.createElement('div');
        header.className = 'policy-header-row';
        
        const name = document.createElement('span');
        name.className = 'policy-name';
        name.textContent = key;
        
        const valSpan = document.createElement('span');
        valSpan.className = 'policy-value';
        valSpan.textContent = val;
        
        header.appendChild(name);
        header.appendChild(valSpan);
        
        const control = document.createElement('div');
        control.className = 'policy-control';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.step = key.includes('timeout') ? '1000' : '0.1';
        input.value = val;
        
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.textContent = 'Set';
        btn.onclick = () => updatePolicyParam(key, input.value);
        
        control.appendChild(input);
        control.appendChild(btn);
        
        item.appendChild(header);
        item.appendChild(control);
        policyConfigContainer.appendChild(item);
    });
}

// UI: Update Hospital cards
function updateHospitalsUI(hospitals) {
    if (hospitals.length === 0) {
        hospitalsGrid.innerHTML = `
            <div class="empty-state">
                <p>No hospitals initialized. Click "Initialize City" to set up hospitals.</p>
            </div>
        `;
        hospitalCountBadge.textContent = '0 Active';
        hospitalCountBadge.className = 'badge disconnected';
        return;
    }

    hospitalCountBadge.textContent = `${hospitals.length} Active`;
    hospitalCountBadge.className = 'badge connected';
    hospitalsGrid.innerHTML = '';

    hospitals.forEach(h => {
        const card = document.createElement('div');
        card.className = 'hospital-card';
        
        const waiting = h.waitingQueue ? h.waitingQueue.length : 0;
        const activeDocs = h.departmentalStaff ? 
            Object.values(h.departmentalStaff).reduce((acc, current) => acc + (current.activeCount || 0), 0) : 0;
        
        const occupancyRate = h.capacity > 0 ? ((h.activeTreatmentsCount || 0) / h.capacity) * 100 : 0;
        
        let statusClass = 'normal';
        let statusText = 'Normal';
        if (waiting > 15) {
            statusClass = 'overloaded';
            statusText = 'Overloaded';
            card.classList.add('overloaded');
        } else if (waiting > 5) {
            statusClass = 'stressed';
            statusText = 'Stressed';
        }

        let progressClass = '';
        if (occupancyRate > 85) progressClass = 'critical';
        else if (occupancyRate > 60) progressClass = 'high';

        card.innerHTML = `
            <div class="h-card-header">
                <div>
                    <div class="h-name">${h.name}</div>
                    <div class="h-id">ID: ${h.id.substring(0, 8)}...</div>
                </div>
                <span class="h-status-indicator ${statusClass}">${statusText}</span>
            </div>
            
            <div class="h-metrics">
                <div class="h-metric-item">
                    <span class="h-metric-lbl">Waiting Queue</span>
                    <span class="h-metric-val" style="color: ${waiting > 0 ? 'var(--warning)' : 'inherit'}">${waiting}</span>
                </div>
                <div class="h-metric-item">
                    <span class="h-metric-lbl">Active Treatments</span>
                    <span class="h-metric-val">${h.activeTreatmentsCount || 0} / ${h.capacity}</span>
                </div>
                <div class="h-metric-item">
                    <span class="h-metric-lbl">Active Doctors</span>
                    <span class="h-metric-val" style="color: var(--info)">${activeDocs}</span>
                </div>
                <div class="h-metric-item">
                    <span class="h-metric-lbl">Avg Wait Time</span>
                    <span class="h-metric-val">${h.avgWaitTimeMs ? Math.round(h.avgWaitTimeMs / 1000) + 's' : '0s'}</span>
                </div>
            </div>
            
            <div class="h-capacity-bar">
                <div class="h-capacity-fill ${progressClass}" style="width: ${Math.min(occupancyRate, 100)}%"></div>
            </div>
        `;
        hospitalsGrid.appendChild(card);
    });
}

// SSE Connection Manager
function startSSEListeners() {
    stopSSEListeners(); // Safety cleanup

    // 1. Stats Stream
    eventSourceStats = new EventSource(`${API_BASE_URL}/api/sse/stats`);
    eventSourceStats.onmessage = (event) => {
        try {
            const stats = JSON.parse(event.data);
            updateStatsUI(stats);
        } catch (err) {
            console.error('Error parsing stats SSE data', err);
        }
    };
    eventSourceStats.onerror = () => {
        console.warn('SSE stats connection errored. Attempting reconnect...');
    };

    // 2. Hospital Stream
    eventSourceHospital = new EventSource(`${API_BASE_URL}/api/sse/hospital`);
    eventSourceHospital.onmessage = (event) => {
        try {
            const hospital = JSON.parse(event.data);
            // Locate and update hospital in list, then redraw
            const idx = hospitalsList.findIndex(h => h.id === hospital.id);
            if (idx !== -1) {
                hospitalsList[idx] = hospital;
            } else {
                hospitalsList.push(hospital);
            }
            updateHospitalsUI(hospitalsList);
            updateHospitalDropdowns(hospitalsList);
        } catch (err) {
            console.error('Error parsing hospital SSE data', err);
        }
    };

    // 3. System Events Stream
    eventSourceEvents = new EventSource(`${API_BASE_URL}/api/sse/events`);
    eventSourceEvents.onmessage = (event) => {
        try {
            const ev = JSON.parse(event.data);
            handleSystemEvent(ev);
        } catch (err) {
            console.error('Error parsing events SSE data', err);
        }
    };
}

function stopSSEListeners() {
    if (eventSourceStats) {
        eventSourceStats.close();
        eventSourceStats = null;
    }
    if (eventSourceHospital) {
        eventSourceHospital.close();
        eventSourceHospital = null;
    }
    if (eventSourceEvents) {
        eventSourceEvents.close();
        eventSourceEvents = null;
    }
}

// Handle real-time stream logs
function handleSystemEvent(ev) {
    let logType = 'info';
    let badgeText = 'sys';
    let messageText = ev.message || JSON.stringify(ev);

    switch (ev.type) {
        case 'CITY_INITIALIZED':
            logType = 'success';
            badgeText = 'sys';
            fetchHospitals(); // Reload fully
            break;
        case 'PATIENT_ADMITTED':
            logType = 'info';
            badgeText = 'adm';
            break;
        case 'SURGE_TRIGGERED':
            logType = 'warning';
            badgeText = 'srg';
            break;
        case 'HOSPITALS_FLOODED':
            logType = 'danger';
            badgeText = 'srg';
            break;
        case 'DISTRESS_TRIGGERED':
        case 'DISTRESS_PENDING':
            logType = 'warning';
            badgeText = 'dst';
            break;
        case 'DISTRESS_CONFIRMED':
            logType = 'success';
            badgeText = 'dst';
            break;
        case 'DISTRESS_DISMISSED':
        case 'DISTRESS_EXPIRED':
            logType = 'system';
            badgeText = 'dst';
            break;
        case 'REDirection_COMPLETED':
            logType = 'success';
            badgeText = 'red';
            break;
    }

    logMessage(messageText, logType, badgeText);
    fetchStats(); // Update counters on any event
}
