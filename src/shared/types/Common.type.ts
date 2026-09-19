export interface IdResponse {
  id: string
}

export interface IdRequest {
  id: string
}

export interface BusinessDto {
  id: string
  name: string
  code: string
  sort: number
}

export interface PageRequest {
  current?: number
  size?: number
}

export interface PageResponse<T> {
  current: number
  size: number
  total: number
  records: T[]
}

export interface TreeNode<T extends TreeNode<T>> {
  id: string
  parentId: string
  code?: string
  name: string
  sort: number
  children?: T[]
}

export type HighlightRange = [number, number]

/** 树工具函数的通用节点约束：只要求 id / children */
export interface TreeLikeNode<T> {
  id: string
  children?: T[]
}

export interface TreePickerNode extends TreeLikeNode<TreePickerNode> {
  name: string
  code?: string
}
