import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import {
  type DataAttachmentCategoryCreateRequestVo,
  type DataAttachmentCategoryUpdateRequestVo,
  type DataAttachmentCategoryUpdateParentRequestVo,
  type DataAttachmentCategoryDetailResponseVo,
  type DataAttachmentCategorySimpleTreeResponseVo
} from '../type/DataAttachmentCategory.type'

const create = async (params: DataAttachmentCategoryCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/data/attachment_category/create', params)
}

const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/attachment_category/delete', params)
}

const update = async (params: DataAttachmentCategoryUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/attachment_category/update', params)
}

const updateParent = async (params: DataAttachmentCategoryUpdateParentRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/data/attachment_category/update_parent', params)
}

const detail = async (params: IdRequest): Promise<DataAttachmentCategoryDetailResponseVo> => {
  return request.post<DataAttachmentCategoryDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/data/attachment_category/detail', params)
}

const treeSimple = async (): Promise<DataAttachmentCategorySimpleTreeResponseVo> => {
  return request.get<DataAttachmentCategorySimpleTreeResponseVo>(MANAGE_API_BASE_URL + 'manage/data/attachment_category/tree_simple')
}

export const DataAttachmentCategoryApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple
}
