import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, onValue, set } 
    from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

import { firebaseConfig } from "../firebase/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// References
const tempRef = ref(db, "intelliroom/temperature");
const fanRef = ref(db, "intelliroom/fanStatus");
const manualModeRef = ref(db, "intelliroom/manualMode");
const manualFanStateRef = ref(db, "intelliroom/manualFanState");

// Realtime temperature
onValue(tempRef, (snapshot) => {
    document.getElementById("temp").innerText = snapshot.val() + " °C";
});

// Realtime fan status
onValue(fanRef, (snapshot) => {
    document.getElementById("fanStatus").innerText = snapshot.val();
});

// Toggle mode
document.getElementById("toggleMode")
    .addEventListener("change", function() {
        set(manualModeRef, this.checked);
    });

// Manual ON
document.getElementById("fanOn")
    .addEventListener("click", function() {
        set(manualFanStateRef, true);
    });

// Manual OFF
document.getElementById("fanOff")
    .addEventListener("click", function() {
        set(manualFanStateRef, false);
    });
