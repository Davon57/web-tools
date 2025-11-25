/**
 * 通知系统工具函数
 * 提供统一的通知消息显示功能
 */

let notificationId = 0

/**
 * 显示通知消息
 * @param {string} message - 通知消息内容
 * @param {string} type - 通知类型 ('success', 'warning', 'error', 'info')
 * @param {number} duration - 显示时长（毫秒），0表示不自动关闭
 * @param {boolean} closable - 是否显示关闭按钮
 */
export function showNotification(message, type = 'info', duration = 4000, closable = true) {
  const container = document.getElementById('notification-container')
  if (!container) {
    console.warn('通知容器未找到')
    return
  }

  const id = `notification-${++notificationId}`
  
  // 创建通知元素
  const notification = document.createElement('div')
  notification.id = id
  notification.className = `notification notification-${type}`
  notification.style.pointerEvents = 'auto'
  notification.style.marginBottom = '10px'
  
  // 创建通知内容
  const content = document.createElement('span')
  content.textContent = message
  notification.appendChild(content)
  
  // 添加关闭按钮
  if (closable) {
    const closeBtn = document.createElement('button')
    closeBtn.className = 'notification-close'
    closeBtn.innerHTML = '×'
    closeBtn.onclick = () => removeNotification(id)
    notification.appendChild(closeBtn)
  }
  
  // 添加到容器
  container.appendChild(notification)
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
  
  return id
}

/**
 * 移除通知
 * @param {string} id - 通知ID
 */
export function removeNotification(id) {
  const notification = document.getElementById(id)
  if (notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }
}

/**
 * 清除所有通知
 */
export function clearAllNotifications() {
  const container = document.getElementById('notification-container')
  if (container) {
    container.innerHTML = ''
  }
}

// 便捷方法
export const notification = {
  success: (message, duration, closable) => showNotification(message, 'success', duration, closable),
  warning: (message, duration, closable) => showNotification(message, 'warning', duration, closable),
  error: (message, duration, closable) => showNotification(message, 'error', duration, closable),
  info: (message, duration, closable) => showNotification(message, 'info', duration, closable)
}

// 添加滑出动画
const style = document.createElement('style')
style.textContent = `
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
`
document.head.appendChild(style)