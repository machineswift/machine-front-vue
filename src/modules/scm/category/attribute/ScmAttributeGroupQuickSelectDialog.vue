<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择属性分组'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(760px, 70vw, 1280px)"
    align-center
  >
    <el-splitter class="quick-select-splitter">
      <!-- 左侧后台分类树面板：卡片高度对齐右栏内容高度，树高度再按卡片内容高度计算 -->
      <el-splitter-panel collapsible size="28%">
        <el-card ref="treeCardRef" class="box-card-tree-select" :style="treeCardStyle">
          <template #header>
            <span class="tree-card-title">后台分类</span>
          </template>
          <div ref="treeBodyRef" class="tree-body">
            <el-input ref="treeSearchInputRef" v-model="state.categoryQuery" placeholder="请输入关键字" clearable @input="onCategoryQueryChanged" />
            <!-- 树默认收起，只展示第一层 -->
            <el-tree-v2
              ref="categoryTreeRef"
              :data="state.categoryTreeData"
              :props="state.categoryProps"
              :filter-method="categoryFilterMethod"
              @check="handleCategoryCheck"
              show-checkbox
              :height="categoryTreeHeight"
            />
          </div>
        </el-card>
      </el-splitter-panel>

      <el-splitter-panel :min="200">
        <div ref="rightContentRef" class="attribute-group-selector-container">
          <!-- 搜索区域 -->
          <el-card class="box-card-form">
            <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="80px">
              <div class="form-items-group">
                <el-form-item label="分组名称:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="请输入分组名称" clearable />
                </el-form-item>
                <el-form-item label="分组编码:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.code" placeholder="请输入分组编码" clearable />
                </el-form-item>
                <el-form-item label="组类型:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.groupType" placeholder="选择组类型" clearable>
                    <el-option v-for="option in groupTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="状态:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                    <el-option v-for="option in groupStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
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

          <!-- 属性分组列表 -->
          <div class="table-wrapper">
            <el-table
              ref="groupTableRef"
              :data="state.groupList"
              row-key="id"
              border
              height="100%"
              v-loading="state.loading"
              @selection-change="rows => handleSelectionChange(rows as ScmAttributeGroupSimpleListResponseVo[])"
              @row-click="handleRowClick"
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
              <el-table-column prop="name" label="分组名称" align="center" width="180" fixed="left" show-overflow-tooltip />
              <el-table-column prop="code" label="分组编码" align="center" width="200" show-overflow-tooltip />
              <el-table-column prop="groupType" label="组类型" align="center" width="120">
                <template #default="{ row }">
                  {{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_GROUP_TYPE, row.groupType) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" align="center" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'ENABLE' ? 'success' : 'danger'">
                    {{ enumStore.getEnumLabel(DICT_STATUS, row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :total="state.pagination.total"
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
          已选择 {{ selectedCount }} 个属性分组
          <el-button type="warning" @click="clearAllSelection" v-if="selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" v-hasPermission="[PERMISSION_CODE.pageSimple]">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElMessage, ElTable, ElTreeV2, type TableInstance, type TreeNodeData } from 'element-plus'
  import { useElementSize } from '@vueuse/core'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS, DICT_SCM_ATTRIBUTE_GROUP_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmAttributeGroupQueryPageRequestVo, ScmAttributeGroupSimpleListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  /** 权限编码与后端 @PreAuthorize 保持一致（ScmAttributeGroupController.pageSimple） */
  const PERMISSION_CODE = {
    pageSimple: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:PAGE_SIMPLE'
  }

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
    /** 已选属性分组：多选时作为初始勾选，单选时作为不可选项 */
    selectedGroups: {
      type: Array as () => ScmAttributeGroupSimpleListResponseVo[],
      default: () => []
    }
  })

  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'confirm'])

  const { options: groupTypeOptions, load: loadGroupTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_GROUP_TYPE)
  const { options: groupStatusOptions, load: loadGroupStatusOptions } = useEnumOptions(DICT_STATUS)

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    // 选择的分组数据
    singleSelected: null as string | null,
    groupList: [] as ScmAttributeGroupSimpleListResponseVo[],
    /** 跨页选中：翻页后仍保留已选分组 */
    selectedRows: new Map<string, ScmAttributeGroupSimpleListResponseVo>(),

    searchForm: {
      name: '',
      code: '',
      groupType: null as string | null,
      status: null as string | null,
      backCategoryIdSet: [] as string[]
    },
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },
    // 左侧后台分类树
    categoryQuery: '',
    categoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    categoryProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  const selectedCount = computed(() => state.selectedRows.size)

  const groupTableRef = ref<TableInstance>()
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  const rightContentRef = ref<HTMLElement | null>(null)
  const treeBodyRef = ref<HTMLElement | null>(null)
  const treeSearchInputRef = ref()

  // 右栏高度由内容（搜索卡片 + 表格 + 分页）决定，左栏卡片对齐它，避免左右高度不协调
  const { height: rightContentHeight } = useElementSize(rightContentRef)
  const treeCardStyle = computed(() => (rightContentHeight.value > 0 ? { height: `${Math.max(0, rightContentHeight.value - 8)}px` } : {}))

  /** 树虚拟滚动需要具体高度：卡片内容高 - 关键字输入框 - 间距 */
  const categoryTreeHeight = ref(340)

  const resolveElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const calculateTreeHeight = async () => {
    await nextTick()
    const bodyEl = treeBodyRef.value
    if (!bodyEl) return
    const inputEl = resolveElement(treeSearchInputRef.value)
    const inputHeight = inputEl?.offsetHeight || 32
    const spacing = 10
    categoryTreeHeight.value = Math.max(200, bodyEl.clientHeight - inputHeight - spacing)
  }

  watch([() => state.dialogVisible, rightContentHeight], () => {
    calculateTreeHeight()
  })

  /** 默认收起：只展示第一级，下一级由用户按需展开 */
  const collapseAllNodes = () => {
    categoryTreeRef.value?.setExpandedKeys([])
  }

  const onCategoryQueryChanged = () => {
    categoryTreeRef.value?.filter(state.categoryQuery.trim())

    if (state.categoryQuery.trim() === '') {
      collapseAllNodes()
    }
  }

  const categoryFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    const keyword = query.toLowerCase()
    return node.name?.toLowerCase().includes(keyword) || node.code?.toLowerCase().includes(keyword) || false
  }

  /** 勾选后台分类只更新查询条件，点击搜索后生效（与属性分组管理页的筛选交互保持一致） */
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.backCategoryIdSet = (categoryTreeRef.value.getCheckedKeys() as string[]).map(key => String(key))
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const res = await ScmBackCategoryApi.treeSimple()
      state.categoryTreeData = res.children || (res.id ? [res] : [])
      collapseAllNodes()
    } catch (error) {
      console.error('获取后台分类树失败', error)
    }
  }

  const isRowDisabled = (row: ScmAttributeGroupSimpleListResponseVo) => {
    return props.selectedGroups.some(group => group.id === row.id)
  }

  const handleRadioChange = (row: ScmAttributeGroupSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
    }
  }

  const handleRowClick = (row: unknown, column: { type?: string } | null) => {
    // 点击复选框列时由复选框自身处理，避免重复切换
    if (column?.type === 'selection') {
      return
    }

    if (props.multiple) {
      groupTableRef.value?.toggleRowSelection(
        row as ScmAttributeGroupSimpleListResponseVo,
        !state.selectedRows.has((row as ScmAttributeGroupSimpleListResponseVo).id)
      )
    } else {
      handleRadioChange(row as ScmAttributeGroupSimpleListResponseVo)
    }
  }

  const handleSelectionChange = (rows: ScmAttributeGroupSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 当前页未选中的行从已选集合中移除，当前页外的选择保留，实现跨页多选
    const currentPageIds = new Set(state.groupList.map(row => row.id))
    currentPageIds.forEach(id => {
      if (!rows.some(row => row.id === id)) {
        newSelectedRows.delete(id)
      }
    })

    rows.forEach(row => {
      newSelectedRows.set(row.id, row)
    })

    state.selectedRows = newSelectedRows
  }

  const clearAllSelection = () => {
    state.selectedRows.clear()
    groupTableRef.value?.clearSelection()
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchGroupList()
  }

  const resetSearch = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.groupType = null
    state.searchForm.status = null
    state.searchForm.backCategoryIdSet = []
    state.categoryQuery = ''
    categoryTreeRef.value?.setCheckedKeys([])
    handleSearch()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchGroupList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchGroupList()
  }

  const fetchGroupList = async () => {
    try {
      state.loading = true
      const params: ScmAttributeGroupQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.name ? { name: state.searchForm.name } : {}),
        ...(state.searchForm.code ? { code: state.searchForm.code } : {}),
        ...(state.searchForm.groupType ? { groupType: state.searchForm.groupType } : {}),
        ...(state.searchForm.status ? { status: state.searchForm.status } : {}),
        ...(state.searchForm.backCategoryIdSet.length > 0 ? { backCategoryIdSet: state.searchForm.backCategoryIdSet } : {})
      }

      const res = await ScmAttributeGroupApi.pageSimple(params)
      state.groupList = res.records
      state.pagination.total = res.total

      // 回显已选：翻页后重新勾选当前页中已在 selectedRows 的行
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        groupTableRef.value?.clearSelection()
        state.groupList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            groupTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取属性分组列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.groupType = null
    state.searchForm.status = null
    state.searchForm.backCategoryIdSet = []
    state.categoryQuery = ''
    state.categoryTreeData = []
    state.pagination.current = 1
    state.pagination.size = 20
    state.pagination.total = 0
    state.groupList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (selectedCount.value === 0) {
        ElMessage.warning('请至少选择一个属性分组')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个属性分组')
        return
      }
      const selectedGroup = state.groupList.find(row => row.id === state.singleSelected)
      if (selectedGroup) {
        emit('confirm', [selectedGroup])
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
      await Promise.all([loadGroupTypeOptions(), loadGroupStatusOptions()])

      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedGroups.forEach(group => {
          state.selectedRows.set(group.id, group)
        })
      }
      await Promise.all([fetchCategoryTree(), fetchGroupList()])
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .attribute-group-selector-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2px;
  }

  .quick-select-splitter {
    height: min(640px, calc(100vh - 192px));
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    margin: 10px 0;
  }

  .box-card-tree-select {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      padding: 12px;
    }

    .tree-card-title {
      font-size: 14px;
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
