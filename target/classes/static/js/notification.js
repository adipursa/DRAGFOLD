// 알림 표시
export function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    toast.querySelector('.toast-body').textContent = message;
    toast.className = `toast bg-${type} text-white`;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
} 