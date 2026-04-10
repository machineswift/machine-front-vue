import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  DataMaterialCreateRequestVo,
  DataMaterialUpdateRequestVo,
  DataMaterialUpdateCategoryRequestVo,
  DataMaterialQueryPageRequestVo,
  DataMaterialDetailResponseVo,
  DataMaterialExpandPageResponse
} from '../type/DataMaterial.type'

const MATERIAL_BASE = MANAGE_API_BASE_URL + 'manage/data/file/material'

const create = async (params: DataMaterialCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MATERIAL_BASE + '/create', params)
}

const update = async (params: DataMaterialUpdateRequestVo): Promise<void> => {
  return request.post(MATERIAL_BASE + '/update', params)
}

const updateCategory = async (params: DataMaterialUpdateCategoryRequestVo): Promise<void> => {
  return request.post(MATERIAL_BASE + '/update_category', params)
}

const detail = async (params: IdRequest): Promise<DataMaterialDetailResponseVo> => {
  return request.post<DataMaterialDetailResponseVo>(MATERIAL_BASE + '/detail', params)
}

const pageExpand = async (params: DataMaterialQueryPageRequestVo): Promise<DataMaterialExpandPageResponse> => {
  return request.post<DataMaterialExpandPageResponse>(MATERIAL_BASE + '/page_expand', params)
}

export const DataMaterialApi = {
  create,
  update,
  updateCategory,
  detail,
  pageExpand
}
