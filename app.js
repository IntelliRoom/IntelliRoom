import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    onValue 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import { firebaseConfig } from "../firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase references
const tempRef = ref(db, "/intelliroom/temperature");
const fanRef = ref(db, "/intelliroom/fanStatus");
const manualModeRef = ref(db, "/intelliroom/manualMode");
const manualFanStateRef = ref(db, "/intelliroom/manualFanState");
const logsRef = ref(db, "/temperatureLogs");


// ------------------------------------------------
// REALTIME UPDATES
// ------------------------------------------------

// Temperature realtime
onValue(tempRef, (snapshot) => {
    const temp = snapshot.val();
    if (temp !== null && document.getElementById("temp")) {
        document.getElementById("temp").innerHTML = temp.toFixed(1) + " °C";
    }
});

// Fan status realtime
onValue(fanRef, (snapshot) => {
    const status = snapshot.val();
    if (status !== null && document.getElementById("fanStatus")) {
        document.getElementById("fanStatus").innerHTML = status ? "ON" : "OFF";
    }
});

// Manual Mode realtime
onValue(manualModeRef, (snapshot) => {
    const mode = snapshot.val();
    const toggle = document.getElementById("toggleMode");

    if (mode !== null && toggle) {
        toggle.checked = mode;
        document.getElementById("modeLabel").innerHTML = mode ? "Manual Mode" : "Automatic Mode";
    }
});

// Manual Fan State realtime
onValue(manualFanStateRef, (snapshot) => {
    const fanState = snapshot.val();
    const fanSwitch = document.getElementById("manualFanSwitch");

    if (fanState !== null && fanSwitch) {
        fanSwitch.checked = fanState;
    }
});


// ------------------------------------------------
// CONTROLS (Buttons & Switches)
// ------------------------------------------------

// Toggle Manual Mode
const toggleMode = document.getElementById("toggleMode");
if (toggleMode) {
    toggleMode.addEventListener("change", function() {
        set(manualModeRef, this.checked);
    });
}

// Manual Fan On/Off buttons
const fanOnBtn = document.getElementById("fanOn");
if (fanOnBtn) {
    fanOnBtn.addEventListener("click", function() {
        set(manualFanStateRef, true);
    });
}

const fanOffBtn = document.getElementById("fanOff");
if (fanOffBtn) {
    fanOffBtn.addEventListener("click", function() {
        set(manualFanStateRef, false);
    });
}

// Manual Fan Switch (if using toggle)
const manualFanSwitch = document.getElementById("manualFanSwitch");
if (manualFanSwitch) {
    manualFanSwitch.addEventListener("change", function() {
        set(manualFanStateRef, this.checked);
    });
}


// ------------------------------------------------
// TEMPERATURE LOGS
// ------------------------------------------------

onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const table = document.getElementById("logTable");

    if (!table) return;

    table.innerHTML = "";

    if (data) {
        Object.keys(data).forEach(date => {
            Object.keys(data[date]).forEach(time => {
                const temp = data[date][time];

                table.innerHTML += `
                    <tr>
                        <td>${date}</td>
                        <td>${time}</td>
                        <td>${temp} °C</td>
                    </tr>
                `;
            });
        });
    }
});
