<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择用户'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="66%"
    top="5vh"
  >
    <el-splitter>
      <!-- 左侧组织树面板 -->
      <el-splitter-panel collapsible size="28%">
        <el-card class="box-card-tree-select">
          <template #header>
            <el-select v-model="state.searchForm.organizationType">
              <el-option v-for="option in organizationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
          <el-input v-model="state.organizationQuery" placeholder="请输入关键字" @input="onOrganizationQueryChanged" />
          <el-tree-v2
            ref="organizationTreeRef"
            :data="currentOrganizationTreeOptions"
            :props="state.organizationProps"
            :filter-method="organizationFilterMethod"
            @check="handleOrganizationCheck"
            show-checkbox
            :height="440"
          />
        </el-card>
      </el-splitter-panel>

      <!-- 右侧内容面板 -->
      <el-splitter-panel :min="200">
        <div class="user-selector-container">
          <!-- 搜索区域 -->
          <el-card class="box-card-form">
            <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="80px">
              <div class="form-items-group">
                <el-form-item label="用户姓名:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="请输入用户姓名" clearable />
                </el-form-item>
                <el-form-item label="用户名:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.username" placeholder="请输入用户名" clearable />
                </el-form-item>
                <el-form-item label="手机号:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.phone" placeholder="请输入手机号" clearable />
                </el-form-item>
                <el-form-item label="状态:" class="form-item-responsive" prop="status">
                  <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                    <el-option v-for="option in userStatus" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
              </div>
              <!-- 操作按钮组 -->
              <div class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>

          <!-- 用户列表 -->
          <el-table
            ref="userTableRef"
            :data="state.userList"
            row-key="id"
            height="400"
            v-loading="state.userDataLoading"
            @selection-change="rows => handleSelectionChange(rows as BIamUserSimpleListResponseVo[])"
            @row-click="handleRowClick"
            border
            stripe
            style="margin: 10px 0"
          >
            <el-table-column v-if="multiple" type="selection" width="55" :reserve-selection="true" />
            <el-table-column v-else label="操作" width="55" fixed="left">
              <template #default="{ row }">
                <el-radio
                  v-model="state.singleSelected"
                  :label="row.id"
                  :disabled="isRowDisabled(row)"
                  @change="() => handleRadioChange(row)"
                  class="hidden-radio"
                />
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" align="center" width="120" fixed="left" />
            <el-table-column prop="name" label="姓名" align="center" width="120" />
            <el-table-column prop="phone" label="手机号" align="center" width="150" />
            <el-table-column prop="status" label="状态" align="center" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ENABLE' ? 'success' : 'danger'">
                  {{ row.status === 'ENABLE' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :total="state.pagination.total"
            :pager-count="5"
            :page-sizes="[10, 20, 50, 200, 500]"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-splitter-panel>
    </el-splitter>

    <template #footer>
      <div class="footer-container">
        <div v-if="multiple" class="selected-info">
          已选择 {{ selectedCount }} 个用户
          <el-button type="warning" @click="clearAllSelection" v-if="selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage, ElTable, ElTreeV2, type TreeNodeData, type TableInstance } from 'element-plus'
  import { BIamUserApi } from '@/modules/biam/user/api/BIamUser.api'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS, DICT_IAM_ORG_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamUserQueryPageRequestVo, BIamUserSimpleListResponseVo } from '@/modules/biam/user/type/BIamUser.type'
  import type { BIamOrganizationSimpleTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectedUsers: {
      type: Array as () => BIamUserSimpleListResponseVo[],
      default: () => []
    }
  })

  const { options: userStatus, load: loadUserStatus } = useEnumOptions(DICT_STATUS)
  const { options: organizationTypeOptions, load: loadOrganizationTypeOptions } = useEnumOptions(DICT_IAM_ORG_TYPE)
  const emit = defineEmits(['update:modelValue', 'confirm'])

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    userDataLoading: false,

    // 组织树
    organizationQuery: '',
    organizationTreeOptionsMap: new Map<string, BIamOrganizationSimpleTreeResponseVo[]>(),

    // 选择的用户信息
    userList: [] as BIamUserSimpleListResponseVo[],
    singleSelected: null as string | null,
    selectedRows: new Map<string, BIamUserSimpleListResponseVo>(),

    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    searchForm: {
      name: '',
      username: '',
      phone: '',
      status: null as string | null,
      organizationType: null as string | null,
      organizationIdSet: [] as string[]
    },
    pagination: {
      current: 1,
      size: 10,
      total: 0
    }
  })

  const selectedCount = computed(() => state.selectedRows.size)

  const userTableRef = ref<TableInstance>()
  const organizationTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  // 计算当前组织的状态
  const currentOrganizationTreeOptions = ref<BIamOrganizationSimpleTreeResponseVo[]>([])

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const isRowDisabled = (row: BIamUserSimpleListResponseVo) => {
    return props.selectedUsers.some(user => user.id === row.id)
  }

  const handleRadioChange = (row: BIamUserSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
    }
  }

  const handleRowClick = (row: unknown, column: { type?: string } | null) => {
    // 点击复选框列时由复选框自身处理，避免重复切换
    if (column?.type === 'selection') {
      return
    }

    if (props.multiple) {
      userTableRef.value?.toggleRowSelection(row as BIamUserSimpleListResponseVo, !state.selectedRows.has((row as BIamUserSimpleListResponseVo).id))
    } else {
      handleRadioChange(row as BIamUserSimpleListResponseVo)
    }
  }

  const handleSelectionChange = (rows: BIamUserSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 创建当前页所有行的ID集合
    const currentPageIds = new Set(state.userList.map(row => row.id))

    // 移除当前页未选中的行
    currentPageIds.forEach(id => {
      if (!rows.some(row => row.id === id)) {
        newSelectedRows.delete(id)
      }
    })

    // 添加当前页新选中的行
    rows.forEach(row => {
      newSelectedRows.set(row.id, row)
    })

    state.selectedRows = newSelectedRows
  }

  const clearAllSelection = () => {
    state.selectedRows.clear()
    userTableRef.value?.clearSelection()
  }

  const onOrganizationQueryChanged = () => {
    if (organizationTreeRef.value) {
      organizationTreeRef.value.filter(state.organizationQuery.trim())
    }

    if (state.organizationQuery.trim() === '') {
      organizationTreeRef.value?.setExpandedKeys([])
    }
  }

  const organizationFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleOrganizationCheck = () => {
    if (organizationTreeRef.value) {
      state.searchForm.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(
        currentOrganizationTreeOptions.value,
        organizationTreeRef.value.getCheckedKeys() as string[]
      ).map(node => node.id)
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchUserList()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchUserList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchUserList()
  }

  const fetchUserList = async () => {
    try {
      state.userDataLoading = true
      const params: BIamUserQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...state.searchForm,
        status: state.searchForm.status ?? undefined,
        organizationType: state.searchForm.organizationType ?? undefined
      }

      const res = await BIamUserApi.pageSimple(params)
      state.userList = res.records
      state.pagination.total = res.total

      // 设置选中状态
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        userTableRef.value?.clearSelection()
        state.userList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            userTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      state.userDataLoading = false
    }
  }

  const resetSearch = () => {
    state.searchForm = {
      name: '',
      username: '',
      phone: '',
      status: null as string | null,
      organizationType: state.searchForm.organizationType,
      organizationIdSet: [] as string[]
    }
    state.organizationQuery = ''
    organizationTreeRef.value?.setCheckedKeys([])
    handleSearch()
  }

  const handleDialogClosed = () => {
    state.searchForm = {
      name: '',
      username: '',
      phone: '',
      status: null as string | null,
      organizationType: null as string | null,
      organizationIdSet: [] as string[]
    }
    state.organizationQuery = ''
    state.pagination.current = 1
    state.pagination.size = 10
    state.pagination.total = 0
    state.userList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (selectedCount.value === 0) {
        ElMessage.warning('请至少选择一个用户')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个用户')
        return
      }
      const selectedUser = state.userList.find(row => row.id === state.singleSelected)
      if (selectedUser) {
        emit('confirm', [selectedUser])
      }
    }
    state.dialogVisible = false
  }

  // 监听组织类型变化
  watch(
    () => state.searchForm.organizationType,
    async organizationType => {
      if (!organizationType) {
        return
      }

      if (!state.organizationTreeOptionsMap.has(organizationType)) {
        const response = await BIamOrganizationApi.treeSimple({ type: organizationType })
        state.organizationTreeOptionsMap.set(organizationType, response.children ?? [])
      }

      state.searchForm.organizationIdSet = []
      organizationTreeRef.value?.setCheckedKeys([])
      currentOrganizationTreeOptions.value = state.organizationTreeOptionsMap.get(organizationType) || []
    },
    { immediate: false }
  )

  // 监听对话框显示状态
  watch(
    () => props.modelValue,
    async val => {
      if (!val) {
        return
      }

      await loadUserStatus()
      await loadOrganizationTypeOptions()
      state.searchForm.organizationType = organizationTypeOptions.value[0]?.code ?? null

      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedUsers.forEach(user => {
          state.selectedRows.set(user.id, user)
        })
      }
      await fetchUserList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .user-selector-container {
    padding: 2px;
  }

  .box-card-form {
    margin: 2px;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      flex-direction: column;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        align-items: flex-start;

        .form-item-responsive {
          margin-bottom: 2px;
          flex: 1 1 240px;
          min-width: 120px;
          max-width: 240px;
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }

  .box-card-tree-select {
    margin: 4px;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .el-select {
      margin: 0 0 0 0;
      width: 100%;
    }
  }

  :deep(.hidden-radio) {
    .el-radio__label {
      display: none !important;
    }
  }

  :deep(.el-table__row) {
    cursor: pointer;
  }

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .selected-info {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }

    .footer-buttons {
      margin-left: auto;
    }
  }
</style>
