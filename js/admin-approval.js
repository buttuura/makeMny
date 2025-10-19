// admin-approval.js
// Fetch and display pending deposits, allow admin to approve

let allDeposits = [];
let currentStatus = 'pending';

document.addEventListener('DOMContentLoaded', function() {
    fetchStatsAndDeposits();
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatus = this.value;
            renderApprovals();
        });
    }
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
    fetchAllDeposits();
}

function fetchAllDeposits() {
    document.getElementById('loadingSpinner').style.display = 'block';
    fetch('https://makemny-3.onrender.com/api/deposits?status=all')
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingSpinner').style.display = 'none';
            allDeposits = data;
            renderApprovals();
        })
        .catch(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
        });
}

function renderApprovals() {
    const list = document.getElementById('approvalsList');
    list.innerHTML = '';
    let filtered = allDeposits.filter(dep => {
        if (currentStatus === 'all') return true;
        return dep.status === currentStatus;
    });
    if (!filtered.length) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    document.getElementById('emptyState').style.display = 'none';
    filtered.forEach(dep => {
        const item = document.createElement('div');
        item.className = 'approval-item';
        item.innerHTML = `
            <div><strong>Account Name:</strong> ${dep.accountName}</div>
            <div><strong>Account Number:</strong> ${dep.accountNumber}</div>
            <div><strong>Amount:</strong> UGX ${dep.amount}</div>
            <div><strong>Status:</strong> ${dep.status.charAt(0).toUpperCase() + dep.status.slice(1)}</div>
            ${dep.status === 'pending' ? `
                <button onclick="approveDeposit('${dep.accountName}', ${dep.amount})">Approve</button>
                <button onclick="rejectDeposit('${dep.accountName}', ${dep.amount})" style="margin-left:1em;background:#e74c3c;color:#fff;">Reject</button>
            ` : ''}
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
        fetchStatsAndDeposits();
        alert('Deposit approved!');
    });
}

function rejectDeposit(accountName, amount) {
    fetch('https://makemny-3.onrender.com/api/reject-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, amount })
    })
    .then(res => res.json())
    .then(() => {
        fetchStatsAndDeposits();
        alert('Deposit rejected!');
    });
}

function refreshApprovals() {
    fetchStatsAndDeposits();
}
