<template>
  <div ref="pageContainerRef" class="provider-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
          <div class="form-items-group">
            <el-form-item label="厂商:" prop="provider" class="form-item-responsive">
              <el-select v-model="searchForm.provider" placeholder="选择厂商" clearable>
                <el-option v-for="option in state.providerOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.statusOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
          </div>

          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:LIST_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearchForm" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:LIST_EXPAND']">
                <el-icon><Refresh /></el-icon>
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
        <el-button type="primary" size="default" @click="openAddDialog" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.providerList"
          border
          v-loading="state.loading"
          :height="tableHeight"
          stripe
          highlight-current-row
          style="margin: 10px 0"
          class="provider-table"
        >
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="id" label="ID" align="center" v-if="false" />
          <el-table-column prop="provider" label="厂商" align="center" width="160" fixed>
            <template #default="{ row }">
              <el-tag>
                {{ getProviderLabel(row.provider) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseUrl" label="API基础地址" align="center" min-width="320" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" align="center" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="'ENABLE'"
                :inactive-value="'DISABLE'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="toggleProviderStatus(row)"
                v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:UPDATE_STATUS']"
              />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" align="center" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.description || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="140" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" align="center" width="180">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="140" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="openDetailDialog(row)" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="openEditDialog(row)" v-hasPermission="['MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER:UPDATE']">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="onDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete" divided :disabled="!hasPermission(['AI:RESOURCE_CENTER:PROVIDER:DELETE'])">
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

      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="4" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <AiResourceProviderAddDialog v-model="state.dialog.addVisible" @success="handleAddSuccess" />
    <AiResourceProviderEditDialog v-model="state.dialog.editVisible" :provider-id="state.selectedProviderId" @refresh="fetchData" />
    <AiResourceProviderDetailDialog v-model="state.dialog.detailVisible" :provider-id="state.selectedProviderId" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:AI:RESOURCE_CENTER:PROVIDER'
  })

  import { reactive, onMounted, ref, nextTick, watch, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Delete } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import AiResourceProviderAddDialog from '@/modules/ai/resource/provider/AiResourceProviderAddDialog.vue'
  import AiResourceProviderEditDialog from '@/modules/ai/resource/provider/AiResourceProviderEditDialog.vue'
  import AiResourceProviderDetailDialog from '@/modules/ai/resource/provider/AiResourceProviderDetailDialog.vue'
  import type { AiResourceProviderExpandListResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    loading: false,
    showSearchCard: true,
    selectedProviderId: '',

    // 枚举选项
    providerOptions: [] as Array<{ code: string; message: string }>,
    statusOptions: [] as Array<{ code: string; message: string }>,

    // 列表数据
    providerList: [] as AiResourceProviderExpandListResponseVo[],

    dialog: {
      addVisible: false,
      editVisible: false,
      detailVisible: false
    }
  })

  const searchForm = reactive({
    provider: null as string | null,
    status: null as string | null
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)

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
    const contentSpacing = 16
    const newHeight = Math.max(320, cardBody.clientHeight - operationButtonsHeight - contentSpacing)

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

  // 工具函数
  const getProviderLabel = (provider: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('AiProviderEnum', provider)
    return enumItem?.message || provider
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 业务逻辑
  const fetchData = async (): Promise<void> => {
    try {
      state.loading = true
      const records = await AiResourceProviderApi.list({
        status: searchForm.status ?? undefined
      })
      state.providerList = records
    } catch (error) {
      console.error('获取厂商列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = (): void => {
    fetchData()
  }

  const resetSearchForm = (): void => {
    searchFormRef.value?.resetFields()
    searchForm.status = null
    searchForm.provider = null
    handleSearch()
  }

  const openAddDialog = (): void => {
    state.dialog.addVisible = true
  }

  const openEditDialog = (row: AiResourceProviderExpandListResponseVo): void => {
    state.selectedProviderId = row.id
    state.dialog.editVisible = true
  }

  const openDetailDialog = (row: AiResourceProviderExpandListResponseVo): void => {
    state.selectedProviderId = row.id
    state.dialog.detailVisible = true
  }

  const handleAddSuccess = async (): Promise<void> => {
    await fetchData()
  }

  const onDropdownCommand = (command: string | number | object, row: AiResourceProviderExpandListResponseVo): void => {
    handleDropdownCommand(String(command), row)
  }

  const handleDropdownCommand = (command: string, row: AiResourceProviderExpandListResponseVo): void => {
    const commandMap: Record<string, () => void> = {
      delete: () => handleDeleteProvider(row)
    }
    commandMap[command]?.()
  }

  // 切换厂商状态
  const toggleProviderStatus = async (row: AiResourceProviderExpandListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '禁用' : '启用'}厂商 "${getProviderLabel(row.provider)}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await AiResourceProviderApi.updateStatus({
        id: row.id,
        status: row.status
      })

      ElMessage.success(`${row.status === 'ENABLE' ? '启用' : '禁用'}成功`)
    } catch (error: unknown) {
      // 取消操作时回滚状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      if (error !== 'cancel') {
        console.error('切换厂商状态失败', error)
      }
    }
  }

  // 删除厂商
  const handleDeleteProvider = async (row: AiResourceProviderExpandListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除厂商 "${getProviderLabel(row.provider)}" 吗？此操作将同时删除该厂商下的所有模型配置，不可恢复。`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await AiResourceProviderApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        console.error('删除厂商失败', error)
      }
    }
  }

  onMounted(async () => {
    state.statusOptions = await enumStore.getEnumDataAsync('StatusEnum')
    state.providerOptions = await enumStore.getEnumDataAsync('AiProviderEnum')
    await fetchData()
    await nextTick()
    setupResizeObserver()
    calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
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

  .provider-page {
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
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;
      }
    }
  }

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
      justify-content: space-between;
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

    :deep(.el-dropdown) {
      margin-left: 2px;
    }
  }

  .provider-table {
    :deep(.el-table__body) {
      td {
        padding: 8px 0;
      }
    }
  }
</style>
