// deposit.js
// Handles deposit page interactions

document.addEventListener('DOMContentLoaded', function() {
    // Add click event to all level-card sections
    document.querySelectorAll('.level-card').forEach(function(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            const level = card.getAttribute('data-level');
            const amount = card.getAttribute('data-amount');
            showPaymentPopup(level, amount);
        });
    });
});

function showPaymentPopup(level, amount) {
    let popup = document.getElementById('paymentPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'paymentPopup';
        popup.innerHTML = `
            <div class="popup-overlay"></div>
            <div class="popup-content">
                <h2>Pay for <span id="popupLevel"></span></h2>
                <p>Amount: <span id="popupAmount"></span> UGX</p>
                <form id="accountForm">
                    <div style="margin-bottom:1em;">
                        <label for="userAccountNumber">Your Account Number:</label><br>
                        <input type="text" id="userAccountNumber" name="userAccountNumber" required style="width:80%;margin-top:0.5em;">
                    </div>
                    <div style="margin-bottom:1em;">
                        <label for="userAccountName">Your Account Name:</label><br>
                        <input type="text" id="userAccountName" name="userAccountName" required style="width:80%;margin-top:0.5em;">
                    </div>
                    <div style="margin-bottom:1em;">
                        <input type="checkbox" id="nameCheck" required>
                        <label for="nameCheck">I confirm the account name above is in my name</label>
                    </div>
                    <button type="submit" id="proceedToPayBtn">Proceed to Pay</button>
                    <button type="button" id="closePopupBtn">Cancel</button>
                </form>
                <div id="paymentInstructions" style="display:none;margin-top:2em;text-align:left;">
                    <h3>Send Payment To:</h3>
                    <div><strong>Account Number:</strong> 0776944322</div>
                    <div><strong>Account Name:</strong> Buttura Isaiah</div>
                    <div style="margin-top:1em;">After payment, your deposit will be processed.</div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        // Add styles
        const style = document.createElement('style');
        style.innerHTML = `
            #paymentPopup { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; display: flex; align-items: center; justify-content: center; }
            .popup-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); pointer-events: none; }
            .popup-content { position: relative; background: #fff; padding: 2em; border-radius: 10px; z-index: 2; min-width: 320px; text-align: center; pointer-events: auto; }
            .popup-content button { margin: 1em; }
            .popup-content input[type="text"] { padding:0.5em; border-radius:5px; border:1px solid #ccc; }
        `;
        document.head.appendChild(style);
    }
    popup.style.display = 'flex';
    popup.querySelector('#popupLevel').textContent = level.charAt(0).toUpperCase() + level.slice(1) + ' Worker';
    popup.querySelector('#popupAmount').textContent = amount;
    // Reset form and instructions
    popup.querySelector('#accountForm').style.display = 'block';
    popup.querySelector('#paymentInstructions').style.display = 'none';
    // Cancel button
    popup.querySelector('#closePopupBtn').onclick = function() {
        popup.style.display = 'none';
    };
    // Form submit
    popup.querySelector('#accountForm').onsubmit = function(e) {
        e.preventDefault();
        const accNum = popup.querySelector('#userAccountNumber').value.trim();
        const accName = popup.querySelector('#userAccountName').value.trim();
        const nameChecked = popup.querySelector('#nameCheck').checked;
        if (!accNum || !accName || !nameChecked) {
            alert('Please fill all fields and confirm your account name.');
            return;
        }
        // Hide form, show payment instructions
        popup.querySelector('#accountForm').style.display = 'none';
        popup.querySelector('#paymentInstructions').style.display = 'block';
    };
}
