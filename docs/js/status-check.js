// Status Check Controller

class StatusCheckController {
    constructor() {
        this.github = {
            owner: 'yourusername',          // Replace with your GitHub username
            repo: 'getcash-tasks',          // Replace with your repository name
            token: 'your_github_token',     // Replace with your GitHub personal access token
            branch: 'main'                  // Replace with your branch name
        };
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            this.setupPage();
        }
    }
    
    setupPage() {
        this.setupEventListeners();
        this.prefillLastRequest();
    }
    
    setupEventListeners() {
        const form = document.getElementById('statusForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkStatus();
        });
        
        // Phone number formatting
        const phoneInput = document.getElementById('phoneNumber');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('256')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                value = '+256' + value.substring(1);
            } else if (!value.startsWith('+256')) {
                value = '+256' + value;
            }
            e.target.value = value;
        });
    }
    
    prefillLastRequest() {
        // Auto-fill with last deposit request if available
        const lastRequest = JSON.parse(localStorage.getItem('lastDepositRequest') || 'null');
        if (lastRequest) {
            document.getElementById('phoneNumber').value = lastRequest.phone;
            if (lastRequest.id) {
                document.getElementById('depositId').value = lastRequest.id;
            }
        }
    }
    
    async checkStatus() {
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const depositId = document.getElementById('depositId').value.trim();
        
        if (!phoneNumber) {
            this.showNotification('Please enter your phone number', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Search for deposit requests
            const deposits = await this.loadFromGitHub('deposit_requests.json');
            
            // Find matching deposits
            let matchingDeposits = deposits.filter(deposit => 
                deposit.phone === phoneNumber
            );
            
            // If deposit ID is provided, filter by it too
            if (depositId) {
                matchingDeposits = matchingDeposits.filter(deposit => 
                    deposit.id === depositId
                );
            }
            
            // Sort by submission date (newest first)
            matchingDeposits.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            
            if (matchingDeposits.length === 0) {
                this.showNotFoundResult(phoneNumber, depositId);
            } else {
                this.showStatusResult(matchingDeposits[0]); // Show most recent
            }
            
        } catch (error) {
            console.error('Error checking status:', error);
            this.showErrorResult('Failed to check status. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }
    
    showStatusResult(deposit) {
        const resultContainer = document.getElementById('statusResult');
        const statusClass = deposit.status;
        
        let statusIcon, statusTitle, statusMessage, actionButtons;
        
        switch (deposit.status) {
            case 'pending':
                statusIcon = '⏳';
                statusTitle = 'Approval Pending';
                statusMessage = 'Your deposit is under review by our admin team.';
                actionButtons = `
                    <button class="action-btn btn-primary" onclick="location.reload()">
                        🔄 Refresh Status
                    </button>
                    <a href="deposit.html" class="action-btn btn-secondary">
                        💰 Make Another Deposit
                    </a>
                `;
                break;
                
            case 'approved':
                statusIcon = '✅';
                statusTitle = 'Approved - Access Granted!';
                statusMessage = 'Congratulations! Your deposit has been approved and task access is now active.';
                actionButtons = `
                    <a href="${this.getTaskPageUrl(deposit.level)}" class="action-btn btn-success">
                        🎯 Start Tasks
                    </a>
                    <a href="profile.html" class="action-btn btn-primary">
                        👤 View Profile
                    </a>
                `;
                break;
                
            case 'rejected':
                statusIcon = '❌';
                statusTitle = 'Deposit Rejected';
                statusMessage = 'Unfortunately, your deposit was not approved.';
                actionButtons = `
                    <a href="deposit.html" class="action-btn btn-primary">
                        💰 Try New Deposit
                    </a>
                    <button class="action-btn btn-secondary" onclick="this.contactSupport()">
                        📞 Contact Support
                    </button>
                `;
                break;
                
            default:
                statusIcon = '❓';
                statusTitle = 'Unknown Status';
                statusMessage = 'Unable to determine deposit status.';
                actionButtons = '';
        }
        
        resultContainer.className = `status-result ${statusClass}`;
        resultContainer.innerHTML = `
            <div class="status-icon">${statusIcon}</div>
            <h3>${statusTitle}</h3>
            <p>${statusMessage}</p>
            
            <div class="status-details">
                <div class="detail-row">
                    <span class="detail-label">Deposit ID:</span>
                    <span class="detail-value">${deposit.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${deposit.userName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${deposit.levelDisplayName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">UGX ${deposit.amount.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${deposit.paymentMethod}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted:</span>
                    <span class="detail-value">${this.formatDate(deposit.submittedAt)}</span>
                </div>
                ${deposit.status !== 'pending' ? `
                    <div class="detail-row">
                        <span class="detail-label">${deposit.status === 'approved' ? 'Approved' : 'Rejected'}:</span>
                        <span class="detail-value">${this.formatDate(deposit.status === 'approved' ? deposit.approvedAt : deposit.rejectedAt)}</span>
                    </div>
                ` : ''}
                ${deposit.adminNotes ? `
                    <div class="detail-row">
                        <span class="detail-label">Admin Notes:</span>
                        <span class="detail-value">${deposit.adminNotes}</span>
                    </div>
                ` : ''}
            </div>
            
            ${actionButtons ? `<div class="status-actions">${actionButtons}</div>` : ''}
        `;
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showNotFoundResult(phone, depositId) {
        const resultContainer = document.getElementById('statusResult');
        
        resultContainer.className = 'status-result not-found';
        resultContainer.innerHTML = `
            <div class="status-icon">🔍</div>
            <h3>No Deposits Found</h3>
            <p>We couldn't find any deposit requests matching your details.</p>
            
            <div class="status-details">
                <div class="detail-row">
                    <span class="detail-label">Phone Searched:</span>
                    <span class="detail-value">${phone}</span>
                </div>
                ${depositId ? `
                    <div class="detail-row">
                        <span class="detail-label">Deposit ID Searched:</span>
                        <span class="detail-value">${depositId}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="status-actions">
                <a href="deposit.html" class="action-btn btn-primary">
                    💰 Make First Deposit
                </a>
                <button class="action-btn btn-secondary" onclick="this.clearForm()">
                    🔄 Try Different Details
                </button>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showErrorResult(message) {
        const resultContainer = document.getElementById('statusResult');
        
        resultContainer.className = 'status-result not-found';
        resultContainer.innerHTML = `
            <div class="status-icon">⚠️</div>
            <h3>Error</h3>
            <p>${message}</p>
            
            <div class="status-actions">
                <button class="action-btn btn-primary" onclick="this.checkStatus()">
                    🔄 Try Again
                </button>
                <button class="action-btn btn-secondary" onclick="this.clearForm()">
                    📝 Clear Form
                </button>
            </div>
        `;
        
        resultContainer.style.display = 'block';
    }
    
    showLoading(show) {
        const resultContainer = document.getElementById('statusResult');
        
        if (show) {
            resultContainer.className = 'status-result';
            resultContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Checking your status...</p>
                </div>
            `;
            resultContainer.style.display = 'block';
        }
    }
    
    clearForm() {
        document.getElementById('phoneNumber').value = '';
        document.getElementById('depositId').value = '';
        document.getElementById('statusResult').style.display = 'none';
        document.getElementById('phoneNumber').focus();
    }
    
    getTaskPageUrl(level) {
        const taskPages = {
            'intern': 'tasks-intern.html',
            'worker': 'tasks-level1.html',
            'senior': 'tasks-level2.html',
            'expert': 'tasks-level3.html'
        };
        return taskPages[level] || 'tasks-intern.html';
    }
    
    contactSupport() {
        this.showNotification('Contact admin via WhatsApp or Telegram for support.', 'info');
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.3s ease'
        });
        
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'info': '#007bff',
            'warning': '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // GitHub helper methods
    async loadFromGitHub(fileName) {
        try {
            const file = await this.getGitHubFile(fileName);
            if (file && file.content) {
                const content = atob(file.content);
                return JSON.parse(content);
            }
            return [];
        } catch (error) {
            console.error('Error loading from GitHub:', error);
            
            // Fallback to localStorage
            if (fileName === 'deposit_requests.json') {
                return JSON.parse(localStorage.getItem('depositRequests') || '[]');
            }
            return [];
        }
    }
    
    async getGitHubFile(fileName) {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.github.owner}/${this.github.repo}/contents/${fileName}?ref=${this.github.branch}`, {
                headers: {
                    'Authorization': `token ${this.github.token}`,
                    'User-Agent': 'GetCash-App'
                }
            });
            
            if (response.status === 404) {
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting GitHub file:', error);
            return null;
        }
    }
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatusCheckController();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);