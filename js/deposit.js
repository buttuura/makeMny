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
                <h2 style="color:#2d2d7a;font-size:1.5em;margin-bottom:0.5em;">Pay for <span id="popupLevel"></span></h2>
                <p style="font-size:1.1em;margin-bottom:1em;">Amount: <span id="popupAmount"></span> UGX</p>
                <form id="accountForm">
                    <div class="form-group">
                        <label for="userAccountNumber">Your Account Number:</label><br>
                        <input type="text" id="userAccountNumber" name="userAccountNumber" required>
                    </div>
                    <div class="form-group">
                        <label for="userAccountName">Your Account Name:</label><br>
                        <input type="text" id="userAccountName" name="userAccountName" required>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="nameCheck" required>
                        <label for="nameCheck">I confirm the account name above is in my name</label>
                    </div>
                    <button type="submit" id="proceedToPayBtn">Proceed to Pay</button>
                    <button type="button" id="closePopupBtn">Cancel</button>
                </form>
                <div id="paymentInstructions" style="display:none;margin-top:2em;text-align:left;">
                    <h3 style="color:#2d2d7a;">Send Payment To:</h3>
                    <div style="font-size:1.1em;"><strong>Account Number:</strong> 0776944322</div>
                    <div style="font-size:1.1em;"><strong>Account Name:</strong> Buttura Isaiah</div>
                    <div style="margin-top:1em;">After payment, your deposit will be processed.</div>
                </div>
                <div id="processingStatus" style="display:none;margin-top:2em;text-align:center;">
                    <div class="loader"></div>
                    <div style="margin-top:1em;font-size:1.1em;color:#2d2d7a;">Processing... Waiting for admin approval.</div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        // Add styles
        const style = document.createElement('style');
        style.innerHTML = `
            #paymentPopup { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; display: flex; align-items: center; justify-content: center; }
            .popup-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); pointer-events: none; }
            .popup-content { position: relative; background: #fff; padding: 2em 2.5em; border-radius: 16px; z-index: 2; min-width: 340px; max-width: 95vw; box-shadow: 0 8px 32px rgba(44,44,120,0.12); text-align: center; pointer-events: auto; }
            .popup-content button { margin: 1em 0.5em; padding: 0.6em 1.5em; border-radius: 8px; border: none; background: #2d2d7a; color: #fff; font-weight: 600; cursor: pointer; transition: background 0.2s; }
            .popup-content button:hover { background: #1a1a4d; }
            .popup-content input[type="text"] { padding:0.7em; border-radius:8px; border:1px solid #ccc; width:80%; margin-top:0.5em; margin-bottom:1em; font-size:1em; }
            .form-group { margin-bottom:1em; text-align:left; }
            .loader { border: 6px solid #f3f3f3; border-top: 6px solid #2d2d7a; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
        // Send deposit data to backend for admin approval
        fetch('http://localhost:5000/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountName: accName, amount: amount })
        })
        .then(res => res.json())
        .then(data => {
            // Hide form, show payment instructions
            popup.querySelector('#accountForm').style.display = 'none';
            popup.querySelector('#paymentInstructions').style.display = 'block';
            // Show processing status
            popup.querySelector('#processingStatus').style.display = 'block';
            // Start polling for approval
            pollApproval(accName, amount, popup);
        })
        .catch(() => {
            alert('Failed to submit deposit. Please try again.');
        });
    };
}

function pollApproval(accountName, amount, popup) {
    let interval = setInterval(() => {
        fetch('http://localhost:5000/api/pending-deposits')
            .then(res => res.json())
            .then(data => {
                // If deposit is no longer pending, show approved message
                const found = data.find(d => d.accountName === accountName && d.amount == amount);
                if (!found) {
                    clearInterval(interval);
                    popup.querySelector('#processingStatus').innerHTML = '<div style="color:green;font-size:1.2em;margin-top:1em;">✅ Deposit Approved by Admin!</div>';
                    setTimeout(() => { popup.style.display = 'none'; }, 2500);
                }
            });
    }, 3000);
}
