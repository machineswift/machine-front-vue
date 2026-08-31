import request from '@/shared/utils/Request.util'
import { IAM_API_BASE_URL } from '@/shared/constants/Common.constant'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamPermissionCreateRequestVo,
  BIamPermissionUpdateRequestVo,
  BIamPermissionUpdateParentRequestVo,
  BIamPermissionDetailResponseVo,
  BIamPermissionTreeSimpleResponseVo,
  BIamPermissionTreeExpandResponseVo
} from '@/modules/biam/permission/type/BIamPermission.type'

// 创建权限
const create = async (params: BIamPermissionCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/biam/permission/create', params)
}

// 删除权限
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/permission/delete', params)
}

// 修改权限
const update = async (params: BIamPermissionUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/permission/update', params)
}

// 修改父权限
const updateParent = async (params: BIamPermissionUpdateParentRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/biam/permission/update_parent', params)
}

// 权限详情
const detail = async (params: IdRequest): Promise<BIamPermissionDetailResponseVo> => {
  return request.post<BIamPermissionDetailResponseVo>(IAM_API_BASE_URL + 'iam/biam/permission/detail', params)
}

// 权限树(应用于组件弹窗)
const treeSimple = async (params: IdRequest): Promise<BIamPermissionTreeSimpleResponseVo> => {
  return request.post<BIamPermissionTreeSimpleResponseVo>(IAM_API_BASE_URL + 'iam/biam/permission/tree_simple', params)
}

// 权限树(应用于角色管理菜单)
const treeExpand = async (params: IdRequest): Promise<BIamPermissionTreeExpandResponseVo> => {
  return request.post<BIamPermissionTreeExpandResponseVo>(IAM_API_BASE_URL + 'iam/biam/permission/tree_expand', params)
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
