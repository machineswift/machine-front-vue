<template>
  <div ref="pageContainerRef" class="permission-page">
    <!-- 搜索卡片 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入权限名称" clearable />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入权限编码" clearable />
          </el-form-item>
          <el-form-item label="图标:" prop="icon">
            <el-input v-model="state.searchForm.icon" placeholder="请输入权限图标" clearable />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:AUTH:PERMISSION:TREE_EXPAND']">搜索</el-button>
            <el-button @click="resetSearch" v-hasPermission="['SYSTEM:AUTH:PERMISSION:TREE_EXPAND']">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
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
        >
          <el-table-column prop="name" label="名称" width="240" align="left" fixed>
            <template #default="{ row }">
              <span v-if="row.icon" class="permission-icon">
                <el-icon v-if="row.icon.startsWith('el-icon')">
                  <component :is="row.icon" />
                </el-icon>
                <SvgIcon v-else :name="row.icon" width="15" height="15" />
              </span>
              <span :class="{ 'highlight-text': shouldHighlight(row) }">
                {{ row.name }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="code" label="编码" width="180">
            <template #default="{ row }">
              <span :class="{ 'highlight-text': shouldHighlight(row) }">
                {{ row.code }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="resourceType" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getResourceTypeTag(row.resourceType)">
                {{ getResourceTypeText(row.resourceType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="icon" label="图标" width="180" align="center">
            <template #default="{ row }">
              <span :class="{ 'highlight-text': shouldHighlight(row) }">
                {{ row.icon }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="createName" label="创建人" width="180" align="center" />

          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column prop="updateName" label="修改人" width="180" align="center" />

          <el-table-column prop="updateTime" label="更新时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatTime(row.updateTime) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="showDetailDialog(row.id)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:UPDATE']">编辑</el-button>
                <el-dropdown trigger="click" @command="onPermissionDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="create" :disabled="!hasPermission(['SYSTEM:AUTH:PERMISSION:CREATE'])">
                        <el-icon><Plus /></el-icon>
                        <span>新增</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="updateParent" :disabled="!hasPermission(['SYSTEM:AUTH:PERMISSION:UPDATE_PARENT'])">
                        <el-icon><Connection /></el-icon>
                        <span>修改父节点</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided :disabled="!hasPermission(['SYSTEM:AUTH:PERMISSION:DELETE'])">
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
    <IamPermissionCreateDialog v-model="state.dialogs.create.visible" :parent-node="state.currentRow" @success="handleDialogSuccess" />
    <IamPermissionEditDialog v-model="state.dialogs.edit.visible" :permission-id="state.currentId" @success="handleDialogSuccess" />
    <IamPermissionDetailDialog v-model="state.dialogs.detail.visible" :permission-id="state.currentId" />
    <IamPermissionUpdateParentDialog ref="updateParentDialogRef" :permission-tree="state.treeData" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:AUTH:permission'
  })
  import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { hasPermission } from '@/common/utils/Permission.util'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import type { IamPermissionTreeExpandResponseVo } from '@/modules/iam/permission/type/IamPermission.type'
  import IamPermissionCreateDialog from '@/modules/iam/permission/IamPermissionCreateDialog.vue'
  import IamPermissionEditDialog from '@/modules/iam/permission/IamPermissionEditDialog.vue'
  import IamPermissionUpdateParentDialog from '@/modules/iam/permission/IamPermissionUpdateParentDialog.vue'
  import IamPermissionDetailDialog from '@/modules/iam/permission/IamPermissionDetailDialog.vue'
  import SvgIcon from '@/common/components/svgIcon/SvgIcon.vue'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'

  // 常量定义
  const RESOURCE_TYPE_TAG_MAP: Record<string, string> = {
    APP: 'primary',
    MODULE: 'success',
    DIRECTORY: 'info',
    MENU: 'warning',
    BUTTON: 'danger'
  }

  const enumStore = useDictionaryEnumStore()
  const searchFormRef = ref()
  const updateParentDialogRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)

  // 表格高度 - 初始为0，等计算完成后再显示
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
    // 保障最小高度，避免在极小视口下表格不可用
    const newHeight = Math.max(260, cardBody.clientHeight)

    if (tableHeight.value !== newHeight) {
      tableHeight.value = newHeight
    }

    // 首次计算完成后显示表格
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

  // 组件状态
  const state = reactive({
    loading: false,
    searchForm: {
      name: '',
      code: '',
      icon: ''
    },
    currentId: '',
    currentRow: null as IamPermissionTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as IamPermissionTreeExpandResponseVo[],
    tableDataToShow: [] as IamPermissionTreeExpandResponseVo[],
    treeData: null as IamPermissionTreeExpandResponseVo | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false },
      updateParent: { visible: false }
    }
  })

  // 表格操作
  const setDefaultExpandedRows = (nodes: IamPermissionTreeExpandResponseVo[]) => {
    state.expandedRowKeys = nodes.map(node => node.id)
  }

  const collectParentIds = (nodes: IamPermissionTreeExpandResponseVo[], targetId: string): string[] => {
    const result: string[] = []

    const findParent = (nodeList: IamPermissionTreeExpandResponseVo[], target: string): boolean => {
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

  // 搜索功能
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

    const findMatches = (nodes: IamPermissionTreeExpandResponseVo[]) => {
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

    const filterNodes = (nodes: IamPermissionTreeExpandResponseVo[]): IamPermissionTreeExpandResponseVo[] => {
      return nodes
        .filter(node => allExpandedIds.has(node.id))
        .map(node => ({
          ...node,
          children: node.children?.length ? filterNodes(node.children) : undefined
        }))
    }

    state.tableDataToShow = filterNodes(state.tableData)
  }

  const shouldHighlight = (row: IamPermissionTreeExpandResponseVo) => {
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

  // 对话框操作
  const showCreateDialog = (row: IamPermissionTreeExpandResponseVo) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: IamPermissionTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: IamPermissionTreeExpandResponseVo) => {
    updateParentDialogRef.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDialogSuccess = () => {
    state.dialogs.create.visible = false
    state.dialogs.edit.visible = false
    fetchPermissionTree()
  }

  // 工具函数
  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const getResourceTypeTag = (type?: string | null) => {
    if (!type) return 'info'
    const enumItem = enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', type)
    if (!enumItem || !enumItem.code) return 'info'
    return RESOURCE_TYPE_TAG_MAP[enumItem.code] || 'info'
  }

  const getResourceTypeText = (type?: string | null) => {
    if (!type) return '-'
    const enumItem = enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', type)
    return enumItem?.message || type || '-'
  }

  // 删除操作
  const handleDelete = async (row: { id: string }) => {
    try {
      await IamPermissionApi.destroy({ id: row.id })
      handleDialogSuccess()
    } catch (error) {
      console.error('删除权限失败', error)
    }
  }

  /** 处理权限下拉菜单命令 */
  const onPermissionDropdownCommand = (command: string | number | object, row: IamPermissionTreeExpandResponseVo) => {
    handlePermissionDropdownCommand(String(command), row)
  }

  /** 处理权限下拉菜单命令 */
  const handlePermissionDropdownCommand = (command: string, row: IamPermissionTreeExpandResponseVo) => {
    const commandMap: Record<string, () => void> = {
      create: () => showCreateDialog(row),
      updateParent: () => showUpdateParentDialog(row),
      delete: () => {
        // 使用 ElMessageBox 替代 el-popconfirm，因为在下拉菜单中无法使用 el-popconfirm
        ElMessageBox.confirm('确定要删除此权限吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => handleDelete(row))
          .catch(() => {
            // 用户取消删除
          })
      }
    }
    commandMap[command]?.()
  }

  // 数据获取
  const fetchPermissionTree = async () => {
    try {
      state.loading = true
      const res = await IamPermissionApi.treeExpand({ id: 'machine' })
      state.treeData = res
      state.tableData = res.children || []
      state.tableDataToShow = res.children || []
      setDefaultExpandedRows(state.tableData)
    } catch (error) {
      console.error('获取权限树失败', error)
    } finally {
      state.loading = false
    }
  }

  onMounted(async () => {
    await Promise.all([enumStore.getEnumDataAsync('IamPermissionResourceTypeEnum'), enumStore.getEnumDataAsync('IamDataPermissionScopeTypeEnum')])
    await fetchPermissionTree()
    await nextTick()
    setupResizeObserver()
    await updateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  .permission-page {
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
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .el-form-item {
        margin-bottom: 0;
      }

      .el-input {
        width: 200px;
      }

      .el-select {
        width: 200px;
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
      }
    }
  }

  .box-card-data {
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
    }

    .table-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .search-form {
      .button-group {
        margin-left: 0;
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .permission-icon {
    margin-right: 8px;
    vertical-align: middle;

    .icon-image {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
  }

  .el-table {
    :deep(.el-table__cell) {
      padding: 8px 0;
    }
  }

  .highlight-text {
    background-color: #fffb8f;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    :deep(.el-button) {
      margin: 0;
      margin-right: 2px;

      &:last-child {
        margin-right: 0;
      }
    }

    :deep(.el-dropdown) {
      margin-left: 2px;
    }
  }
</style>
