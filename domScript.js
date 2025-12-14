document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggleMode');
    const modeText = document.querySelector('.mode-text');

    const fanOnButton = document.getElementById('fanOn');
    const fanOffButton = document.getElementById('fanOff');

    toggle.addEventListener('change', function() {
        if (this.checked) {
            modeText.textContent = 'Manual Mode';
        } else {
            modeText.textContent = 'Automatic Mode';
        }
    });
    modeText.textContent = toggle.checked ? 'Manual Mode' : 'Automatic Mode';

    function updateControlState() {
        const isManualMode = toggleMode.checked;

        if (isManualMode) {
            // MANUAL MODE: Enable buttons
            modeText.textContent = 'Manual Mode';
            fanOnButton.disabled = false;
            fanOffButton.disabled = false;
            
            // Re-enforce the button visibility swap logic for when entering Manual Mode
            // Check if the Fan State (tracked via a Firebase read or local variable) dictates which button should show.
            // For now, we'll assume the fan is OFF when entering Manual Mode:
            fanOnButton.style.display = 'block';
            fanOnButton.style.background = '#00ff95';
            fanOffButton.style.display = 'none';

        } else {
            // AUTOMATIC MODE: Disable buttons
            modeText.textContent = 'Automatic Mode';
            fanOnButton.disabled = true;
            fanOffButton.disabled = true;
            
            // Ensure both buttons are visible/hidden as they were, but they are disabled.
            // When disabled, they should revert to the initial state (ON visible, OFF hidden) for clarity.
            fanOnButton.style.display = 'block';
            fanOnButton.style.background = 'gray';
            fanOffButton.style.display = 'none';
        }
    }


    // --- 1. Control Mode Switch Listener ---
    toggleMode.addEventListener('change', updateControlState);

    // --- 2. Manual Fan Button Toggling Listener (Only fires if buttons are enabled) ---
    fanOnButton.addEventListener('click', function() {
        if (!fanOnButton.disabled) {
            // Hide the ON button and show the OFF button
            fanOnButton.style.display = 'none';
            fanOffButton.style.display = 'block';
            console.log("Fan ON command sent (Manual Mode).");
            // *** (Firebase Fan ON command here) ***
        }
    });

    fanOffButton.addEventListener('click', function() {
        if (!fanOffButton.disabled) {
            // Hide the OFF button and show the ON button
            fanOffButton.style.display = 'none';
            fanOnButton.style.display = 'block';
            console.log("Fan OFF command sent (Manual Mode).");
            // *** (Firebase Fan OFF command here) ***
        }
    });
    
    // Initialize the state when the page loads
    updateControlState();
});