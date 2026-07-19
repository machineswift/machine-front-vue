import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import {
  type DataMaterialCategoryCreateRequestVo,
  type DataMaterialCategoryUpdateRequestVo,
  type DataMaterialCategoryUpdateParentRequestVo,
  type DataMaterialCategoryDetailResponseVo,
  type DataMaterialCategorySimpleTreeResponseVo
} from '../type/DataMaterialCategory.type'

const create = async (params: DataMaterialCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/create', params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/delete', params)
}

const update = async (params: DataMaterialCategoryUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/update', params)
}

const updateParent = async (params: DataMaterialCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/update_parent', params)
}

const detail = async (params: IdRequest): Promise<DataMaterialCategoryDetailResponseVo> => {
  return request.post<DataMaterialCategoryDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/detail', params)
}

const treeSimple = async (): Promise<DataMaterialCategorySimpleTreeResponseVo> => {
  return request.get<DataMaterialCategorySimpleTreeResponseVo>(ADMIN_API_BASE_URL + 'admin/data/file_center/material_category/tree_simple')
}

export const DataMaterialCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple
}
