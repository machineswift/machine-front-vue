import { ref } from 'vue'
import { defineStore } from 'pinia'
import { IamDictionaryEnumApi } from '@/modules/iam/dictionary/api/IamDictionaryEmum.api'
import type { IamDictionaryEnumRequestVo, IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'

export const useDictionaryEnumStore = defineStore(
  'machine:iam_dictionary_enum',
  () => {
    // State - 使用ref包装Map
    const enumCache = ref<Map<string, IamDictionaryEnumInfoResponse[]>>(new Map())

    // Actions
    const getEnumDataSync = (enumName: string): IamDictionaryEnumInfoResponse[] => {
      return enumCache.value.get(enumName) || []
    }

    const getEnumDataAsync = async (enumName: string): Promise<IamDictionaryEnumInfoResponse[]> => {
      if (!enumCache.value.has(enumName)) {
        const params: IamDictionaryEnumRequestVo = { enumName }
        const data = await IamDictionaryEnumApi.detail(params)
        enumCache.value.set(enumName, data)
        return data
      }
      return enumCache.value.get(enumName) || []
    }

    const getEnumItemByCodeSync = (enumName: string, code: string): IamDictionaryEnumInfoResponse | undefined => {
      const cachedData = enumCache.value.get(enumName)
      return cachedData?.find(item => item.code === code)
    }

    const getEnumItemByCodeAsync = async (enumName: string, code: string): Promise<IamDictionaryEnumInfoResponse | undefined> => {
      const enumList = await getEnumDataAsync(enumName)
      return enumList.find(item => item.code === code)
    }

    const clearEnumCache = (enumName: string): void => {
      enumCache.value.delete(enumName)
    }

    const clearAllEnumCache = (): void => {
      enumCache.value.clear()
    }

    return {
      // State
      enumCache,

      // Actions
      getEnumDataSync,
      getEnumDataAsync,
      getEnumItemByCodeSync,
      getEnumItemByCodeAsync,
      clearEnumCache,
      clearAllEnumCache
    }
  },
  {
    persist: {
      storage: sessionStorage,
      serializer: {
        serialize: state => {
          return JSON.stringify(Array.from(state.enumCache.entries()))
        },
        deserialize: str => {
          return { enumCache: new Map(JSON.parse(str)) }
        }
      }
    }
  }
)

export default useDictionaryEnumStore
