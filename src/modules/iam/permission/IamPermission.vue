<template>
  <div>
    <!-- 搜索卡片 -->
    <el-card class="box-card-form">
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
    <el-card class="box-card-data">
      <el-table
        :data="state.tableDataToShow"
        row-key="id"
        height="calc(100vh - 200px)"
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
            <el-button size="small" @click="showDetailDialog(row.id)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:DETAIL']">详情</el-button>
            <el-button size="small" type="primary" @click="showCreateDialog(row)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:CREATE']">新增</el-button>
            <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:UPDATE']">编辑</el-button>
            <el-button size="small" type="warning" @click="showUpdateParentDialog(row)" v-hasPermission="['SYSTEM:AUTH:PERMISSION:UPDATE_PARENT']">
              修改父节点
            </el-button>
            <el-popconfirm title="确定要删除此权限吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button size="small" type="danger" v-hasPermission="['SYSTEM:AUTH:PERMISSION:DELETE']">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 对话框组件 -->
    <IamPermissionCreateDialog v-model="state.dialogs.create.visible" :parent-node="state.currentRow" @success="handleDialogSuccess" />
    <IamPermissionEditDialog v-model="state.dialogs.edit.visible" :permission-id="state.currentId" @success="handleDialogSuccess" />
    <IamPermissionDetailDialog v-model="state.dialogs.detail.visible" :permission-id="state.currentId" />
    <IamPermissionUpdateParentDialog ref="updateParentDialogRef" :permission-tree="state.treeData" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import type { IamPermissionTreeExpandResponseVo } from '@/modules/iam/permission/type/IamPermission.type'
  import IamPermissionCreateDialog from '@/modules/iam/permission/IamPermissionCreateDialog.vue'
  import IamPermissionEditDialog from '@/modules/iam/permission/IamPermissionEditDialog.vue'
  import IamPermissionUpdateParentDialog from '@/modules/iam/permission/IamPermissionUpdateParentDialog.vue'
  import IamPermissionDetailDialog from '@/modules/iam/permission/IamPermissionDetailDialog.vue'
  import SvgIcon from '@/modules/common/components/svgIcon/SvgIcon.vue'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'

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
    const enumItem = enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', type)
    return RESOURCE_TYPE_TAG_MAP[enumItem.code]
  }

  const getResourceTypeText = (type?: string | null) => {
    const enumItem = enumStore.getEnumItemByCodeSync('IamPermissionResourceTypeEnum', type)
    return enumItem.message
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
  })
</script>

<style scoped lang="scss">
  .box-card-form {
    margin: 4px;
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
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
</style>
