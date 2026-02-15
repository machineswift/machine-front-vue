import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataMaterialUploadParams,
  DataMaterialCreateRequestVo,
  DataMaterialUpdateRequestVo,
  DataMaterialQueryPageRequestVo,
  DataMaterialDetailResponseVo,
  DataMaterialUrlResponseVo,
  DataMaterialExpandPageResponse,
  DataMaterialUploadImageParams
} from '../type/DataMaterial.type'

const upload = async (params: DataMaterialUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/material/upload', params.file, {
    materIalType: params.materIalType
  })
}

const uploadImage = async (params: DataMaterialUploadImageParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/material/upload_image', params.file, {
    thumbnailWeight: params.thumbnailWeight,
    thumbnailHeight: params.thumbnailHeight,
    materIalType: params.materIalType
  })
}

const create = async (params: DataMaterialCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file/material/create', params)
}

const update = async (params: DataMaterialUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/file/material/update', params)
}

const getUrl = async (materialId: string, expireSecond?: number): Promise<DataMaterialUrlResponseVo> => {
  return request.get<DataMaterialUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/material/get_url', {
    materialId,
    expireSecond
  })
}

const getThumbnailUrl = async (materialId: string, expireSecond?: number): Promise<DataMaterialUrlResponseVo> => {
  return request.get<DataMaterialUrlResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/material/get_thumbnail_url', {
    materialId,
    expireSecond
  })
}

const detail = async (params: IdRequest): Promise<DataMaterialDetailResponseVo> => {
  return request.post<DataMaterialDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file/material/detail', params)
}

const pageExpand = async (params: DataMaterialQueryPageRequestVo): Promise<DataMaterialExpandPageResponse> => {
  return request.post<DataMaterialExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/data/file/material/page_expand', params)
}

export const DataMaterialApi = {
  upload,
  uploadImage,
  getUrl,
  getThumbnailUrl,
  create,
  update,
  detail,
  pageExpand
}
