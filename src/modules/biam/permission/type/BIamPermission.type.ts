import type { HighlightRange, TreeNode } from '@/shared/types/Common.type'
import type { DataPermissionMetaDto } from '@/shared/types/CommonIam.type'

export interface BIamPermissionCreateRequestVo {
  parentId: string
  resourceType: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList?: DataPermissionMetaDto[]
}

export interface BIamPermissionUpdateRequestVo {
  id: string
  code: string
  name: string
  icon?: string
  sort?: number
  description?: string
  dataPermissionMetaList?: DataPermissionMetaDto[]
}

export interface BIamPermissionUpdateParentRequestVo {
  id: string
  parentId: string
}

export interface BIamPermissionDetailResponseVo {
  id: string
  parentId: string
  resourceType: string
  code: string
  name: string
  icon: string
  sort: number
  description: string
  dataPermissionMetaList: DataPermissionMetaDto[]
  createName: string
  createBy: string
  createTime: number
  updateName: string
  updateBy: string
  updateTime: number
}

export interface BIamPermissionTreeSimpleResponseVo extends TreeNode<BIamPermissionTreeSimpleResponseVo> {
  resourceType: string
  code: string
  name: string
  icon: string
}

export interface BIamPermissionTreeExpandResponseVo extends TreeNode<BIamPermissionTreeExpandResponseVo> {
  resourceType: string
  code: string
  name: string
  icon: string
  sort: number
  description: string
  dataPermissionMetaList: DataPermissionMetaDto[]
  createName?: string
  createBy?: string
  createTime: number
  updateName?: string
  updateBy?: string
  updateTime: number
  /** 搜索命中区间（渲染时再生成高亮节点，存储区间可避免 HTML 拼接） */
  highlight?: { name?: HighlightRange[]; code?: HighlightRange[]; icon?: HighlightRange[] }
}
