import request from '@/modules/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/modules/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/modules/common/types/Common.type'
import {
  type IamOrganizationCreateRequestVo,
  type IamOrganizationUpdateRequestVo,
  type IamOrganizationUpdateParentRequestVo,
  type IamOrganizationDetailResponseVo,
  type IamOrganizationTreeSimpleResponseVo,
  type IamOrganizationExpandTreeResponseVo,
  type IamOrganizationWithShopTreeResponseVo
} from '../type/IamOrganization.type'

// 创建组织
const create = async (params: IamOrganizationCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/organization/create', params)
}

// 删除织
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/organization/delete', params)
}

// 修改织
const update = async (params: IamOrganizationUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/organization/update', params)
}

// 修改父织
const updateParent = async (params: IamOrganizationUpdateParentRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/organization/update_parent', params)
}

// 详情
const detail = async (params: IdRequest): Promise<IamOrganizationDetailResponseVo> => {
  return request.post<IamOrganizationDetailResponseVo>(IAM_API_BASE_URL + 'iam/organization/detail', params)
}

// 权限树(应用于组件弹窗)
const treeSimple = async (params: IdRequest): Promise<IamOrganizationTreeSimpleResponseVo> => {
  return request.post<IamOrganizationTreeSimpleResponseVo>(IAM_API_BASE_URL + 'iam/organization/tree_simple', params)
}

// 权限树(应用于组织管理菜单)
const treeExpand = async (params: IdRequest): Promise<IamOrganizationExpandTreeResponseVo> => {
  return request.post<IamOrganizationExpandTreeResponseVo>(IAM_API_BASE_URL + 'iam/organization/tree_expand', params)
}

// 权限树(关联门店信息)
const treeWithShop = async (params: IdRequest): Promise<IamOrganizationWithShopTreeResponseVo> => {
  return request.post<IamOrganizationWithShopTreeResponseVo>(IAM_API_BASE_URL + 'iam/organization/tree_with_shop', params)
}

export const IamOrganizationApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand,
  treeWithShop
}
