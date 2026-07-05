<template>
  <div ref="pageContainerRef" class="login-log-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
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
            <el-form-item label="登录时间:" prop="timeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="state.searchForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="x"
              />
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
    <el-card ref="dataCardRef" class="box-card-data">
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table :data="state.tableData" border v-loading="state.isLoading" :height="tableHeight" stripe highlight-current-row>
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
          <el-table-column prop="platform" label="平台" align="center" width="120">
            <template #default="{ row }">
              <el-tooltip v-if="row.platform" :content="row.platform" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.platform }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="failReason" label="失败原因" align="center" width="300" min-width="240">
            <template #default="{ row }">
              <el-tooltip v-if="row.failReason" :content="row.failReason" placement="top" :append-to-body="true" :show-after="200">
                <span class="text-ellipsis">{{ row.failReason }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateName" label="操作人" align="center" width="120" />

          <el-table-column prop="createTime" label="登录时间" align="center" width="180">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="showDetail(row)" v-hasPermission="['SYSTEM:AUTH:LOGIN_LOG:DETAIL']">详情</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          ref="paginationRef"
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
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
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
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:AUTH:LOGIN_LOG'
  })
  import { onMounted, reactive, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import IamUserLoginLogDetail from '@/modules/iam/loginLog/IamUserLoginLogDetail.vue'
  import { IamUserLoginLogApi } from '@/modules/iam/loginLog/api/IamUserLoginLog.api'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
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
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  // 表格高度 - 初始为0，等计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true

  const resolveElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const calculateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    const operationButtonsHeight = operationButtonsRef.value?.offsetHeight || 50
    const paginationHeight = paginationRef.value?.offsetHeight || 60
    const contentSpacing = 16
    const newHeight = Math.max(320, cardBody.clientHeight - operationButtonsHeight - paginationHeight - contentSpacing)

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
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  // 计算属性 - 操作人ID集合
  const selectedOperatorIds = computed({
    get: () => state.selectedOperators.map(u => u.id),
    set: newIds => {
      state.selectedOperators = newIds.map(id => state.selectedOperators.find(user => user.id === id) || ({ id } as IamUserSimpleListResponseVo))
    }
  })

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
    calculateTableHeight()
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
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
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

  .login-log-page {
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
          flex: 1 1 280px;
          min-width: 100px;
          max-width: 280px;

          &.user-selector {
            min-width: 280px;

            // 优化标签间距
            :deep(.el-select__tags) {
              .el-tag {
                margin-right: 4px;
                margin-left: 0;
                padding: 0 6px;

                &:first-child {
                  margin-left: 0;
                }
              }
            }
          }

          // 登录时间字段特殊宽度
          &.form-item-date-picker {
            flex: 1 1 440px;
            max-width: 440px;

            :deep(.el-date-editor) {
              width: 100%;
              max-width: 440px;
            }
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
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      gap: 8px;
    }

    .operation-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .el-switch {
        margin-left: 8px;
      }
    }

    .table-placeholder {
      flex: 1;
      padding: 10px 0;
    }
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
  }

  .text-ellipsis {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
</style>
