import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type { QueryDownloadDetailResponseVo, DataDownloadPageRequestVo, DataDataDownloadPageResponse } from '@/modules/data/download/type/DataDownload.type'

// 创建
const retry = async (params: IdResponse): Promise<void> => {
  return request.post<void>(MANAGE_API_BASE_URL + 'manage/data/download/retry', params)
}

// 详情
const detail = async (params: IdRequest): Promise<QueryDownloadDetailResponseVo> => {
  return request.post<QueryDownloadDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/download/detail', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: DataDownloadPageRequestVo): Promise<DataDataDownloadPageResponse> => {
  return request.post<DataDataDownloadPageResponse>(MANAGE_API_BASE_URL + 'manage/data/download/page_expand', params)
}

export const DataDownloadApi = {
  retry,
  detail,
  pageExpand
}
