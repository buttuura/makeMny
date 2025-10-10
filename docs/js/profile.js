// Profile Page JavaScript Functions

class ProfileController {
    constructor() {
        this.userData = this.loadUserData();
        this.financialData = this.loadFinancialData();
        
        this.init();
    }
    
    init() {
        this.displayUserInfo();
        this.displayFinancialData();
        this.bindEvents();
        this.checkForRecentDeposit();
    }
    
    checkForRecentDeposit() {
        // Check if user just completed a deposit
        const urlParams = new URLSearchParams(window.location.search);
        const fromDeposit = urlParams.get('from') === 'deposit';
        
        if (fromDeposit) {
            // Show upgrade notification with financial details
            const levelInfo = this.getLevelInfo(this.userData.level);
            const lastDepositAmount = this.financialData.lastDepositAmount || 0;
            const levelBonus = this.financialData.levelBonus || 0;
            
            let message = `🎉 Profile Updated Successfully!\n\n`;
            message += `✅ Level: ${levelInfo.name}\n`;
            message += `💰 Deposit: ${this.formatCurrency(lastDepositAmount)}\n`;
            if (levelBonus > 0) {
                message += `🎁 Level Bonus: ${this.formatCurrency(levelBonus)}\n`;
            }
            message += `💳 New Balance: ${this.formatCurrency(this.financialData.accountBalance)}\n`;
            message += `📈 Total Deposited: ${this.formatCurrency(this.financialData.totalDeposited)}`;
            
            this.showNotification(message, 'success');
            
            // Remove the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    
    loadUserData() {
        // Get user data from localStorage or use defaults
        const storedUserData = localStorage.getItem('userData');
        const storedLevel = localStorage.getItem('userLevel');
        
        const defaultData = {
            name: 'John Doe',
            phone: '+256 123 456 789',
            email: 'john.doe@example.com',
            level: storedLevel || 'intern',
            memberSince: 'October 7, 2025',
            status: 'active'
        };
        
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            // Ensure level is updated from latest deposit
            if (storedLevel && userData.level !== storedLevel) {
                userData.level = storedLevel;
                // Save the updated data back
                localStorage.setItem('userData', JSON.stringify(userData));
            }
            return userData;
        }
        
        return defaultData;
    }
    
    loadFinancialData() {
        // Get financial data from localStorage or use defaults
        const storedFinancialData = localStorage.getItem('financialData');
        const userLevel = localStorage.getItem('userLevel') || 'intern';
        
        // Set default earnings based on user level
        const levelDefaults = {
            'intern': { todayEarnings: 2500, taskEarnings: 18500 },
            'worker': { todayEarnings: 2500, taskEarnings: 25000 },
            'senior': { todayEarnings: 8000, taskEarnings: 45000 },
            'expert': { todayEarnings: 21000, taskEarnings: 85000 }
        };
        
        const levelData = levelDefaults[userLevel] || levelDefaults['intern'];
        
        const defaultData = {
            accountBalance: 0, // Start with 0, will be updated after deposits
            totalDeposited: 0,
            todayEarnings: levelData.todayEarnings,
            taskEarnings: levelData.taskEarnings,
            withdrawableAmount: Math.floor(levelData.taskEarnings * 0.6), // 60% of task earnings available for withdrawal
            referralEarnings: 3500,
            userLevel: userLevel
        };
        
        if (storedFinancialData) {
            const financialData = JSON.parse(storedFinancialData);
            // Update earnings based on current level if needed
            if (financialData.userLevel !== userLevel) {
                financialData.todayEarnings = levelData.todayEarnings;
                financialData.userLevel = userLevel;
                // Save updated data
                localStorage.setItem('financialData', JSON.stringify(financialData));
            }
            return financialData;
        }
        
        return defaultData;
    }
    
    displayUserInfo() {
        // Update user initial
        const userInitial = document.getElementById('userInitial');
        if (userInitial) {
            userInitial.textContent = this.userData.name.charAt(0).toUpperCase();
        }
        
        // Update user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = this.userData.name;
        }
        
        // Update phone number
        const userPhone = document.getElementById('userPhone');
        if (userPhone) {
            userPhone.textContent = this.userData.phone;
        }
        
        // Update email
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = this.userData.email;
        }
        
        // Update user level
        const userLevel = document.getElementById('userLevel');
        if (userLevel) {
            const levelInfo = this.getLevelInfo(this.userData.level);
            userLevel.innerHTML = `
                <span class="level-icon">${levelInfo.icon}</span>
                <span class="level-text">${levelInfo.name}</span>
            `;
        }
        
        // Update member since
        const memberSince = document.getElementById('memberSince');
        if (memberSince) {
            memberSince.textContent = this.userData.memberSince;
        }
        
        // Update account status
        const accountStatus = document.getElementById('accountStatus');
        if (accountStatus) {
            accountStatus.innerHTML = `
                <span class="status-dot"></span>
                ${this.userData.status.charAt(0).toUpperCase() + this.userData.status.slice(1)}
            `;
        }
    }
    
    displayFinancialData() {
        // Update account balance
        const accountBalance = document.getElementById('accountBalance');
        if (accountBalance) {
            accountBalance.textContent = this.formatCurrency(this.financialData.accountBalance);
        }
        
        // Update total deposited
        const totalDeposited = document.getElementById('totalDeposited');
        if (totalDeposited) {
            totalDeposited.textContent = this.formatCurrency(this.financialData.totalDeposited);
        }
        
        // Update today's earnings
        const todayEarnings = document.getElementById('todayEarnings');
        if (todayEarnings) {
            todayEarnings.textContent = this.formatCurrency(this.financialData.todayEarnings);
        }
        
        // Update task earnings
        const taskEarnings = document.getElementById('taskEarnings');
        if (taskEarnings) {
            taskEarnings.textContent = this.formatCurrency(this.financialData.taskEarnings);
        }
        
        // Update withdrawable amount
        const withdrawableAmount = document.getElementById('withdrawableAmount');
        if (withdrawableAmount) {
            withdrawableAmount.textContent = this.formatCurrency(this.financialData.withdrawableAmount);
        }
        
        // Update referral earnings
        const referralEarnings = document.getElementById('referralEarnings');
        if (referralEarnings) {
            referralEarnings.textContent = this.formatCurrency(this.financialData.referralEarnings);
        }
    }
    
    getLevelInfo(level) {
        const levels = {
            'intern': { icon: '🎓', name: 'Intern Level' },
            'worker': { icon: '💼', name: 'Level 1 Worker' },
            'senior': { icon: '⭐', name: 'Senior Worker' },
            'expert': { icon: '👑', name: 'Expert Worker' }
        };
        
        return levels[level] || levels['intern'];
    }
    
    bindEvents() {
        // Add event listeners for interactive elements
        this.bindEditButtons();
        this.bindActionButtons();
    }
    
    bindEditButtons() {
        // Avatar edit button
        const editAvatarBtn = document.querySelector('.edit-avatar-btn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => this.editAvatar());
        }
        
        // Upgrade button
        const upgradeBtn = document.querySelector('.upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                window.location.href = 'deposit.html';
            });
        }
    }
    
    bindActionButtons() {
        // Support button
        const supportBtn = document.querySelector('.support-btn');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => this.contactSupport());
        }
    }
    
    editAvatar() {
        this.showNotification('Avatar editing feature coming soon!', 'info');
    }
    
    contactSupport() {
        const supportMessage = `
            📞 Contact Support:
            
            📧 Email: support@getcash.com
            📱 Phone: +256 123 456 789
            💬 WhatsApp: +256 987 654 321
            
            🕒 Support Hours:
            Monday - Friday: 8:00 AM - 6:00 PM
            Saturday: 9:00 AM - 4:00 PM
            Sunday: Closed
        `;
        
        this.showNotification(supportMessage, 'info');
    }
    
    formatCurrency(amount) {
        return `UGX ${amount.toLocaleString()}`;
    }
    
    saveUserData() {
        localStorage.setItem('userData', JSON.stringify(this.userData));
    }
    
    saveFinancialData() {
        localStorage.setItem('financialData', JSON.stringify(this.financialData));
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.whiteSpace = 'pre-line';
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
            maxWidth: '350px',
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

// Global functions for onclick handlers
function editField(fieldType) {
    const profileController = window.profileController;
    
    const fieldPrompts = {
        'name': 'Enter your full name:',
        'phone': 'Enter your phone number:',
        'email': 'Enter your email address:'
    };
    
    const currentValue = profileController.userData[fieldType];
    const newValue = prompt(fieldPrompts[fieldType], currentValue);
    
    if (newValue && newValue.trim() !== '' && newValue !== currentValue) {
        profileController.userData[fieldType] = newValue.trim();
        profileController.saveUserData();
        profileController.displayUserInfo();
        profileController.showNotification(`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} updated successfully!`, 'success');
    }
}

function initiateWithdrawal() {
    const profileController = window.profileController;
    const availableAmount = profileController.financialData.withdrawableAmount;
    
    if (availableAmount <= 0) {
        profileController.showNotification('No funds available for withdrawal', 'error');
        return;
    }
    
    const withdrawAmount = prompt(`Enter amount to withdraw (Available: ${profileController.formatCurrency(availableAmount)}):`);
    
    if (withdrawAmount) {
        const amount = parseInt(withdrawAmount.replace(/[^0-9]/g, ''));
        
        if (isNaN(amount) || amount <= 0) {
            profileController.showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        if (amount > availableAmount) {
            profileController.showNotification('Amount exceeds available balance', 'error');
            return;
        }
        
        // Show withdrawal options
        const withdrawalOptions = `
            💸 Withdrawal Options:
            
            1. Mobile Money (MTN/Airtel)
            2. Bank Transfer
            3. Bitcoin/Crypto
            
            Amount: ${profileController.formatCurrency(amount)}
            Processing fee: UGX 1,000
            
            Contact support to proceed with withdrawal.
        `;
        
        profileController.showNotification(withdrawalOptions, 'info');
    }
}

// Initialize profile controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileController = new ProfileController();
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