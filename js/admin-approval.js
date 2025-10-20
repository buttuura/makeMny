document.addEventListener('DOMContentLoaded', function() {
// Simple admin approval JS
const API_BASE = 'https://makemny-5.onrender.com';

function showMessage(msg, color = 'red') {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.style.color = color;
    setTimeout(() => { el.textContent = ''; }, 3000);
}

function fetchApprovals() {
    fetch(`${API_BASE}/api/deposits?status=pending`)
        .then(res => res.json())
        .then(data => renderApprovals(data))
        .catch(() => showMessage('Failed to load approvals'));
}

function renderApprovals(deposits) {
    const container = document.getElementById('approvals');
    container.innerHTML = '';
    if (!deposits.length) {
        container.innerHTML = '<p>No pending approvals.</p>';
        return;
    }
    deposits.forEach(dep => {
        const div = document.createElement('div');
        div.className = 'approval-item';
        div.innerHTML = `
            <strong>${dep.accountName}</strong> | UGX ${dep.amount} | ${dep.accountNumber}
            <button onclick="approveDeposit('${dep.accountName}', ${dep.amount})">Approve</button>
            <button onclick="rejectDeposit('${dep.accountName}', ${dep.amount})">Reject</button>
        `;
        container.appendChild(div);
    });
}

function approveDeposit(accountName, amount) {
    fetch(`${API_BASE}/api/approve-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, amount })
    })
    .then(res => res.json())
    .then(data => {
        showMessage('Deposit approved!', 'green');
        fetchApprovals();
    })
    .catch(() => showMessage('Failed to approve deposit'));
}

function rejectDeposit(accountName, amount) {
    fetch(`${API_BASE}/api/reject-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, amount })
    })
    .then(res => res.json())
    .then(data => {
        showMessage('Deposit rejected!', 'green');
        fetchApprovals();
    })
    .catch(() => showMessage('Failed to reject deposit'));
}

document.addEventListener('DOMContentLoaded', fetchApprovals);
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
                <button onclick="approveDeposit('${dep._id}')">Approve</button>
                <button onclick="rejectDeposit('${dep._id}')" style="margin-left:1em;background:#e74c3c;color:#fff;">Reject</button>
            ` : ''}
        `;
        list.appendChild(item);
    });
}

function approveDeposit(depositId) {
    fetch('/api/approve-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId })
    })
    .then(res => res.json())
    .then(() => {
        // Update local allDeposits array
        allDeposits = allDeposits.map(dep => {
            if (dep._id === depositId && dep.status === 'pending') {
                return { ...dep, status: 'approved', approvedAt: new Date() };
            }
            return dep;
        });
        // Switch filter to 'approved' so user sees the item move
        currentStatus = 'approved';
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) statusFilter.value = 'approved';
        renderApprovals();
        fetchStatsAndDeposits();
        alert('Deposit approved!');
    });
}

function rejectDeposit(depositId) {
    fetch('/api/reject-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId })
    })
    .then(res => res.json())
    .then(() => {
        // Update local allDeposits array
        allDeposits = allDeposits.map(dep => {
            if (dep._id === depositId && dep.status === 'pending') {
                return { ...dep, status: 'rejected', rejectedAt: new Date() };
            }
            return dep;
        });
        renderApprovals();
        fetchStatsAndDeposits();
        alert('Deposit rejected!');
    });
}

function refreshApprovals() {
    fetchStatsAndDeposits();
}
