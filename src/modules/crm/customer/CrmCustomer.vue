<template>
  <div class="customer-page-div">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
          <div class="form-items-group">
            <el-form-item label="客户编码:" prop="code" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="请输入客户编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="身份证号:" prop="identityCardNumber" class="form-item-responsive">
              <el-input v-model="state.searchForm.identityCardNumber" placeholder="请输入身份证号" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive">
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
              <el-button type="primary" @click="handleSearch" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:PAGE_EXPAND']">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </transition>

    <!-- 数据卡片 -->
    <el-card class="box-card-data">
      <div class="operation-buttons">
        <el-button type="primary" size="default" @click="showAddDialog">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <el-table :data="state.tableData" border style="margin: 10px 0" v-loading="state.loading" :height="state.dataCardHeight" stripe highlight-current-row>
        <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
        <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
        <el-table-column prop="code" label="客户编码" align="center" width="120" fixed></el-table-column>
        <el-table-column prop="identityCardNumber" label="身份证号" align="center" width="180"></el-table-column>
        <el-table-column prop="name" label="姓名" align="center" width="120"></el-table-column>
        <el-table-column prop="gender" label="性别" align="center" width="80">
          <template #default="{ row }">
            {{ getCustomerGenderLabel(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="createName" label="创建人" align="center" width="160"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatTimestamp(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateName" label="修改人" align="center" width="160"></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatTimestamp(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:DETAIL']">详情</el-button>
            <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:UPDATE']">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" v-hasPermission="['CRM:CUSTOMER:CUSTOMER:DELETE']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="state.pagination.current"
        v-model:page-size="state.pagination.size"
        :page-sizes="[20, 50, 100, 200]"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="state.pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        v-hasPermission="['CRM:CUSTOMER:CUSTOMER:PAGE_EXPAND']"
      />
    </el-card>

    <!-- 对话框组件 -->
    <CrmCustomerAddDialog v-model="state.dialog.add" @success="handleAddSuccess" />
    <CrmCustomerDetailDialog v-model="state.dialog.detail" :customerId="state.currentCustomerId" />
    <CrmCustomerEditDialog v-model="state.dialog.edit" :customerId="state.currentCustomerId" @success="handleEditSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { CrmCustomerApi } from '@/modules/crm/customer/api/CrmCustomer.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { CrmCustomerDetailResponseVo, CrmCustomerExpandPageResponse, CrmCustomerQueryPageRequestVo } from '@/modules/crm/customer/type/CrmCustomer.type'
  import CrmCustomerAddDialog from '@/modules/crm/customer/CrmCustomerAddDialog.vue'
  import CrmCustomerDetailDialog from '@/modules/crm/customer/CrmCustomerDetailDialog.vue'
  import CrmCustomerEditDialog from '@/modules/crm/customer/CrmCustomerEditDialog.vue'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    dataCardHeight: 'calc(100vh - 300px)',

    currentCustomerId: '',
    tableData: [] as CrmCustomerDetailResponseVo[],

    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      code: '',
      identityCardNumber: '',
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    // 对话框状态
    dialog: {
      add: false,
      detail: false,
      edit: false
    }
  })

  const searchFormRef = ref()

  // 构建查询参数
  const buildQueryParams = (): CrmCustomerQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.identityCardNumber && { identityCardNumber: searchForm.identityCardNumber }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime })
    }
  }

  // 获取客户列表
  const fetchData = async () => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const res: CrmCustomerExpandPageResponse = await CrmCustomerApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取客户列表失败', error)
    } finally {
      state.loading = false
    }
  }

  // 处理时间范围变更
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

  // 搜索
  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  // 重置搜索
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

  // 分页处理
  const handlePageChange = (current: number) => {
    state.pagination.current = current
    fetchData()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchData()
  }

  // 对话框操作
  const showAddDialog = () => {
    state.dialog.add = true
  }

  const showDetailDialog = (row: CrmCustomerDetailResponseVo) => {
    state.currentCustomerId = row.id
    state.dialog.detail = true
  }

  const showEditDialog = (row: CrmCustomerDetailResponseVo) => {
    state.currentCustomerId = row.id
    state.dialog.edit = true
  }

  // 删除操作
  const handleDelete = async (row: CrmCustomerDetailResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除客户 ${row.name || row.code} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await CrmCustomerApi.destroy({ id: row.id })
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除客户失败', error)
      }
    }
  }

  // 成功回调
  const handleAddSuccess = () => {
    fetchData()
  }

  const handleEditSuccess = () => {
    fetchData()
  }

  // 工具函数
  const getCustomerGenderLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('CrmGenderEnum', type)
    return enumItem?.message || type
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  // 生命周期
  onMounted(async () => {
    // 枚举选项
    await Promise.all([enumStore.getEnumDataAsync('CrmGenderEnum')])

    await fetchData()
  })
</script>

<style lang="scss" scoped>
  .customer-page-div {
    padding: 2px;

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
          gap: 8px;
          align-items: flex-start;

          .form-item-responsive {
            margin-bottom: 8px;
            flex: 1 1 320px;
            min-width: 120px;
            max-width: 320px;

            &.role-selector {
              min-width: 320px;
            }

            &.shop-selector {
              min-width: 320px;
            }
          }
        }

        .button-group {
          margin-left: auto;
          white-space: nowrap;
          margin-top: 4px;
        }
      }
    }

    .box-card-data {
      margin: 2px;
      border-radius: 2px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

      .operation-buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
    }
  }

  // 动画效果
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }
</style>
