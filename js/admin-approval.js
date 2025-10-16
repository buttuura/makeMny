// admin-approval.js
// Fetch and display pending deposits, allow admin to approve

document.addEventListener('DOMContentLoaded', function() {
    fetchPendingDeposits();
});

function fetchPendingDeposits() {
    document.getElementById('loadingSpinner').style.display = 'block';
    fetch('http://localhost:5000/api/pending-deposits')
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingSpinner').style.display = 'none';
            renderApprovals(data);
        })
        .catch(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
        });
}

function renderApprovals(deposits) {
    const list = document.getElementById('approvalsList');
    list.innerHTML = '';
    if (!deposits.length) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    document.getElementById('emptyState').style.display = 'none';
    deposits.forEach((dep, idx) => {
        const item = document.createElement('div');
        item.className = 'approval-item';
        item.innerHTML = `
            <div><strong>Account Name:</strong> ${dep.accountName}</div>
            <div><strong>Amount:</strong> UGX ${dep.amount}</div>
            <button onclick="approveDeposit('${dep.accountName}', ${dep.amount})">Approve</button>
        `;
        list.appendChild(item);
    });
}

function approveDeposit(accountName, amount) {
    fetch('http://localhost:5000/api/approve-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, amount })
    })
    .then(res => res.json())
    .then(() => {
        fetchPendingDeposits();
        alert('Deposit approved!');
    });
}

function refreshApprovals() {
    fetchPendingDeposits();
}
