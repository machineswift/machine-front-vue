import { ref, watch } from 'vue'

const STORAGE_KEY = 'portal-theme-dark'

/** 从 localStorage 读取主题偏好 */
function loadTheme(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {
    // ignore
  }
  return true // 默认深色
}

const isDark = ref(loadTheme())

/** 将主题 class 同步到 <html> */
function syncHtmlClass(val: boolean) {
  document.documentElement.classList.toggle('portal-dark', val)
  document.documentElement.classList.toggle('portal-light', !val)
}

// 初始化同步
syncHtmlClass(isDark.value)

watch(isDark, val => {
  syncHtmlClass(val)
  try {
    localStorage.setItem(STORAGE_KEY, String(val))
  } catch {
    // ignore
  }
})

export function usePortalTheme() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggle
  }
}
