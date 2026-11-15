import { computed } from 'vue'
import { useIamUserStore } from '@/shared/stores/IamUser.store'

/**
 * 权限判断的组合式入口：模板中用 `v-if="has(code)"`，脚本中用返回值。
 * 权限码只应作为业务键出现在这里，不要再写 DOM 指令式判断。
 */
export function usePermission() {
  const store = useIamUserStore()
  const codeSet = computed(() => new Set(store.permissions.permissionCodeList ?? []))

  const has = (code: string | string[]): boolean => {
    const list = Array.isArray(code) ? code : [code]
    return list.some(item => codeSet.value.has(item))
  }

  return { has, codeSet }
}
