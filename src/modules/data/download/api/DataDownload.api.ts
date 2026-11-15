import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type { QueryDownloadDetailResponseVo, DataDownloadPageRequestVo, DataDataDownloadPageResponse } from '@/modules/data/download/type/DataDownload.type'

// 创建
const retry = async (params: IdResponse): Promise<void> => {
  return request.post<void>(adminApi('admin/data/file_center/download/retry'), params)
}

// 详情
const detail = async (params: IdRequest): Promise<QueryDownloadDetailResponseVo> => {
  return request.post<QueryDownloadDetailResponseVo>(adminApi('admin/data/file_center/download/detail'), params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: DataDownloadPageRequestVo): Promise<DataDataDownloadPageResponse> => {
  return request.post<DataDataDownloadPageResponse>(adminApi('admin/data/file_center/download/page_expand'), params)
}

export const DataDownloadApi = {
  retry,
  detail,
  pageExpand
}
