import type { App, Directive, DirectiveBinding } from 'vue'
import { useIamUserStore } from '@/shared/stores/IamUser.store'

interface DisabledSnapshot {
  root: {
    wasDisabled: boolean | null
    hadClass: boolean
    ariaDisabled: string | null
    tabindex: string | null
    pointerEvents: string
    cursor: string
  }
  controls: Array<{ element: HTMLElement; wasDisabled: boolean }>
}

const snapshots = new WeakMap<HTMLElement, DisabledSnapshot>()

const isNativeControl = (element: Element): element is HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
  element instanceof HTMLButtonElement || element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement

const disableElement = (el: HTMLElement) => {
  if (snapshots.has(el)) return

  const rootIsControl = isNativeControl(el)
  const snapshot: DisabledSnapshot = {
    root: {
      wasDisabled: rootIsControl ? el.disabled : null,
      hadClass: el.classList.contains('is-disabled'),
      ariaDisabled: el.getAttribute('aria-disabled'),
      tabindex: el.getAttribute('tabindex'),
      pointerEvents: el.style.pointerEvents,
      cursor: el.style.cursor
    },
    controls: []
  }

  if (rootIsControl) {
    el.disabled = true
  }

  el.classList.add('is-disabled')
  el.setAttribute('aria-disabled', 'true')
  el.setAttribute('tabindex', '-1')
  el.style.pointerEvents = 'none'
  el.style.cursor = 'not-allowed'

  el.querySelectorAll('button,input,select,textarea').forEach(control => {
    if (!isNativeControl(control)) return
    snapshot.controls.push({ element: control, wasDisabled: control.disabled })
    control.disabled = true
  })

  snapshots.set(el, snapshot)
}

const restoreElement = (el: HTMLElement) => {
  const snapshot = snapshots.get(el)
  if (!snapshot) return

  if (snapshot.root.wasDisabled !== null && isNativeControl(el)) {
    el.disabled = snapshot.root.wasDisabled
  }
  if (!snapshot.root.hadClass) {
    el.classList.remove('is-disabled')
  }
  if (snapshot.root.ariaDisabled === null) {
    el.removeAttribute('aria-disabled')
  } else {
    el.setAttribute('aria-disabled', snapshot.root.ariaDisabled)
  }
  if (snapshot.root.tabindex === null) {
    el.removeAttribute('tabindex')
  } else {
    el.setAttribute('tabindex', snapshot.root.tabindex)
  }
  el.style.pointerEvents = snapshot.root.pointerEvents
  el.style.cursor = snapshot.root.cursor

  snapshot.controls.forEach(({ element, wasDisabled }) => {
    if (isNativeControl(element)) {
      element.disabled = wasDisabled
    }
  })

  snapshots.delete(el)
}

const evaluate = (el: HTMLElement, binding: DirectiveBinding<string | string[]>) => {
  let allowed = false
  try {
    const { permissionCodeList } = useIamUserStore().getPermissionInfo()
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    allowed = required.some(code => permissionCodeList.includes(code))
  } catch (error) {
    console.error('权限检查失败:', error)
  }

  if (allowed) {
    restoreElement(el)
  } else {
    disableElement(el)
  }
}

export const permissionDirective = (app: App) => {
  app.directive('hasPermission', {
    mounted: (el, binding) => evaluate(el, binding),
    updated: (el, binding) => evaluate(el, binding)
  } as Directive<HTMLElement, string | string[]>)
}
