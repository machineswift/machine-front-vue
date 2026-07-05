import { cloneDeep } from 'lodash'
import { routeLookup } from '@/common/utils/RouteLookup.util'
import { useIamUserStore } from '@/common/stores/IamUser.store'
import type { ExtendedRouteRecordRaw } from '@/common/types/Router.type'
import type { IamPermissionTreeSimpleResponseVo } from '@/modules/iam/permission/type/IamPermission.type'

export class PermissionUtil {
  /**
   * 递归删除权限树中 resourceType 为 BUTTON 的节点
   */
  public static removeButtonNodes(treeNodes: IamPermissionTreeSimpleResponseVo[]): IamPermissionTreeSimpleResponseVo[] {
    return treeNodes
      .filter(node => node.resourceType !== 'BUTTON')
      .map(node => ({
        ...node,
        children: node.children ? this.removeButtonNodes(node.children) : []
      }))
  }

  /**
   * 根据权限编码列表过滤权限树
   */
  public static filterByPermissionCodes(treeNodes: IamPermissionTreeSimpleResponseVo[], permissionCodeList: string[]): IamPermissionTreeSimpleResponseVo[] {
    if (!permissionCodeList || permissionCodeList.length === 0) {
      return []
    }

    return treeNodes
      .map(node => {
        // 深拷贝当前节点，避免修改原始数据
        const newNode = { ...node }
        // 递归处理子节点
        if (node.children) {
          newNode.children = this.filterByPermissionCodes(node.children, permissionCodeList)
        }
        return newNode
      })
      .filter(node => {
        return permissionCodeList.includes(node.code) || (node.children && node.children.length > 0)
      })
  }

  /**
   * 将权限树转换为路由配置
   */
  public static convertPermissionTreeToRoutes(permissionTree: IamPermissionTreeSimpleResponseVo[]): ExtendedRouteRecordRaw[] {
    // 存储最终生成的路由配置
    const resultRoutes: ExtendedRouteRecordRaw[] = []

    const processNode = (node: IamPermissionTreeSimpleResponseVo): ExtendedRouteRecordRaw | null => {
      // 通过权限码查找对应的路由配置
      const route = routeLookup.getByCode(node.code)

      // 如果找不到对应的路由，抛出错误
      if (!route) {
        import('element-plus')
          .then(({ ElNotification }) => {
            ElNotification.error({
              title: '路由配置错误',
              message: `找不到权限码 [${node.code}] 对应的路由配置`,
              duration: 5000
            })
          })
          .catch(() => {
            alert(`路由配置错误: 找不到权限码 [${node.code}] 对应的路由配置`)
          })
        return null
      }

      // 深拷贝路由配置，避免修改原始数据
      const routeClone = cloneDeep(route)

      // 如果权限节点有名称，则覆盖路由的title
      if (node.name) {
        routeClone.meta.title = node.name
      }

      // 如果权限节点有图标，则覆盖路由的icon
      if (node.icon) {
        routeClone.meta.icon = node.icon
      }

      // 处理子节点（如果有）
      if (node.children && node.children.length > 0) {
        routeClone.children = node.children.map(processNode).filter(Boolean) as ExtendedRouteRecordRaw[]
      }

      return routeClone
    }

    // 遍历权限树的根节点
    for (const node of permissionTree) {
      const route = processNode(node)
      if (route) {
        resultRoutes.push(route)
      }
    }

    return resultRoutes
  }
}

/**
 * 检查用户是否拥有指定权限
 * @param permissions 权限编码（单个字符串或字符串数组）
 * @returns 如果传入数组，任一权限满足即返回 true；如果传入字符串，该权限满足即返回 true
 *
 * @example
 * ```ts
 * // 检查单个权限
 * if (hasPermission('SYSTEM:BASIC_DATA:TAG:CREATE')) {
 *   // 有权限
 * }
 *
 * // 检查多个权限（任一满足即可）
 * if (hasPermission(['SYSTEM:BASIC_DATA:TAG:CREATE', 'SYSTEM:BASIC_DATA:TAG:UPDATE'])) {
 *   // 有任一权限
 * }
 * ```
 */
export function hasPermission(permissions: string | string[]): boolean {
  try {
    const iamUserStore = useIamUserStore()
    const { permissionCodeList } = iamUserStore.getPermissionInfo()
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
    return requiredPermissions.some((permission: string) => permissionCodeList.includes(permission))
  } catch (error) {
    console.error('权限检查失败:', error)
    return false
  }
}

export default PermissionUtil
