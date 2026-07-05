import type { App, Directive, DirectiveBinding } from 'vue'
import { useIamUserStore } from '@/common/stores/IamUser.store'
import { nextTick } from 'vue'

interface PermissionDirectiveElement extends HTMLElement {
  _permissionDisabled?: boolean
  _permissionClickHandler?: (e: Event) => void
}

/**
 * 权限指令注册
 *
 * 使用示例：
 * 1. 基本用法：<button v-hasPermission="'user:create'">创建用户</button>
 * 2. 多权限检查：<button v-hasPermission="['user:create', 'user:edit']">创建/编辑用户</button>
 *
 * 注意：没有权限时，元素会显示但被禁用，不会隐藏
 */
export const permissionDirective = (app: App) => {
  app.directive('hasPermission', {
    mounted: (el, binding) => {
      nextTick(() => {
        handlePermissionCheck(el, binding)
      })
    },
    updated: (el, binding) => {
      nextTick(() => {
        handlePermissionCheck(el, binding)
      })
    },
    unmounted: cleanup
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
    } else {
      enableElement(el)
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    disableElement(el)
  }
}

/**
 * 查找 Element Plus 组件的实际 DOM 元素
 */
function findComponentInfo(el: HTMLElement): { rootEl: HTMLElement } {
  // 如果是 el-dropdown-item，查找实际的 li 元素
  let rootEl = el

  // 首先检查当前元素是否是 el-dropdown-item
  if (el.classList.contains('el-dropdown-item')) {
    rootEl = el
  } else {
    // 向上查找 el-dropdown-item
    const dropdownItem = el.closest('.el-dropdown-item') as HTMLElement
    if (dropdownItem) {
      rootEl = dropdownItem
    } else {
      // 查找最近的组件根元素
      let current: HTMLElement | null = el
      while (current && current !== document.body) {
        if (
          current.classList.contains('el-button') ||
          current.classList.contains('el-dropdown-item') ||
          current.classList.contains('el-switch') ||
          current.tagName === 'BUTTON' ||
          current.tagName === 'INPUT' ||
          current.tagName === 'LI'
        ) {
          rootEl = current
          break
        }
        current = current.parentElement
      }
    }
  }

  return { rootEl }
}

/**
 * 禁用元素
 */
function disableElement(el: PermissionDirectiveElement) {
  if (el._permissionDisabled) return

  const { rootEl } = findComponentInfo(el)

  el.classList.add('no-permission')
  rootEl.classList.add('no-permission')
  el._permissionDisabled = true

  // 处理原生 HTML 元素
  const element = rootEl as HTMLButtonElement | HTMLInputElement
  if ('disabled' in element) {
    element.disabled = true
  }

  // 处理 Element Plus 组件
  // el-dropdown-item 需要设置 disabled 属性和 is-disabled 类
  rootEl.setAttribute('disabled', '')
  rootEl.setAttribute('aria-disabled', 'true')
  rootEl.classList.add('is-disabled')

  // 对于 el-dropdown-item，需要特殊处理
  if (rootEl.classList.contains('el-dropdown-item') || rootEl.tagName === 'LI') {
    rootEl.style.pointerEvents = 'none'
    rootEl.style.opacity = '0.6'
    rootEl.style.cursor = 'not-allowed'

    // 阻止 el-dropdown-item 的点击事件
    const preventClick = (e: Event) => {
      if (el._permissionDisabled) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    // 移除旧的事件监听器（如果存在）
    if (el._permissionClickHandler) {
      rootEl.removeEventListener('click', el._permissionClickHandler, true)
    }

    el._permissionClickHandler = preventClick
    rootEl.addEventListener('click', preventClick, true)

    // 阻止 mousedown 事件
    const preventMouseDown = (e: Event) => {
      if (el._permissionDisabled) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    rootEl.addEventListener('mousedown', preventMouseDown, true)
  } else {
    rootEl.style.pointerEvents = 'none'
    rootEl.style.opacity = rootEl.style.opacity || '0.6'
    rootEl.style.cursor = rootEl.style.cursor || 'not-allowed'

    // 阻止点击事件
    const preventClick = (e: Event) => {
      if (el._permissionDisabled) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }

    if (el._permissionClickHandler) {
      rootEl.removeEventListener('click', el._permissionClickHandler, true)
    }

    el._permissionClickHandler = preventClick
    rootEl.addEventListener('click', preventClick, true)
  }
}

/**
 * 启用元素
 */
function enableElement(el: PermissionDirectiveElement) {
  if (!el._permissionDisabled) return

  const { rootEl } = findComponentInfo(el)

  el.classList.remove('no-permission')
  rootEl.classList.remove('no-permission')
  el._permissionDisabled = false

  // 处理原生 HTML 元素
  const element = rootEl as HTMLButtonElement | HTMLInputElement
  if ('disabled' in element) {
    element.disabled = false
  }

  // 处理 Element Plus 组件
  rootEl.removeAttribute('disabled')
  rootEl.removeAttribute('aria-disabled')
  rootEl.classList.remove('is-disabled')

  // 恢复样式
  if (rootEl.classList.contains('el-dropdown-item') || rootEl.tagName === 'LI') {
    rootEl.style.pointerEvents = ''
    rootEl.style.opacity = ''
    rootEl.style.cursor = ''
  } else {
    rootEl.style.pointerEvents = ''
    rootEl.style.opacity = ''
    rootEl.style.cursor = ''
  }

  // 移除事件监听器
  if (el._permissionClickHandler) {
    rootEl.removeEventListener('click', el._permissionClickHandler, true)
    delete el._permissionClickHandler
  }
}

/**
 * 清理
 */
function cleanup(el: PermissionDirectiveElement) {
  if (el._permissionClickHandler) {
    const { rootEl } = findComponentInfo(el)
    rootEl.removeEventListener('click', el._permissionClickHandler, true)
    delete el._permissionClickHandler
  }
  enableElement(el)
  delete el._permissionDisabled
}
