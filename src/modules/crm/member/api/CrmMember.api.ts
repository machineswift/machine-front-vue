import request from '@/modules/common/utils/Request.util'
import { MANAGE_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import type {
  CrmMemberCreateRequestVo,
  CrmMemberUpdateRequestVo,
  CrmMemberDetailResponseVo,
  CrmMemberQueryPageRequestVo,
  CrmMemberSimplePageResponse,
  CrmMemberExpandPageResponse
} from '../type/CrmMember.type'

// 创建会员
const create = async (params: CrmMemberCreateRequestVo): Promise<IdResponse<string>> => {
  return request.post<IdResponse<string>>(MANAGE_API_BASE_URL + 'manage/crm/member/create', params)
}

// 删除会员
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/crm/member/delete', params)
}

// 修改会员
const update = async (params: CrmMemberUpdateRequestVo): Promise<void> => {
  return request.post(MANAGE_API_BASE_URL + 'manage/crm/member/update', params)
}

// 会员详情
const detail = async (params: IdRequest): Promise<CrmMemberDetailResponseVo> => {
  return request.post<CrmMemberDetailResponseVo>(MANAGE_API_BASE_URL + 'manage/crm/member/detail', params)
}

// 分页查询会员(应用于组件弹窗)
const pageSimple = async (params: CrmMemberQueryPageRequestVo): Promise<CrmMemberSimplePageResponse> => {
  return request.post<CrmMemberSimplePageResponse>(MANAGE_API_BASE_URL + 'manage/crm/member/page_simple', params)
}

// 分页查询会员(应用于会员管理菜单)
const pageExpand = async (params: CrmMemberQueryPageRequestVo): Promise<CrmMemberExpandPageResponse> => {
  return request.post<CrmMemberExpandPageResponse>(MANAGE_API_BASE_URL + 'manage/crm/member/page_expand', params)
}

export const CrmMemberApi = {
  create,
  destroy,
  update,
  detail,
  pageSimple,
  pageExpand
}
