import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import { type IamDictionaryEnumRequestVo, type IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'

const detail = async (params: IamDictionaryEnumRequestVo): Promise<IamDictionaryEnumInfoResponse[]> => {
  return request.post<IamDictionaryEnumInfoResponse[]>(iamApi('iam/dictionary/enum/queryEnumInfo'), params)
}

export const IamDictionaryEnumApi = {
  detail
}
