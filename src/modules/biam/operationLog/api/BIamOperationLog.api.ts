import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest } from '@/shared/types/Common.type'
import type { BIamOperationLogQueryPageRequestVo, BIamOperationLogExpandPageResponse, BIamOperationLogDetailResponseVo } from '../type/BIamOperationLog.type'

// 详情
const detail = async (params: IdRequest): Promise<BIamOperationLogDetailResponseVo> => {
  return request.post<BIamOperationLogDetailResponseVo>(IAM_API_BASE_URL + 'iam/biam/operation_log/detail', params)
}

// 分页查询
const pageExpand = async (params: BIamOperationLogQueryPageRequestVo): Promise<BIamOperationLogExpandPageResponse> => {
  return request.post<BIamOperationLogExpandPageResponse>(IAM_API_BASE_URL + 'iam/biam/operation_log/page_expand', params)
}

export const BIamOperationLogApi = {
  detail,
  pageExpand
}
