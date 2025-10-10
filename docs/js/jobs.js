// GetCash Jobs Page JavaScript

/**
 * Jobs Page Controller
 */
class JobsController {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize the jobs page
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            this.setupPage();
        }
    }
    
    /**
     * Setup page elements and event listeners
     */
    setupPage() {
        this.setupJobButtons();
        this.setupNavigation();
        this.checkUserLevel();
        this.animateCards();
    }
    
    /**
     * Setup job button click handlers
     */
    setupJobButtons() {
        const jobButtons = document.querySelectorAll('.action-button');
        
        jobButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(button);
            });
        });
    }
    
    /**
     * Handle button click
     */
    handleButtonClick(button) {
        // Check if button has investment data (upgrade buttons)
        const investmentAmount = button.getAttribute('data-investment');
        const jobTitle = button.getAttribute('data-job');
        
        if (investmentAmount && jobTitle) {
            // Show alert for recharge
            this.showRechargeAlert(investmentAmount, jobTitle);
        } else if (button.classList.contains('current-level')) {
            // Current level button
            alert('You are already at this level! Start working on tasks to earn money.');
        } else {
            // Default message for other buttons
            alert('This feature is coming soon!');
        }
    }
    
    /**
     * Show recharge alert message
     */
    showRechargeAlert(investmentAmount, jobTitle) {
        const amount = parseInt(investmentAmount);
        const formattedAmount = amount.toLocaleString();
        
        const message = `💰 RECHARGE REQUIRED\n\n` +
                       `Job Level: ${jobTitle}\n` +
                       `Investment Needed: UGX ${formattedAmount}\n\n` +
                       `Please recharge UGX ${formattedAmount} in your wallet to unlock this job level.\n\n` +
                       `Go to your wallet to add funds and start earning more!`;
        
        alert(message);
    }
    
    /**
     * Handle job selection
     */
    async handleJobSelection(jobLevel, button) {
        // Add loading state
        this.setButtonLoading(button, true);
        
        try {
            // Check if user is logged in
            const isLoggedIn = this.checkLoginStatus();
            
            if (!isLoggedIn) {
                this.showMessage('Please login to access jobs', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            
            // Check user qualification for the level
            const isQualified = await this.checkUserQualification(jobLevel);
            
            if (!isQualified) {
                this.showQualificationMessage(jobLevel);
                return;
            }
            
            // Simulate loading
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Navigate to job tasks
            this.navigateToTasks(jobLevel);
            
        } catch (error) {
            this.showMessage('Error loading jobs. Please try again.', 'error');
        } finally {
            this.setButtonLoading(button, false);
        }
    }
    
    /**
     * Check if user is logged in
     */
    checkLoginStatus() {
        return sessionStorage.getItem('getcash_logged_in') === 'true';
    }
    
    /**
     * Check user qualification for job level
     */
    async checkUserQualification(jobLevel) {
        // Simulate API call to check user qualifications
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo purposes, allow all levels
        // In real implementation, check user's completed tasks, ratings, etc.
        const userLevel = localStorage.getItem('getcash_user_level') || 'intern';
        
        const levelHierarchy = {
            'intern': 0,
            'level1': 1,
            'level2': 2,
            'level3': 3
        };
        
        const currentUserLevel = levelHierarchy[userLevel] || 0;
        const requiredLevel = levelHierarchy[jobLevel] || 0;
        
        return currentUserLevel >= requiredLevel;
    }
    
    /**
     * Show qualification message
     */
    showQualificationMessage(jobLevel) {
        const messages = {
            'level1': 'Complete 10 intern tasks to unlock Level 1 jobs',
            'level2': 'Complete 25 Level 1 tasks with 4+ star rating to unlock Level 2 jobs',
            'level3': 'Complete 50 Level 2 tasks with 4.5+ star rating to unlock Level 3 jobs'
        };
        
        const message = messages[jobLevel] || 'You need to complete more tasks to access this level';
        this.showMessage(message, 'warning');
    }
    
    /**
     * Navigate to tasks page
     */
    navigateToTasks(jobLevel) {
        // Store selected job level
        sessionStorage.setItem('getcash_selected_job_level', jobLevel);
        
        this.showMessage(`Loading ${jobLevel} jobs...`, 'success');
        
        // Navigate to tasks page (create this page later)
        setTimeout(() => {
            // For now, just show a message
            this.showMessage(`${jobLevel} jobs page coming soon!`, 'info');
        }, 1000);
    }
    
    /**
     * Setup navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                
                // Handle navigation
                if (href && href !== '#') {
                    // Let default navigation happen
                    return;
                }
                
                // Prevent default for placeholder links
                e.preventDefault();
                
                // Show coming soon message
                const label = item.querySelector('.nav-label').textContent;
                this.showMessage(`${label} page coming soon!`, 'info');
            });
        });
    }
    
    /**
     * Check and display user level
     */
    checkUserLevel() {
        const userLevel = localStorage.getItem('getcash_user_level') || 'intern';
        
        // Highlight available job levels
        this.highlightAvailableLevels(userLevel);
    }
    
    /**
     * Highlight available job levels
     */
    highlightAvailableLevels(userLevel) {
        const levelHierarchy = {
            'intern': 0,
            'level1': 1,
            'level2': 2,
            'level3': 3
        };
        
        const currentLevel = levelHierarchy[userLevel] || 0;
        
        // Add visual indicators for locked levels
        const jobCards = document.querySelectorAll('.job-card');
        
        jobCards.forEach((card, index) => {
            if (index > currentLevel) {
                card.classList.add('locked');
                this.addLockIndicator(card);
            }
        });
    }
    
    /**
     * Add lock indicator to card
     */
    addLockIndicator(card) {
        const lockIndicator = document.createElement('div');
        lockIndicator.className = 'lock-indicator';
        lockIndicator.innerHTML = '🔒';
        
        // Style the lock indicator
        lockIndicator.style.position = 'absolute';
        lockIndicator.style.top = '10px';
        lockIndicator.style.right = '15px';
        lockIndicator.style.fontSize = '1.5rem';
        lockIndicator.style.opacity = '0.7';
        
        card.appendChild(lockIndicator);
        
        // Add locked styling
        card.style.opacity = '0.7';
        const button = card.querySelector('.job-btn');
        if (button) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        }
    }
    
    /**
     * Animate cards on load
     */
    animateCards() {
        const cards = document.querySelectorAll('.job-card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    /**
     * Set button loading state
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            
            const arrow = button.querySelector('.btn-arrow');
            if (arrow) {
                arrow.textContent = '⟳';
            }
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            
            const arrow = button.querySelector('.btn-arrow');
            if (arrow) {
                arrow.textContent = '→';
            }
        }
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message-popup');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message-popup message-${type}`;
        messageElement.textContent = message;
        
        // Style the message
        this.styleMessage(messageElement, type);
        
        // Add to page
        document.body.appendChild(messageElement);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.opacity = '0';
                messageElement.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 4000);
    }
    
    /**
     * Style message popup
     */
    styleMessage(element, type) {
        // Base styles
        Object.assign(element.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10001',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
        });
        
        // Type-specific colors
        const colors = {
            success: {
                background: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb'
            },
            error: {
                background: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb'
            },
            warning: {
                background: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeaa7'
            },
            info: {
                background: '#d1ecf1',
                color: '#0c5460',
                border: '1px solid #bee5eb'
            }
        };
        
        const colorScheme = colors[type] || colors.info;
        Object.assign(element.style, colorScheme);
    }
    
    /**
     * Get job statistics
     */
    getJobStats() {
        return {
            intern: { available: 52, completed: 0 },
            level1: { available: 78, completed: 0 },
            level2: { available: 43, completed: 0 },
            level3: { available: 27, completed: 0 }
        };
    }
}

// Initialize jobs controller
window.jobsController = new JobsController();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobsController;
}