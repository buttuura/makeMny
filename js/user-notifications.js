// Basic user notifications script
function showUserNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `user-notification user-notification-${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '1rem',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Example usage:
// showUserNotification('Welcome!', 'success');
// showUserNotification('Something went wrong.', 'error');
