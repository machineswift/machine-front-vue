import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
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
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/area/create', params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/area/delete', params)
}

const update = async (params: DataAreaUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/area/update', params)
}

const updateParent = async (params: DataAreaUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/area/update_parent', params)
}

const detail = async (params: IdRequest): Promise<DataAreaDetailResponseVo> => {
  return request.post<DataAreaDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/area/detail', params)
}

const treeSimple = async (params: DataAreaTreeRequestVo): Promise<DataAreaTreeSimpleResponseVo> => {
  return request.post<DataAreaTreeSimpleResponseVo>(MANAGE_API_BASE_URL + 'manage/data/area/tree_simple', params)
}

const treeExpand = async (params: DataAreaTreeRequestVo): Promise<DataAreaExpandTreeResponseVo> => {
  return request.post<DataAreaExpandTreeResponseVo>(MANAGE_API_BASE_URL + 'manage/data/area/tree_expand', params)
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
