<template>
  <div ref="pageContainerRef" class="model-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
          <div class="form-items-group">
            <el-form-item label="所属厂商:" prop="providerId" class="form-item-responsive">
              <el-select v-model="searchForm.providerId" placeholder="选择厂商" clearable filterable>
                <el-option v-for="option in state.providerOptions" :key="option.id" :label="getProviderLabel(option.provider)" :value="option.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="模型名称:" prop="name" class="form-item-responsive">
              <el-input v-model="searchForm.name" placeholder="请输入模型名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="模型编码:" prop="code" class="form-item-responsive">
              <el-input v-model="searchForm.code" placeholder="请输入模型编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in state.statusOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleCreateTimeRangeChange"
              />
            </el-form-item>

            <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive form-item-date-picker">
              <el-date-picker
                v-model="searchForm.updateTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="x"
                @change="handleUpdateTimeRangeChange"
              />
            </el-form-item>
          </div>

          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['AI:RESOURCE_CENTER:MODEL:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearchForm" v-hasPermission="['AI:RESOURCE_CENTER:MODEL:PAGE_EXPAND']">
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
        <el-button type="primary" size="default" @click="openAddDialog" v-hasPermission="['AI:RESOURCE_CENTER:MODEL:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.modelList"
          border
          v-loading="state.isLoading"
          :height="tableHeight"
          style="margin: 10px 0"
          stripe
          highlight-current-row
          class="model-table"
        >
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="id" label="ID" align="center" v-if="false" fixed />
          <el-table-column prop="providerId" label="厂商" align="center" width="140" fixed>
            <template #default="{ row }">
              <el-tag>
                {{ getProviderName(row.providerId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="模型名称" align="center" width="180" show-overflow-tooltip />
          <el-table-column prop="code" label="模型编码" align="center" width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" align="center" width="110">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="'ENABLE'"
                :inactive-value="'DISABLE'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="toggleModelStatus(row)"
                v-hasPermission="['AI:RESOURCE_CENTER:MODEL:UPDATE_STATUS']"
              />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" align="center" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.description || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="130" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="130" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="修改时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="openDetailDialog(row)" v-hasPermission="['AI:RESOURCE_CENTER:MODEL:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="openEditDialog(row)" v-hasPermission="['AI:RESOURCE_CENTER:MODEL:UPDATE']">编辑</el-button>
                <el-dropdown trigger="click" @command="onDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete" divided>
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

        <el-pagination
          ref="paginationRef"
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[20, 50, 100, 200, 500, 1000]"
          :background="true"
          layout="prev, pager, next, jumper, ->, total, sizes"
          :total="pagination.total"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
          v-hasPermission="['AI:RESOURCE_CENTER:MODEL:PAGE_EXPAND']"
        />
      </div>

      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <AiResourceModelAddDialog v-model="state.dialog.addVisible" @success="handleAddSuccess" />
    <AiResourceModelEditDialog v-model="state.dialog.editVisible" :model-id="state.selectedModelId" @refresh="fetchData" />
    <AiResourceModelDetailDialog v-model="state.dialog.detailVisible" :model-id="state.selectedModelId" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'AI:RESOURCE_CENTER:MODEL'
  })

  import { reactive, onMounted, ref, nextTick, watch, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Delete } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/common/stores/DictionaryEnum.store'
  import { AiResourceModelApi } from '@/modules/ai/resource/model/api/AiResourceModel.api'
  import { AiResourceProviderApi } from '@/modules/ai/resource/provider/api/AiResourceProvider.api'
  import AiResourceModelAddDialog from '@/modules/ai/resource/model/AiResourceModelAddDialog.vue'
  import AiResourceModelEditDialog from '@/modules/ai/resource/model/AiResourceModelEditDialog.vue'
  import AiResourceModelDetailDialog from '@/modules/ai/resource/model/AiResourceModelDetailDialog.vue'
  import type {
    AiResourceModelExpandPageResponse,
    AiResourceModelExpandListResponseVo,
    AiResourceModelQueryPageRequestVo
  } from '@/modules/ai/resource/model/type/AiResourceModel.type'
  import type { AiResourceProviderListResponseVo } from '@/modules/ai/resource/provider/type/AiResourceProvider.type'

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    isLoading: false,
    showSearchCard: true,
    selectedModelId: '',

    // 枚举选项
    providerList: [] as AiResourceProviderListResponseVo[],
    providerOptions: [] as AiResourceProviderListResponseVo[],
    statusOptions: [] as Array<{ code: string; message: string }>,

    // 表格数据
    modelList: [] as AiResourceModelExpandListResponseVo[],

    dialog: {
      addVisible: false,
      editVisible: false,
      detailVisible: false
    }
  })

  const pagination = reactive<AiResourceModelQueryPageRequestVo>({
    current: 1,
    size: 20,
    total: 0
  })

  const searchForm = reactive({
    providerId: null as string | null,
    name: '',
    code: '',
    status: null as string | null,
    createTimeRange: [] as number[],
    createStartTime: undefined as number | undefined,
    createEndTime: undefined as number | undefined,
    updateTimeRange: [] as number[],
    updateStartTime: undefined as number | undefined,
    updateEndTime: undefined as number | undefined
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

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

  const getProviderName = (providerId: string): string => {
    const provider = state.providerList.find(p => p.id === providerId)
    if (!provider) return providerId
    return getProviderLabel(provider.provider)
  }

  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 业务逻辑
  const buildQueryParams = (): AiResourceModelQueryPageRequestVo => {
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.providerId && { providerId: searchForm.providerId }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
  }

  const fetchData = async (): Promise<void> => {
    try {
      state.isLoading = true
      const params = buildQueryParams()
      const response: AiResourceModelExpandPageResponse = await AiResourceModelApi.pageExpand(params)

      state.modelList = response.records
      pagination.total = response.total
    } catch (error) {
      console.error('获取模型列表失败:', error)
    } finally {
      state.isLoading = false
    }
  }

  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      searchForm.createStartTime = value[0]
      searchForm.createEndTime = value[1]
    } else {
      searchForm.createStartTime = undefined
      searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      searchForm.updateStartTime = value[0]
      searchForm.updateEndTime = value[1]
    } else {
      searchForm.updateStartTime = undefined
      searchForm.updateEndTime = undefined
    }
  }

  const handleSearch = (): void => {
    pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const resetSearchForm = (): void => {
    searchFormRef.value?.resetFields()
    searchForm.createTimeRange = []
    searchForm.createStartTime = undefined
    searchForm.createEndTime = undefined
    searchForm.updateTimeRange = []
    searchForm.updateStartTime = undefined
    searchForm.updateEndTime = undefined
    handleSearch()
  }

  const handlePageChange = async (): Promise<void> => {
    await fetchData()
  }
  const handlePageSizeChange = (newSize: number): void => {
    pagination.size = newSize
    pagination.current = 1
    fetchData()
  }

  const openAddDialog = (): void => {
    state.dialog.addVisible = true
  }

  const openEditDialog = (row: AiResourceModelExpandListResponseVo): void => {
    state.selectedModelId = row.id
    state.dialog.editVisible = true
  }

  const openDetailDialog = (row: AiResourceModelExpandListResponseVo): void => {
    state.selectedModelId = row.id
    state.dialog.detailVisible = true
  }

  const handleAddSuccess = async (): Promise<void> => {
    await fetchData()
  }

  const onDropdownCommand = (command: string | number | object, row: AiResourceModelExpandListResponseVo): void => {
    handleDropdownCommand(String(command), row)
  }

  const handleDropdownCommand = (command: string, row: AiResourceModelExpandListResponseVo): void => {
    const commandMap: Record<string, () => void> = {
      delete: () => handleDeleteModel(row)
    }
    commandMap[command]?.()
  }

  // 切换模型状态
  const toggleModelStatus = async (row: AiResourceModelExpandListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '禁用' : '启用'}模型 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await AiResourceModelApi.updateStatus({ id: row.id, status: row.status })
      ElMessage.success(`${row.status === 'ENABLE' ? '启用' : '禁用'}成功`)
    } catch (error: unknown) {
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      if (error !== 'cancel') {
        console.error('切换模型状态失败', error)
      }
    }
  }

  // 删除模型
  const handleDeleteModel = async (row: AiResourceModelExpandListResponseVo): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除模型 "${row.name}" 吗？`, '警告', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })

      await AiResourceModelApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        console.error('删除模型失败', error)
      }
    }
  }

  onMounted(async () => {
    state.statusOptions = await enumStore.getEnumDataAsync('StatusEnum')

    // 加载厂商列表（用于显示厂商名称）
    try {
      const providerList = await AiResourceProviderApi.listSimple()
      state.providerList = providerList
      state.providerOptions = providerList
    } catch (error) {
      console.error('获取厂商列表失败', error)
    }

    await fetchData()
    await nextTick()
    setupResizeObserver()
    calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
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

  .model-page {
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

          &.form-item-date-picker {
            flex: 1 1 320px;
            max-width: 320px;

            :deep(.el-date-editor) {
              width: 100%;
              max-width: 320px;
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

  .model-table {
    :deep(.el-table__body) {
      td {
        padding: 8px 0;
      }
    }
  }

  .feature-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }
</style>
