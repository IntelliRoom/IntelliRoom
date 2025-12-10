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
const tempRef = ref(db, "intelliroom/temperature");
const fanRef = ref(db, "intelliroom/fanStatus");
const manualModeRef = ref(db, "intelliroom/manualMode");
const manualFanStateRef = ref(db, "intelliroom/manualFanState");

// Temperature logs
const logsRef = ref(db, "temperatureLogs");


// ------------------------------------------------
// REALTIME DASHBOARD VALUES
// ------------------------------------------------

// Temperature
onValue(tempRef, (snapshot) => {
    const temp = snapshot.val();
    if (temp !== null) {
        document.getElementById("temp").innerText = `${temp.toFixed(1)} °C`;
    }
});

// Fan status
onValue(fanRef, (snapshot) => {
    const status = snapshot.val();
    if (status !== null) {
        document.getElementById("fanStatus").innerText = status;
    }
});

// Mode toggle sync
onValue(manualModeRef, (snapshot) => {
    const mode = snapshot.val();
    if (mode !== null) {
        document.getElementById("toggleMode").checked = mode;
    }
});


// ------------------------------------------------
// MANUAL FAN CONTROLS
// ------------------------------------------------

// Toggle auto/manual mode
document.getElementById("toggleMode").addEventListener("change", function () {
    set(manualModeRef, this.checked);
});

// Manual fan ON
document.getElementById("fanOn").addEventListener("click", () => {
    set(manualFanStateRef, true);
});

// Manual fan OFF
document.getElementById("fanOff").addEventListener("click", () => {
    set(manualFanStateRef, false);
});


// ------------------------------------------------
// LOAD TEMPERATURE LOG HISTORY
// ------------------------------------------------

onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const table = document.getElementById("logTable");

    if (!table) return;  // Safety if not on index.php page

    table.innerHTML = "";

    if (!data) return;

    // Loop through date → time → temperature
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
});
