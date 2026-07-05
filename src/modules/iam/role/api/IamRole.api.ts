import request from '@/common/utils/Request.util'
import { IAM_API_BASE_URL } from '@/common/constant/Common.constant'
import type { IdRequest, IdResponse } from '@/common/types/Common.type'
import type {
  IamRoleCreateRequestVo,
  IamRoleUpdateRequestVo,
  IamRoleUpdateStatusRequestVo,
  IamRoleUpdatePermissionRequestVo,
  IamRoleDetailResponseVo,
  IamRoleQueryPageRequestVo,
  IamRoleSimplePageResponse,
  IamRoleExpandPageResponse
} from '../type/IamRole.type'

// 创建
const create = async (params: IamRoleCreateRequestVo): Promise<IdResponse> => {
  return request.post<IdResponse>(IAM_API_BASE_URL + 'iam/role/create', params)
}

// 删除
const destroy = async (params: IdRequest): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/role/delete', params)
}

// 修改
const update = async (params: IamRoleUpdateRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/role/update', params)
}

// 修改状态
const updateStatus = async (params: IamRoleUpdateStatusRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/role/update_status', params)
}

// 修改角色权限
const updatePermission = async (params: IamRoleUpdatePermissionRequestVo): Promise<void> => {
  return request.post(IAM_API_BASE_URL + 'iam/role/update_permission', params)
}

// 详情
const detail = async (params: IdRequest): Promise<IamRoleDetailResponseVo> => {
  return request.post<IamRoleDetailResponseVo>(IAM_API_BASE_URL + 'iam/role/detail', params)
}

// 分页查询(应用于组件弹窗)
const pageSimple = async (params: IamRoleQueryPageRequestVo): Promise<IamRoleSimplePageResponse> => {
  return request.post<IamRoleSimplePageResponse>(IAM_API_BASE_URL + 'iam/role/page_simple', params)
}

// 分页查询(应用于角色管理菜单)
const pageExpand = async (params: IamRoleQueryPageRequestVo): Promise<IamRoleExpandPageResponse> => {
  return request.post<IamRoleExpandPageResponse>(IAM_API_BASE_URL + 'iam/role/page_expand', params)
}

export const IamRoleApi = {
  create,
  destroy,
  update,
  updateStatus,
  updatePermission,
  detail,
  pageSimple,
  pageExpand
}
