import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type { BIamUserLoginLogQueryPageRequestVo, BIamUserLoginLogExpandPageResponse, BIamUserLoginLogDetailResponseVo } from '../type/IamUserLoginLog.type'

// 详情
const detail = async (params: IdRequest): Promise<BIamUserLoginLogDetailResponseVo> => {
  return request.post<BIamUserLoginLogDetailResponseVo>(iamApi('iam/biam/user_login_log/detail'), params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: BIamUserLoginLogQueryPageRequestVo): Promise<BIamUserLoginLogExpandPageResponse> => {
  return request.post<BIamUserLoginLogExpandPageResponse>(iamApi('iam/biam/user_login_log/page_expand'), params)
}

export const BIamUserLoginLogApi = {
  detail,
  pageExpand
}
