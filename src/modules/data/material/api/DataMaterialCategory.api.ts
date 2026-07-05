import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import {
  type DataMaterialCategoryCreateRequestVo,
  type DataMaterialCategoryUpdateRequestVo,
  type DataMaterialCategoryUpdateParentRequestVo,
  type DataMaterialCategoryDetailResponseVo,
  type DataMaterialCategorySimpleTreeResponseVo
} from '../type/DataMaterialCategory.type'

const create = async (params: DataMaterialCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/create', params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/delete', params)
}

const update = async (params: DataMaterialCategoryUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/update', params)
}

const updateParent = async (params: DataMaterialCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/update_parent', params)
}

const detail = async (params: IdRequest): Promise<DataMaterialCategoryDetailResponseVo> => {
  return request.post<DataMaterialCategoryDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/detail', params)
}

const treeSimple = async (): Promise<DataMaterialCategorySimpleTreeResponseVo> => {
  return request.get<DataMaterialCategorySimpleTreeResponseVo>(MANAGE_API_BASE_URL + 'manage/data/file_center/material_category/tree_simple')
}

export const DataMaterialCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple
}
