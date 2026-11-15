import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
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
  return request.post<IdResponse>(adminApi('admin/data/area/create'), params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/data/area/delete'), params)
}

const update = async (params: DataAreaUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/area/update'), params)
}

const updateParent = async (params: DataAreaUpdateParentRequestVo): Promise<void> => {
  return request.post(adminApi('admin/data/area/update_parent'), params)
}

const detail = async (params: IdRequest): Promise<DataAreaDetailResponseVo> => {
  return request.post<DataAreaDetailResponseVo>(adminApi('admin/data/area/detail'), params)
}

const treeSimple = async (params: DataAreaTreeRequestVo): Promise<DataAreaTreeSimpleResponseVo> => {
  return request.post<DataAreaTreeSimpleResponseVo>(adminApi('admin/data/area/tree_simple'), params)
}

const treeExpand = async (params: DataAreaTreeRequestVo): Promise<DataAreaExpandTreeResponseVo> => {
  return request.post<DataAreaExpandTreeResponseVo>(adminApi('admin/data/area/tree_expand'), params)
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
