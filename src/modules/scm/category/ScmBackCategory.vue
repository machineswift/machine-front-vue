<template>
  <div ref="pageContainerRef" class="back-category-page">
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
        <el-button type="primary" @click="showCreateDialog(null)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:CREATE']">新增</el-button>
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

          <el-table-column prop="backCategoryNumber" label="分类数" width="110" align="center" />

          <el-table-column prop="sort" label="排序" width="90" align="center" />

          <el-table-column prop="createName" label="创建人" width="120" show-overflow-tooltip />

          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>

          <el-table-column prop="updateName" label="更新人" width="120" show-overflow-tooltip />

          <el-table-column prop="updateTime" label="更新时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" width="260" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click.stop="showDetailDialog(row.id)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click.stop="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:UPDATE']">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="onDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info" @click.stop>
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="create" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:CREATE'])">
                        <el-icon><Plus /></el-icon>
                        <span>新增子类目</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="updateParent" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:UPDATE_PARENT'])">
                        <el-icon><Connection /></el-icon>
                        <span>移动类目</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided :disabled="!hasPermission(['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:DELETE'])">
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
    <ScmBackCategoryCreateDialog
      v-model="state.dialogs.create.visible"
      :parent-node="state.currentRow"
      :root-node-id="state.treeData?.id"
      :root-node-name="state.treeData?.name"
      @success="handleDialogSuccess"
    />
    <ScmBackCategoryEditDialog v-model="state.dialogs.edit.visible" :category-id="state.currentId" @success="handleDialogSuccess" />
    <ScmBackCategoryDetailDialog v-model="state.dialogs.detail.visible" :category-id="state.currentId" />
    <ScmBackCategoryUpdateParentDialog ref="updateParentDialogRef" :category-tree="state.treeData" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SCM:CATEGORY:BACK'
  })

  import { ref, reactive, onMounted, onBeforeUnmount, onActivated, nextTick } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryTreeExpandResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'
  import ScmBackCategoryCreateDialog from '@/modules/scm/category/ScmBackCategoryCreateDialog.vue'
  import ScmBackCategoryEditDialog from '@/modules/scm/category/ScmBackCategoryEditDialog.vue'
  import ScmBackCategoryDetailDialog from '@/modules/scm/category/ScmBackCategoryDetailDialog.vue'
  import ScmBackCategoryUpdateParentDialog from '@/modules/scm/category/ScmBackCategoryUpdateParentDialog.vue'

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
    currentRow: null as ScmBackCategoryTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as ScmBackCategoryTreeExpandResponseVo[],
    tableDataToShow: [] as ScmBackCategoryTreeExpandResponseVo[],
    treeData: null as ScmBackCategoryTreeExpandResponseVo | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false }
    }
  })

  // 工具函数
  const formatTimestamp = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const setDefaultExpandedRows = (nodes: ScmBackCategoryTreeExpandResponseVo[]) => {
    // 默认展开第一级
    state.expandedRowKeys = nodes.map(node => node.id)
  }

  const collectParentIds = (nodes: ScmBackCategoryTreeExpandResponseVo[], targetId: string): string[] => {
    const result: string[] = []

    const findParent = (nodeList: ScmBackCategoryTreeExpandResponseVo[], target: string): boolean => {
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

  // 搜索
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

    const findMatches = (nodes: ScmBackCategoryTreeExpandResponseVo[]) => {
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

    const filterNodes = (nodes: ScmBackCategoryTreeExpandResponseVo[]): ScmBackCategoryTreeExpandResponseVo[] => {
      return nodes
        .filter(node => allExpandedIds.has(node.id))
        .map(node => ({
          ...node,
          children: node.children?.length ? filterNodes(node.children) : undefined
        }))
    }

    state.tableDataToShow = filterNodes(state.tableData)
  }

  const shouldHighlight = (row: ScmBackCategoryTreeExpandResponseVo) => {
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
  const handleRowClick = (row: ScmBackCategoryTreeExpandResponseVo) => {
    state.currentRow = row
  }

  // 对话框操作
  const showCreateDialog = (row: ScmBackCategoryTreeExpandResponseVo | null) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: ScmBackCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: ScmBackCategoryTreeExpandResponseVo) => {
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

  // 删除
  const handleDelete = async (row: ScmBackCategoryTreeExpandResponseVo) => {
    try {
      await ScmBackCategoryApi.destroy({ id: row.id })
      fetchCategoryTree()
    } catch (error) {
      console.error('删除后台类目失败', error)
    }
  }

  // 下拉菜单命令
  const onDropdownCommand = (command: string | number | object, row: ScmBackCategoryTreeExpandResponseVo) => {
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
  const countTotalNodes = (nodes: ScmBackCategoryTreeExpandResponseVo[]): number => {
    let count = 0
    for (const node of nodes) {
      count++
      if (node.children?.length) {
        count += countTotalNodes(node.children)
      }
    }
    return count
  }

  /** 请求去重 Promise，防止并发重复调用 */
  let fetchPromise: Promise<void> | null = null

  // 获取数据
  const fetchCategoryTree = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmBackCategoryApi.treeExpand()
        .then(res => {
          state.treeData = res
          state.tableData = res.children || []
          state.tableDataToShow = res.children || []
          state.totalCount = countTotalNodes(state.tableData)
          setDefaultExpandedRows(state.tableData)
        })
        .catch(error => {
          console.error('获取后台类目树失败', error)
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

  /** keep-alive 切回标签时刷新数据 */
  onActivated(async () => {
    await fetchCategoryTree()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  .back-category-page {
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
