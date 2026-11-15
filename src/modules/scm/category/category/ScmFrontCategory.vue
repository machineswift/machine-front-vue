<template>
  <div class="front-category-page">
    <!-- 搜索卡片 -->
    <el-card class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入类目名称" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入类目编码,至少3位" clearable @keyup.enter="handleSearch" />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <span v-if="state.isSearching" class="search-limit-hint">结果{{ state.resultShown }}/{{ state.resultTotal }}条</span>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="box-card-data">
      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="showCreateDialog(null)" v-hasPermission="[PERMISSION_CODE.create]">新增</el-button>
      </div>

      <!-- 表格区域 -->
      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table-v2
          v-show="tableHeightReady"
          v-model:expanded-row-keys="state.expandedRowKeys"
          :columns="tableColumns"
          :data="state.tableDataToShow"
          :width="tableWidth"
          :height="tableHeight"
          :expand-column-key="expandColumnKey"
          :indent-size="16"
          :icon-size="14"
          :row-height="44"
          fixed
          row-key="id"
          class="front-category-table"
          v-loading="state.loading"
        >
          <template #empty>
            <div class="table-empty">{{ state.isSearching ? '没有匹配的类目' : '暂无数据' }}</div>
          </template>
        </el-table-v2>

        <!-- 骨架屏占位 -->
        <div v-show="!tableHeightReady" class="table-placeholder">
          <el-skeleton :rows="8" animated />
        </div>
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <ScmFrontCategoryAddDialog
      v-model="state.dialogs.create.visible"
      :parent-node="state.currentRow"
      :root-node-id="state.treeData?.id"
      :root-node-name="state.treeData?.name"
      @success="fetchCategoryTree"
    />
    <ScmFrontCategoryEditDialog v-model="state.dialogs.edit.visible" :category-id="state.currentId" @success="fetchCategoryTree" />
    <ScmFrontCategoryDetailDialog v-model="state.dialogs.detail.visible" :category-id="state.currentId" :is-leaf="state.currentIsLeaf" />
    <ScmFrontCategoryUpdateParentDialog ref="updateParentDialogRef" :category-tree="state.treeData" @success="fetchCategoryTree" />
    <!-- 修改关联后台分类弹窗 -->
    <ScmFrontCategoryUpdateBackCategoryDialog v-model="state.dialogs.updateBackCategory.visible" :category-id="state.currentId" @success="fetchCategoryTree" />

    <el-dialog
      v-model="state.dialogs.backCategory.visible"
      title="关联后台分类"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :destroy-on-close="true"
      @closed="handleBackCategoryDialogClosed"
      width="clamp(480px, 46vw, 640px)"
      align-center
    >
      <div v-loading="state.backCategoryLoading" class="detail-section">
        <TreeCheckPanel
          ref="backCategoryPanelRef"
          v-model="state.selectedBackCategoryIds"
          :roots="state.backCategoryTreeData"
          :height="260"
          expand-checked-only
          placeholder="输入后台分类名称或编码搜索"
          :icon="FolderOpened"
          :closable-tags="false"
          empty-tags-text="暂无关联后台分类"
        />
      </div>

      <template #footer>
        <el-button @click="state.dialogs.backCategory.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'ScmFrontCategory'
  })

  import { ref, reactive, computed, onMounted, onActivated, nextTick, h, watch, markRaw } from 'vue'
  import Fuse, { type FuseResultMatch } from 'fuse.js'
  import { ElMessage, ElMessageBox, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete, FolderOpened } from '@element-plus/icons-vue'
  import { useElementSize } from '@vueuse/core'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import HighlightText from '@/shared/components/HighlightText.vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { ScmFrontCategoryTreeExpandResponseVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'
  import type { HighlightRange } from '@/shared/types/Common.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
  import ScmFrontCategoryAddDialog from '@/modules/scm/category/category/ScmFrontCategoryAddDialog.vue'
  import ScmFrontCategoryEditDialog from '@/modules/scm/category/category/ScmFrontCategoryEditDialog.vue'
  import ScmFrontCategoryDetailDialog from '@/modules/scm/category/category/ScmFrontCategoryDetailDialog.vue'
  import ScmFrontCategoryUpdateParentDialog from '@/modules/scm/category/category/ScmFrontCategoryUpdateParentDialog.vue'
  import ScmFrontCategoryUpdateBackCategoryDialog from '@/modules/scm/category/category/ScmFrontCategoryUpdateBackCategoryDialog.vue'

  const searchFormRef = ref()
  const updateParentDialogRef = ref()
  const tableWrapperRef = ref<HTMLElement | null>(null)

  const expandColumnKey = 'name'

  const { width: tableWrapperWidth, height: tableWrapperHeight } = useElementSize(tableWrapperRef)
  const tableWidth = computed(() => Math.max(tableWrapperWidth.value, 320))
  const tableHeight = computed(() => Math.max(tableWrapperHeight.value, 260))
  const tableHeightReady = computed(() => tableWrapperHeight.value > 0 && tableWrapperWidth.value > 0)

  let isFirstActivation = true

  /** 权限编码集中定义 */
  const PERMISSION_CODE = {
    detail: 'MANAGE_APP:SCM:CATEGORY:FRONT:DETAIL',
    create: 'MANAGE_APP:SCM:CATEGORY:FRONT:CREATE',
    update: 'MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE',
    updateParent: 'MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE_PARENT',
    updateBackCategory: 'MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE_BACK_CATEGORY',
    delete: 'MANAGE_APP:SCM:CATEGORY:FRONT:DELETE'
  }

  const permission = {
    detail: computed(() => hasPermission([PERMISSION_CODE.detail])),
    create: computed(() => hasPermission([PERMISSION_CODE.create])),
    update: computed(() => hasPermission([PERMISSION_CODE.update])),
    updateParent: computed(() => hasPermission([PERMISSION_CODE.updateParent])),
    updateBackCategory: computed(() => hasPermission([PERMISSION_CODE.updateBackCategory])),
    delete: computed(() => hasPermission([PERMISSION_CODE.delete]))
  }

  const state = reactive({
    loading: false,
    backCategoryLoading: false,
    isSearching: false,
    searchForm: {
      name: '',
      code: ''
    },
    resultShown: 0,
    resultTotal: 0,
    currentId: '',
    currentIsLeaf: true,
    currentRow: null as ScmFrontCategoryTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as ScmFrontCategoryTreeExpandResponseVo[],
    tableDataToShow: [] as ScmFrontCategoryTreeExpandResponseVo[],
    treeData: null as ScmFrontCategoryTreeExpandResponseVo | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false },
      backCategory: { visible: false },
      updateBackCategory: { visible: false }
    },
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    selectedBackCategoryIds: [] as string[]
  })

  // 搜索索引只在查询时使用，无需响应式
  let flatData: ScmFrontCategoryTreeExpandResponseVo[] = []
  let nameFuse: Fuse<ScmFrontCategoryTreeExpandResponseVo> | null = null

  const backCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const tableColumns = [
    {
      key: 'name',
      title: '名称',
      dataKey: 'name',
      width: 200,
      fixed: true,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        rowData.highlight?.name?.length ? h(HighlightText, { text: cellData, ranges: rowData.highlight.name }) : cellData
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 240,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        rowData.highlight?.code?.length ? h(HighlightText, { text: cellData, ranges: rowData.highlight.code }) : cellData || '-'
    },
    { key: 'frontCategoryNumber', title: '前台分类数', dataKey: 'frontCategoryNumber', width: 100, align: 'center' },
    {
      key: 'backCategoryNumber',
      title: '后台分类数',
      dataKey: 'backCategoryNumber',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }: { rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        (rowData.backCategoryNumber ?? 0) > 0
          ? h('span', { class: 'link-number', onClick: () => handleShowBackCategories(rowData) }, String(rowData.backCategoryNumber))
          : '0'
    },
    { key: 'sort', title: '排序', dataKey: 'sort', width: 90, align: 'center' },
    { key: 'createName', title: '创建人', dataKey: 'createName', width: 120, align: 'center' },
    {
      key: 'createTime',
      title: '创建时间',
      dataKey: 'createTime',
      width: 170,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    { key: 'updateName', title: '更新人', dataKey: 'updateName', width: 120, align: 'center' },
    {
      key: 'updateTime',
      title: '更新时间',
      dataKey: 'updateTime',
      width: 170,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    {
      key: 'operation',
      title: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      cellRenderer: ({ rowData }: { rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        h('div', { class: 'table-actions' }, [
          h(ElButton, { size: 'small', disabled: !permission.detail.value, onClick: () => showDetailDialog(rowData) }, () => '详情'),
          h(ElButton, { size: 'small', type: 'primary', disabled: !permission.update.value, onClick: () => showEditDialog(rowData) }, () => '编辑'),
          h(
            ElDropdown,
            {
              trigger: 'click',
              placement: 'bottom-end',
              onCommand: (command: string | number | object) => onDropdownCommand(String(command), rowData)
            },
            {
              default: () =>
                h(ElButton, { size: 'small', type: 'info' }, () => ['更多', h(ElIcon, { class: 'el-icon--right' }, { default: () => h(ArrowDown) })]),
              dropdown: () =>
                h(ElDropdownMenu, null, () => [
                  h(ElDropdownItem, { command: 'create', disabled: !permission.create.value }, () => [
                    h(ElIcon, null, { default: () => h(Plus) }),
                    h('span', null, '新增')
                  ]),
                  h(ElDropdownItem, { command: 'updateParent', disabled: !permission.updateParent.value }, () => [
                    h(ElIcon, null, { default: () => h(Connection) }),
                    h('span', null, '移动')
                  ]),
                  h(
                    ElDropdownItem,
                    { command: 'updateBackCategory', disabled: !permission.updateBackCategory.value || (rowData.frontCategoryNumber ?? 0) > 0 },
                    () => [h(ElIcon, null, { default: () => h(FolderOpened) }), h('span', null, '后台分类')]
                  ),
                  h(ElDropdownItem, { command: 'delete', divided: true, disabled: !permission.delete.value }, () => [
                    h(ElIcon, null, { default: () => h(Delete) }),
                    h('span', null, '删除')
                  ])
                ])
            }
          )
        ])
    }
  ]

  /** 默认收起：只展示第一级，下一级由用户按需展开 */
  const resetExpandedRows = () => {
    state.expandedRowKeys = []
  }

  type SearchFieldKey = 'name' | 'code'

  /** 单字段命中：节点 + 该字段需高亮的区间 */
  interface FieldHit {
    item: ScmFrontCategoryTreeExpandResponseVo
    ranges: HighlightRange[]
  }

  const SEARCH_RESULT_LIMIT = 256

  /** 建索引：名称走模糊匹配，编码是标识符（走精确包含匹配，见 performSearch） */
  const buildSearchIndex = () => {
    flatData = TreeDataUtil.collectAllNodes(state.tableData)
    nameFuse = new Fuse(flatData, {
      keys: ['name'],
      includeMatches: true,
      threshold: 0.1,
      minMatchCharLength: 1,
      ignoreLocation: true,
      distance: 30,
      findAllMatches: true,
      tokenize: (text: string) => text.split(/\s+/)
    })

    // 未搜索时表格展示全部数据，结果与总数相同
    state.resultShown = state.resultTotal = flatData.length
  }

  /** 收集并合并命中区间（升序、互不重叠），渲染时直接拼接文本节点 */
  const getHighlightRanges = (matches: readonly FuseResultMatch[] | undefined): HighlightRange[] => {
    if (!matches?.length) return []

    const ranges: HighlightRange[] = []
    matches.forEach(match => match.indices?.forEach(([start, end]) => ranges.push([start, end])))
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

  /** 编码命中区间：按“包含”逐段定位（大小写不敏感） */
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

  const performSearch = () => {
    const { name, code } = state.searchForm

    if (!name && !code) {
      resetSearch()
      return
    }

    state.isSearching = true

    // 各字段命中：节点 + 该字段需高亮的区间
    const fieldHits = new Map<SearchFieldKey, FieldHit[]>()
    if (name) {
      fieldHits.set(
        'name',
        (nameFuse?.search(name) ?? []).map(result => ({ item: result.item, ranges: getHighlightRanges(result.matches) }))
      )
    }
    if (code) {
      // 编码是标识符，按“包含”精确匹配（模糊匹配会把 0001 命中到 0000）
      const keyword = code.toLowerCase()
      fieldHits.set(
        'code',
        flatData.filter(node => node.code?.toLowerCase().includes(keyword)).map(node => ({ item: node, ranges: collectSubstringRanges(node.code ?? '', code) }))
      )
    }

    // 多字段取交集：以首个已填字段为基准，用其余字段的命中 id 集合逐层过滤
    const allHits = [...fieldHits.values()].reduce<FieldHit[] | null>((acc, list) => {
      const idSet = new Set(list.map(hit => hit.item.id))
      return acc ? acc.filter(hit => idSet.has(hit.item.id)) : list
    }, null)

    const hits = (allHits ?? []).slice(0, SEARCH_RESULT_LIMIT)
    state.resultTotal = allHits?.length ?? 0
    state.resultShown = hits.length

    const rangesById = new Map<SearchFieldKey, Map<string, HighlightRange[]>>()
    fieldHits.forEach((list, key) => {
      const ranges = new Map<string, HighlightRange[]>()
      list.forEach(hit => ranges.set(hit.item.id, hit.ranges))
      rangesById.set(key, ranges)
    })

    const matchedMap = new Map<string, ScmFrontCategoryTreeExpandResponseVo>()
    hits.forEach(hit => {
      matchedMap.set(hit.item.id, {
        ...hit.item,
        highlight: {
          name: rangesById.get('name')?.get(hit.item.id) ?? [],
          code: rangesById.get('code')?.get(hit.item.id) ?? []
        }
      })
    })

    // id→父id 索引，避免在循环里反复遍历整棵树
    const parentIdMap = new Map<string, string>()
    const collectParentIdMap = (nodes: ScmFrontCategoryTreeExpandResponseVo[]) => {
      nodes.forEach(node => {
        node.children?.forEach(child => parentIdMap.set(child.id, node.id))
        if (node.children?.length) collectParentIdMap(node.children)
      })
    }
    collectParentIdMap(state.tableData)

    // 向上回溯命中项的全部祖先，祖先只用于承载层级
    const parentIds = new Set<string>()
    for (const id of matchedMap.keys()) {
      let parentId = parentIdMap.get(id)
      while (parentId && !parentIds.has(parentId)) {
        parentIds.add(parentId)
        parentId = parentIdMap.get(parentId)
      }
    }

    // 构建结果树：只保留命中项及其祖先
    const buildResultTree = (nodes: ScmFrontCategoryTreeExpandResponseVo[]): ScmFrontCategoryTreeExpandResponseVo[] =>
      nodes.flatMap(node => {
        const matched = matchedMap.get(node.id)
        if (!matched && !parentIds.has(node.id)) return []
        const newNode = matched ?? { ...node }
        if (node.children?.length) newNode.children = buildResultTree(node.children)
        return [newNode]
      })

    // 命中多少个就展开多少个父节点，不截断（否则深层命中会被折叠隐藏）
    state.tableDataToShow = markRaw(buildResultTree(state.tableData))
    state.expandedRowKeys = [...parentIds]
  }

  const handleSearch = () => {
    if (state.searchForm.code && state.searchForm.code.length < 3) {
      ElMessage.warning('编码至少需要3位字符')
      return
    }
    performSearch()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.isSearching = false
    state.tableDataToShow = state.tableData
    resetExpandedRows()
    state.resultShown = state.resultTotal = flatData.length
  }

  /** 记录当前操作行（编辑/详情共用：是否为叶子类目只取决于子孙节点数） */
  const selectRow = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.currentIsLeaf = (row.frontCategoryNumber ?? 0) === 0
  }

  const showCreateDialog = (row: ScmFrontCategoryTreeExpandResponseVo | null) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    selectRow(row)
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    selectRow(row)
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    updateParentDialogRef.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  /** 修改关联后台分类（弹窗内自行加载关联数据） */
  const showUpdateBackCategoryDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.updateBackCategory.visible = true
  }

  const handleDelete = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    try {
      await ScmFrontCategoryApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      fetchCategoryTree()
    } catch (error) {
      console.error('删除前台类目失败', error)
    }
  }

  const onDropdownCommand = (command: string, row: ScmFrontCategoryTreeExpandResponseVo) => {
    const commandMap: Record<string, () => void> = {
      create: () => showCreateDialog(row),
      updateParent: () => showUpdateParentDialog(row),
      updateBackCategory: () => showUpdateBackCategoryDialog(row),
      delete: () => {
        ElMessageBox.confirm(`确定要删除类目「${row.name}」吗？删除后子类目将一并删除，请谨慎操作。`, '删除确认', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => handleDelete(row))
          .catch(() => {})
      }
    }
    commandMap[command]?.()
  }

  /** 点击后台分类数：加载关联数据并打开独立弹窗 */
  const handleShowBackCategories = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.backCategory.visible = true
    state.backCategoryLoading = true

    try {
      const [detail, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: row.id }), ScmBackCategoryApi.treeSimple()])

      state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
      state.selectedBackCategoryIds = detail.backCategoryIdSet || []

      await nextTick()
      backCategoryPanelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取关联后台分类失败', error)
    } finally {
      state.backCategoryLoading = false
    }
  }

  const handleBackCategoryDialogClosed = () => {
    state.backCategoryTreeData = []
    state.selectedBackCategoryIds = []
    state.backCategoryLoading = false
    backCategoryPanelRef.value?.reset()
  }

  /** 请求去重 Promise，防止并发重复调用 */
  let fetchPromise: Promise<void> | null = null

  const fetchCategoryTree = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmFrontCategoryApi.treeExpand()
        .then(res => {
          state.treeData = markRaw(res)
          state.tableData = markRaw(res.children || [])
          state.tableDataToShow = state.tableData
          buildSearchIndex()
          resetExpandedRows()
        })
        .catch(error => {
          console.error('获取前台类目树失败', error)
        })
      await fetchPromise
    } finally {
      fetchPromise = null
      state.loading = false
    }
  }

  watch(
    () => state.searchForm,
    ({ name, code }) => {
      if (!name && !code && state.isSearching) {
        resetSearch()
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    await fetchCategoryTree()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchCategoryTree()
  })
</script>

<style scoped lang="scss">
  .front-category-page {
    height: 100%;
    min-height: 0;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  .box-card-form {
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .button-group {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-left: auto;

        .search-limit-hint {
          margin-right: 12px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }

  .box-card-data {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      overflow: hidden;
    }
  }

  .operation-buttons {
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* 后台分类数链接（cellRenderer 内创建，需用 :deep 命中） */
  :deep(.link-number) {
    color: var(--el-color-primary);
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.2s;

    &:hover {
      text-decoration-color: var(--el-color-primary);
    }
  }

  .detail-section {
    padding: 0;

    /* 「关联后台分类」弹窗仅展示：复选框不可交互（保留树的滚动/搜索可用） */
    :deep(.tree-panel-tree .el-checkbox) {
      pointer-events: none;
    }
  }

  .table-placeholder {
    padding: 10px 0;
  }

  .table-empty {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .front-category-table {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    :deep(.el-table-v2__header-cell),
    :deep(.el-table-v2__row-cell) {
      padding: 0 8px;
      border-right: 1px solid var(--el-border-color);
    }
  }

  /* 操作按钮样式 - 需要深度选择器以应用到 JSX 组件 */
  :deep(.table-actions) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    .el-button {
      margin: 0;
      margin-right: 2px;

      &:last-child {
        margin-right: 0;
      }
    }

    .el-dropdown {
      margin-left: 2px;
    }
  }
</style>
