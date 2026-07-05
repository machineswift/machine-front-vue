import request from '@/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest } from '@/common/types/Common.type'
import type { IamUserLoginLogQueryPageRequestVo, IamUserLoginLogExpandPageResponse, IamUserLoginLogDetailResponseVo } from '../type/IamUserLoginLog.type'

// 详情
const detail = async (params: IdRequest): Promise<IamUserLoginLogDetailResponseVo> => {
  return request.post<IamUserLoginLogExpandPageResponse>(IAM_API_BASE_URL + 'iam/user_login_log/detail', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: IamUserLoginLogQueryPageRequestVo): Promise<IamUserLoginLogExpandPageResponse> => {
  return request.post<IamUserLoginLogExpandPageResponse>(IAM_API_BASE_URL + 'iam/user_login_log/page_expand', params)
}

export const IamUserLoginLogApi = {
  detail,
  pageExpand
}
