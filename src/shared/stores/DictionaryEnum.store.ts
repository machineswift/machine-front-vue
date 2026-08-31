import { ref } from 'vue'
import { defineStore } from 'pinia'
import { IamDictionaryEnumApi } from '@/shared/api/DictionaryEnum.api'
import type { IamDictionaryEnumRequestVo, IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'

export const useDictionaryEnumStore = defineStore('machine:iam_dictionary_enum', () => {
  const enumCache = ref<Map<string, IamDictionaryEnumInfoResponse[]>>(new Map())

  const pendingRequests = new Map<string, Promise<IamDictionaryEnumInfoResponse[]>>()

  let clearEpoch = 0

  const getEnumDataAsync = async (enumName: string): Promise<IamDictionaryEnumInfoResponse[]> => {
    const cached = enumCache.value.get(enumName)
    if (cached && cached.length > 0) {
      return cached
    }

    const pending = pendingRequests.get(enumName)
    if (pending) {
      return pending
    }

    const epochAtStart = clearEpoch
    const params: IamDictionaryEnumRequestVo = { enumName }
    const request = IamDictionaryEnumApi.detail(params)
      .then(data => {
        if (data.length > 0 && clearEpoch === epochAtStart) {
          enumCache.value.set(enumName, data)
        }
        return data
      })
      .catch(error => {
        console.warn(`[dictionary] 加载枚举 ${enumName} 失败`, error)
        return []
      })
      .finally(() => {
        if (pendingRequests.get(enumName) === request) {
          pendingRequests.delete(enumName)
        }
      })

    pendingRequests.set(enumName, request)
    return request
  }

  const preloadEnums = async (enumNames: string[]): Promise<Record<string, IamDictionaryEnumInfoResponse[]>> => {
    const uniqueNames = Array.from(new Set(enumNames.filter((name): name is string => Boolean(name))))
    const results = await Promise.all(uniqueNames.map(name => getEnumDataAsync(name)))
    const record: Record<string, IamDictionaryEnumInfoResponse[]> = {}
    uniqueNames.forEach((name, index) => {
      record[name] = results[index]
    })
    return record
  }

  const getEnumItemByCodeAsync = async (enumName: string, code: string): Promise<IamDictionaryEnumInfoResponse | undefined> => {
    const enumList = await getEnumDataAsync(enumName)
    return enumList.find(item => item.code === code)
  }

  const autoRequestedEnums = new Set<string>()

  const getEnumLabel = (enumName: string, code?: string | null, emptyText = ''): string => {
    if (!code) return emptyText
    const item = enumCache.value.get(enumName)?.find(enumItem => enumItem.code === code)
    if (item) return item.message
    if (!autoRequestedEnums.has(enumName)) {
      autoRequestedEnums.add(enumName)
      getEnumDataAsync(enumName)
    }
    return code
  }

  const getEnumLabelAsync = async (enumName: string, code?: string | null, emptyText = ''): Promise<string> => {
    if (!code) return emptyText
    const item = await getEnumItemByCodeAsync(enumName, code)
    if (!item) {
      console.warn(`[dictionary] 枚举 ${enumName} 中不存在 code=${code}，请检查字典注册或枚举名拼写（已回退显示原始 code）`)
      return code
    }
    return item.message
  }

  const clearEnumCache = (enumName: string): void => {
    enumCache.value.delete(enumName)
    pendingRequests.delete(enumName)
    autoRequestedEnums.delete(enumName)
  }

  const clearAllEnumCache = (): void => {
    enumCache.value.clear()
    pendingRequests.clear()
    autoRequestedEnums.clear()
    clearEpoch++
  }

  return {
    // State
    enumCache,

    // Actions
    getEnumDataAsync,
    preloadEnums,
    getEnumItemByCodeAsync,
    getEnumLabel,
    getEnumLabelAsync,
    clearEnumCache,
    clearAllEnumCache
  }
})

export default useDictionaryEnumStore
