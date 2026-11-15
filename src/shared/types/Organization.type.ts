/**
 * 组织树节点的共享契约。
 *
 * data（门店归属组织筛选）等跨域场景只依赖该最小结构，
 * 完整组织 DTO 仍归 modules/biam 所有。
 */
export interface OrganizationTreeNode {
  id: string
  parentId: string
  code: string
  name: string
  type: string
  children?: OrganizationTreeNode[]
}
