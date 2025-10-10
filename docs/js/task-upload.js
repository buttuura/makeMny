// Task Upload Page JavaScript Functions

class TaskUploadController {
    constructor() {
        this.selectedLevel = null;
        this.uploadedTasks = [];
        
        // GitHub configuration
        this.github = {
            owner: 'your-username', // Replace with your GitHub username
            repo: 'getcash-tasks',   // Replace with your repository name
            token: 'ghp_your_token_here', // Replace with your GitHub token
            branch: 'main'
        };
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.loadRecentUploads();
    }
    
    bindEvents() {
        // Level selection events
        const levelOptions = document.querySelectorAll('.level-option');
        levelOptions.forEach(option => {
            option.addEventListener('click', () => this.selectLevel(option));
        });
        
        // Form events
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Image upload events
        this.bindImageUploadEvents();
        
        // Success section events
        const viewTasksBtn = document.getElementById('viewTasksBtn');
        if (viewTasksBtn) {
            viewTasksBtn.addEventListener('click', () => this.viewTasks());
        }
    }
    
    bindImageUploadEvents() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('taskImage');
        const removeBtn = document.getElementById('removeImage');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeImage();
            });
        }
    }
    
    selectLevel(option) {
        // Remove previous selection
        document.querySelectorAll('.level-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        
        // Store selected level
        const level = option.dataset.level;
        this.selectedLevel = {
            level: level,
            name: option.querySelector('h3').textContent,
            price: this.getLevelPrice(level),
            icon: option.querySelector('.level-icon').textContent
        };
        
        // Update form
        this.updateForm();
        
        // Show upload form
        this.showUploadForm();
    }
    
    getLevelPrice(level) {
        const prices = {
            'intern': 500,
            'worker': 500,
            'senior': 1600,
            'expert': 4200
        };
        return prices[level] || 500;
    }
    
    updateForm() {
        if (!this.selectedLevel) return;
        
        // Update selected level display
        const display = document.getElementById('selectedLevelDisplay');
        if (display) {
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">${this.selectedLevel.icon}</span>
                    <div>
                        <strong>${this.selectedLevel.name}</strong>
                        <div style="color: #666; font-size: 0.9rem;">UGX ${this.selectedLevel.price} per task</div>
                    </div>
                </div>
            `;
        }
        
        // Update task price field
        const priceInput = document.getElementById('taskPrice');
        if (priceInput) {
            priceInput.value = this.selectedLevel.price;
        }
    }
    
    showUploadForm() {
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.style.display = 'block';
            uploadForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size must be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const placeholder = document.querySelector('.upload-placeholder');
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            
            if (placeholder && preview && previewImg) {
                placeholder.style.display = 'none';
                preview.style.display = 'block';
                previewImg.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
    
    removeImage() {
        const fileInput = document.getElementById('taskImage');
        const placeholder = document.querySelector('.upload-placeholder');
        const preview = document.getElementById('imagePreview');
        
        if (fileInput) fileInput.value = '';
        if (placeholder) placeholder.style.display = 'flex';
        if (preview) preview.style.display = 'none';
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.selectedLevel) {
            this.showNotification('Please select a target level first', 'error');
            return;
        }
        
        // Get form data
        const formData = new FormData(event.target);
        const taskData = {
            id: Date.now().toString(),
            level: this.selectedLevel.level,
            levelName: this.selectedLevel.name,
            title: formData.get('taskTitle'),
            price: parseInt(formData.get('taskPrice')),
            description: formData.get('taskDescription'),
            category: formData.get('taskCategory'),
            duration: formData.get('taskDuration'),
            quantity: parseInt(formData.get('taskQuantity')),
            instructions: formData.get('taskInstructions'),
            image: this.getImageDataUrl(),
            uploadedAt: new Date().toISOString(),
            status: 'active'
        };
        
        // Validate required fields
        if (!taskData.title || !taskData.description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            // Save task to GitHub
            await this.saveTask(taskData);
            
            // Show success
            this.showSuccess(taskData);
        } catch (error) {
            this.showNotification('Failed to upload task. Please try again.', 'error');
        }
    }
    
    getImageDataUrl() {
        const previewImg = document.getElementById('previewImg');
        return previewImg && previewImg.src !== window.location.href ? previewImg.src : null;
    }
    
    async saveTask(taskData) {
        try {
            // Show loading state
            this.showNotification('Uploading task to GitHub...', 'info');
            
            // Add to uploaded tasks
            this.uploadedTasks.unshift(taskData);
            
            // Keep only last 50 uploads
            if (this.uploadedTasks.length > 50) {
                this.uploadedTasks = this.uploadedTasks.slice(0, 50);
            }
            
            // Save uploaded tasks list to GitHub
            await this.saveToGitHub('uploaded_tasks.json', this.uploadedTasks);
            
            // Get existing level tasks from GitHub
            const levelTasks = await this.loadFromGitHub(`tasks_${taskData.level}.json`) || [];
            
            // Create multiple tasks if quantity > 1
            for (let i = 0; i < taskData.quantity; i++) {
                const task = {
                    ...taskData,
                    id: `${taskData.id}_${i}`,
                    title: taskData.quantity > 1 ? `${taskData.title} #${i + 1}` : taskData.title
                };
                levelTasks.unshift(task);
            }
            
            // Save level tasks to GitHub
            await this.saveToGitHub(`tasks_${taskData.level}.json`, levelTasks);
            
            console.log(`Uploaded ${taskData.quantity} task(s) to ${taskData.level} level on GitHub`);
            this.showNotification('Task uploaded successfully to GitHub!', 'success');
            
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            this.showNotification('Error uploading to GitHub. Check your configuration.', 'error');
            throw error;
        }
    }
    
    showSuccess(taskData) {
        // Hide form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) uploadForm.style.display = 'none';
        
        // Update success message
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.textContent = `Your task "${taskData.title}" has been uploaded to ${taskData.levelName} and is now available for users.`;
        }
        
        // Show success section
        const successSection = document.getElementById('successSection');
        if (successSection) {
            successSection.style.display = 'block';
            successSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update recent uploads
        this.loadRecentUploads();
        
        // Reset form
        this.resetForm();
    }
    
    resetForm() {
        const form = document.getElementById('taskForm');
        if (form) form.reset();
        
        this.removeImage();
        this.selectedLevel = null;
        
        // Remove level selection
        document.querySelectorAll('.level-option').forEach(opt => opt.classList.remove('selected'));
    }
    
    loadRecentUploads() {
        const container = document.getElementById('recentUploads');
        if (!container) return;
        
        if (this.uploadedTasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                    <p>No tasks uploaded yet. Upload your first task above!</p>
                </div>
            `;
            return;
        }
        
        // Show recent uploads (last 5)
        const recentTasks = this.uploadedTasks.slice(0, 5);
        container.innerHTML = recentTasks.map(task => `
            <div class="upload-item">
                <div class="upload-icon">${this.getCategoryIcon(task.category)}</div>
                <div class="upload-details">
                    <h4>${task.title}</h4>
                    <p>${task.levelName} • UGX ${task.price} • ${this.getTimeAgo(task.uploadedAt)}</p>
                </div>
                <div class="upload-status ${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</div>
            </div>
        `).join('');
    }
    
    getCategoryIcon(category) {
        const icons = {
            'data-entry': '📝',
            'social-media': '📱',
            'content-writing': '✍️',
            'surveys': '📊',
            'research': '🔍',
            'other': '📋'
        };
        return icons[category] || '📋';
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHrs > 0) {
            return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
    
    viewTasks() {
        if (!this.selectedLevel) return;
        
        const taskPages = {
            'intern': 'tasks-intern.html',
            'worker': 'tasks-level1.html',
            'senior': 'tasks-level2.html',
            'expert': 'tasks-level3.html'
        };
        
        const page = taskPages[this.selectedLevel.level];
        if (page) {
            window.location.href = page;
        }
    }
    
    async saveToGitHub(fileName, data) {
        const content = JSON.stringify(data, null, 2);
        
        try {
            // First, get the current file to get its SHA
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
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            throw error;
        }
    }

    async loadFromGitHub(fileName) {
        try {
            const file = await this.getGitHubFile(fileName);
            
            if (file && file.content) {
                const content = atob(file.content);
                return JSON.parse(content);
            }
            
            // Return empty array if file doesn't exist
            return [];
        } catch (error) {
            console.error('Error loading from GitHub:', error);
            // Return empty array on error
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
                // File doesn't exist yet
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
        }, 4000);
    }
}

// Global functions for onclick handlers
function cancelUpload() {
    const controller = window.taskUploadController;
    if (controller) {
        controller.resetForm();
        
        // Hide upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) uploadForm.style.display = 'none';
        
        // Hide success section
        const successSection = document.getElementById('successSection');
        if (successSection) successSection.style.display = 'none';
        
        controller.showNotification('Upload cancelled', 'info');
    }
}

function uploadAnother() {
    const successSection = document.getElementById('successSection');
    if (successSection) successSection.style.display = 'none';
    
    // Scroll back to level selection
    document.querySelector('.level-selector').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize task upload controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskUploadController = new TaskUploadController();
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