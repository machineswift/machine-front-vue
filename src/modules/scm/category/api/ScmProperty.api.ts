import request from '@/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse, PageResponse } from '@/common/types/Common.type'
import type {
  ScmPropertyCreateRequestVo,
  ScmPropertyUpdateRequestVo,
  ScmPropertyQueryPageRequestVo,
  ScmPropertyDetailResponseVo,
  ScmPropertySimpleListResponseVo,
  ScmPropertyListResponseVo
} from '@/modules/scm/category/type/ScmProperty.type'

// 创建属性
const create = async (params: ScmPropertyCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(MANAGE_API_BASE_URL + 'manage/scm/property/create', params)
}

// 修改属性
const update = async (params: ScmPropertyUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/property/update', params)
}

// 删除属性
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/scm/property/delete', params)
}

// 查询属性详情
const detail = async (params: IdRequest): Promise<ScmPropertyDetailResponseVo> => {
  return request.post<ScmPropertyDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/scm/property/detail', params)
}

// 分页查询属性（应用于组件弹窗/属性选择器）
const pageSimple = async (params: ScmPropertyQueryPageRequestVo): Promise<PageResponse<ScmPropertySimpleListResponseVo>> => {
  return request.post<PageResponse<ScmPropertySimpleListResponseVo>>(MANAGE_API_BASE_URL + 'manage/scm/property/page_simple', params)
}

// 分页查询属性（应用于属性库管理菜单）
const pageExpand = async (params: ScmPropertyQueryPageRequestVo): Promise<PageResponse<ScmPropertyListResponseVo>> => {
  return request.post<PageResponse<ScmPropertyListResponseVo>>(MANAGE_API_BASE_URL + 'manage/scm/property/page_expand', params)
}

export const ScmPropertyApi = {
  create,
  update,
  destroy,
  detail,
  pageSimple,
  pageExpand
}
