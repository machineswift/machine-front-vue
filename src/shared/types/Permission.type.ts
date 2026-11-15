/**
 * 权限树的共享层最小类型。
 * 后端 BIamPermissionTreeSimpleResponseVo 在结构上满足该接口。
 */
export interface PermissionTreeNode {
  code: string
  name: string
  icon: string
  resourceType: string
  children?: PermissionTreeNode[]
}
