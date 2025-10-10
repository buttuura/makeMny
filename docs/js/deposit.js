// Recharge Page JavaScript Functions

class RechargeController {
    constructor() {
        this.selectedLevel = null;
        this.selectedPayment = null;
        this.rechargeAmount = 0;
        this.userDetails = null;
        
        // GitHub configuration (same as admin panel)
        this.github = {
            owner: 'yourusername',          // Replace with your GitHub username
            repo: 'getcash-tasks',          // Replace with your repository name
            token: 'your_github_token',     // Replace with your GitHub personal access token
            branch: 'main'                  // Replace with your branch name
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Level selection events
        const levelCards = document.querySelectorAll('.level-card');
        levelCards.forEach(card => {
            card.addEventListener('click', () => this.selectLevel(card));
        });
        
        // Payment method selection events
        const paymentCards = document.querySelectorAll('.payment-card');
        paymentCards.forEach(card => {
            card.addEventListener('click', () => this.selectPayment(card));
        });
        
        // Proceed button event
        const proceedBtn = document.getElementById('proceedBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => this.proceedToPayment());
        }
    }
    
    selectLevel(card) {
        // Store potential selection data
        const levelData = {
            level: card.dataset.level,
            amount: parseInt(card.dataset.amount),
            name: card.querySelector('h3').textContent
        };
        
        // Show confirmation popup
        this.showConfirmationPopup(levelData, card);
    }
    
    showConfirmationPopup(levelData, card) {
        // Create popup HTML
        const popupHTML = `
            <div class="popup-overlay" id="confirmationPopup">
                <div class="popup-content">
                    <div class="popup-header">
                        <h3>🔐 Confirm Your Selection</h3>
                        <button class="close-popup" onclick="this.closeConfirmationPopup()">×</button>
                    </div>
                    <div class="popup-body">
                        <div class="selection-info">
                            <p><strong>Selected Level:</strong> ${levelData.name}</p>
                            <p><strong>Investment Amount:</strong> ${this.formatCurrency(levelData.amount)}</p>
                        </div>
                        <form class="confirmation-form" id="confirmationForm">
                            <div class="form-group">
                                <label for="accountName">Full Name *</label>
                                <input type="text" id="accountName" name="accountName" placeholder="Enter your full name" required>
                            </div>
                            <div class="form-group">
                                <label for="phoneNumber">Phone Number *</label>
                                <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="+256 XXX XXX XXX" required>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="confirmTerms" required>
                                    <span class="checkmark"></span>
                                    I confirm the details above are correct and agree to proceed
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="popup-footer">
                        <button class="btn-cancel" onclick="this.closeConfirmationPopup()">Cancel</button>
                        <button class="btn-confirm" onclick="this.confirmLevelSelection()">Confirm & Continue</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add popup to body
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Store current selection context
        this.pendingLevel = levelData;
        this.pendingCard = card;
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('accountName').focus();
        }, 100);
        
        // Add event listeners
        this.bindPopupEvents();
    }
    
    bindPopupEvents() {
        const popup = document.getElementById('confirmationPopup');
        const form = document.getElementById('confirmationForm');
        const closeBtn = popup.querySelector('.close-popup');
        const cancelBtn = popup.querySelector('.btn-cancel');
        const confirmBtn = popup.querySelector('.btn-confirm');
        
        // Close popup events
        closeBtn.addEventListener('click', () => this.closeConfirmationPopup());
        cancelBtn.addEventListener('click', () => this.closeConfirmationPopup());
        
        // Confirm button event
        confirmBtn.addEventListener('click', () => this.confirmLevelSelection());
        
        // Form submission event
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmLevelSelection();
        });
        
        // Close on overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closeConfirmationPopup();
            }
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
    
    confirmLevelSelection() {
        const form = document.getElementById('confirmationForm');
        const accountName = document.getElementById('accountName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const termsChecked = document.getElementById('confirmTerms').checked;
        
        // Validation
        if (!accountName) {
            this.showNotification('Please enter your full name', 'error');
            document.getElementById('accountName').focus();
            return;
        }
        
        if (!phoneNumber || phoneNumber.length < 10) {
            this.showNotification('Please enter a valid phone number', 'error');
            document.getElementById('phoneNumber').focus();
            return;
        }
        
        if (!termsChecked) {
            this.showNotification('Please confirm your details are correct', 'error');
            return;
        }
        
        // Store user details
        this.userDetails = {
            name: accountName,
            phone: phoneNumber
        };
        
        // Proceed with level selection
        this.proceedWithLevelSelection();
        
        // Close popup
        this.closeConfirmationPopup();
    }
    
    proceedWithLevelSelection() {
        // Remove previous selection
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        this.pendingCard.classList.add('selected');
        
        // Store selection data
        this.selectedLevel = this.pendingLevel;
        this.rechargeAmount = this.selectedLevel.amount;
        
        // Show payment section
        this.showPaymentSection();
        this.updateDisplay();
        
        // Show success message
        this.showNotification(`Level confirmed for ${this.userDetails.name}`, 'success');
        
        // Smooth scroll to payment section
        setTimeout(() => {
            document.getElementById('paymentSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
    
    closeConfirmationPopup() {
        const popup = document.getElementById('confirmationPopup');
        if (popup) {
            popup.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
        
        // Clear pending selection
        this.pendingLevel = null;
        this.pendingCard = null;
    }
    
    selectPayment(card) {
        // Check if the payment method is disabled
        if (card.classList.contains('disabled')) {
            this.showNotification('This payment method is coming soon!', 'info');
            return;
        }
        
        // Remove previous selection
        document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Store selection data
        this.selectedPayment = {
            method: card.dataset.method,
            name: card.querySelector('h3').textContent
        };
        
        // Show summary section
        this.showSummarySection();
        this.updateDisplay();
        
        // Smooth scroll to summary section
        setTimeout(() => {
            document.getElementById('summarySection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
    
    showPaymentSection() {
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) {
            paymentSection.style.display = 'block';
        }
    }
    
    showSummarySection() {
        const summarySection = document.getElementById('summarySection');
        if (summarySection) {
            summarySection.style.display = 'block';
        }
    }
    
    updateDisplay() {
        // Update summary display
        const selectedLevelEl = document.getElementById('selectedLevel');
        const rechargeAmountEl = document.getElementById('rechargeAmount');
        const paymentMethodEl = document.getElementById('paymentMethod');
        const totalAmountEl = document.getElementById('totalAmount');
        
        if (selectedLevelEl && this.selectedLevel) {
            selectedLevelEl.textContent = this.selectedLevel.name;
        }
        
        if (rechargeAmountEl) {
            rechargeAmountEl.textContent = this.formatCurrency(this.rechargeAmount);
        }
        
        if (paymentMethodEl && this.selectedPayment) {
            paymentMethodEl.textContent = this.selectedPayment.name;
        }
        
        if (totalAmountEl) {
            totalAmountEl.textContent = this.formatCurrency(this.rechargeAmount);
        }
    }
    
    formatCurrency(amount) {
        return `UGX ${amount.toLocaleString()}`;
    }
    
    async proceedToPayment() {
        if (!this.selectedLevel || !this.selectedPayment) {
            this.showNotification('Please select both a level and payment method', 'error');
            return;
        }
        
        if (!this.userDetails) {
            this.showNotification('User details missing. Please select a level first.', 'error');
            return;
        }
        
        try {
            // Create deposit request
            const depositRequest = {
                id: `DEP${Date.now()}`,
                userId: `USER${Date.now().toString().slice(-6)}`,
                userName: this.userDetails.name,
                phone: this.userDetails.phone,
                email: `${this.userDetails.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
                level: this.selectedLevel.level,
                levelDisplayName: this.selectedLevel.name,
                amount: this.rechargeAmount,
                paymentMethod: this.selectedPayment.name,
                transactionId: this.generateTransactionId(),
                status: 'pending',
                submittedAt: new Date().toISOString(),
                approvedAt: null,
                rejectedAt: null,
                adminNotes: '',
                screenshot: null
            };
            
            // Show processing message
            this.showNotification('Submitting deposit request for admin approval...', 'info');
            
            // Save deposit request (simulated - in real app would use GitHub or API)
            await this.submitDepositRequest(depositRequest);
            
            // Show success message
            this.showDepositSubmissionSuccess(depositRequest);
            
        } catch (error) {
            console.error('Error submitting deposit request:', error);
            this.showNotification('Failed to submit deposit request. Please try again.', 'error');
        }
    }
    
    generateTransactionId() {
        const prefix = this.selectedPayment.method === 'mobile' ? 'MM' : 
                      this.selectedPayment.method === 'bank' ? 'BT' : 'TXN';
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    
    async submitDepositRequest(depositRequest) {
        try {
            // Try to save to GitHub first
            try {
                // Get existing requests from GitHub
                const existingRequests = await this.loadFromGitHub('deposit_requests.json');
                
                // Add new request
                existingRequests.push(depositRequest);
                
                // Save to GitHub
                await this.saveToGitHub('deposit_requests.json', existingRequests);
                
                this.showNotification('Request submitted to admin panel successfully!', 'success');
                
            } catch (githubError) {
                console.warn('GitHub save failed, using local storage:', githubError);
                
                // Fallback to localStorage if GitHub fails
                const localRequests = JSON.parse(localStorage.getItem('depositRequests') || '[]');
                localRequests.push(depositRequest);
                localStorage.setItem('depositRequests', JSON.stringify(localRequests));
                
                this.showNotification('Request saved locally. GitHub sync will retry later.', 'warning');
            }
            
            // Always save locally as backup
            localStorage.setItem('lastDepositRequest', JSON.stringify(depositRequest));
            
            return depositRequest;
            
        } catch (error) {
            console.error('Error saving deposit request:', error);
            throw error;
        }
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
            return [];
        }
    }
    
    async saveToGitHub(fileName, data) {
        const content = JSON.stringify(data, null, 2);
        
        try {
            const currentFile = await this.getGitHubFile(fileName);
            
            const response = await fetch(`https://api.github.com/repos/${this.github.owner}/${this.github.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.github.token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'GetCash-App'
                },
                body: JSON.stringify({
                    message: `Update ${fileName} - ${new Date().toISOString()}`,
                    content: btoa(content),
                    branch: this.github.branch,
                    sha: currentFile ? currentFile.sha : undefined
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            throw error;
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
    
    showDepositSubmissionSuccess(depositRequest) {
        // Clear form selections
        this.selectedLevel = null;
        this.selectedPayment = null;
        this.rechargeAmount = 0;
        this.userDetails = null;
        
        // Reset UI
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
        this.hidePaymentSection();
        this.updateDisplay();
        
        // Show success popup
        const successPopup = `
            <div class="popup-overlay" id="successPopup">
                <div class="popup-content success-popup">
                    <div class="popup-header success-header">
                        <div class="success-icon">✅</div>
                        <h3>Deposit Request Submitted!</h3>
                    </div>
                    <div class="popup-body">
                        <div class="request-summary">
                            <h4>Request Details:</h4>
                            <p><strong>Request ID:</strong> ${depositRequest.id}</p>
                            <p><strong>Name:</strong> ${depositRequest.userName}</p>
                            <p><strong>Level:</strong> ${depositRequest.levelDisplayName}</p>
                            <p><strong>Amount:</strong> UGX ${depositRequest.amount.toLocaleString()}</p>
                            <p><strong>Payment Method:</strong> ${depositRequest.paymentMethod}</p>
                            <p><strong>Transaction ID:</strong> ${depositRequest.transactionId}</p>
                        </div>
                        
                        <div class="approval-info">
                            <h4>⏳ Awaiting Admin Approval</h4>
                            <p>Your deposit request has been submitted successfully and is now pending admin approval.</p>
                            <p><strong>What happens next:</strong></p>
                            <ul>
                                <li>Admin will review your payment details</li>
                                <li>You'll receive approval notification within 24 hours</li>
                                <li>Once approved, your task access will be activated</li>
                                <li>You can then start earning from tasks</li>
                            </ul>
                        </div>
                        
                        <div class="contact-info">
                            <p><strong>Need help?</strong> Contact admin for faster processing.</p>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <button class="btn-primary" onclick="this.closeSuccessPopup()">Continue</button>
                        <button class="btn-secondary" onclick="this.checkStatus()">Check Status</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successPopup);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            this.closeSuccessPopup();
        }, 10000);
    }
    
    checkStatus() {
        this.closeSuccessPopup();
        this.showNotification('Status check feature coming soon! Check with admin for updates.', 'info');
    }
    
    closeSuccessPopup() {
        const popup = document.getElementById('successPopup');
        if (popup) {
            popup.remove();
        }
    }
    
    hidePaymentSection() {
        const paymentSection = document.querySelector('.payment-section');
        if (paymentSection) {
            paymentSection.style.display = 'none';
        }
        
        const proceedSection = document.querySelector('.proceed-section');
        if (proceedSection) {
            proceedSection.style.display = 'none';
        }
    }
    
    updateUserProfile(paymentData) {
        // Update user level
        localStorage.setItem('userLevel', paymentData.level.level);
        
        // Get existing user data or create default
        let userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Update user data with new level and payment info
        userData = {
            ...userData,
            level: paymentData.level.level,
            levelName: paymentData.level.name,
            lastUpgrade: new Date().toISOString()
        };
        
        // Save updated user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Get existing financial data or create default
        let financialData = JSON.parse(localStorage.getItem('financialData') || '{}');
        
        // Update financial data with deposit information
        const currentDeposited = financialData.totalDeposited || 0;
        const currentBalance = financialData.accountBalance || 0;
        const levelBonus = this.calculateLevelBonus(paymentData.level.level);
        
        financialData = {
            ...financialData,
            totalDeposited: currentDeposited + paymentData.amount,
            accountBalance: currentBalance + paymentData.amount + levelBonus,
            lastDepositAmount: paymentData.amount,
            lastDepositDate: new Date().toISOString(),
            userLevel: paymentData.level.level,
            levelBonus: levelBonus
        };
        
        // Save updated financial data
        localStorage.setItem('financialData', JSON.stringify(financialData));
        
        console.log('Profile updated:', { userData, financialData });
    }
    
    calculateLevelBonus(level) {
        // Calculate bonus credits based on level upgrade
        const bonuses = {
            'worker': 5000,   // Level 1 Worker gets 5k bonus
            'senior': 10000,  // Senior Worker gets 10k bonus
            'expert': 20000   // Expert Worker gets 20k bonus
        };
        
        return bonuses[level] || 0;
    }
    
    redirectToTasksPage(level) {
        const taskPages = {
            'intern': 'tasks-intern.html',
            'worker': 'tasks-level1.html',
            'senior': 'tasks-level2.html',
            'expert': 'tasks-level3.html'
        };
        
        const page = taskPages[level] || 'tasks-intern.html';
        window.location.href = page;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
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
        
        // Set background color based on type
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'info': '#007bff',
            'warning': '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize deposit controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RechargeController();
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