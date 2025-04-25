/**
 * 사용자에게 알림을 표시하는 모듈
 * 
 * 주요 기능:
 * 1. 토스트 형태의 알림 표시
 * 2. 알림 타입에 따른 스타일 적용 (success, danger, warning, info)
 */

/**
 * 화면 우측 하단에 토스트 형태의 알림을 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 (success, danger, warning, info)
 */
export function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    toast.querySelector('.toast-body').textContent = message;
    toast.className = `toast bg-${type} text-white`;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
} 