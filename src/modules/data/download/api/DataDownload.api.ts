import request, { getBaseUrl } from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import { useIamUserStore } from '@/common/stores/IamUser.store'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type { QueryDownloadDetailResponseVo, DataDownloadPageRequestVo, DataDataDownloadPageResponse } from '@/modules/data/download/type/DataDownload.type'

// 创建
const retry = async (params: IdResponse): Promise<void> => {
  return request.post<void>(MANAGE_API_BASE_URL + 'manage/data/file_center/download/retry', params)
}

// 详情
const detail = async (params: IdRequest): Promise<QueryDownloadDetailResponseVo> => {
  return request.post<QueryDownloadDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file_center/download/detail', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: DataDownloadPageRequestVo): Promise<DataDataDownloadPageResponse> => {
  return request.post<DataDataDownloadPageResponse>(MANAGE_API_BASE_URL + 'manage/data/file_center/download/page_expand', params)
}

// 下载文件 — 后端直连 MinIO 返回文件流，前端用 fetch + Blob 下载，避免页面闪烁
const downloadFile = async (params: IdRequest, fileName: string): Promise<void> => {
  const userStore = useIamUserStore()
  const token = await userStore.getValidToken()
  const fullUrl = `${getBaseUrl()}${MANAGE_API_BASE_URL}manage/data/file_center/download/download_file`

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error('下载失败')
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}

export const DataDownloadApi = {
  retry,
  detail,
  pageExpand,
  downloadFile
}
