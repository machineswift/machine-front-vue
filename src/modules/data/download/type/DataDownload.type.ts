import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'
import type { DataAttachmentDto } from '@/modules/data/attachment/type/DataAttachment.type'

export interface QueryDownloadDetailResponseVo {
  id: string
  status: string
  attachment: DataAttachmentDto
  failCause: string
  createBy?: string
  createTime: number
  updateName?: string
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
  attachment: DataAttachmentDto
  failCause: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type DataDataDownloadPageResponse = PageResponse<DataDownloadListResponseVo>
