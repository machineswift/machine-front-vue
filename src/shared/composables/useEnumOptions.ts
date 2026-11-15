import { ref } from 'vue'
import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
import type { IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'

/**
 * 枚举选项加载 composable
 *
 * 统一封装「按需加载 + 缓存复用」的枚举选项：
 *
 * - 底层走 DictionaryEnum.store 的缓存 + 并发去重 + 失败隔离，不重复请求
 * - load() 手动触发；已加载过的枚举再次 load 命中 store 缓存，开销极小
 *
 * 用法：
 *   const { options: statusOptions, load: loadStatus } = useEnumOptions(DICT_STATUS)
 *   onMounted(() => { loadStatus() })
 *   // 模板：<el-option v-for="o in statusOptions" :key="o.code" :label="o.message" :value="o.code" />
 */
export const useEnumOptions = (enumName: string) => {
  const enumStore = useDictionaryEnumStore()

  const options = ref<IamDictionaryEnumInfoResponse[]>([])
  const loading = ref(false)

  const load = async (): Promise<IamDictionaryEnumInfoResponse[]> => {
    loading.value = true
    options.value = await enumStore.getEnumDataAsync(enumName)
    loading.value = false
    return options.value
  }

  return {
    options,
    loading,
    load
  }
}

export default useEnumOptions
