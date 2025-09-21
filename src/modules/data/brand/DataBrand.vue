<template>
  <div>
    <transition name="slide-fade">
      <el-card class="search-card" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="名称:" prop="name" class="form-item-responsive">
              <el-input v-model="state.searchForm.name" placeholder="品牌名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="编码:" prop="code" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="品牌编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.brandStatus" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建人:" prop="createUserIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedCreateUserIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择创建人"
                @remove-tag="removeQueryCreateUser"
                @clear="clearSelectorAllCreateUsers"
              >
                <el-option v-for="user in state.selectedCreateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showCreateUserSelectorDialog"
                    v-hasPermission="['SYSTEM:AUTH:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="修改人:" prop="updateUserIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedUpdateUserIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择修改人"
                @remove-tag="removeQueryUpdateUser"
                @clear="clearSelectorAllUpdateUsers"
              >
                <el-option v-for="user in state.selectedUpdateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showUpdateUserSelectorDialog"
                    v-hasPermission="['SYSTEM:AUTH:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive">
              <el-date-picker
                v-model="state.searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleCreateTimeRangeChange"
              />
            </el-form-item>

            <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive">
              <el-date-picker
                v-model="state.searchForm.updateTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleUpdateTimeRangeChange"
              />
            </el-form-item>
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </transition>

    <!-- 数据卡片 -->
    <el-card class="data-card">
      <div class="operation-buttons">
        <el-button type="primary" @click="showAddDialog" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <el-table :data="state.tableData" border v-loading="state.loading" :height="state.dataCardHeight" style="margin: 10px 0" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" align="center" v-if="false" />
        <el-table-column label="序号" align="center" type="index" width="60" fixed />
        <el-table-column prop="name" label="名称" align="center" width="180" fixed />
        <el-table-column prop="code" label="编码" align="center" width="160" />

        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'ENABLE'"
              :inactive-value="'DISABLE'"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="toggleStatus(row)"
              v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:UPDATE_STATUS']"
            />
          </template>
        </el-table-column>

        <el-table-column prop="logoUrl" label="LOGO" align="center" width="150">
          <template #default="{ row }">
            <DataBrandLogoPreview :url="row.logoUrl" />
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip />
        <el-table-column prop="createName" label="创建人" align="center" width="120" />
        <el-table-column prop="createTime" label="创建时间" align="center" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateName" label="修改人" align="center" width="120" />
        <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="showEdit(row)" v-hasPermission="['SYSTEM:BASIC_DATA:BRAND:UPDATE']">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="state.pagination.current"
        v-model:page-size="state.pagination.size"
        :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="state.pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 对话框组件 -->
    <DataBrandAddDialog v-model="state.dialog.add" @success="fetchBrandList" />
    <DataBrandEditDialog v-model="state.dialog.edit" :brand-id="state.currentBrandId" @success="fetchBrandList" />
    <DataBrandDetailDialog v-model="state.dialog.detail" :brand-id="state.currentBrandId" />

    <IamUserQuickSelectDialog
      v-model="state.createUserDialogVisible"
      @confirm="handleCreateUserSelect"
      :multiple="true"
      :selected-users="state.selectedCreateUsers"
    />
    <IamUserQuickSelectDialog
      v-model="state.updateUserDialogVisible"
      @confirm="handleUpdateUserSelect"
      :multiple="true"
      :selected-users="state.selectedUpdateUsers"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import type { DataBrandExpandPageResponse } from '@/modules/data/brand/type/DataBrand.type'
  import DataBrandAddDialog from '@/modules/data/brand/DataBrandAddDialog.vue'
  import DataBrandDetailDialog from '@/modules/data/brand/DataBrandDetailDialog.vue'
  import DataBrandEditDialog from '@/modules/data/brand/DataBrandEditDialog.vue'
  import DataBrandLogoPreview from '@/modules/data/brand/DataBrandLogoPreview.vue'
  import IamUserQuickSelectDialog from '@/modules/iam/user/IamUserQuickSelectDialog.vue'
  import type { IamUserSimpleListResponseVo } from '@/modules/iam/types'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentBrandId: '',
    dataCardHeight: 'calc(100vh - 400px)',
    brandStatus: [],
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    searchForm: {
      code: '',
      name: '',
      status: null as string | null,
      createUserIdSet: [] as string[],
      updateUserIdSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      edit: false,
      detail: false
    },
    tableData: [] as DataBrandExpandPageResponse['records'],
    // 新增的用户选择相关状态
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as IamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as IamUserSimpleListResponseVo[]
  })

  const searchFormRef = ref()

  // 计算属性
  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || { id })
    }
  })

  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || { id })
    }
  })

  // 监听搜索框展开状态，调整表格高度
  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.dataCardHeight = newVal ? 'calc(100vh - 400px)' : 'calc(100vh - 200px)'
      }, 80)
    },
    { immediate: false }
  )

  // 方法
  const fetchBrandList = async () => {
    try {
      state.loading = true
      const params = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.code && { code: state.searchForm.code }),
        ...(state.searchForm.name && { name: state.searchForm.name }),
        ...(state.searchForm.status && { status: state.searchForm.status }),
        ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
        ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) }),
        ...(state.searchForm.createStartTime && { createStartTime: state.searchForm.createStartTime }),
        ...(state.searchForm.createEndTime && { createEndTime: state.searchForm.createEndTime }),
        ...(state.searchForm.updateStartTime && { updateStartTime: state.searchForm.updateStartTime }),
        ...(state.searchForm.updateEndTime && { updateEndTime: state.searchForm.updateEndTime })
      }

      const res = await DataBrandApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchBrandList()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.createTimeRange = []
    state.searchForm.createStartTime = undefined
    state.searchForm.createEndTime = undefined
    state.searchForm.updateTimeRange = []
    state.searchForm.updateStartTime = undefined
    state.searchForm.updateEndTime = undefined
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    handleSearch()
  }

  const handlePageChange = () => fetchBrandList()
  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchBrandList()
  }

  const showAddDialog = () => {
    state.dialog.add = true
  }

  const showDetail = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.detail = true
  }

  const showEdit = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.edit = true
  }

  // 新增的时间范围处理方法
  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.createStartTime = value[0]
      state.searchForm.createEndTime = value[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.updateStartTime = value[0]
      state.searchForm.updateEndTime = value[1]
    } else {
      state.searchForm.updateStartTime = undefined
      state.searchForm.updateEndTime = undefined
    }
  }

  // 新增的用户选择相关方法
  const showCreateUserSelectorDialog = () => {
    state.createUserDialogVisible = true
  }

  const clearSelectorAllCreateUsers = () => {
    state.selectedCreateUsers = []
  }

  const removeQueryCreateUser = (userId: string) => {
    state.selectedCreateUsers = state.selectedCreateUsers.filter(user => user.id !== userId)
  }

  const handleCreateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }

  const showUpdateUserSelectorDialog = () => {
    state.updateUserDialogVisible = true
  }

  const clearSelectorAllUpdateUsers = () => {
    state.selectedUpdateUsers = []
  }

  const removeQueryUpdateUser = (userId: string) => {
    state.selectedUpdateUsers = state.selectedUpdateUsers.filter(user => user.id !== userId)
  }

  const handleUpdateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  const toggleStatus = async (row: { id: string; name: string; status: string }) => {
    try {
      const action = row.status === 'ENABLE' ? '禁用' : '启用'
      await ElMessageBox.confirm(`确定要${action}品牌 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DataBrandApi.updateStatus({
        id: row.id,
        status: row.status
      })

      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('修改品牌状态失败:', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 初始化
  onMounted(async () => {
    // 枚举选项
    state.brandStatus = await enumStore.getEnumDataAsync('StatusEnum')
    await fetchBrandList()
  })
</script>

<style scoped lang="scss">
  /* 添加动画效果 */
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.6s ease;
    overflow: hidden;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
    height: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .search-card,
  .data-card {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    margin: 4px;
    transition: all 0.6s ease;
  }

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
        &.user-selector {
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

  .data-card {
    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .el-switch {
        margin-left: 8px;
      }
    }
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .form-item-responsive {
      flex-basis: 30% !important;
    }
  }

  @media (max-width: 768px) {
    .form-item-responsive {
      flex-basis: 45% !important;
    }

    .button-group {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
