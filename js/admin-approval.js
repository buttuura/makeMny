// Simple admin approval JS
const API_BASE = 'https://makemny-6.onrender.com';

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
            <button onclick="approveDeposit('${dep._id}')">Approve</button>
            <button onclick="rejectDeposit('${dep._id}')">Reject</button>
        `;
        container.appendChild(div);
    });
}

function approveDeposit(depositId) {
    fetch(`${API_BASE}/api/approve-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId })
    })
    .then(res => res.json())
    .then(data => {
        showMessage('Deposit approved!', 'green');
        fetchApprovals();
    })
    .catch(() => showMessage('Failed to approve deposit'));
}

function rejectDeposit(depositId) {
    fetch(`${API_BASE}/api/reject-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId })
    })
    .then(res => res.json())
    .then(data => {
        showMessage('Deposit rejected!', 'green');
        fetchApprovals();
    })
    .catch(() => showMessage('Failed to reject deposit'));
}

document.addEventListener('DOMContentLoaded', fetchApprovals);
