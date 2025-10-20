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
