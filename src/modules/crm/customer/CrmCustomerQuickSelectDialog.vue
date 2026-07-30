<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择客户'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="70%"
    top="5vh"
  >
    <div class="customer-selector-container">
      <!-- 搜索区域 -->
      <el-card class="box-card-form">
        <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="100px">
          <div class="form-items-group">
            <el-form-item label="客户编码:" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="请输入客户编码" clearable />
            </el-form-item>
            <el-form-item label="身份证号:" class="form-item-responsive">
              <el-input v-model="state.searchForm.identityCardNumber" placeholder="请输入身份证号" clearable />
            </el-form-item>
            <el-form-item label="创建时间:" class="form-item-responsive">
              <el-date-picker
                v-model="state.searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleTimeChange"
              />
            </el-form-item>
          </div>
          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:CRM:CUSTOMER:CUSTOMER:PAGE_SIMPLE']">搜索</el-button>
              <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:CRM:CUSTOMER:CUSTOMER:PAGE_SIMPLE']">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-card>

      <!-- 客户列表 -->
      <el-table
        ref="customerTableRef"
        :data="state.customerList"
        row-key="id"
        height="400"
        v-loading="state.customerDataLoading"
        @selection-change="handleSelectionChange"
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
        <el-table-column prop="code" label="客户编码" align="center" width="120" fixed="left" />
        <el-table-column prop="identityCardNumber" label="身份证号" align="center" width="180" />
        <el-table-column prop="name" label="姓名" align="center" width="120" />
        <el-table-column prop="gender" label="性别" align="center" width="80">
          <template #default="{ row }">
            {{ getCustomerGenderLabel(row.gender) }}
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
        :page-sizes="[10, 20, 50, 100]"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-hasPermission="['MANAGE_APP:CRM:CUSTOMER:CUSTOMER:PAGE_SIMPLE']"
      />
    </div>

    <template #footer>
      <div class="footer-container">
        <div v-if="multiple" class="selected-info">
          已选择 {{ state.selectedCount }} 个客户
          <el-button type="warning" @click="clearAllSelection" v-if="state.selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElTable } from 'element-plus'
  import { reactive, watch, computed, ref } from 'vue'
  import { CrmCustomerApi } from '@/modules/crm/customer/api/CrmCustomer.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { CrmCustomerQueryPageRequestVo, CrmCustomerSimpleListResponseVo } from '@/modules/crm/customer/type/CrmCustomer.type'

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
    selectedCustomers: {
      type: Array as () => CrmCustomerSimpleListResponseVo[],
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
    customerDataLoading: false,

    // 选择的客户信息
    customerList: [] as CrmCustomerSimpleListResponseVo[],
    singleSelected: null as string | null,
    selectedRows: new Map<string, CrmCustomerSimpleListResponseVo>(),
    selectedCount: computed(() => state.selectedRows.size),

    searchForm: {
      code: '',
      identityCardNumber: '',
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    pagination: {
      current: 1,
      size: 10,
      total: 0
    }
  })

  const customerTableRef = ref<InstanceType<typeof ElTable>>()

  // 方法
  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const getCustomerGenderLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('GenderEnum', type)
    return enumItem?.message || type
  }

  const isRowDisabled = (row: CrmCustomerSimpleListResponseVo) => {
    return props.selectedCustomers.some(customer => customer.id === row.id)
  }

  const handleRadioChange = (row: CrmCustomerSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
    }
  }

  const handleSelectionChange = (rows: CrmCustomerSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 创建当前页所有行的ID集合
    const currentPageIds = new Set(state.customerList.map(row => row.id))

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
    customerTableRef.value?.clearSelection()
  }

  const handleTimeChange = () => {
    const range = state.searchForm.createTimeRange
    if (range && range.length === 2) {
      state.searchForm.createStartTime = range[0]
      state.searchForm.createEndTime = range[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchCustomerList()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchCustomerList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchCustomerList()
  }

  const fetchCustomerList = async () => {
    try {
      state.customerDataLoading = true
      const params: CrmCustomerQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...state.searchForm
      }

      const res = await CrmCustomerApi.pageSimple(params)
      state.customerList = res.records
      state.pagination.total = res.total

      // 设置选中状态
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        customerTableRef.value?.clearSelection()
        state.customerList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            customerTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    } finally {
      state.customerDataLoading = false
    }
  }

  const resetSearch = () => {
    state.searchForm = {
      code: '',
      identityCardNumber: '',
      createTimeRange: [],
      createStartTime: undefined,
      createEndTime: undefined
    }
    handleSearch()
  }

  const handleDialogClosed = () => {
    state.searchForm = {
      code: '',
      identityCardNumber: '',
      createTimeRange: [],
      createStartTime: undefined,
      createEndTime: undefined
    }
    state.pagination.current = 1
    state.pagination.size = 10
    state.pagination.total = 0
    state.customerList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (state.selectedCount === 0) {
        ElMessage.warning('请至少选择一个客户')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个客户')
        return
      }
      const selectedCustomer = state.customerList.find(row => row.id === state.singleSelected)
      if (selectedCustomer) {
        emit('confirm', [selectedCustomer])
      }
    }
    state.dialogVisible = false
  }

  // 监听对话框显示状态
  watch(
    () => props.modelValue,
    async val => {
      if (!val) {
        return
      }

      // 初始化选择的数据状态
      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedCustomers.forEach(customer => {
          state.selectedRows.set(customer.id, customer)
        })
      }
      await fetchCustomerList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .customer-selector-container {
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
