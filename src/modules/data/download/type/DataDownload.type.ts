import type { PageRequest, PageResponse } from '@/modules/common/types/Common.type'

/** 文件类型枚举中文（与后端 DataFileTypeEnum 一致，用于展示） */
export const DATA_FILE_TYPE_LABEL_MAP: Record<string, string> = {
  IMAGE: '图片',
  VIDEO: '视频',
  AUDIO: '音频',
  DOCUMENT: '文档',
  SPREADSHEET: '电子表格',
  PRESENTATION: '演示文稿',
  ARCHIVE: '压缩文件',
  EXECUTABLE: '可执行文件',
  CODE: '源代码',
  CONFIG: '配置文件',
  FONT: '字体文件',
  MODEL_3D: '3D模型',
  CAD: 'CAD文件',
  E_BOOK: '电子书',
  DATABASE: '数据库',
  LOG: '日志文件',
  SYSTEM: '系统文件',
  TEMPORARY: '临时文件',
  UNKNOWN: '未知类型'
}

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
  failCause?: string
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
}

export type DataDataDownloadPageResponse = PageResponse<DataDownloadListResponseVo>
