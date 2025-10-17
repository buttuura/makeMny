// admin-approval.js
// Fetch and display pending deposits, allow admin to approve

document.addEventListener('DOMContentLoaded', function() {

    fetchStatsAndDeposits();
});

function fetchStatsAndDeposits() {
    fetch('https://makemny-3.onrender.com/api/deposit-stats')
        .then(res => res.json())
        .then(stats => {
            document.getElementById('pendingCount').textContent = stats.pending;
            document.getElementById('approvedCount').textContent = stats.approved;
            document.getElementById('rejectedCount').textContent = stats.rejected;
            document.getElementById('totalRevenue').textContent = stats.totalRevenue;
        })
        .catch(() => {
            document.getElementById('pendingCount').textContent = '0';
            document.getElementById('approvedCount').textContent = '0';
            document.getElementById('rejectedCount').textContent = '0';
            document.getElementById('totalRevenue').textContent = '0';
        });
    fetchPendingDeposits();
}

function fetchPendingDeposits() {
    document.getElementById('loadingSpinner').style.display = 'block';
    fetch('https://makemny-3.onrender.com/api/pending-deposits')
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
            <div><strong>Account Number:</strong> ${dep.accountNumber}</div>
            <div><strong>Amount:</strong> UGX ${dep.amount}</div>
            <button onclick="approveDeposit('${dep.accountName}', ${dep.amount})">Approve</button>
        `;
        list.appendChild(item);
    });
}

function approveDeposit(accountName, amount) {
    fetch('https://makemny-3.onrender.com/api/approve-deposit', {
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
