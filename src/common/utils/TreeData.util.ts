import type { TreeNode } from '@/common/types/Common.type'

export class TreeDataUtil {
  /**
   * 遍历树结构，收集所有节点（支持单个节点或节点数组）
   * @returns 所有节点的扁平化数组（children会被清空）
   */
  public static collectAllNodes<T extends TreeNode<T>>(root: T | T[] | null): T[] {
    if (!root) return []

    // 统一处理数组和单节点的情况
    const roots = Array.isArray(root) ? root : [root]
    const nodes: T[] = []
    const stack: T[] = [...roots]

    while (stack.length > 0) {
      const node = stack.pop()!

      // 复制节点并清空children
      const { children = [], ...rest } = node
      const nodeCopy = { ...rest, children: [] } as T
      nodes.push(nodeCopy)

      // 反向压栈保持原始顺序
      if (children?.length) {
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i])
        }
      }
    }

    return nodes
  }

  /**
   * 查找指定ID的节点（支持DFS/BFS，支持单节点或节点数组）
   */
  public static findNode<T extends TreeNode<T>>(root: T | T[] | null, id: string | null, options: { mode?: 'dfs' | 'bfs' } = { mode: 'dfs' }): T | null {
    // 处理空值
    if (!root || !id) return null

    // 统一处理数组和单节点
    const roots = Array.isArray(root) ? root : [root]
    const stackOrQueue: T[] = [...roots]
    const isDFS = options.mode === 'dfs'

    while (stackOrQueue.length > 0) {
      const node = isDFS ? stackOrQueue.pop()! : stackOrQueue.shift()!

      // 检查当前节点
      if (node.id === id) return node

      // 处理子节点
      if (node.children?.length) {
        const children = isDFS ? [...node.children].reverse() : node.children
        for (const child of children) {
          stackOrQueue.push(child)
        }
      }
    }

    return null
  }

  /**
   * 获取所有选中节点中的根节点
   */
  public static getRootNodesFromSelected<T extends TreeNode<T>>(root: T | T[] | null, selectedIds: string[]): T[] {
    if (!root || !selectedIds || selectedIds.length === 0) {
      return []
    }

    // 统一处理数组和单节点的情况
    const roots = Array.isArray(root) ? root : [root]
    const selectedIdSet = new Set(selectedIds)
    const result: T[] = []
    const stack: { node: T; hasSelectedParent: boolean }[] = []

    // 初始化栈
    for (const node of roots) {
      stack.push({ node, hasSelectedParent: false })
    }

    while (stack.length > 0) {
      const { node, hasSelectedParent } = stack.pop()!
      const isSelected = selectedIdSet.has(node.id)

      // 如果是选中节点且没有父节点被选中，则加入结果
      if (isSelected && !hasSelectedParent) {
        result.push(node)
      }

      // 处理子节点
      if (node.children?.length) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          const child = node.children[i]
          stack.push({
            node: child,
            hasSelectedParent: hasSelectedParent || isSelected
          })
        }
      }
    }

    return result
  }

  /**
   * 获取指定节点的所有子节点ID（包括自身）
   */
  public static getAllChildrenIdsIncludingSelf<T extends TreeNode<T>>(treeData: T | T[], nodeIds: string[]): string[] {
    const result: string[] = []
    const nodes = Array.isArray(treeData) ? treeData : [treeData]

    // 查找节点
    const findNode = (nodes: T[], id: string): T | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNode(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    // 收集所有子节点ID（包含自身）
    const collectChildrenIds = (node: T) => {
      result.push(node.id)
      node.children?.forEach(child => collectChildrenIds(child))
    }

    // 处理每个要查找的节点ID
    nodeIds.forEach(id => {
      const node = findNode(nodes, id)
      if (node) {
        collectChildrenIds(node)
      }
    })

    // 去重后返回
    return [...new Set(result)]
  }

  /**
   * 获取指定节点集合的所有父级节点（包括根节点）
   */
  public static getAllParentNodes<T extends TreeNode<T>>(root: T | T[] | null, targetIds: string[]): T[] {
    if (!root || !targetIds || targetIds.length === 0) {
      return []
    }

    const roots = Array.isArray(root) ? root : [root]
    const idToNode: Record<string, T> = {}
    const childToParent: Record<string, string> = {}

    const stack: T[] = [...roots]
    roots.forEach(node => (idToNode[node.id] = node))

    while (stack.length > 0) {
      const node = stack.pop()
      if (!node) continue

      const children = node.children
      if (children) {
        for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i]
          if (child) {
            childToParent[child.id] = node.id
            idToNode[child.id] = child
            stack.push(child)
          }
        }
      }
    }

    // Collect all parent nodes
    const result: Record<string, T> = {}
    for (const targetId of targetIds) {
      const node = idToNode[targetId]
      if (node) {
        result[node.id] = node
        let parentId = childToParent[targetId]
        while (parentId) {
          const parentNode = idToNode[parentId]
          if (parentNode) {
            result[parentNode.id] = parentNode
            parentId = childToParent[parentId]
          } else {
            break
          }
        }
      }
    }

    return Object.values(result)
  }

  /**
   * 获取给定ID集合中所有最后一层的节点ID（没有子节点的节点）
   */
  public static getBottomLevelIds<T extends TreeNode<T>>(root: T | T[] | null, ids: string[]): string[] {
    if (!root || !ids || ids.length === 0) {
      return []
    }

    // 统一处理数组和单节点的情况
    const roots = Array.isArray(root) ? root : [root]
    const result: string[] = []
    const stack: T[] = [...roots]

    // 首先构建一个所有节点的映射
    const allNodesMap = new Map<string, T>()
    while (stack.length > 0) {
      const node = stack.pop()!
      allNodesMap.set(node.id, node)

      if (node.children?.length) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i])
        }
      }
    }

    // 检查每个给定的ID是否是最后一层
    for (const id of ids) {
      const node = allNodesMap.get(id)
      if (node && (!node.children || node.children.length === 0)) {
        result.push(id)
      }
    }

    return result
  }
}
