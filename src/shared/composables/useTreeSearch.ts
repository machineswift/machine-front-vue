import { computed, nextTick, ref, shallowRef, toValue, type MaybeRefOrGetter } from 'vue'
import Fuse, { type FuseResultMatch } from 'fuse.js'
import { debounce } from 'lodash-es'
import type { TreeNodeData } from 'element-plus'
import { TreeDataUtil } from '@/shared/utils/TreeData.util'
import type { HighlightRange, TreeLikeNode } from '@/shared/types/Common.type'

export type TreeSearchNode<T> = TreeLikeNode<T> & {
  name: string
  code?: string
}

export interface NodeHighlight {
  name: HighlightRange[]
  code: HighlightRange[]
}

/** 搜索面板用到的树实例能力（避免耦合组件实例类型） */
export interface TreeSearchTree {
  filter: (query: string) => void
  setExpandedKeys: (keys: string[]) => void
}

export interface UseTreeSearchOptions<T extends TreeSearchNode<T>> {
  roots: MaybeRefOrGetter<T[]>
  /** 命中后自动过滤/展开的树实例 */
  tree?: () => TreeSearchTree | undefined
  /** 清空关键字后恢复的展开层级，默认根节点及其下一级 */
  expandedKeys?: () => string[]
  /** 搜索前置钩子（在构建匹配表之前 await）：如懒加载场景先按关键字把服务端命中路径并入树 */
  prefetch?: (keyword: string) => Promise<void>
  debounceMs?: number
}

const SEARCH_DEBOUNCE = 300

export const useTreeSearch = <T extends TreeSearchNode<T>>(options: UseTreeSearchOptions<T>) => {
  const rootNodes = computed(() => toValue(options.roots) ?? [])

  const searchText = ref('')
  const searchedText = ref('')
  const matchMap = shallowRef<Map<string, NodeHighlight>>(new Map())
  const isSearching = computed(() => searchText.value.trim().length > 0)
  const showMatchCount = computed(() => isSearching.value && searchedText.value === searchText.value.trim())
  const matchCount = computed(() => matchMap.value.size)
  const flatNodes = computed(() => TreeDataUtil.collectAllNodes(rootNodes.value))

  const findNode = (id: string): T | null => TreeDataUtil.findNode(rootNodes.value, id)

  // 自身 + 全部下级 id，用于排除“自己或自己的下级”
  const collectSubtreeIds = (id: string): Set<string> => new Set(TreeDataUtil.getAllChildrenIdsIncludingSelf(rootNodes.value, id ? [id] : []))

  function collectAncestorIds(id: string, nodes: T[] = rootNodes.value, path: string[] = [], result = new Set<string>()): Set<string> {
    for (const node of nodes) {
      if (node.id === id) {
        path.forEach(parentId => result.add(parentId))
        return result
      }
      if (node.children?.length) {
        collectAncestorIds(id, node.children as T[], [...path, node.id], result)
        if (result.size) return result
      }
    }
    return result
  }

  // 父级已勾选时不重复提交下级
  const collectRootIds = (checkedIds: Iterable<string>): string[] =>
    TreeDataUtil.getRootNodesFromSelected(rootNodes.value, [...checkedIds]).map(node => node.id)

  function defaultExpandedKeys(extraIds: Iterable<string> = []): string[] {
    const keys = new Set<string>()
    rootNodes.value.forEach(root => {
      keys.add(root.id)
      root.children?.forEach(child => keys.add(child.id))
    })
    for (const id of extraIds) {
      collectAncestorIds(id).forEach(parentId => keys.add(parentId))
    }
    return Array.from(keys)
  }

  const toHighlightRanges = (matches: readonly FuseResultMatch[] | undefined): HighlightRange[] => {
    const ranges: HighlightRange[] = []
    matches?.forEach(match => match.indices?.forEach(([start, end]) => ranges.push([start, end])))
    if (!ranges.length) return []

    ranges.sort((a, b) => a[0] - b[0])
    const merged: HighlightRange[] = [ranges[0]]
    for (let i = 1; i < ranges.length; i++) {
      const current = ranges[i]
      const last = merged[merged.length - 1]
      if (current[0] <= last[1] + 1) {
        if (current[1] > last[1]) last[1] = current[1]
      } else {
        merged.push(current)
      }
    }
    return merged
  }

  const collectSubstringRanges = (text: string, query: string): HighlightRange[] => {
    const ranges: HighlightRange[] = []
    const target = query.toLowerCase()
    if (!target) return ranges

    const source = text.toLowerCase()
    let from = 0
    while (from <= source.length - target.length) {
      const index = source.indexOf(target, from)
      if (index === -1) break
      ranges.push([index, index + target.length - 1])
      from = index + target.length
    }
    return ranges
  }

  const nameFuse = computed(
    () =>
      new Fuse(flatNodes.value, {
        keys: ['name'],
        includeMatches: true,
        includeScore: true,
        threshold: 0.1,
        minMatchCharLength: 1,
        ignoreLocation: true,
        distance: 30,
        findAllMatches: true,
        tokenize: (text: string) => text.split(/\s+/)
      })
  )

  const buildMatchMap = (keyword: string): Map<string, NodeHighlight> => {
    const map = new Map<string, NodeHighlight>()
    if (!keyword) return map

    // 名称：模糊匹配
    nameFuse.value.search(keyword).forEach(result => {
      const ranges = toHighlightRanges(result.matches?.filter(match => match.key === 'name'))
      if (ranges.length) map.set(result.item.id, { name: ranges, code: [] })
    })

    // 编码：包含匹配
    flatNodes.value.forEach(node => {
      const ranges = collectSubstringRanges(node.code ?? '', keyword)
      if (!ranges.length) return

      const existing = map.get(node.id)
      if (existing) existing.code = ranges
      else map.set(node.id, { name: [], code: ranges })
    })

    return map
  }

  const applySearch = async () => {
    const keyword = searchText.value.trim()

    // 懒加载等场景：先把服务端命中路径并入树，再做本地匹配
    if (options.prefetch && keyword) {
      await options.prefetch(keyword)
      // 关键字已变化（异步期间用户又输入了），丢弃过期结果
      if (searchText.value.trim() !== keyword) return
    }

    matchMap.value = buildMatchMap(keyword)
    searchedText.value = keyword

    // 交给 el-tree-v2 过滤：命中节点的父级会自动展开
    const tree = options.tree?.()
    tree?.filter(keyword)
    // filter('') 会把全部节点标记为展开，需恢复默认层级
    if (!keyword) nextTick(() => tree?.setExpandedKeys(options.expandedKeys?.() ?? defaultExpandedKeys()))
  }

  const handleSearchInput = debounce(applySearch, options.debounceMs ?? SEARCH_DEBOUNCE)

  const handleSearchClear = () => {
    handleSearchInput.cancel()
    applySearch()
  }

  const resetSearch = () => {
    handleSearchInput.cancel()
    searchText.value = ''
    searchedText.value = ''
    matchMap.value = new Map()
  }

  const filterMethod = (query: string, data: TreeNodeData) => {
    if (!query.trim()) return true
    return matchMap.value.has((data as { id: string }).id)
  }

  const getRanges = (id: string, field: keyof NodeHighlight): HighlightRange[] => matchMap.value.get(id)?.[field] ?? []

  // 编码展示为 (code)，命中区间需整体右移一位
  const codeRanges = (id: string): HighlightRange[] => getRanges(id, 'code').map(([start, end]) => [start + 1, end + 1] as HighlightRange)

  return {
    searchText,
    matchCount,
    showMatchCount,
    isSearching,
    findNode,
    collectSubtreeIds,
    collectRootIds,
    defaultExpandedKeys,
    handleSearchInput,
    handleSearchClear,
    resetSearch,
    filterMethod,
    getRanges,
    codeRanges,
    /** 立即重跑一次搜索（不发新请求由 prefetch 自行保证）：树数据变化后刷新本地匹配/高亮 */
    reapplySearch: applySearch
  }
}
