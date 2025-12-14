const fanStatusElement = document.getElementById('fanStatus');

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
        const modeEvent = new CustomEvent('controlModeChanged', {
            detail: {
                isManual: isManualMode
            }
        });
        // Dispatch the event from the document
        document.dispatchEvent(modeEvent);

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
            
            const fanEvent = new CustomEvent('fanControlChanged', {
                detail: {
                    state: 'OFF' // This state corresponds to manualFanStatus = false
                }
            });
            document.dispatchEvent(fanEvent);
            console.log("Implicit Fan OFF command sent (Switched to Auto Mode, clearing manual state).");

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
            const fanEvent = new CustomEvent('fanControlChanged', {
                detail: {
                    state: 'ON'
                }
            });
            document.dispatchEvent(fanEvent);
            console.log("Fan ON command sent (Manual Mode).");
            // *** (Firebase Fan ON command here) ***
        }
    });

    fanOffButton.addEventListener('click', function() {
        if (!fanOffButton.disabled) {
            // Hide the OFF button and show the ON button
            fanOffButton.style.display = 'none';
            fanOnButton.style.display = 'block';
            const fanEvent = new CustomEvent('fanControlChanged', {
                detail: {
                    state: 'OFF'
                }
            });
            document.dispatchEvent(fanEvent);
            console.log("Fan OFF command sent (Manual Mode).");
            // *** (Firebase Fan OFF command here) ***
        }
    });
    
    // Initialize the state when the page loads
    updateControlState();
});

document.addEventListener('firebaseFanStatusUpdate', function(e) {
    const isFanOn = e.detail.state;

    if (isFanOn === true) {
        fanStatusElement.textContent = 'ON';
        fanStatusElement.classList.add('status-on');
        fanStatusElement.classList.remove('status-off');
    } else {
        fanStatusElement.textContent = 'OFF';
        fanStatusElement.classList.add('status-off');
        fanStatusElement.classList.remove('status-on');
    }
    
    console.log("DOM Script: Fan Status updated on UI.");
});
