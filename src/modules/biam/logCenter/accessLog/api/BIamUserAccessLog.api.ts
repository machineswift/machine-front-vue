import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type {
  BIamUserAccessLogQueryPageRequestVo,
  BIamUserAccessLogExpandPageResponse,
  BIamUserAccessLogDetailResponseVo,
  BIamUserAccessLogDeleteRequestVo
} from '@/modules/biam/logCenter/accessLog/type/IamUserAccessLog.type'

// 清理指定时间之前的日志
const deleteLog = async (params: BIamUserAccessLogDeleteRequestVo): Promise<number> => {
  return request.post<number>(iamApi('iam/biam/user_access_log/delete'), params)
}

// 详情
const detail = async (params: IdRequest): Promise<BIamUserAccessLogDetailResponseVo> => {
  return request.post<BIamUserAccessLogDetailResponseVo>(iamApi('iam/biam/user_access_log/detail'), params)
}

// 分页查询
const pageExpand = async (params: BIamUserAccessLogQueryPageRequestVo): Promise<BIamUserAccessLogExpandPageResponse> => {
  return request.post<BIamUserAccessLogExpandPageResponse>(iamApi('iam/biam/user_access_log/page_expand'), params)
}

export const BIamUserAccessLogApi = {
  deleteLog,
  detail,
  pageExpand
}
