import type { PageRequest, PageResponse } from '@/shared/types/Common.type'

export interface QueryDownloadDetailResponseVo {
  id: string
  status: string
  module?: string
  entity?: string
  attachmentId?: string
  fileType?: string
  attachmentOriginalName?: string
  attachmentSize?: number
  failCause?: string
  createBy?: string
  createTime: number
  updateBy?: string
  updateTime: number
}

// 分页查询接口请求参数
export interface DataDownloadPageRequestVo extends PageRequest {
  fileName?: string
  statusList?: string[]
  createStartTime?: number
  createEndTime?: number
}

export interface DataDownloadListResponseVo {
  id: string
  status: string
  module?: string
  entity?: string
  attachmentId?: string
  fileType?: string
  attachmentOriginalName?: string
  attachmentSize?: number
  expireTime?: number
  failCause?: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type DataDataDownloadPageResponse = PageResponse<DataDownloadListResponseVo>
