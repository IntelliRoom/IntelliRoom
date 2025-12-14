import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { get, getDatabase, ref, set, onValue,onChildAdded, query, limitToLast } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAv_ZS8PLXoTcDIXkE-deVKgTPgIUchKJc",
  authDomain: "intelliroom-50474.firebaseapp.com",
  databaseURL: "https://intelliroom-50474-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "intelliroom-50474",
  storageBucket: "intelliroom-50474.firebasestorage.app",
  messagingSenderId: "391776071622",
  appId: "1:391776071622:web:e215eb5a58179881654cc7",
  measurementId: "G-WY77EP7TVZ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Firebase references
const currentTempRef = ref(db, 'intelliroom/Current_Temperature');

const logRef = ref(db, 'temperature');
const logTable = document.getElementById('logTable');
const recentLogQuery = query(logRef, limitToLast(50));

// ------------------------------------------------
// REALTIME UPDATES
// ------------------------------------------------
onValue(currentTempRef, (snapshot) => {
    // snapshot.val() will be the single float number (e.g., 25.54)
    const currentTemperature = snapshot.val();
    
    const tempElement = document.getElementById('temp');
    
    if (currentTemperature !== null) {
        // Format the value to two decimal places and update the HTML element
        tempElement.innerHTML = currentTemperature.toFixed(2) + ' °C';
        console.log("Updated Current Temperature:", currentTemperature);
    } else {
        // Handle case where the node might be empty initially
        tempElement.innerHTML = 'N/A';
        console.log("Current Temperature node is empty or null.");
    }
});
//table populate blah blah
get(recentLogQuery)
    .then((snapshot) => {      
        if (snapshot.exists()) {            
            let htmlContent = '';
            
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (!data || !data.DateTime || !data.Temperature) {
                    console.warn("Skipping malformed historical record:", data);
                    return; 
                }
                // Data Parsing
                const dateTime = data.DateTime.split(' ');
                const date = dateTime[0];
                const time = dateTime[1];
                const rawTemp = parseFloat(data.Temperature);
                const temperatureValue = isNaN(rawTemp) ? 'N/A' : rawTemp.toFixed(2);
                // Build HTML string for the current record
                const rowHTML = `
                    <tr>
                        <td>${date}</td>
                        <td>${time}</td>
                        <td>${temperatureValue} °C</td>
                    </tr>
                `;
                // Prepend the new row to the existing content string (Newest on top)
                htmlContent = rowHTML + htmlContent; 
            });
            // Insert all historical records into the tbody in one go
            logTable.insertAdjacentHTML('afterbegin', htmlContent);
            console.log("Historical data fetched and displayed successfully (via get()).");
        } else {
            console.log("No historical data found to fetch.");
        }
    })
    .catch((error) => {
        console.error("Error fetching initial historical data:", error);
    });

// ** PART 2: LISTEN FOR NEW DATA (ONLY FOR FUTURE UPDATES) **
// Using onChildAdded to listen ONLY for new records pushed from the ESP32
onChildAdded(logRef, (snapshot) => {
    // Skip if the table already has content from the 'get' promise (prevents duplication on load)
    if (logTable.children.length === 0 && snapshot.exists()) {
        // This block should only run if the 'get' failed, but we include it for safety
        console.log("Adding new record before initial load complete...");
    }
    const data = snapshot.val();
    
    if (!data || !data.DateTime || !data.Temperature) {
        return;
    }

    const dateTime = data.DateTime.split(' ');
    const date = dateTime[0];
    const time = dateTime[1];
    const rawTemp = parseFloat(data.Temperature);
    const temperatureValue = isNaN(rawTemp) ? 'N/A' : rawTemp.toFixed(2);

    // Create the HTML for the single new row
    const newRowHTML = `
        <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${temperatureValue} °C</td>
        </tr>
    `;
    logTable.insertAdjacentHTML('afterbegin', newRowHTML);
    console.log("New record added successfully (via onChildAdded).");
});
