import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from "../firebase/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References to Firebase paths (matching ESP32)
const tempRef = ref(db, "/intelliroom/temperature");
const fanRef = ref(db, "/intelliroom/fanStatus");
const manualModeRef = ref(db, "/intelliroom/manualMode");
const manualFanStateRef = ref(db, "/intelliroom/manualFanState");
const currentModeRef = ref(db, "/intelliroom/currentModeIsManual");

// -------------------------------
// Real-time updates
// -------------------------------

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

// Sync toggle with manualMode
onValue(manualModeRef, (snapshot) => {
    const mode = snapshot.val();
    if (mode !== null) {
        document.getElementById("toggleMode").checked = mode;
    }
});

// -------------------------------
// Event listeners
// -------------------------------

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

