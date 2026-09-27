import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest } from '@/shared/types/Common.type'
import type { DataAttachmentLogQueryPageRequestVo, DataAttachmentLogExpandPageResponse, DataAttachmentLogDetailResponseVo } from '../type/DataAttachment.type'

// 详情
const detail = async (params: IdRequest): Promise<DataAttachmentLogDetailResponseVo> => {
  return request.post<DataAttachmentLogDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment_log/detail', params)
}

// 分页查询
const pageExpand = async (params: DataAttachmentLogQueryPageRequestVo): Promise<DataAttachmentLogExpandPageResponse> => {
  return request.post<DataAttachmentLogExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/attachment_log/page_expand', params)
}

export const DataAttachmentLogApi = {
  detail,
  pageExpand
}
