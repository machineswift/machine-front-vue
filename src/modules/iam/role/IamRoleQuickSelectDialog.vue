<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择角色'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="64%"
    top="5vh"
  >
    <div class="role-selector-container">
      <!-- 搜索区域 -->
      <el-card class="box-card-form">
        <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="角色名称:" class="form-item-responsive">
              <el-input v-model="state.searchForm.name" placeholder="请输入角色名称" clearable />
            </el-form-item>
            <el-form-item label="角色编码:" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="请输入角色编码" clearable />
            </el-form-item>
            <el-form-item label="状态:" class="form-item-responsive" prop="status">
              <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.roleStatus" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="角色类型:" class="form-item-responsive">
              <el-select v-model="state.searchForm.type" placeholder="请选择角色类型" clearable>
                <el-option v-for="item in state.roleTypes" :key="item.code" :label="item.message" :value="item.code" />
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

      <!-- 角色列表 -->
      <el-table
        ref="roleTableRef"
        :data="state.roleList"
        row-key="id"
        border
        height="400"
        v-loading="state.loading"
        @selection-change="handleSelectionChange"
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
        <el-table-column prop="name" label="角色名称" align="center" width="120" fixed="left" />
        <el-table-column prop="code" label="角色编码" align="center" width="180" />
        <el-table-column prop="type" label="角色类型" align="center" width="100">
          <template #default="{ row }">
            {{ getRoleTypeLabel(row.type) }}
          </template>
        </el-table-column>
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

    <template #footer>
      <div class="footer-container">
        <div v-if="multiple" class="selected-info">
          已选择 {{ state.selectedCount }} 个角色
          <el-button type="warning" @click="clearAllSelection" v-if="state.selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" v-hasPermission="['SYSTEM:AUTH:ROLE:PAGE_SIMPLE']">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElTable } from 'element-plus'
  import { reactive, watch, computed, ref } from 'vue'
  import { IamRoleApi } from '@/modules/iam/role/api/IamRole.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { IamRoleQueryPageRequestVo, IamRoleSimpleListResponseVo } from '@/modules/iam/role/type/IamRole.type'

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
    roleType: {
      type: String,
      default: null as string | null
    },
    selectedRoles: {
      type: Array as () => IamRoleSimpleListResponseVo[],
      default: () => []
    }
  })

  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'confirm'])

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    // 枚举状态
    roleStatus: [] as Array<{ code: string; message: string }>,
    roleTypes: [] as Array<{ code: string; message: string }>,

    // 选择的角色数据
    singleSelected: null as string | null,
    roleList: [] as IamRoleSimpleListResponseVo[],
    selectedRows: new Map<string, IamRoleSimpleListResponseVo>(),
    selectedCount: computed(() => state.selectedRows.size),

    searchForm: {
      name: '',
      code: '',
      status: null as string | null,
      type: null as string | null
    },
    pagination: {
      current: 1,
      size: 10,
      total: 0
    }
  })

  const roleTableRef = ref<InstanceType<typeof ElTable>>()

  // 方法
  const getRoleTypeLabel = (type: string) => {
    const enumItem = enumStore.getEnumItemByCodeSync('IamRoleTypeEnum', type)
    return enumItem?.message || type
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const isRowDisabled = (row: IamRoleSimpleListResponseVo) => {
    return props.selectedRoles.some(role => role.id === row.id)
  }

  const handleRadioChange = (row: IamRoleSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
    }
  }

  const handleSelectionChange = (rows: IamRoleSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 创建当前页所有行的ID集合
    const currentPageIds = new Set(state.roleList.map(row => row.id))

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
    roleTableRef.value?.clearSelection()
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchRoleList()
  }

  const resetSearch = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.status = null
    state.searchForm.type = null
    handleSearch()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchRoleList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchRoleList()
  }

  const fetchRoleList = async () => {
    try {
      state.loading = true
      const params: IamRoleQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...state.searchForm
      }

      const res = await IamRoleApi.pageSimple(params)
      state.roleList = res.records
      state.pagination.total = res.total

      // 设置选中状态
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        roleTableRef.value?.clearSelection()
        state.roleList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            roleTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.status = null
    state.searchForm.type = null
    state.pagination.current = 1
    state.pagination.size = 10
    state.pagination.total = 0
    state.roleList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (state.selectedCount === 0) {
        ElMessage.warning('请至少选择一个角色')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个角色')
        return
      }
      const selectedRole = state.roleList.find(row => row.id === state.singleSelected)
      if (selectedRole) {
        emit('confirm', [selectedRole])
      }
    }
    state.dialogVisible = false
  }

  watch(
    () => props.modelValue,
    async val => {
      if (!val) {
        return
      }
      const [roleStatus, roleTypes] = await Promise.all([enumStore.getEnumDataAsync('StatusEnum'), enumStore.getEnumDataAsync('IamRoleTypeEnum')])

      state.roleStatus = roleStatus
      state.roleTypes = roleTypes
      state.searchForm.type = props.roleType

      // 初始化选择的数据状态
      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedRoles.forEach(role => {
          state.selectedRows.set(role.id, role)
        })
      }
      await fetchRoleList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .role-selector-container {
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
      }
    }
  }

  :deep(.hidden-radio) {
    .el-radio__label {
      display: none !important;
    }
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
