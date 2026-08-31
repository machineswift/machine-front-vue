import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import { type IamDictionaryEnumRequestVo, type IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'

const detail = async (params: IamDictionaryEnumRequestVo): Promise<IamDictionaryEnumInfoResponse[]> => {
  return request.post<IamDictionaryEnumInfoResponse[]>(IAM_API_BASE_URL + 'iam/dictionary/enum/queryEnumInfo', params)
}

export const IamDictionaryEnumApi = {
  detail
}
