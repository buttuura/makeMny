// GetCash Tasks Controller

/**
 * Tasks Page Controller
 */
class TasksController {
    constructor(level) {
        this.level = level;
        this.tasks = [];
        this.github = {
            owner: 'yourusername',     // Replace with your GitHub username
            repo: 'getcash-tasks',     // Replace with your repository name
            token: 'your_github_token', // Replace with your GitHub personal access token
            branch: 'main'             // Replace with your branch name
        };
        this.init();
    }
    
    /**
     * Initialize the tasks page
     */
    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            await this.setupPage();
        }
    }
    
    /**
     * Setup page elements and load tasks
     */
    async setupPage() {
        this.setupNavigation();
        await this.loadTasks();
        this.updateHeader();
    }
    
    /**
     * Load tasks from GitHub storage
     */
    async loadTasks() {
        try {
            // Show loading spinner
            this.showLoading(true);
            
            // Check if user has approved access first
            const hasAccess = await this.checkUserAccess();
            
            if (!hasAccess) {
                this.showAccessDenied();
                return;
            }
            
            // Load tasks from GitHub for this level
            this.tasks = await this.fetchTasksForLevel(this.level);
            
            // If no tasks found in GitHub, use fallback sample data
            if (this.tasks.length === 0) {
                this.tasks = this.getFallbackTasks(this.level);
                this.showNotification('Loading sample tasks. Upload tasks from admin panel.', 'info');
            }
            
            // Display tasks
            this.displayTasks();
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to load tasks. Using sample data.');
            
            // Use fallback data on error
            this.tasks = this.getFallbackTasks(this.level);
            this.displayTasks();
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Fetch tasks for specific level from GitHub
     */
    async fetchTasksForLevel(level) {
        try {
            const fileName = `tasks_${level}.json`;
            const tasks = await this.loadFromGitHub(fileName);
            return tasks.filter(task => task.status === 'active');
        } catch (error) {
            console.error('Error fetching tasks from GitHub:', error);
            return [];
        }
    }

    /**
     * Get fallback sample tasks if GitHub is not configured
     */
    getFallbackTasks(level) {
        const taskDatabase = {
            intern: [
                {
                    id: 'intern_001',
                    title: 'Complete Social Media Survey',
                    description: 'Answer questions about your social media usage patterns and preferences. This is a simple survey that takes about 5-10 minutes to complete.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/007bff/ffffff?text=Survey+Task'
                },
                {
                    id: 'intern_002',
                    title: 'Data Entry - Product Information',
                    description: 'Enter product details from images into our database system. Basic computer skills required for this task.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/28a745/ffffff?text=Data+Entry'
                },
                {
                    id: 'intern_003',
                    title: 'Content Moderation',
                    description: 'Review and moderate user-generated content according to community guidelines. Help maintain a safe online environment.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/ffc107/000000?text=Moderation'
                }
            ],
            level1: [
                {
                    id: 'level1_001',
                    title: 'Write Product Descriptions',
                    description: 'Create compelling product descriptions for e-commerce listings. Use your creativity to write engaging and informative descriptions.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/17a2b8/ffffff?text=Writing+Task'
                },
                {
                    id: 'level1_002',
                    title: 'Customer Support Chat',
                    description: 'Provide customer support via live chat. Help customers with their questions and resolve their issues professionally.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/6f42c1/ffffff?text=Support+Chat'
                },
                {
                    id: 'level1_003',
                    title: 'Market Research Analysis',
                    description: 'Research competitors and compile a brief market analysis report. Gather insights about market trends and opportunities.',
                    price: 500,
                    image: 'https://via.placeholder.com/300x150/fd7e14/ffffff?text=Research+Task'
                }
            ],
            level2: [
                {
                    id: 'level2_001',
                    title: 'Design Social Media Graphics',
                    description: 'Create 5 social media post graphics using provided brand guidelines. Show your creativity and design skills in this engaging task.',
                    price: 1000,
                    image: 'https://via.placeholder.com/300x150/e83e8c/ffffff?text=Design+Task'
                },
                {
                    id: 'level2_002',
                    title: 'Digital Marketing Campaign',
                    description: 'Plan and execute a small digital marketing campaign. Use your marketing knowledge to create an effective campaign strategy.',
                    price: 1000,
                    image: 'https://via.placeholder.com/300x150/20c997/ffffff?text=Marketing+Task'
                },
                {
                    id: 'level2_003',
                    title: 'Website Testing & QA',
                    description: 'Test website functionality and report bugs with detailed documentation. Help improve user experience through thorough testing.',
                    price: 1000,
                    image: 'https://via.placeholder.com/300x150/6610f2/ffffff?text=Testing+Task'
                }
            ],
            level3: [
                {
                    id: 'level3_001',
                    title: 'Full-Stack Web Development',
                    description: 'Build a complete web application with frontend and backend. Demonstrate your advanced programming skills in this comprehensive project.',
                    price: 1200,
                    image: 'https://via.placeholder.com/300x150/dc3545/ffffff?text=Development'
                },
                {
                    id: 'level3_002',
                    title: 'Business Strategy Consultation',
                    description: 'Provide strategic business consultation for a startup company. Use your expertise to help businesses grow and succeed.',
                    price: 1200,
                    image: 'https://via.placeholder.com/300x150/343a40/ffffff?text=Consulting'
                },
                {
                    id: 'level3_003',
                    title: 'AI Model Development',
                    description: 'Train and optimize machine learning models for data classification. Apply advanced AI techniques to solve complex problems.',
                    price: 1200,
                    image: 'https://via.placeholder.com/300x150/795548/ffffff?text=AI+Task'
                }
            ]
        };
        
        return taskDatabase[level] || [];
    }
    
    /**
     * Display tasks in the UI
     */
    displayTasks() {
        const tasksList = document.getElementById('tasksList');
        const noTasksDiv = document.getElementById('noTasks');
        
        if (this.tasks.length === 0) {
            tasksList.style.display = 'none';
            noTasksDiv.style.display = 'block';
            return;
        }
        
        tasksList.style.display = 'grid';
        noTasksDiv.style.display = 'none';
        
        tasksList.innerHTML = this.tasks.map(task => this.createTaskCard(task)).join('');
        
        // Add event listeners to task buttons
        this.setupTaskButtons();
    }
    
    /**
     * Create HTML for a task card
     */
    createTaskCard(task) {
        return `
            <div class="task-card" data-task-id="${task.id}">
                ${task.image ? `<div class="task-image">
                    <img src="${task.image}" alt="${task.title}" />
                </div>` : ''}
                
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <div class="task-price">UGX ${task.price.toLocaleString()}</div>
                    </div>
                    
                    <div class="task-description">${task.description}</div>
                    
                    <button class="task-btn" data-task-id="${task.id}">
                        Start Task
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup task button click handlers
     */
    setupTaskButtons() {
        const taskButtons = document.querySelectorAll('.task-btn');
        
        taskButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = button.getAttribute('data-task-id');
                this.handleTaskStart(taskId);
            });
        });
    }
    
    /**
     * Handle task start
     */
    handleTaskStart(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        
        if (!task) {
            alert('Task not found!');
            return;
        }
        
        // Check if user is logged in
        const isLoggedIn = sessionStorage.getItem('getcash_logged_in') === 'true';
        
        if (!isLoggedIn) {
            alert('Please login to start tasks');
            window.location.href = 'login.html';
            return;
        }
        
        // Show task confirmation dialog
        const confirmed = confirm(
            `Start Task: ${task.title}\n\n` +
            `Reward: UGX ${task.reward.toLocaleString()}\n` +
            `Duration: ${task.duration}\n` +
            `Category: ${task.category}\n\n` +
            `Are you ready to start this task?`
        );
        
        if (confirmed) {
            this.startTask(task);
        }
    }
    
    /**
     * Start the selected task
     */
    startTask(task) {
        // In a real app, this would navigate to the task execution page
        // For now, we'll simulate starting the task
        
        alert(`Task "${task.title}" has been started!\n\nThis would normally open the task interface.\n\nFor demo purposes, this feature is coming soon.`);
        
        // You could store the started task in localStorage
        const startedTasks = JSON.parse(localStorage.getItem('getcash_started_tasks') || '[]');
        startedTasks.push({
            ...task,
            startedAt: new Date().toISOString(),
            status: 'in-progress'
        });
        localStorage.setItem('getcash_started_tasks', JSON.stringify(startedTasks));
    }
    
    /**
     * Update header information
     */
    updateHeader() {
        const availableTasksElement = document.querySelector('.available-tasks');
        if (availableTasksElement) {
            availableTasksElement.textContent = `${this.tasks.length} tasks available`;
        }
    }
    
    /**
     * Show/hide loading spinner
     */
    showLoading(show) {
        const loadingSpinner = document.querySelector('.loading-spinner');
        const tasksList = document.getElementById('tasksList');
        
        if (show) {
            if (loadingSpinner) {
                loadingSpinner.style.display = 'block';
            }
        } else {
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <h3>Error Loading Tasks</h3>
                <p>${message}</p>
                <button class="refresh-btn" onclick="location.reload()">Try Again</button>
            </div>
        `;
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
                alert(`${label} page coming soon!`);
            });
        });
    }
    
    /**
     * Get level display name
     */
    getLevelDisplayName() {
        const levelNames = {
            'intern': 'Intern Tasks',
            'level1': 'Level 1 Tasks',
            'level2': 'Level 2 Tasks',
            'level3': 'Level 3 Tasks'
        };
        
        return levelNames[this.level] || 'Tasks';
    }
    
    /**
     * Check if user has approved access for tasks
     */
    async checkUserAccess() {
        try {
            // First check if there's any approved deposit in GitHub
            const users = await this.loadFromGitHub('users.json');
            const currentUser = this.getCurrentUserId(); // We'll need to implement this
            
            if (currentUser) {
                const userData = users.find(u => u.userId === currentUser);
                if (userData && userData.taskAccess) {
                    return true;
                }
            }
            
            // Fallback: check localStorage for approved deposit
            const lastRequest = JSON.parse(localStorage.getItem('lastDepositRequest') || 'null');
            if (lastRequest) {
                // Check if there's any approved request for this user
                const deposits = await this.loadFromGitHub('deposit_requests.json');
                const approvedDeposit = deposits.find(d => 
                    d.phone === lastRequest.phone && d.status === 'approved'
                );
                
                if (approvedDeposit) {
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Error checking user access:', error);
            // Allow access on error for development purposes
            return true;
        }
    }
    
    /**
     * Get current user ID (simplified for demo)
     */
    getCurrentUserId() {
        // In a real app, this would come from authentication
        // For demo, we'll use the last deposit request
        const lastRequest = JSON.parse(localStorage.getItem('lastDepositRequest') || 'null');
        return lastRequest ? lastRequest.userId : null;
    }
    
    /**
     * Show access denied message
     */
    showAccessDenied() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = `
            <div class="access-denied">
                <div class="denied-icon">🔒</div>
                <h3>Task Access Restricted</h3>
                <p>Your account needs admin approval before you can access tasks.</p>
                
                <div class="access-info">
                    <h4>To gain access:</h4>
                    <ol>
                        <li>Make a deposit to upgrade your account level</li>
                        <li>Wait for admin approval (usually within 24 hours)</li>
                        <li>Once approved, you can start earning from tasks</li>
                    </ol>
                </div>
                
                <div class="access-actions">
                    <a href="deposit.html" class="access-btn deposit-btn">
                        💰 Make Deposit
                    </a>
                    <button class="access-btn check-btn" onclick="location.reload()">
                        🔄 Check Status
                    </button>
                </div>
                
                <div class="contact-info">
                    <p><small>Need help? Contact admin for faster approval processing.</small></p>
                </div>
            </div>
        `;
        
        // Add custom styles for access denied
        const style = document.createElement('style');
        style.textContent = `
            .access-denied {
                text-align: center;
                padding: 60px 20px;
                max-width: 500px;
                margin: 0 auto;
            }
            
            .denied-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            
            .access-denied h3 {
                color: #dc3545;
                margin-bottom: 15px;
                font-size: 1.5rem;
            }
            
            .access-denied p {
                color: #666;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .access-info {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                text-align: left;
            }
            
            .access-info h4 {
                color: #495057;
                margin-bottom: 15px;
                font-size: 1.1rem;
            }
            
            .access-info ol {
                color: #666;
                line-height: 1.8;
                padding-left: 20px;
            }
            
            .access-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin: 30px 0;
            }
            
            .access-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .deposit-btn {
                background: #28a745;
                color: white;
            }
            
            .deposit-btn:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            
            .check-btn {
                background: #007bff;
                color: white;
            }
            
            .check-btn:hover {
                background: #0056b3;
                transform: translateY(-2px);
            }
            
            .contact-info {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }
            
            .contact-info small {
                color: #6c757d;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Refresh tasks
     */
    async refreshTasks() {
        await this.loadTasks();
    }

    /**
     * Load data from GitHub
     */
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

    /**
     * Get file from GitHub
     */
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

    /**
     * Show notification
     */
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

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TasksController;
}