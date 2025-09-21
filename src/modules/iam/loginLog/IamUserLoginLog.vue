<template>
  <div>
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="操作人:" prop="operatorIdSet" class="form-item-responsive user-selector">
              <el-select
                v-model="selectedOperatorIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择操作人"
                @remove-tag="removeQueryOperator"
                @clear="clearSelectorAllOperators"
              >
                <el-option v-for="user in state.selectedOperators" :key="user.id" :label="user.name || user.username" :value="user.id" />
                <template #prefix>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="showOperatorSelectorDialog"
                    v-hasPermission="['SYSTEM:AUTH:USER:PAGE_SIMPLE']"
                    style="margin-right: 8px; height: 24px"
                  >
                    选择
                  </el-button>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item label="登录时间:" prop="timeRange" class="form-item-responsive">
              <el-date-picker
                v-model="state.searchForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="x"
              />
            </el-form-item>
            <el-form-item label="认证动作:" prop="authAction" class="form-item-responsive">
              <el-select v-model="state.searchForm.authAction" placeholder="选择认证动作" clearable>
                <el-option v-for="option in state.authActionOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="认证方式:" prop="authMethod" class="form-item-responsive">
              <el-select v-model="state.searchForm.authMethod" placeholder="选择认证方式" clearable>
                <el-option v-for="option in state.authMethodOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="认证结果:" prop="authResult" class="form-item-responsive">
              <el-select v-model="state.searchForm.authResult" placeholder="选择认证结果" clearable>
                <el-option v-for="option in state.authResultOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:AUTH:LOGIN_LOG:PAGE_EXPAND']">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleResetSearch" v-hasPermission="['SYSTEM:AUTH:LOGIN_LOG:PAGE_EXPAND']">
                <el-icon>
                  <Refresh />
                </el-icon>
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
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <!-- 数据表格 -->
      <el-table :data="state.tableData" border style="margin: 10px 0" v-loading="state.isLoading" :height="state.tableHeight" stripe highlight-current-row>
        <el-table-column label="序号" align="center" type="index" width="60" fixed />
        <el-table-column prop="username" label="用户名" align="center" width="120" fixed />
        <el-table-column prop="name" label="姓名" align="center" width="100" />
        <el-table-column prop="phone" label="手机号" align="center" width="120" />

        <el-table-column prop="authAction" label="认证动作" align="center" width="120">
          <template #default="{ row }">
            <el-tag>{{ formatEnumDisplay('IamAuthActionEnum', row.authAction) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="authMethod" label="认证方式" align="center" width="140">
          <template #default="{ row }">
            <el-tag>{{ formatEnumDisplay('IamAuthMethodEnum', row.authMethod) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="authResult" label="认证结果" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.authResult === 'SUCCESS' ? 'success' : 'danger'">
              {{ formatEnumDisplay('IamAuthResultEnum', row.authResult) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="ipAddress" label="IP地址" align="center" width="140" />
        <el-table-column prop="platform" label="平台" align="center" width="120" />
        <el-table-column prop="failReason" label="失败原因" align="center" width="240" />
        <el-table-column prop="updateName" label="操作人" align="center" width="120" />

        <el-table-column prop="createTime" label="登录时间" align="center" width="160">
          <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="default" @click="showDetail(row)" v-hasPermission="['SYSTEM:AUTH:LOGIN_LOG:DETAIL']">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="state.pagination.current"
        v-model:page-size="state.pagination.size"
        :page-sizes="[20, 50, 100, 200, 500, 1000]"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="state.pagination.total"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
        v-hasPermission="['SYSTEM:AUTH:LOGIN_LOG:PAGE_EXPAND']"
      />
    </el-card>

    <!-- 详情对话框 -->
    <IamUserLoginLogDetail v-model="state.detailVisible" :log-id="state.selectedLogId" />

    <!-- 操作人选择对话框 -->
    <IamUserQuickSelectDialog
      v-model="state.operatorDialogVisible"
      @confirm="handleOperatorSelect"
      :multiple="true"
      :selected-users="state.selectedOperators"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch, computed } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import IamUserLoginLogDetail from '@/modules/iam/loginLog/IamUserLoginLogDetail.vue'
  import { IamUserLoginLogApi } from '@/modules/iam/loginLog/api/IamUserLoginLog.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'
  import type { IamUserLoginLogExpandListResponseVo, IamUserLoginLogExpandPageResponse, IamUserLoginLogQueryPageRequestVo } from '@/modules/iam/types'
  import IamUserQuickSelectDialog from '@/modules/iam/user/IamUserQuickSelectDialog.vue'
  import type { IamUserSimpleListResponseVo } from '@/modules/iam/types'

  // 组合式函数
  const enumStore = useDictionaryEnumStore()

  // 状态管理
  const state = reactive({
    isLoading: false,
    showSearchCard: true,
    detailVisible: false,
    operatorDialogVisible: false,
    tableHeight: 'calc(100vh - 420px)',

    // 状态枚举
    authActionOptions: [] as IamDictionaryEnumInfoResponse[],
    authMethodOptions: [] as IamDictionaryEnumInfoResponse[],
    authResultOptions: [] as IamDictionaryEnumInfoResponse[],

    // 操作人相关状态
    selectedOperators: [] as IamUserSimpleListResponseVo[],

    // 表格数据
    tableData: [] as IamUserLoginLogExpandListResponseVo[],
    selectedLogId: '',
    searchForm: {
      authAction: null as string | null,
      authMethod: null as string | null,
      authResult: null as string | null,
      timeRange: null as number[] | null,
      operatorIdSet: [] as string[] // 操作人ID集合
    },
    pagination: {
      current: 1,
      size: 20,
      total: 0
    }
  })

  const searchFormRef = ref<FormInstance>()

  // 计算属性 - 操作人ID集合
  const selectedOperatorIds = computed({
    get: () => state.selectedOperators.map(u => u.id),
    set: newIds => {
      state.selectedOperators = newIds.map(id => state.selectedOperators.find(user => user.id === id) || { id })
    }
  })

  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.tableHeight = newVal ? 'calc(100vh - 420px)' : 'calc(100vh - 200px)'
      }, 80)
    },
    { immediate: false }
  )

  // 业务逻辑
  const fetchData = async (): Promise<void> => {
    try {
      state.isLoading = true
      const params = buildQueryParams()
      const res: IamUserLoginLogExpandPageResponse = await IamUserLoginLogApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取登录日志失败:', error)
    } finally {
      state.isLoading = false
    }
  }

  const buildQueryParams = (): IamUserLoginLogQueryPageRequestVo => {
    return {
      current: state.pagination.current,
      size: state.pagination.size,
      ...(state.searchForm.authAction && { authAction: state.searchForm.authAction }),
      ...(state.searchForm.authMethod && { authMethod: state.searchForm.authMethod }),
      ...(state.searchForm.authResult && { authResult: state.searchForm.authResult }),
      ...(state.searchForm.timeRange?.length === 2 && {
        createStartTime: state.searchForm.timeRange[0],
        createEndTime: state.searchForm.timeRange[1]
      }),
      // 添加操作人查询条件
      ...(state.selectedOperators.length > 0 && { userIdSet: state.selectedOperators.map(u => u.id) })
    }
  }

  const handleSearch = (): void => {
    state.pagination.current = 1
    fetchData()
  }

  const handleResetSearch = (): void => {
    searchFormRef.value?.resetFields()
    state.searchForm.timeRange = null
    state.selectedOperators = [] // 重置操作人选择
    handleSearch()
  }

  const handlePageChange = (): void => fetchData()

  const handlePageSizeChange = (newSize: number): void => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const showDetail = (row: IamUserLoginLogExpandListResponseVo): void => {
    state.selectedLogId = row.id
    state.detailVisible = true
  }

  // 操作人相关方法
  const showOperatorSelectorDialog = () => {
    state.operatorDialogVisible = true
  }

  const clearSelectorAllOperators = () => {
    state.selectedOperators = []
  }

  const removeQueryOperator = (userId: string) => {
    state.selectedOperators = state.selectedOperators.filter(user => user.id !== userId)
  }

  const handleOperatorSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedOperators = users
    state.operatorDialogVisible = false
  }

  // 工具函数
  const formatEnumDisplay = (enumName: string, value: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync(enumName, value)
    return enumItem?.message || value
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 初始化
  onMounted(async () => {
    // 枚举选项
    state.authActionOptions = await enumStore.getEnumDataAsync('IamAuthActionEnum')
    state.authMethodOptions = await enumStore.getEnumDataAsync('IamAuthMethodEnum')
    state.authResultOptions = await enumStore.getEnumDataAsync('IamAuthResultEnum')
    await fetchData()
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

  .box-card-form {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

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

  .box-card-data {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    .operation-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;

      .el-switch {
        margin-left: 8px;
      }
    }
  }
</style>
