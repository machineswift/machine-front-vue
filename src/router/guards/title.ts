import type { RouteLocationNormalized } from 'vue-router'
import setting from '@/setting'

export const applyDocumentTitle = (to: RouteLocationNormalized) => {
  document.title = `${setting.title}-${to.meta.title || ''}`
}
