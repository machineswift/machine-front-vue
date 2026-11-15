import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamPermissionCreateRequestVo,
  BIamPermissionUpdateRequestVo,
  BIamPermissionUpdateParentRequestVo,
  BIamPermissionDetailResponseVo,
  BIamPermissionTreeSimpleResponseVo,
  BIamPermissionTreeExpandResponseVo
} from '@/modules/biam/accessControl/permission/type/BIamPermission.type'

// 创建权限
const create = async (params: BIamPermissionCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/permission/create'), params)
}

// 删除权限
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/permission/delete'), params)
}

// 修改权限
const update = async (params: BIamPermissionUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/permission/update'), params)
}

// 修改父权限
const updateParent = async (params: BIamPermissionUpdateParentRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/permission/update_parent'), params)
}

// 权限详情
const detail = async (params: IdRequest): Promise<BIamPermissionDetailResponseVo> => {
  return request.post<BIamPermissionDetailResponseVo>(iamApi('iam/biam/permission/detail'), params)
}

// 权限树(应用于组件弹窗)
const treeSimple = async (params: IdRequest): Promise<BIamPermissionTreeSimpleResponseVo> => {
  return request.post<BIamPermissionTreeSimpleResponseVo>(iamApi('iam/biam/permission/tree_simple'), params)
}

// 权限树(应用于角色管理菜单)
const treeExpand = async (params: IdRequest): Promise<BIamPermissionTreeExpandResponseVo> => {
  return request.post<BIamPermissionTreeExpandResponseVo>(iamApi('iam/biam/permission/tree_expand'), params)
}

export const BIamPermissionApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand
}
