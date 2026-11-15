<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择属性'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div class="attribute-selector-container">
      <!-- 搜索区域 -->
      <el-card class="box-card-form">
        <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="属性名称:" class="form-item-responsive">
              <el-input v-model="state.searchForm.name" placeholder="请输入属性名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="属性编码:" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="请输入属性编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="属性类型:" class="form-item-responsive">
              <el-select v-model="state.searchForm.attributeType" placeholder="选择属性类型" clearable>
                <el-option v-for="option in attributeTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="输入方式:" class="form-item-responsive">
              <el-select v-model="state.searchForm.inputType" placeholder="选择输入方式" clearable>
                <el-option v-for="option in inputTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
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

      <!-- 属性列表 -->
      <div class="table-wrapper">
        <el-table
          ref="attributeTableRef"
          :data="state.attributeList"
          row-key="id"
          border
          height="100%"
          v-loading="state.loading"
          @selection-change="rows => handleSelectionChange(rows as ScmAttributeSimpleListResponseVo[])"
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
          <el-table-column prop="name" label="属性名称" align="center" width="180" fixed="left" show-overflow-tooltip />
          <el-table-column prop="code" label="属性编码" align="center" width="200" show-overflow-tooltip />
          <el-table-column prop="attributeType" label="属性类型" align="center" width="120">
            <template #default="{ row }">
              {{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_TYPE, row.attributeType) }}
            </template>
          </el-table-column>
          <el-table-column prop="inputType" label="输入方式" align="center" width="120">
            <template #default="{ row }">
              {{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_INPUT_TYPE, row.inputType) }}
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

    <template #footer>
      <div class="footer-container">
        <div v-if="multiple" class="selected-info">
          已选择 {{ selectedCount }} 个属性
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
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage, ElTable, type TableInstance } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_SCM_ATTRIBUTE_TYPE, DICT_SCM_ATTRIBUTE_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import type { ScmAttributeQueryPageRequestVo, ScmAttributeSimpleListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  /** 权限编码与后端 @PreAuthorize 保持一致（ScmAttributeController.pageSimple） */
  const PERMISSION_CODE = {
    pageSimple: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE:PAGE_SIMPLE'
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
    /** 已选属性：多选时作为初始勾选，单选时作为不可选项 */
    selectedAttributes: {
      type: Array as () => ScmAttributeSimpleListResponseVo[],
      default: () => []
    }
  })

  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'confirm'])

  const { options: attributeTypeOptions, load: loadAttributeTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_TYPE)
  const { options: inputTypeOptions, load: loadInputTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_INPUT_TYPE)

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,

    // 选择的属性数据
    singleSelected: null as string | null,
    attributeList: [] as ScmAttributeSimpleListResponseVo[],
    /** 跨页选中：翻页后仍保留已选属性 */
    selectedRows: new Map<string, ScmAttributeSimpleListResponseVo>(),

    searchForm: {
      name: '',
      code: '',
      attributeType: null as string | null,
      inputType: null as string | null
    },
    pagination: {
      current: 1,
      size: 20,
      total: 0
    }
  })

  const selectedCount = computed(() => state.selectedRows.size)

  const attributeTableRef = ref<TableInstance>()

  const isRowDisabled = (row: ScmAttributeSimpleListResponseVo) => {
    return props.selectedAttributes.some(attribute => attribute.id === row.id)
  }

  const handleRadioChange = (row: ScmAttributeSimpleListResponseVo) => {
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
      attributeTableRef.value?.toggleRowSelection(
        row as ScmAttributeSimpleListResponseVo,
        !state.selectedRows.has((row as ScmAttributeSimpleListResponseVo).id)
      )
    } else {
      handleRadioChange(row as ScmAttributeSimpleListResponseVo)
    }
  }

  const handleSelectionChange = (rows: ScmAttributeSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)

    // 当前页未选中的行从已选集合中移除，当前页外的选择保留，实现跨页多选
    const currentPageIds = new Set(state.attributeList.map(row => row.id))
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
    attributeTableRef.value?.clearSelection()
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchAttributeList()
  }

  const resetSearch = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.attributeType = null
    state.searchForm.inputType = null
    handleSearch()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchAttributeList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchAttributeList()
  }

  const fetchAttributeList = async () => {
    try {
      state.loading = true
      const params: ScmAttributeQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.name ? { name: state.searchForm.name } : {}),
        ...(state.searchForm.code ? { code: state.searchForm.code } : {}),
        ...(state.searchForm.attributeType ? { attributeType: state.searchForm.attributeType } : {}),
        ...(state.searchForm.inputType ? { inputType: state.searchForm.inputType } : {})
      }

      const res = await ScmAttributeApi.pageSimple(params)
      state.attributeList = res.records
      state.pagination.total = res.total

      // 回显已选：翻页后重新勾选当前页中已在 selectedRows 的行
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        attributeTableRef.value?.clearSelection()
        state.attributeList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            attributeTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取属性列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.searchForm.name = ''
    state.searchForm.code = ''
    state.searchForm.attributeType = null
    state.searchForm.inputType = null
    state.pagination.current = 1
    state.pagination.size = 20
    state.pagination.total = 0
    state.attributeList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (selectedCount.value === 0) {
        ElMessage.warning('请至少选择一个属性')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个属性')
        return
      }
      const selectedAttribute = state.attributeList.find(row => row.id === state.singleSelected)
      if (selectedAttribute) {
        emit('confirm', [selectedAttribute])
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
      await Promise.all([loadAttributeTypeOptions(), loadInputTypeOptions()])

      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedAttributes.forEach(attribute => {
          state.selectedRows.set(attribute.id, attribute)
        })
      }
      await fetchAttributeList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .attribute-selector-container {
    display: flex;
    flex-direction: column;
    height: min(640px, calc(100vh - 192px));
    padding: 2px;
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    margin: 10px 0;
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
