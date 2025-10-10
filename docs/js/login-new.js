// GetCash Login Page - New Clean JavaScript

/**
 * Login Page Controller
 */
class LoginController {
    constructor() {
        this.form = null;
        this.emailField = null;
        this.passwordField = null;
        this.rememberCheckbox = null;
        this.loginButton = null;
        this.togglePasswordBtn = null;
        
        this.init();
    }
    
    /**
     * Initialize the login page
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }
    
    /**
     * Setup DOM elements and event listeners
     */
    setupElements() {
        // Get DOM elements
        this.form = document.querySelector('.login-form');
        this.emailField = document.getElementById('email');
        this.passwordField = document.getElementById('password');
        this.rememberCheckbox = document.getElementById('remember');
        this.loginButton = document.querySelector('.login-btn');
        this.togglePasswordBtn = document.querySelector('.toggle-password');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved email if exists
        this.loadSavedCredentials();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Password toggle
        if (this.togglePasswordBtn) {
            this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());
        }
        
        // Real-time validation
        if (this.emailField) {
            this.emailField.addEventListener('blur', () => this.validateEmail());
            this.emailField.addEventListener('input', () => this.clearFieldError(this.emailField));
        }
        
        if (this.passwordField) {
            this.passwordField.addEventListener('input', () => this.clearFieldError(this.passwordField));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            email: this.emailField.value.trim(),
            password: this.passwordField.value,
            remember: this.rememberCheckbox?.checked || false
        };
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate login process (replace with actual API call)
            const success = await this.performLogin(formData);
            
            if (success) {
                this.handleLoginSuccess(formData);
            } else {
                this.handleLoginError('Invalid email or password. Please try again.');
            }
        } catch (error) {
            this.handleLoginError('Network error. Please check your connection and try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * Perform login (replace with actual API call)
     */
    async performLogin(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate login validation (replace with actual logic)
        // For demo purposes, accept any valid email format with password length > 6
        return this.isValidEmail(formData.email) && formData.password.length >= 6;
    }
    
    /**
     * Handle successful login
     */
    handleLoginSuccess(formData) {
        // Save credentials if remember me is checked
        if (formData.remember) {
            localStorage.setItem('getcash_remember_email', formData.email);
        } else {
            localStorage.removeItem('getcash_remember_email');
        }
        
        // Show success message
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Store login state
        sessionStorage.setItem('getcash_logged_in', 'true');
        sessionStorage.setItem('getcash_user_email', formData.email);
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'Welcomepage.html';
        }, 1500);
    }
    
    /**
     * Handle login error
     */
    handleLoginError(message) {
        this.showMessage(message, 'error');
        
        // Shake the form for visual feedback
        if (this.form) {
            this.form.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                this.form.style.animation = '';
            }, 500);
        }
    }
    
    /**
     * Validate the entire form
     */
    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Validate email
        if (!this.emailField.value.trim()) {
            this.showFieldError(this.emailField, 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(this.emailField.value.trim())) {
            this.showFieldError(this.emailField, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!this.passwordField.value) {
            this.showFieldError(this.passwordField, 'Password is required');
            isValid = false;
        } else if (this.passwordField.value.length < 6) {
            this.showFieldError(this.passwordField, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate email field
     */
    validateEmail() {
        const email = this.emailField.value.trim();
        
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(this.emailField, 'Please enter a valid email address');
            return false;
        } else if (email) {
            this.showFieldSuccess(this.emailField);
            return true;
        }
        
        return true;
    }
    
    /**
     * Check if email format is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Toggle password visibility
     */
    togglePassword() {
        if (!this.passwordField || !this.togglePasswordBtn) return;
        
        const isPassword = this.passwordField.type === 'password';
        
        this.passwordField.type = isPassword ? 'text' : 'password';
        this.togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        this.togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        
        // Focus back to password field for better UX
        this.passwordField.focus();
    }
    
    /**
     * Show field error
     */
    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message visible';
        errorElement.textContent = message;
        
        field.parentElement.appendChild(errorElement);
    }
    
    /**
     * Show field success
     */
    showFieldSuccess(field) {
        field.classList.add('success');
        field.classList.remove('error');
        
        // Remove error message if exists
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('visible');
        }
    }
    
    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('error', 'success');
        
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('visible');
        }
    }
    
    /**
     * Clear all form errors
     */
    clearAllErrors() {
        const fields = [this.emailField, this.passwordField];
        fields.forEach(field => {
            if (field) {
                this.clearFieldError(field);
            }
        });
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
            zIndex: '10000',
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
     * Set loading state
     */
    setLoadingState(isLoading) {
        if (!this.loginButton) return;
        
        if (isLoading) {
            this.loginButton.classList.add('loading');
            this.loginButton.disabled = true;
            
            const btnIcon = this.loginButton.querySelector('.btn-icon');
            if (btnIcon) {
                btnIcon.textContent = '⟳';
            }
        } else {
            this.loginButton.classList.remove('loading');
            this.loginButton.disabled = false;
            
            const btnIcon = this.loginButton.querySelector('.btn-icon');
            if (btnIcon) {
                btnIcon.textContent = '→';
            }
        }
    }
    
    /**
     * Load saved credentials
     */
    loadSavedCredentials() {
        const savedEmail = localStorage.getItem('getcash_remember_email');
        
        if (savedEmail && this.emailField) {
            this.emailField.value = savedEmail;
            
            if (this.rememberCheckbox) {
                this.rememberCheckbox.checked = true;
            }
            
            // Focus password field if email is pre-filled
            if (this.passwordField) {
                this.passwordField.focus();
            }
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Enter key to submit form
        if (e.key === 'Enter' && (e.target === this.emailField || e.target === this.passwordField)) {
            e.preventDefault();
            this.handleSubmit(e);
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            this.clearForm();
        }
    }
    
    /**
     * Clear form data
     */
    clearForm() {
        if (this.emailField) this.emailField.value = '';
        if (this.passwordField) this.passwordField.value = '';
        if (this.rememberCheckbox) this.rememberCheckbox.checked = false;
        
        this.clearAllErrors();
        
        if (this.emailField) {
            this.emailField.focus();
        }
    }
}

// Global functions for backward compatibility
function togglePassword() {
    if (window.loginController) {
        window.loginController.togglePassword();
    }
}

// Add shake animation CSS
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Initialize login controller when page loads
window.loginController = new LoginController();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginController;
}