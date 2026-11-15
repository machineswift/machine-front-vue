import request from '@/shared/utils/Request.util'
import { adminApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  CrmMemberCreateRequestVo,
  CrmMemberUpdateRequestVo,
  CrmMemberDetailResponseVo,
  CrmMemberQueryPageRequestVo,
  CrmMemberSimplePageResponse,
  CrmMemberExpandPageResponse
} from '../type/CrmMember.type'

// 创建会员
const create = async (params: CrmMemberCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(adminApi('admin/crm/member/create'), params)
}

// 删除会员
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(adminApi('admin/crm/member/delete'), params)
}

// 修改会员
const update = async (params: CrmMemberUpdateRequestVo): Promise<void> => {
  return request.post(adminApi('admin/crm/member/update'), params)
}

// 会员详情
const detail = async (params: IdRequest): Promise<CrmMemberDetailResponseVo> => {
  return request.post<CrmMemberDetailResponseVo>(adminApi('admin/crm/member/detail'), params)
}

// 分页查询会员(应用于组件弹窗)
const pageSimple = async (params: CrmMemberQueryPageRequestVo): Promise<CrmMemberSimplePageResponse> => {
  return request.post<CrmMemberSimplePageResponse>(adminApi('admin/crm/member/page_simple'), params)
}

// 分页查询会员(应用于会员管理菜单)
const pageExpand = async (params: CrmMemberQueryPageRequestVo): Promise<CrmMemberExpandPageResponse> => {
  return request.post<CrmMemberExpandPageResponse>(adminApi('admin/crm/member/page_expand'), params)
}

export const CrmMemberApi = {
  create,
  destroy,
  update,
  detail,
  pageSimple,
  pageExpand
}
