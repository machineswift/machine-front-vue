<template>
  <div ref="pageContainerRef" class="property-page">
    <!-- 搜索卡片 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="90px">
        <div class="form-items-group">
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入编码" clearable />
          </el-form-item>
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入名称" clearable />
          </el-form-item>
          <el-form-item label="属性类型:" prop="propertyType">
            <el-select v-model="state.searchForm.propertyType" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="item in state.propertyTypeOptions" :key="item.code" :label="item.message" :value="item.code" />
            </el-select>
          </el-form-item>
          <el-form-item label="输入方式:" prop="inputType">
            <el-select v-model="state.searchForm.inputType" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="item in state.inputTypeOptions" :key="item.code" :label="item.message" :value="item.code" />
            </el-select>
          </el-form-item>
          <el-form-item label="可搜索:" prop="isSearch">
            <el-select v-model="state.searchForm.isSearch" placeholder="全部" clearable style="width: 100px">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="showCreateDialog" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:PROPERTY:CREATE']">新增</el-button>
      </div>

      <!-- 表格区域 -->
      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table :data="state.tableData" :height="tableHeight" style="width: 100%" border v-loading="state.loading" highlight-current-row>
          <el-table-column prop="code" label="编码" width="160" show-overflow-tooltip />

          <el-table-column prop="name" label="名称" width="180" show-overflow-tooltip />

          <el-table-column prop="propertyType" label="属性类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="propertyTypeTag(row.propertyType)" size="small">
                {{ getEnumLabel(state.propertyTypeOptions, row.propertyType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="inputType" label="输入方式" width="100" align="center">
            <template #default="{ row }">
              {{ getEnumLabel(state.inputTypeOptions, row.inputType) }}
            </template>
          </el-table-column>

          <el-table-column prop="isRequired" label="必填" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isRequired ? 'danger' : 'info'" size="small">
                {{ row.isRequired ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="isMultiple" label="多选" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isMultiple ? 'warning' : 'info'" size="small">
                {{ row.isMultiple ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="isSearch" label="可搜索" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isSearch ? 'success' : 'info'" size="small">
                {{ row.isSearch ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createName" label="创建人" width="120" show-overflow-tooltip />

          <el-table-column prop="createTime" label="创建时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
          </el-table-column>

          <el-table-column prop="updateName" label="更新人" width="120" show-overflow-tooltip />

          <el-table-column prop="updateTime" label="更新时间" align="center" width="170">
            <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click.stop="showDetailDialog(row.id)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:PROPERTY:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click.stop="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:PROPERTY:UPDATE']">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click.stop="handleDelete(row)" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:PROPERTY:DELETE']">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="state.pagination.current"
          v-model:page-size="state.pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="state.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 对话框 -->
    <ScmPropertyCreateDialog v-model="state.dialogs.create.visible" @success="handleDialogSuccess" />
    <ScmPropertyEditDialog v-model="state.dialogs.edit.visible" :property-id="state.currentId" @success="handleDialogSuccess" />
    <ScmPropertyDetailDialog v-model="state.dialogs.detail.visible" :property-id="state.currentId" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SCM:CATEGORY:PROPERTY'
  })

  import { ref, reactive, onMounted, onBeforeUnmount, onActivated, nextTick } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { ScmPropertyApi } from '@/modules/scm/category/api/ScmProperty.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { ScmPropertyQueryPageRequestVo, ScmPropertyListResponseVo } from '@/modules/scm/category/type/ScmProperty.type'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'
  import ScmPropertyCreateDialog from '@/modules/scm/category/ScmPropertyCreateDialog.vue'
  import ScmPropertyEditDialog from '@/modules/scm/category/ScmPropertyEditDialog.vue'
  import ScmPropertyDetailDialog from '@/modules/scm/category/ScmPropertyDetailDialog.vue'

  const searchFormRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)

  // 表格高度
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true

  const resolveCardElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const updateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    // 减去分页器高度
    const paginatorHeight = cardBody.querySelector('.pagination-wrapper')?.clientHeight ?? 40
    const buttonsHeight = cardBody.querySelector('.operation-buttons')?.clientHeight ?? 40
    const newHeight = Math.max(260, cardBody.clientHeight - paginatorHeight - buttonsHeight - 40)

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
    const searchCardEl = resolveCardElement(searchCardRef.value)
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      updateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  const dictEnumStore = useDictionaryEnumStore()

  // 字典枚举选项
  const enumNames = {
    PROPERTY_TYPE: 'ScmProperityTypeEnum',
    INPUT_TYPE: 'ScmItemInputTypeEnum'
  }

  // 状态
  const state = reactive({
    loading: false,
    propertyTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    inputTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    searchForm: {
      code: '',
      name: '',
      propertyType: undefined as string | undefined,
      inputType: undefined as string | undefined,
      isSearch: undefined as boolean | undefined
    },
    currentId: '',
    tableData: [] as ScmPropertyListResponseVo[],
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false }
    }
  })

  // 工具函数
  const formatTimestamp = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const getEnumLabel = (options: IamDictionaryEnumInfoResponse[], code?: string): string => {
    if (!code) return '-'
    const item = options.find(o => o.code === code)
    return item?.message || code
  }

  const propertyTypeTag = (type?: string): 'success' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'info'> = { KEY: 'success', SALE: 'warning', SPEC: 'info' }
    return type ? map[type] || 'info' : 'info'
  }

  // 搜索
  const buildSearchParams = (): ScmPropertyQueryPageRequestVo => {
    const params: ScmPropertyQueryPageRequestVo = {
      current: state.pagination.current,
      size: state.pagination.size
    }
    if (state.searchForm.code) params.code = state.searchForm.code
    if (state.searchForm.name) params.name = state.searchForm.name
    if (state.searchForm.propertyType) params.propertyType = state.searchForm.propertyType as ScmPropertyQueryPageRequestVo['propertyType']
    if (state.searchForm.inputType) params.inputType = state.searchForm.inputType as ScmPropertyQueryPageRequestVo['inputType']
    if (state.searchForm.isSearch !== undefined) params.isSearch = state.searchForm.isSearch
    return params
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchPageData()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.code = ''
    state.searchForm.name = ''
    state.searchForm.propertyType = undefined
    state.searchForm.inputType = undefined
    state.searchForm.isSearch = undefined
    state.pagination.current = 1
    fetchPageData()
  }

  // 分页
  const handlePageChange = (page: number) => {
    state.pagination.current = page
    fetchPageData()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchPageData()
  }

  // 对话框
  const showCreateDialog = () => {
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: ScmPropertyListResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const handleDialogSuccess = () => {
    state.dialogs.create.visible = false
    state.dialogs.edit.visible = false
    fetchPageData()
  }

  // 删除
  const handleDelete = async (row: ScmPropertyListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除属性「${row.name}」吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await ScmPropertyApi.destroy({ id: row.id })
      fetchPageData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除属性失败', error)
      }
    }
  }

  /** 请求去重 Promise，防止并发重复调用 */
  let fetchPromise: Promise<void> | null = null

  // 获取数据
  const fetchPageData = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmPropertyApi.pageExpand(buildSearchParams())
        .then(res => {
          state.tableData = res.records || []
          state.pagination.total = res.total
          state.pagination.current = res.current
          state.pagination.size = res.size
        })
        .catch(error => {
          console.error('获取属性列表失败', error)
        })
      await fetchPromise
    } finally {
      fetchPromise = null
      state.loading = false
    }
  }

  // 加载字典枚举数据
  const loadEnumData = async () => {
    try {
      const [propertyTypeData, inputTypeData] = await Promise.all([
        dictEnumStore.getEnumDataAsync(enumNames.PROPERTY_TYPE),
        dictEnumStore.getEnumDataAsync(enumNames.INPUT_TYPE)
      ])
      state.propertyTypeOptions = propertyTypeData
      state.inputTypeOptions = inputTypeData
    } catch (error) {
      console.error('加载字典枚举失败', error)
    }
  }

  onMounted(async () => {
    await loadEnumData()
    await fetchPageData()
    await nextTick()
    setupResizeObserver()
    await updateTableHeight()
  })

  /** keep-alive 切回标签时刷新数据 */
  onActivated(async () => {
    await fetchPageData()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  .property-page {
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

    .search-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .button-group {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-left: auto;
      }
    }
  }

  .box-card-data {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px 16px;
      overflow: hidden;
    }
  }

  .operation-buttons {
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .table-placeholder {
    flex: 1;
    padding: 20px;
  }

  .table-actions {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
    flex-shrink: 0;
  }
</style>
