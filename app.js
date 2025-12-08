import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { firebaseConfig } from "../firebase/firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References to Firebase paths
const tempRef = ref(db, "intelliroom/temperature");
const fanRef = ref(db, "intelliroom/fanStatus");
const manualModeRef = ref(db, "intelliroom/manualMode");
const manualFanStateRef = ref(db, "intelliroom/manualFanState");

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
