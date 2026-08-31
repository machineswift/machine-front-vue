import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { BIamUserConfigGetRequestVo, BIamUserConfigSaveRequestVo, BIamUserConfigResponseVo } from '../type/BIamUserConfig.type'

// 查询用户配置
const getByKey = async (params: BIamUserConfigGetRequestVo): Promise<BIamUserConfigResponseVo | null> => {
  return request.post<BIamUserConfigResponseVo | null>(IAM_API_BASE_URL + 'iam/biam/user_config/get_by_key', params)
}

// 保存用户配置
const save = async (params: BIamUserConfigSaveRequestVo): Promise<void> => {
  return request.post<void>(IAM_API_BASE_URL + 'iam/biam/user_config/save', params)
}

export const BIamUserConfigApi = {
  getByKey,
  save
}
