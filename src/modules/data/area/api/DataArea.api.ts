import request from '@/shared/utils/Request.util'
import { ADMIN_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import {
  type DataAreaCreateRequestVo,
  type DataAreaUpdateRequestVo,
  type DataAreaUpdateParentRequestVo,
  type DataAreaDetailResponseVo,
  type DataAreaTreeSimpleResponseVo,
  type DataAreaExpandTreeResponseVo,
  type DataAreaTreeRequestVo
} from '../type/DataArea.type'

const create = async (params: DataAreaCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(ADMIN_API_BASE_URL + 'admin/data/area/create', params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/area/delete', params)
}

const update = async (params: DataAreaUpdateRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/area/update', params)
}

const updateParent = async (params: DataAreaUpdateParentRequestVo): Promise<void> => {
  return request.post(ADMIN_API_BASE_URL + 'admin/data/area/update_parent', params)
}

const detail = async (params: IdRequest): Promise<DataAreaDetailResponseVo> => {
  return request.post<DataAreaDetailResponseVo>(ADMIN_API_BASE_URL + 'admin/data/area/detail', params)
}

const treeSimple = async (params: DataAreaTreeRequestVo): Promise<DataAreaTreeSimpleResponseVo> => {
  return request.post<DataAreaTreeSimpleResponseVo>(ADMIN_API_BASE_URL + 'admin/data/area/tree_simple', params)
}

const treeExpand = async (params: DataAreaTreeRequestVo): Promise<DataAreaExpandTreeResponseVo> => {
  return request.post<DataAreaExpandTreeResponseVo>(ADMIN_API_BASE_URL + 'admin/data/area/tree_expand', params)
}

export const DataAreaApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand
}
