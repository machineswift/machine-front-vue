import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataMaterialUploadParams,
  DataMaterialCreateRequestVo,
  DataMaterialUpdateRequestVo,
  DataMaterialUpdateCategoryRequestVo,
  DataMaterialQueryPageRequestVo,
  DataMaterialDetailResponseVo,
  DataMaterialExpandPageResponse
} from '../type/DataMaterial.type'

const upload = async (params: DataMaterialUploadParams): Promise<IdResponse> => {
  return request.upload<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/material/upload', params.file, {
    storageType: params.storageType,
    materIalType: params.materIalType
  })
}

const create = async (params: DataMaterialCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/material/create', params, { timeout: 1800000 })
}

const update = async (params: DataMaterialUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/file_center/material/update', params, { timeout: 1800000 })
}

const updateCategory = async (params: DataMaterialUpdateCategoryRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/file_center/material/update_category', params)
}

const detail = async (params: IdRequest): Promise<DataMaterialDetailResponseVo> => {
  return request.post<DataMaterialDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/material/detail', params)
}

const pageExpand = async (params: DataMaterialQueryPageRequestVo): Promise<DataMaterialExpandPageResponse> => {
  return request.post<DataMaterialExpandPageResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/material/page_expand', params)
}

export const DataMaterialApi = {
  upload,
  create,
  update,
  updateCategory,
  detail,
  pageExpand
}
