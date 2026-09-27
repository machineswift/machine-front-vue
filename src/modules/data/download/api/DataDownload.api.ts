import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type { QueryDownloadDetailResponseVo, DataDownloadPageRequestVo, DataDataDownloadPageResponse } from '@/modules/data/download/type/DataDownload.type'

// 创建
const retry = async (params: IdResponse): Promise<void> => {
  return request.post<void>(ADMIN_API_BASE_URL + 'admin/data/file_center/download/retry', params)
}

// 详情
const detail = async (params: IdRequest): Promise<QueryDownloadDetailResponseVo> => {
  return request.post<QueryDownloadDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/download/detail', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: DataDownloadPageRequestVo): Promise<DataDataDownloadPageResponse> => {
  return request.post<DataDataDownloadPageResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/download/page_expand', params)
}

export const DataDownloadApi = {
  retry,
  detail,
  pageExpand
}
