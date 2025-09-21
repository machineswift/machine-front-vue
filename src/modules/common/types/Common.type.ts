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
