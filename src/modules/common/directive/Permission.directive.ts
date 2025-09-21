import type { App, Directive, DirectiveBinding } from 'vue'
import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'

interface PermissionDirectiveElement extends HTMLElement {
  _permissionTooltip?: HTMLElement
  _permissionTooltipEvents?: {
    show: () => void
    hide: () => void
    preventClick: (e: Event) => void
  }
}

/**
 * 权限指令注册
 *
 * 使用示例：
 * 1. 基本用法：<button v-hasPermission="'user:create'">创建用户</button>
 * 2. 多权限检查：<button v-hasPermission="['user:create', 'user:edit']">创建/编辑用户</button>
 * 3. 自定义提示：<button v-hasPermission:创建="'user:create'">创建用户</button>
 */
export const permissionDirective = (app: App) => {
  app.directive('hasPermission', {
    mounted: handlePermissionCheck,
    updated: handlePermissionCheck,
    unmounted: cleanupTooltip
  } as Directive<PermissionDirectiveElement, string | string[]>)
}

/**
 * 处理权限检查
 */
function handlePermissionCheck(el: PermissionDirectiveElement, binding: DirectiveBinding<string | string[]>) {
  try {
    const { permissionCodeList } = useIamUserStore().getPermissionInfo()
    const requiredPermissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    const hasPermission = requiredPermissions.some((permission: string) => permissionCodeList.includes(permission))

    if (!hasPermission) {
      disableElement(el)
      setupPermissionTooltip(el, binding.arg || getDefaultActionName(el))
    } else {
      enableElement(el)
      cleanupTooltip(el)
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    handlePermissionError(el)
  }
}

/**
 * 处理权限检查错误
 */
function handlePermissionError(el: PermissionDirectiveElement) {
  disableElement(el)
  setupPermissionTooltip(el, '此操作')
}

/**
 * 获取默认操作名称
 */
function getDefaultActionName(el: HTMLElement): string {
  if (el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement) {
    return el.textContent?.trim() || '此操作'
  }
  return '此操作'
}

/**
 * 禁用元素
 */
function disableElement(el: PermissionDirectiveElement) {
  el.classList.add('no-permission')

  const element = el as HTMLButtonElement | HTMLInputElement
  if ('disabled' in element) {
    element.disabled = true
  } else {
    el.style.pointerEvents = 'none'
  }

  el.style.opacity = '0.7'
  el.style.cursor = 'not-allowed'
}

/**
 * 启用元素
 */
function enableElement(el: PermissionDirectiveElement) {
  el.classList.remove('no-permission')

  const element = el as HTMLButtonElement | HTMLInputElement
  if ('disabled' in element) {
    element.disabled = false
  } else {
    el.style.pointerEvents = ''
  }

  el.style.opacity = ''
  el.style.cursor = ''
}

/**
 * 设置权限提示
 */
function setupPermissionTooltip(el: PermissionDirectiveElement, actionName: string) {
  cleanupTooltip(el)

  const tooltip = createTooltipElement(actionName)
  document.body.appendChild(tooltip)
  el._permissionTooltip = tooltip

  const show = () => showTooltip(el, tooltip)
  const hide = () => hideTooltip(tooltip)
  const preventClick = (e: Event) => {
    if (el.classList.contains('no-permission')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  el.addEventListener('mouseenter', show)
  el.addEventListener('mouseleave', hide)
  el.addEventListener('click', preventClick)

  el._permissionTooltipEvents = { show, hide, preventClick }
}

/**
 * 创建提示元素
 */
function createTooltipElement(actionName: string): HTMLElement {
  const tooltip = document.createElement('div')
  tooltip.className = 'permission-tooltip'
  tooltip.textContent = `您暂无${actionName}权限，请联系管理员`

  Object.assign(tooltip.style, {
    position: 'absolute',
    display: 'none',
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    zIndex: '9999',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    pointerEvents: 'none'
  })

  return tooltip
}

/**
 * 显示提示
 */
function showTooltip(el: HTMLElement, tooltip: HTMLElement) {
  const rect = el.getBoundingClientRect()
  tooltip.style.display = 'block'

  let left = rect.left + window.scrollX
  let top = rect.top + window.scrollY - tooltip.offsetHeight - 5

  if (top < 5) {
    top = rect.top + window.scrollY + rect.height + 5
  }

  const rightEdge = left + tooltip.offsetWidth
  if (rightEdge > window.innerWidth) {
    left = window.innerWidth - tooltip.offsetWidth - 5
  }

  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
}

/**
 * 隐藏提示
 */
function hideTooltip(tooltip: HTMLElement) {
  tooltip.style.display = 'none'
}

/**
 * 清理提示
 */
function cleanupTooltip(el: PermissionDirectiveElement) {
  if (el._permissionTooltip) {
    document.body.removeChild(el._permissionTooltip)
    delete el._permissionTooltip
  }

  if (el._permissionTooltipEvents) {
    const { show, hide, preventClick } = el._permissionTooltipEvents
    el.removeEventListener('mouseenter', show)
    el.removeEventListener('mouseleave', hide)
    el.removeEventListener('click', preventClick)
    delete el._permissionTooltipEvents
  }
}
