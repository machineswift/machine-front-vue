import type { IamAuthInfo, IamCurrentUser, IamFunctionPermission } from '@/shared/types/Iam.type'
import type { PermissionTreeNode } from '@/shared/types/Permission.type'
import type { OrganizationTreeNode } from '@/shared/types/Organization.type'

/**
 * 共享层依赖的 IAM 端口。
 *
 * 具体实现（调用 modules/biam 的 api）在 app 装配层注入，
 * 这样 shared 不需要 import modules，依赖方向保持 shared <- modules。
 */
export interface IamGateway {
  getCurrentUser(): Promise<IamCurrentUser>
  getFunctionPermission(): Promise<IamFunctionPermission>
  logout(): Promise<void>
  refreshAccessToken(refreshToken: string): Promise<IamAuthInfo>
  getPermissionTree(): Promise<PermissionTreeNode[]>
  getOrganizationTree(type: string): Promise<OrganizationTreeNode[]>
}

let gateway: IamGateway | null = null

export function setIamGateway(instance: IamGateway): void {
  gateway = instance
}

export function getIamGateway(): IamGateway {
  if (!gateway) {
    throw new Error('IamGateway 尚未安装：请在 main.ts 中先调用 installBiamGateway()')
  }
  return gateway
}
