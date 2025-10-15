// deposit.js
// Handles deposit page interactions

document.addEventListener('DOMContentLoaded', function() {
    // Add click event to all investment amounts
    document.querySelectorAll('.investment-amount').forEach(function(elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', function(e) {
            const card = elem.closest('.level-card');
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
                <button id="payNowBtn">Pay Now</button>
                <button id="closePopupBtn">Cancel</button>
            </div>
        `;
        document.body.appendChild(popup);
        // Add styles
        const style = document.createElement('style');
        style.innerHTML = `
            #paymentPopup { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; display: flex; align-items: center; justify-content: center; }
            .popup-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); }
            .popup-content { position: relative; background: #fff; padding: 2em; border-radius: 10px; z-index: 2; min-width: 300px; text-align: center; }
            .popup-content button { margin: 1em; }
        `;
        document.head.appendChild(style);
    }
    popup.style.display = 'flex';
    popup.querySelector('#popupLevel').textContent = level.charAt(0).toUpperCase() + level.slice(1) + ' Worker';
    popup.querySelector('#popupAmount').textContent = amount;
    popup.querySelector('#closePopupBtn').onclick = function() {
        popup.style.display = 'none';
    };
    popup.querySelector('#payNowBtn').onclick = function() {
        // Here you can add payment logic
        alert('Proceeding to payment for ' + amount + ' UGX');
        popup.style.display = 'none';
    };
}
