import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataAttachmentUploadParams,
  DataAttachmentQueryPageRequestVo,
  DataAttachmentDetailResponseVo,
  DataAttachmentUrlResponseVo,
  DataAttachmentUrlsResponseVo,
  DataAttachmentExpandPageResponse,
  DataAttachmentVersionResponseVo
} from '../type/DataAttachment.type'

/** 上传附件，返回 attachmentId */
const upload = async (params: DataAttachmentUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(adminApi('admin/data/file_center/attachment/upload'), params.file, undefined, {
    onUploadProgress: event => {
      if (!params.onProgress || !event.total) return
      params.onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)))
    }
  })
}

const thumbnail = async (attachmentId: string, expireSecond?: number): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(adminApi('admin/data/file_center/attachment/thumbnail'), {
    attachmentId,
    expireSecond
  })
}

/** 缩略图(批量)，返回该附件下所有文件的缩略图地址 */
const batchThumbnail = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(adminApi('admin/data/file_center/attachment/batch_thumbnail'), {
    attachmentId
  })
}

/** 预览 */
const preview = async (attachmentId: string): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(adminApi('admin/data/file_center/attachment/preview'), {
    attachmentId
  })
}

/** 预览(批量)，返回该附件下所有文件的预览地址 */
const batchPreview = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(adminApi('admin/data/file_center/attachment/batch_preview'), {
    attachmentId
  })
}

/** 下载 */
const download = async (attachmentId: string): Promise<DataAttachmentUrlResponseVo> => {
  return request.get<DataAttachmentUrlResponseVo>(adminApi('admin/data/file_center/attachment/download'), {
    attachmentId
  })
}

/** 下载(批量)，返回该附件下所有文件的下载地址 */
const batchDownload = async (attachmentId: string): Promise<DataAttachmentUrlsResponseVo> => {
  return request.get<DataAttachmentUrlsResponseVo>(adminApi('admin/data/file_center/attachment/batch_download'), {
    attachmentId
  })
}

/** 缩略图（按附件ID集合批量获取），返回 attachmentId -> url */
const mapThumbnail = async (attachmentIds: string[]): Promise<Record<string, string>> => {
  return request.post<Record<string, string>>(adminApi('admin/data/file_center/attachment/map_thumbnail'), {
    idSet: attachmentIds
  })
}

/** 版本列表 */
const versionList = async (attachmentId: string): Promise<DataAttachmentVersionResponseVo[]> => {
  return request.post<DataAttachmentVersionResponseVo[]>(adminApi('admin/data/file_center/attachment/version_list'), {
    id: attachmentId
  })
}

const detail = async (params: IdRequest): Promise<DataAttachmentDetailResponseVo> => {
  return request.post<DataAttachmentDetailResponseVo>(adminApi('admin/data/file_center/attachment/detail'), params)
}

const pageExpand = async (params: DataAttachmentQueryPageRequestVo): Promise<DataAttachmentExpandPageResponse> => {
  return request.post<DataAttachmentExpandPageResponse>(adminApi('admin/data/file_center/attachment/page_expand'), params)
}

export const DataAttachmentApi = {
  upload,
  thumbnail,
  batchThumbnail,
  preview,
  batchPreview,
  download,
  batchDownload,
  mapThumbnail,
  versionList,
  detail,
  pageExpand
}
