import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  DataBrandCategoryCreateRequestVo,
  DataBrandCategoryDetailResponseVo,
  DataBrandCategorySimpleTreeResponseVo,
  DataBrandCategoryUpdateParentRequestVo,
  DataBrandCategoryUpdateRequestVo
} from '@/modules/data/brand/type/DataBrandCategory.type'

const create = async (params: DataBrandCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/data/brand_category/create'), params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/data/brand_category/delete'), params)
}

const update = async (params: DataBrandCategoryUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/brand_category/update'), params)
}

const updateParent = async (params: DataBrandCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/brand_category/update_parent'), params)
}

const detail = async (params: IdRequest): Promise<DataBrandCategoryDetailResponseVo> => {
  return request.post<DataBrandCategoryDetailResponseVo>(adminApi('admin/data/brand_category/detail'), params)
}

const treeSimple = async (): Promise<DataBrandCategorySimpleTreeResponseVo> => {
  return request.get<DataBrandCategorySimpleTreeResponseVo>(adminApi('admin/data/brand_category/tree_simple'))
}

export const DataBrandCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple
}
