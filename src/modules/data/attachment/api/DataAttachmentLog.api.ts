import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest } from '@/shared/types/Common.type'
import type { DataAttachmentLogQueryPageRequestVo, DataAttachmentLogExpandPageResponse, DataAttachmentLogDetailResponseVo } from '../type/DataAttachment.type'

// 详情
const detail = async (params: IdRequest): Promise<DataAttachmentLogDetailResponseVo> => {
  return request.post<DataAttachmentLogDetailResponseVo>(adminApi('admin/data/file_center/attachment_log/detail'), params)
}

// 分页查询
const pageExpand = async (params: DataAttachmentLogQueryPageRequestVo): Promise<DataAttachmentLogExpandPageResponse> => {
  return request.post<DataAttachmentLogExpandPageResponse>(adminApi('admin/data/file_center/attachment_log/page_expand'), params)
}

export const DataAttachmentLogApi = {
  detail,
  pageExpand
}
