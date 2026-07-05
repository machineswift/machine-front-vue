import request from '@/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type {
  IamPermissionCreateRequestVo,
  IamPermissionUpdateRequestVo,
  IamPermissionUpdateParentRequestVo,
  IamPermissionDetailResponseVo,
  IamPermissionTreeSimpleResponseVo,
  IamPermissionTreeExpandResponseVo
} from '@/modules/iam/permission/type/IamPermission.type'

// 创建权限
const create = async (params: IamPermissionCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/permission/create', params)
}

// 删除权限
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/permission/delete', params)
}

// 修改权限
const update = async (params: IamPermissionUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/permission/update', params)
}

// 修改父权限
const updateParent = async (params: IamPermissionUpdateParentRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/permission/update_parent', params)
}

// 权限详情
const detail = async (params: IdRequest): Promise<IamPermissionDetailResponseVo> => {
  return request.post<IamPermissionDetailResponseVo>(IAM_API_BASE_URL + 'iam/permission/detail', params)
}

// 权限树(应用于组件弹窗)
const treeSimple = async (params: IdRequest): Promise<IamPermissionTreeSimpleResponseVo> => {
  return request.post<IamPermissionTreeSimpleResponseVo>(IAM_API_BASE_URL + 'iam/permission/tree_simple', params)
}

// 权限树(应用于角色管理菜单)
const treeExpand = async (params: IdRequest): Promise<IamPermissionTreeExpandResponseVo> => {
  return request.post<IamPermissionTreeExpandResponseVo>(IAM_API_BASE_URL + 'iam/permission/tree_expand', params)
}

export const IamPermissionApi = {
  create,
  destroy,
  update,
  updateParent,
  detail,
  treeSimple,
  treeExpand
}
