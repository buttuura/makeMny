// Filter approvals by status, level, date, and search
function filterApprovals() {
    const status = document.getElementById('statusFilter')?.value || 'all';
    const level = document.getElementById('levelFilter')?.value || 'all';
    const date = document.getElementById('dateFilter')?.value || 'all';
    const search = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
// Simple admin approval JS
const API_BASE = 'https://makemny-3.onrender.com'; // Change to your backend URL if needed

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
    let filtered = allDeposits.filter(dep => {
        // Status filter
        if (status !== 'all' && dep.status !== status) return false;
        // Level filter (assume dep.level exists, otherwise skip)
        if (level !== 'all' && dep.level !== level) return false;
        // Date filter
        if (date !== 'all') {
            const createdAt = new Date(dep.createdAt);
            const now = new Date();
            if (date === 'today') {
                if (createdAt.toDateString() !== now.toDateString()) return false;
            } else if (date === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                if (createdAt < weekAgo) return false;
            } else if (date === 'month') {
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                if (createdAt < monthAgo) return false;
            }
        }
        // Search filter (by accountName or accountNumber)
        if (search) {
            const accName = (dep.accountName || '').toLowerCase();
            const accNum = (dep.accountNumber || '').toLowerCase();
            if (!accName.includes(search) && !accNum.includes(search)) return false;
        }
        return true;
    });

    const list = document.getElementById('approvalsList');
    list.innerHTML = '';
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
    fetch('/api/deposit-stats')
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
    fetch('/api/deposits?status=all')
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
