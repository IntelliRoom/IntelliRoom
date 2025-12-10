import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    onValue 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import { firebaseConfig } from "../firebase/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase references
const tempRef = ref(db, "/intelliroom/temperature");
const fanRef = ref(db, "/intelliroom/fanStatus");
const manualModeRef = ref(db, "/intelliroom/manualMode");
const manualFanStateRef = ref(db, "/intelliroom/manualFanState");

// NEW: Temperature logs reference
const logsRef = ref(db, "/temperatureLogs");


// ------------------------------------------------
// Realtime Updates
// ------------------------------------------------

// Temperature
onValue(tempRef, (snapshot) => {
    const temp = snapshot.val();
    if (temp !== null) {
        document.getElementById("temp").innerText = temp.toFixed(1) + " °C";
    }
});

// Fan status
onValue(fanRef, (snapshot) => {
    const status = snapshot.val();
    if (status !== null) {
        document.getElementById("fanStatus").innerText = status;
    }
});

// Manual/Auto Mode toggle
onValue(manualModeRef, (snapshot) => {
    const mode = snapshot.val();
    if (mode !== null) {
        document.getElementById("toggleMode").checked = mode;
    }
});


// ------------------------------------------------
// Manual Fan Controls
// ------------------------------------------------

// Toggle mode checkbox
document.getElementById("toggleMode").addEventListener("change", function() {
    set(manualModeRef, this.checked);
});

// Manual fan ON
document.getElementById("fanOn").addEventListener("click", function() {
    set(manualFanStateRef, true);
});

// Manual fan OFF
document.getElementById("fanOff").addEventListener("click", function() {
    set(manualFanStateRef, false);
});


// ------------------------------------------------
// NEW: Temperature Log History Loader
// ------------------------------------------------

onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    const table = document.getElementById("logTable");

    if (!table) return; // index.php safety

    table.innerHTML = "";

    if (data) {
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
    }
});
