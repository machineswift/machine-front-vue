import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import {
  type BIamOrganizationCreateRequestVo,
  type BIamOrganizationUpdateRequestVo,
  type BIamOrganizationUpdateParentRequestVo,
  type BIamOrganizationDetailResponseVo,
  type BIamOrganizationTreeSimpleResponseVo,
  type BIamOrganizationExpandTreeResponseVo,
  type BIamOrganizationWithShopTreeResponseVo
} from '../type/BIamOrganization.type'

// 创建组织
const create = async (params: BIamOrganizationCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/organization/create'), params)
}

// 删除织
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/organization/delete'), params)
}

// 修改织
const update = async (params: BIamOrganizationUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/organization/update'), params)
}

// 修改父织
const updateParent = async (params: BIamOrganizationUpdateParentRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/organization/update_parent'), params)
}

// 详情
const detail = async (params: IdRequest): Promise<BIamOrganizationDetailResponseVo> => {
  return request.post<BIamOrganizationDetailResponseVo>(iamApi('iam/biam/organization/detail'), params)
}

// 权限树(应用于组件弹窗)
const treeSimple = async (params: { type: string }): Promise<BIamOrganizationTreeSimpleResponseVo> => {
  return request.post<BIamOrganizationTreeSimpleResponseVo>(iamApi('iam/biam/organization/tree_simple'), params)
}

// 权限树(应用于组织管理菜单)
const treeExpand = async (params: { type: string }): Promise<BIamOrganizationExpandTreeResponseVo> => {
  return request.post<BIamOrganizationExpandTreeResponseVo>(iamApi('iam/biam/organization/tree_expand'), params)
}

// 权限树(关联门店信息)
const treeWithShop = async (params: IdRequest): Promise<BIamOrganizationWithShopTreeResponseVo> => {
  return request.post<BIamOrganizationWithShopTreeResponseVo>(iamApi('iam/biam/organization/tree_with_shop'), params)
}

export const BIamOrganizationApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand,
  treeWithShop
}
