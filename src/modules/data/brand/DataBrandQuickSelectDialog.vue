<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择品牌'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(760px, 70vw, 1280px)"
    align-center
  >
    <el-splitter class="quick-select-splitter">
      <!-- 左侧品牌分类树面板（有分类树查看权限时展示） -->
      <el-splitter-panel v-if="canViewCategoryTree" collapsible size="28%">
        <el-card class="box-card-tree-select">
          <template #header>
            <span class="panel-title">品牌分类</span>
          </template>
          <div ref="treeBodyRef" class="tree-body">
            <el-input v-model="state.categoryQuery" placeholder="请输入关键字筛选分类" clearable @input="onCategoryQueryChanged" />
            <el-tree-v2
              ref="categoryTreeRef"
              :data="state.categoryTreeOptions"
              :props="state.categoryProps"
              :filter-method="categoryFilterMethod"
              @check="handleCategoryCheck"
              show-checkbox
              :height="treeHeight"
            />
          </div>
        </el-card>
      </el-splitter-panel>

      <!-- 右侧内容面板 -->
      <el-splitter-panel :min="200">
        <div class="brand-selector-container">
          <!-- 搜索区域 -->
          <el-card class="box-card-form">
            <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="80px">
              <div class="form-items-group">
                <el-form-item label="名称:" prop="name" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="品牌名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="拼音全拼:" prop="namePinyinFull" class="form-item-responsive">
                  <el-input v-model="state.searchForm.namePinyinFull" placeholder="品牌拼音全拼" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="首字母:" prop="namePinyinInitial" class="form-item-responsive">
                  <el-input v-model="state.searchForm.namePinyinInitial" placeholder="品牌拼音首字母" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="英文名称:" prop="nameEn" class="form-item-responsive">
                  <el-input v-model="state.searchForm.nameEn" placeholder="品牌英文名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="编码:" prop="code" class="form-item-responsive">
                  <el-input v-model="state.searchForm.code" placeholder="品牌编码" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="状态:" prop="status" class="form-item-responsive">
                  <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                    <el-option v-for="option in brandStatus" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
              </div>
              <!-- 操作按钮组 -->
              <div class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSearch">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>

          <!-- 品牌列表 -->
          <div ref="tableWrapperRef" class="table-wrapper">
            <el-table
              ref="brandTableRef"
              :data="state.brandList"
              row-key="id"
              :height="tableHeight"
              v-loading="state.brandDataLoading"
              @selection-change="rows => handleSelectionChange(rows as DataBrandSimpleListResponseVo[])"
              @row-click="handleRowClick"
              border
              stripe
            >
              <el-table-column v-if="multiple" type="selection" width="55" :reserve-selection="true" />
              <el-table-column v-else label="操作" width="55" fixed="left">
                <template #default="{ row }">
                  <el-radio
                    v-model="state.singleSelected"
                    :value="row.id"
                    :disabled="isRowDisabled(row)"
                    @change="() => handleRadioChange(row)"
                    class="hidden-radio"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="品牌名称" align="center" min-width="180" fixed="left" show-overflow-tooltip />
              <el-table-column prop="code" label="编码" align="center" width="160" show-overflow-tooltip />
              <el-table-column prop="nameEn" label="英文名称" align="center" width="160" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" align="center" width="90">
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
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :total="state.pagination.total"
            :pager-count="5"
            :page-sizes="[20, 50, 200, 500]"
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
          已选择 {{ selectedCount }} 个品牌
          <el-button type="warning" @click="clearAllSelection" v-if="selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" v-hasPermission="[confirmPermission]">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, type PropType } from 'vue'
  import { useElementSize } from '@vueuse/core'
  import { ElMessage, ElTable, ElTreeV2, type TreeNodeData, type TableInstance } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataBrandCategoryApi } from '@/modules/data/brand/api/DataBrandCategory.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import type { DataBrandQueryPageRequestVo, DataBrandSimpleListResponseVo, DataBrandSimplePageResponse } from '@/modules/data/brand/type/DataBrand.type'
  import type { DataBrandCategorySimpleTreeResponseVo } from '@/modules/data/brand/type/DataBrandCategory.type'

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
    selectedBrands: {
      type: Array as () => DataBrandSimpleListResponseVo[],
      default: () => []
    },
    /** 自定义分页查询：不传时走 data 域 page_simple（SCM 等场景可传自己的可选品牌接口） */
    fetchPage: {
      type: Function as PropType<(params: DataBrandQueryPageRequestVo) => Promise<DataBrandSimplePageResponse>>,
      default: null
    },
    /** 确定按钮权限编码，与调用方接口的 @PreAuthorize 保持一致 */
    confirmPermission: {
      type: String,
      default: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:PAGE_SIMPLE'
    }
  })

  const { options: brandStatus, load: loadBrandStatus } = useEnumOptions(DICT_STATUS)
  const emit = defineEmits(['update:modelValue', 'confirm'])

  /** 品牌分类树字段映射（与后端 DataBrandCategorySimpleTreeResponseVo 一致） */
  const CATEGORY_TREE_PROPS = { value: 'id', label: 'name', children: 'children' } as const

  /** 分类树查看权限：无权限时不展示左栏，避免拉取分类树 403 */
  const canViewCategoryTree = computed(() => hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND_CATEGORY:TREE_SIMPLE']))

  const emptySearchForm = () => ({
    code: '',
    name: '',
    namePinyinFull: '',
    namePinyinInitial: '',
    nameEn: '',
    status: null as string | null,
    categoryIdSet: [] as string[]
  })

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    brandDataLoading: false,

    // 品牌分类树
    categoryQuery: '',
    categoryTreeOptions: [] as DataBrandCategorySimpleTreeResponseVo[],

    // 选择的品牌信息
    brandList: [] as DataBrandSimpleListResponseVo[],
    singleSelected: null as string | null,
    singleSelectedBrand: null as DataBrandSimpleListResponseVo | null,
    selectedRows: new Map<string, DataBrandSimpleListResponseVo>(),

    categoryProps: CATEGORY_TREE_PROPS,
    searchForm: emptySearchForm(),
    pagination: {
      current: 1,
      size: 20,
      total: 0
    }
  })

  const selectedCount = computed(() => state.selectedRows.size)

  const brandTableRef = ref<TableInstance>()
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const treeBodyRef = ref<HTMLElement | null>(null)

  /** 分类树高度：卡片内容区高度 - 关键字输入框(32) - 间距(10)，随左栏高度自适应 */
  const { height: treeBodyHeight } = useElementSize(treeBodyRef)
  const treeHeight = computed(() => Math.max(200, treeBodyHeight.value - 42))

  /** 数据区（表格）高度：取右栏剩余空间的精确像素值（el-table 用数值高度最稳，数据多时表内滚动、高度不会随数据变化） */
  const tableWrapperRef = ref<HTMLElement | null>(null)
  const { height: tableWrapperHeight } = useElementSize(tableWrapperRef)
  const tableHeight = computed(() => Math.max(200, Math.floor(tableWrapperHeight.value)))

  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const isRowDisabled = (row: DataBrandSimpleListResponseVo) => {
    return props.selectedBrands.some(brand => brand.id === row.id)
  }

  const handleRadioChange = (row: DataBrandSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
      state.singleSelectedBrand = row
    }
  }

  const handleRowClick = (row: unknown, column: { type?: string } | null) => {
    // 点击复选框列时由复选框自身处理，避免重复切换
    if (column?.type === 'selection') {
      return
    }

    if (props.multiple) {
      brandTableRef.value?.toggleRowSelection(row as DataBrandSimpleListResponseVo, !state.selectedRows.has((row as DataBrandSimpleListResponseVo).id))
    } else {
      handleRadioChange(row as DataBrandSimpleListResponseVo)
    }
  }

  const handleSelectionChange = (rows: DataBrandSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 创建当前页所有行的ID集合
    const currentPageIds = new Set(state.brandList.map(row => row.id))

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
    brandTableRef.value?.clearSelection()
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(state.categoryQuery.trim())
    }

    if (state.categoryQuery.trim() === '') {
      categoryTreeRef.value?.setExpandedKeys([])
    }
  }

  const categoryFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  /** 左侧分类树勾选：将选中的根节点 id 同步到查询条件，点击搜索时再请求 */
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(state.categoryTreeOptions, categoryTreeRef.value.getCheckedKeys() as string[]).map(
        node => node.id
      )
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchBrandList()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchBrandList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchBrandList()
  }

  const fetchBrandList = async () => {
    try {
      state.brandDataLoading = true
      const params: DataBrandQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        code: state.searchForm.code || undefined,
        name: state.searchForm.name || undefined,
        namePinyinFull: state.searchForm.namePinyinFull || undefined,
        namePinyinInitial: state.searchForm.namePinyinInitial || undefined,
        nameEn: state.searchForm.nameEn || undefined,
        status: state.searchForm.status ?? undefined,
        categoryIdSet: state.searchForm.categoryIdSet.length > 0 ? state.searchForm.categoryIdSet : undefined
      }

      const res = props.fetchPage ? await props.fetchPage(params) : await DataBrandApi.pageSimple(params)
      state.brandList = res.records
      state.pagination.total = res.total

      // 设置选中状态
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        brandTableRef.value?.clearSelection()
        state.brandList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            brandTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    } finally {
      state.brandDataLoading = false
    }
  }

  const resetSearch = () => {
    state.searchForm = emptySearchForm()
    state.categoryQuery = ''
    categoryTreeRef.value?.setCheckedKeys([])
    handleSearch()
  }

  const handleDialogClosed = () => {
    state.searchForm = emptySearchForm()
    state.categoryQuery = ''
    state.pagination.current = 1
    state.pagination.size = 20
    state.pagination.total = 0
    state.brandList = []
    if (!props.multiple) {
      state.singleSelected = null
      state.singleSelectedBrand = null
    }
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (selectedCount.value === 0) {
        ElMessage.warning('请至少选择一个品牌')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelectedBrand) {
        ElMessage.warning('请选择一个品牌')
        return
      }
      emit('confirm', [state.singleSelectedBrand])
    }
    state.dialogVisible = false
  }

  /** 加载品牌分类树（统一取根节点的子节点作为树数据） */
  const loadCategoryTree = async () => {
    if (!canViewCategoryTree.value) {
      return
    }
    try {
      const response = await DataBrandCategoryApi.treeSimple()
      const treeRoot = response as unknown as DataBrandCategorySimpleTreeResponseVo
      state.categoryTreeOptions = treeRoot?.children?.length ? treeRoot.children : treeRoot?.id ? [treeRoot] : []
    } catch (error) {
      console.error('加载品牌分类树失败', error)
    }
  }

  // 监听对话框显示状态
  watch(
    () => props.modelValue,
    async val => {
      if (!val) {
        return
      }

      await loadBrandStatus()
      await loadCategoryTree()

      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedBrands.forEach(brand => {
          state.selectedRows.set(brand.id, brand)
        })
      } else {
        state.singleSelectedBrand = props.selectedBrands[0] ?? null
        state.singleSelected = state.singleSelectedBrand?.id ?? null
      }
      await fetchBrandList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .brand-selector-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .quick-select-splitter {
    height: min(640px, calc(100vh - 192px));
    overflow: hidden;
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    margin: 10px 0;
    overflow: hidden;
  }

  .box-card-form {
    margin: 2px;
    flex-shrink: 0;
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
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
    }

    .panel-title {
      font-weight: 600;
    }

    .tree-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
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
