import request from '@/shared/utils/Request.util'
import { iamApi } from '@/shared/api/endpoints'
import type { IdRequest, IdResponse } from '@/shared/types/Common.type'
import type {
  BIamRoleCreateRequestVo,
  BIamRoleUpdateRequestVo,
  BIamRoleUpdateStatusRequestVo,
  BIamRoleUpdatePermissionRequestVo,
  BIamRoleDetailResponseVo,
  BIamRoleQueryPageRequestVo,
  BIamRoleSimplePageResponse,
  BIamRoleExpandPageResponse
} from '../type/BIamRole.type'

// 创建
const create = async (params: BIamRoleCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(iamApi('iam/biam/role/create'), params)
}

// 删除
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(iamApi('iam/biam/role/delete'), params)
}

// 修改
const update = async (params: BIamRoleUpdateRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/role/update'), params)
}

// 修改状态
const updateStatus = async (params: BIamRoleUpdateStatusRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/role/update_status'), params)
}

// 修改角色权限
const updatePermission = async (params: BIamRoleUpdatePermissionRequestVo): Promise<void> => {
  return request.post(iamApi('iam/biam/role/update_permission'), params)
}

// 详情
const detail = async (params: IdRequest): Promise<BIamRoleDetailResponseVo> => {
  return request.post<BIamRoleDetailResponseVo>(iamApi('iam/biam/role/detail'), params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: BIamRoleQueryPageRequestVo): Promise<BIamRoleSimplePageResponse> => {
  return request.post<BIamRoleSimplePageResponse>(iamApi('iam/biam/role/page_simple'), params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: BIamRoleQueryPageRequestVo): Promise<BIamRoleExpandPageResponse> => {
  return request.post<BIamRoleExpandPageResponse>(iamApi('iam/biam/role/page_expand'), params)
}

export const BIamRoleApi = {
  create,
  destroy,
  update,
  updateStatus,
  updatePermission,
  detail,
  pageSimple,
  pageExpand
}
