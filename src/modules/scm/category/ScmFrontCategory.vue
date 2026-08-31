<template>
  <div ref="pageContainerRef" class="front-category-page">
    <!-- 搜索卡片 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入类目名称" clearable />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入类目编码" clearable />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="showCreateDialog(null)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:CREATE']">新增</el-button>
      </div>

      <!-- 表格区域 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.tableDataToShow"
          row-key="id"
          :height="tableHeight"
          style="width: 100%"
          border
          v-loading="state.loading"
          :expand-row-keys="state.expandedRowKeys"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          highlight-current-row
          @row-click="handleRowClick"
        >
          <el-table-column prop="name" label="名称" width="280" align="left" fixed show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'highlight-text': shouldHighlight(row) }">
                {{ row.name }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="code" label="编码" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'highlight-text': shouldHighlight(row) }">
                {{ row.code || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="frontCategoryNumber" label="前台分类数" width="110" align="center" />

          <el-table-column prop="backCategoryNumber" label="后台分类数" width="130" align="center">
            <template #default="{ row }">
              <span v-if="(row.backCategoryNumber ?? 0) > 0" class="link-number" @click.stop="handleShowBackCategories(row)">
                {{ row.backCategoryNumber }}
              </span>
              <span v-else>0</span>
            </template>
          </el-table-column>

          <el-table-column prop="sort" label="排序" width="90" align="center" />

          <el-table-column prop="createName" label="创建人" width="120" show-overflow-tooltip />

          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>

          <el-table-column prop="updateName" label="更新人" width="120" show-overflow-tooltip />

          <el-table-column prop="updateTime" label="更新时间" align="center" width="170">
            <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" width="260" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click.stop="showDetailDialog(row.id)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:DETAIL']">
                  详情
                </el-button>
                <el-button size="small" type="primary" @click.stop="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:UPDATE']">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="onDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info" @click.stop>
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="create" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:CREATE'])">
                        <el-icon><Plus /></el-icon>
                        <span>新增子类目</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="updateParent" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:UPDATE_PARENT'])">
                        <el-icon><Connection /></el-icon>
                        <span>移动类目</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:FRONT_CATEGORY:DELETE'])">
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <ScmFrontCategoryCreateDialog
      v-model="state.dialogs.create.visible"
      :parent-node="state.currentRow"
      :root-node-id="state.treeData?.id"
      :root-node-name="state.treeData?.name"
      @success="handleDialogSuccess"
    />
    <ScmFrontCategoryEditDialog v-model="state.dialogs.edit.visible" :category-id="state.currentId" @success="handleDialogSuccess" />
    <ScmFrontCategoryDetailDialog v-model="state.dialogs.detail.visible" :category-id="state.currentId" />
    <ScmFrontCategoryUpdateParentDialog ref="updateParentDialogRef" :category-tree="state.treeData" @success="handleDialogSuccess" />

    <!-- 关联后台分类弹窗（仅展示后台分类树，不含基本信息） -->
    <el-dialog
      v-model="state.dialogs.backCategory.visible"
      title="关联后台分类"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :destroy-on-close="true"
      @closed="handleBackCategoryDialogClosed"
      width="600px"
      top="20vh"
    >
      <div class="detail-section">
        <div class="back-category-selector">
          <el-input v-model="state.backCategoryQuery" placeholder="搜索后台分类" size="small" clearable @input="onBackCategoryQueryChanged" />
          <el-tree
            ref="backCategoryTreeRef"
            :data="state.backCategoryTreeData"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            show-checkbox
            :filter-node-method="backCategoryFilterMethod"
            default-expand-all
            class="back-category-tree"
            @check="syncSelectedNames"
          />
          <div class="selected-tags">
            <span class="selected-label">已选：</span>
            <template v-if="state.selectedBackCategoryNames.length">
              <el-tag v-for="name in state.selectedBackCategoryNames" :key="name" size="small">
                {{ name }}
              </el-tag>
            </template>
            <span v-else class="empty-hint">暂无关联后台分类</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="state.dialogs.backCategory.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SCM:CATEGORY:FRONT'
  })

  import { ref, reactive, onMounted, onBeforeUnmount, onActivated, nextTick } from 'vue'
  import { ElMessageBox, ElTree, type TreeNodeData } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { ScmFrontCategoryTreeExpandResponseVo } from '@/modules/scm/category/type/ScmFrontCategory.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'
  import ScmFrontCategoryCreateDialog from '@/modules/scm/category/ScmFrontCategoryCreateDialog.vue'
  import ScmFrontCategoryEditDialog from '@/modules/scm/category/ScmFrontCategoryEditDialog.vue'
  import ScmFrontCategoryDetailDialog from '@/modules/scm/category/ScmFrontCategoryDetailDialog.vue'
  import ScmFrontCategoryUpdateParentDialog from '@/modules/scm/category/ScmFrontCategoryUpdateParentDialog.vue'

  const searchFormRef = ref()
  const updateParentDialogRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)

  // 表格高度
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true
  let isFirstActivation = true

  const resolveCardElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const updateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    const newHeight = Math.max(260, cardBody.clientHeight)

    if (tableHeight.value !== newHeight) {
      tableHeight.value = newHeight
    }

    if (isFirstCalculation && tableHeight.value > 0) {
      tableHeightReady.value = true
      isFirstCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveCardElement(searchCardRef.value)
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      updateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  // 状态
  const state = reactive({
    loading: false,
    totalCount: 0,
    searchForm: {
      name: '',
      code: ''
    },
    currentId: '',
    currentRow: null as ScmFrontCategoryTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as ScmFrontCategoryTreeExpandResponseVo[],
    tableDataToShow: [] as ScmFrontCategoryTreeExpandResponseVo[],
    treeData: null as ScmFrontCategoryTreeExpandResponseVo | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false },
      backCategory: { visible: false }
    },
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    backCategoryQuery: '',
    selectedBackCategoryIds: [] as string[],
    selectedBackCategoryNames: [] as string[]
  })

  const backCategoryTreeRef = ref<InstanceType<typeof ElTree>>()

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const setDefaultExpandedRows = (nodes: ScmFrontCategoryTreeExpandResponseVo[]) => {
    // 默认展开第一级
    state.expandedRowKeys = nodes.map(node => node.id)
  }

  const collectParentIds = (nodes: ScmFrontCategoryTreeExpandResponseVo[], targetId: string): string[] => {
    const result: string[] = []

    const findParent = (nodeList: ScmFrontCategoryTreeExpandResponseVo[], target: string): boolean => {
      for (const node of nodeList) {
        if (node.id === target) return true

        if (node.children?.length) {
          if (findParent(node.children, target)) {
            result.push(node.id)
            return true
          }
        }
      }
      return false
    }

    findParent(nodes, targetId)
    return result
  }

  const handleSearch = () => {
    if (!hasSearchCriteria()) {
      resetTableDisplay()
      return
    }

    const { matchedIds, parentIds } = findMatchingNodes()
    updateExpandedRows(matchedIds, parentIds)
    updateTableDisplay(matchedIds, parentIds)
  }

  const hasSearchCriteria = () => {
    return Object.values(state.searchForm).some(value => Boolean(value))
  }

  const findMatchingNodes = () => {
    const matchedIds = new Set<string>()
    const parentIds = new Set<string>()

    const findMatches = (nodes: ScmFrontCategoryTreeExpandResponseVo[]) => {
      nodes.forEach(node => {
        const isMatched = Object.entries(state.searchForm).some(([key, value]) => {
          if (!value) return false
          const nodeValue = node[key as keyof typeof node]
          return nodeValue && String(nodeValue).toLowerCase().includes(value.toLowerCase())
        })

        if (isMatched) {
          matchedIds.add(node.id)
          collectParentIds(state.tableData, node.id).forEach(id => parentIds.add(id))
        }

        if (node.children?.length) {
          findMatches(node.children)
        }
      })
    }

    findMatches(state.tableData)
    return { matchedIds, parentIds }
  }

  const updateExpandedRows = (matchedIds: Set<string>, parentIds: Set<string>) => {
    state.expandedRowKeys = Array.from(new Set([...matchedIds, ...parentIds]))
  }

  const updateTableDisplay = (matchedIds: Set<string>, parentIds: Set<string>) => {
    const allExpandedIds = new Set([...matchedIds, ...parentIds])

    const filterNodes = (nodes: ScmFrontCategoryTreeExpandResponseVo[]): ScmFrontCategoryTreeExpandResponseVo[] => {
      return nodes
        .filter(node => allExpandedIds.has(node.id))
        .map(node => ({
          ...node,
          children: node.children?.length ? filterNodes(node.children) : undefined
        }))
    }

    state.tableDataToShow = filterNodes(state.tableData)
  }

  const shouldHighlight = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    if (!hasSearchCriteria()) return false

    return Object.entries(state.searchForm).some(([key, value]) => {
      if (!value) return false
      const rowValue = row[key as keyof typeof row]
      return rowValue && String(rowValue).toLowerCase().includes(value.toLowerCase())
    })
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    resetTableDisplay()
  }

  const resetTableDisplay = () => {
    state.tableDataToShow = state.tableData
    setDefaultExpandedRows(state.tableData)
  }

  // 行点击
  const handleRowClick = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentRow = row
  }

  // 对话框操作
  const showCreateDialog = (row: ScmFrontCategoryTreeExpandResponseVo | null) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    updateParentDialogRef.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDialogSuccess = () => {
    state.dialogs.create.visible = false
    state.dialogs.edit.visible = false
    fetchCategoryTree()
  }

  const handleDelete = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    try {
      await ScmFrontCategoryApi.destroy({ id: row.id })
      fetchCategoryTree()
    } catch (error) {
      console.error('删除前台类目失败', error)
    }
  }

  // 下拉菜单命令
  const onDropdownCommand = (command: string | number | object, row: ScmFrontCategoryTreeExpandResponseVo) => {
    const cmd = String(command)
    const commandMap: Record<string, () => void> = {
      create: () => showCreateDialog(row),
      updateParent: () => showUpdateParentDialog(row),
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
    commandMap[cmd]?.()
  }

  // 统计总数
  const countTotalNodes = (nodes: ScmFrontCategoryTreeExpandResponseVo[]): number => {
    let count = 0
    for (const node of nodes) {
      count++
      if (node.children?.length) {
        count += countTotalNodes(node.children)
      }
    }
    return count
  }

  /** 点击后台分类数：加载关联数据并打开独立弹窗 */
  const handleShowBackCategories = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.backCategory.visible = true

    try {
      const [detail, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: row.id }), ScmBackCategoryApi.treeSimple()])

      state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
      state.selectedBackCategoryIds = detail.backCategoryIdSet || []
      state.selectedBackCategoryNames = resolveNames(state.selectedBackCategoryIds)

      await nextTick()
      backCategoryTreeRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取关联后台分类失败', error)
    }
  }

  /** 后台分类树搜索过滤 */
  const onBackCategoryQueryChanged = (val: string) => {
    if (backCategoryTreeRef.value) {
      backCategoryTreeRef.value.filter(val.trim())
    }
  }

  /** 缓存搜索关键字，避免每节点重复 toLowerCase */
  let cachedQuery = ''
  const backCategoryFilterMethod = (value: string, data: TreeNodeData) => {
    if (!value) return true
    cachedQuery = value.toLowerCase()
    return data.name?.toLowerCase().includes(cachedQuery) || false
  }

  /** 根据 ID 列表解析对应的后台分类名称 */
  const resolveNames = (ids: string[]): string[] => {
    if (!ids.length || !state.backCategoryTreeData.length) return []
    const allNodes = TreeDataUtil.collectAllNodes(state.backCategoryTreeData)
    return ids.map(id => allNodes.find(n => n.id === id)?.name).filter(Boolean) as string[]
  }

  const syncSelectedNames = () => {
    if (!backCategoryTreeRef.value) return
    const checkedKeys = backCategoryTreeRef.value.getCheckedKeys(false) as string[]
    state.selectedBackCategoryIds = checkedKeys
    state.selectedBackCategoryNames = resolveNames(checkedKeys)
  }

  const handleBackCategoryDialogClosed = () => {
    state.backCategoryTreeData = []
    state.backCategoryQuery = ''
    state.selectedBackCategoryIds = []
    state.selectedBackCategoryNames = []
  }

  /** 请求去重 Promise，防止并发重复调用 */
  let fetchPromise: Promise<void> | null = null

  const fetchCategoryTree = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmFrontCategoryApi.treeExpand()
        .then(res => {
          state.treeData = res
          state.tableData = res.children || []
          state.tableDataToShow = res.children || []
          state.totalCount = countTotalNodes(state.tableData)
          setDefaultExpandedRows(state.tableData)
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

  onMounted(async () => {
    await fetchCategoryTree()
    await nextTick()
    setupResizeObserver()
    await updateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchCategoryTree()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
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
      padding: 12px 16px;
      overflow: hidden;
    }
  }

  .operation-buttons {
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .link-number {
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
  }

  .back-category-selector {
    width: 100%;
  }

  .back-category-tree {
    margin-top: 8px;
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
  }

  .selected-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .selected-label {
    font-size: 12px;
    color: #909399;
    flex-shrink: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #c0c4cc;
  }

  .table-placeholder {
    flex: 1;
    padding: 20px;
  }

  .table-actions {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .highlight-text {
    color: #409eff;
    font-weight: 500;
  }
</style>
