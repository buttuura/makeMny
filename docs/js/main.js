// Main Page JavaScript Functions

/**
 * Handle main button clicks (Jobs, Tasks, Recharge)
 * @param {string} buttonType - Type of button clicked
 */
function handleMainButtonClick(buttonType) {
    // Add button click animation
    const button = document.querySelector('.' + buttonType.toLowerCase() + '-btn');
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    // Handle navigation based on button type
    switch(buttonType.toLowerCase()) {
        case 'jobs':
            window.location.href = 'jobs.html';
            break;
        case 'tasks':
            window.location.href = 'tasks-intern.html';
            break;
        case 'recharge':
            window.location.href = 'deposit.html';
            break;
        default:
            showNotification(buttonType + ' feature coming soon!', 'info');
    }
    
    console.log('Navigating to ' + buttonType + ' section...');
}

/**
 * Handle footer navigation clicks
 * @param {string} navType - Type of navigation clicked
 */
function handleFooterNavigation(navType) {
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    const clickedButton = document.querySelector('.' + navType.toLowerCase() + '-btn');
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Handle navigation based on type
    switch(navType.toLowerCase()) {
        case 'home':
            showNotification('You are already on the home page', 'info');
            break;
        case 'withdraw':
            showNotification('Withdraw feature coming soon!', 'info');
            break;
        case 'deposit':
            window.location.href = 'deposit.html';
            break;
        case 'profile':
            window.location.href = 'profile.html';
            break;
        default:
            console.log('Unknown navigation: ' + navType);
    }
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type) {
    type = type || 'info';
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    notification.style.maxWidth = '300px';
    notification.style.wordWrap = 'break-word';
    
    // Set colors based on type
    const colors = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };
    
    const colorScheme = colors[type] || colors.info;
    notification.style.background = colorScheme.bg;
    notification.style.color = colorScheme.color;
    notification.style.border = '1px solid ' + colorScheme.border;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = function() {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    };
    
    notification.appendChild(closeBtn);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

/**
 * Initialize main page functionality
 */
function initializeMainPage() {
    // Add click handlers to main buttons
    const jobsBtn = document.querySelector('.jobs-btn');
    const tasksBtn = document.querySelector('.tasks-btn');
    const rechargeBtn = document.querySelector('.recharge-btn');
    
    if (jobsBtn) {
        jobsBtn.addEventListener('click', () => handleMainButtonClick('Jobs'));
    }
    
    if (tasksBtn) {
        tasksBtn.addEventListener('click', () => handleMainButtonClick('Tasks'));
    }
    
    if (rechargeBtn) {
        rechargeBtn.addEventListener('click', () => handleMainButtonClick('Recharge'));
    }
    
    // Add click handlers to footer navigation
    const homeBtn = document.querySelector('.home-btn');
    const withdrawBtn = document.querySelector('.withdraw-btn');
    const depositBtn = document.querySelector('.deposit-btn');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (homeBtn) {
        homeBtn.addEventListener('click', () => handleFooterNavigation('Home'));
        homeBtn.classList.add('active'); // Set home as active by default
    }
    
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => handleFooterNavigation('Withdraw'));
    }
    
    if (depositBtn) {
        depositBtn.addEventListener('click', () => handleFooterNavigation('Deposit'));
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => handleFooterNavigation('Profile'));
    }
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to GetCash! 💰', 'success');
    }, 1500);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMainPage);
} else {
    initializeMainPage();
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = 
    '@keyframes slideInRight {' +
        'from {' +
            'opacity: 0;' +
            'transform: translateX(100%);' +
        '}' +
        'to {' +
            'opacity: 1;' +
            'transform: translateX(0);' +
        '}' +
    '}' +
    '@keyframes slideOutRight {' +
        'from {' +
            'opacity: 1;' +
            'transform: translateX(0);' +
        '}' +
        'to {' +
            'opacity: 0;' +
            'transform: translateX(100%);' +
        '}' +
    '}' +
    '.notification {' +
        'user-select: none;' +
        'position: relative;' +
        'padding-right: 35px !important;' +
    '}' +
    '.main-btn {' +
        'transition: transform 0.15s ease-out;' +
    '}' +
    '.logout-link {' +
        'background: #dc3545 !important;' +
        'color: white !important;' +
        'border: none;' +
        'cursor: pointer;' +
    '}' +
    '.logout-link:hover {' +
        'background: #c82333 !important;' +
    '}';
document.head.appendChild(style);

/**
 * Handle user logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('getcash_logged_in');
        sessionStorage.removeItem('getcash_user_email');
        sessionStorage.removeItem('getcash_selected_job_level');
        
        // Show logout message
        showNotification('Logged out successfully', 'success');
        
        // Redirect to login page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}