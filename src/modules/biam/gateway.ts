import { setIamGateway } from '@/shared/api/ports/IamGateway'
import type { IamAuthInfo, IamCurrentUser, IamFunctionPermission } from '@/shared/types/Iam.type'
import type { PermissionTreeNode } from '@/shared/types/Permission.type'
import type { OrganizationTreeNode } from '@/shared/types/Organization.type'
import { BIamAuthenticationCaptchaApi } from './authentication/api/BIamAuthenticationCaptcha.api'
import { BIamAuthenticationCurrentApi } from './authentication/api/BIamAuthenticationCurrent.api'
import { BIamPermissionApi } from './accessControl/permission/api/BIamPermission.api'
import { BIamOrganizationApi } from './accessControl/organization/api/BIamOrganization.api'

/**
 * 在 app 装配阶段把 biam 的真实实现注入共享层的 IamGateway 端口。
 * 这样 shared/stores/IamUser.store.ts 不再直接依赖 modules/biam。
 */
export function installBiamGateway(): void {
  setIamGateway({
    getCurrentUser: (): Promise<IamCurrentUser> => BIamAuthenticationCurrentApi.getCurrentUser(),
    getFunctionPermission: (): Promise<IamFunctionPermission> => BIamAuthenticationCurrentApi.getFunctionPermission(),
    logout: (): Promise<void> => BIamAuthenticationCaptchaApi.logout(),
    refreshAccessToken: (refreshToken: string): Promise<IamAuthInfo> => BIamAuthenticationCaptchaApi.getAccessToken({ refreshToken }),
    getPermissionTree: async (): Promise<PermissionTreeNode[]> => {
      const root = await BIamPermissionApi.treeSimple({ id: 'manage_app' })
      return (root.children ?? []) as PermissionTreeNode[]
    },
    getOrganizationTree: async (type: string): Promise<OrganizationTreeNode[]> => {
      const root = await BIamOrganizationApi.treeSimple({ type })
      return (root.children ?? []) as OrganizationTreeNode[]
    }
  })
}
