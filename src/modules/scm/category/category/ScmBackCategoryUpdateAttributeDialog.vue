<template>
  <el-dialog
    v-model="state.visible"
    title="关联属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(680px, 64vw, 1000px)"
    align-center
  >
    <el-divider content-position="left">选择属性</el-divider>

    <div class="select-toolbar">
      <el-button type="primary" plain @click="state.quickSelectVisible = true">选择属性</el-button>
      <span class="form-item-tip">支持跨页多选；已关联的属性默认勾选</span>
    </div>

    <el-divider content-position="left">关联配置</el-divider>

    <el-table :data="state.itemList" border size="small" height="320" v-loading="state.loading">
      <el-table-column prop="name" label="属性名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="code" label="属性编码" min-width="120" show-overflow-tooltip />
      <el-table-column label="属性类型" width="100" align="center">
        <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_TYPE, row.attributeType) || '-' }}</template>
      </el-table-column>
      <el-table-column label="输入方式" width="100" align="center">
        <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_INPUT_TYPE, row.inputType) || '-' }}</template>
      </el-table-column>
      <el-table-column label="必填" width="70" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.requiredFlag" />
        </template>
      </el-table-column>
      <el-table-column label="展示" width="70" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.displayFlag" />
        </template>
      </el-table-column>
      <el-table-column label="可搜索" width="80" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.searchableFlag" />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="130" align="center">
        <template #default="{ row }">
          <el-input-number v-model="row.sort" :min="0" :max="99999" controls-position="right" size="small" style="width: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="removeItem(row.attributeId)">移除</el-button>
        </template>
      </el-table-column>
      <template #empty>请选择属性</template>
    </el-table>
    <div class="form-item-tip">排序值越大越靠前；必填/展示/可搜索为该属性在此类目下的配置</div>

    <!-- 属性快速选择：已关联属性回显勾选 -->
    <ScmAttributeQuickSelectDialog
      v-model="state.quickSelectVisible"
      :multiple="true"
      :selected-attributes="selectedAttributes"
      @confirm="handleAttributesSelected"
    />

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.updateAttribute]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_SCM_ATTRIBUTE_TYPE, DICT_SCM_ATTRIBUTE_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import ScmAttributeQuickSelectDialog from '@/modules/scm/category/attribute/ScmAttributeQuickSelectDialog.vue'
  import type { ScmBackCategoryUpdateAttributeItemVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
  import type { ScmAttributeSimpleListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  const PERMISSION_CODE = {
    updateAttribute: 'MANAGE_APP:SCM:CATEGORY:BACK:UPDATE_ATTRIBUTE'
  }

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const enumStore = useDictionaryEnumStore()

  /** 「关联配置」行：提交字段 + 属性展示信息（展示信息仅前端用，不上送） */
  interface AttributeConfigItem extends ScmBackCategoryUpdateAttributeItemVo {
    code?: string
    name?: string
    attributeType?: string
    inputType?: string
  }

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    /** 属性快速选择弹窗 */
    quickSelectVisible: false,
    /** 已关联属性（全量替换提交） */
    itemList: [] as AttributeConfigItem[]
  })

  /** 快速选择弹窗的已选项（只用于回显勾选与去重，属性完整信息由接口数据回填） */
  const selectedAttributes = computed<ScmAttributeSimpleListResponseVo[]>(() =>
    state.itemList.map(item => ({
      id: item.attributeId,
      code: item.code || '',
      name: item.name || item.attributeId,
      attributeType: item.attributeType || '',
      inputType: item.inputType || ''
    }))
  )

  /** 选择结果：保留已有配置，新勾选属性给默认配置，取消勾选属性直接丢弃 */
  const handleAttributesSelected = (attributes: ScmAttributeSimpleListResponseVo[]) => {
    const itemMap = new Map(state.itemList.map(item => [item.attributeId, item]))
    state.itemList = attributes.map(
      attribute =>
        itemMap.get(attribute.id) ?? {
          attributeId: attribute.id,
          code: attribute.code,
          name: attribute.name,
          attributeType: attribute.attributeType,
          inputType: attribute.inputType,
          requiredFlag: false,
          displayFlag: true,
          searchableFlag: false,
          sort: 0,
          features: ''
        }
    )
    state.quickSelectVisible = false
  }

  const removeItem = (attributeId: string) => {
    state.itemList = state.itemList.filter(item => item.attributeId !== attributeId)
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await ScmBackCategoryApi.updateAttribute({
        id: props.categoryId,
        // 全量替换：只提交关联配置字段，不上送响应填充字段
        attributeItemList: state.itemList.map(item => ({
          attributeId: item.attributeId,
          requiredFlag: item.requiredFlag,
          displayFlag: item.displayFlag,
          searchableFlag: item.searchableFlag,
          sort: item.sort,
          features: item.features
        }))
      })
      ElMessage.success('修改关联属性成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改关联属性失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const detail = await ScmBackCategoryApi.detail({ id: props.categoryId })
      state.itemList = (detail.attributeList || []).map(item => ({
        attributeId: item.attributeId,
        code: item.code,
        name: item.name,
        attributeType: item.attributeType,
        inputType: item.inputType,
        requiredFlag: item.requiredFlag ?? false,
        displayFlag: item.displayFlag ?? true,
        searchableFlag: item.searchableFlag ?? false,
        sort: item.sort ?? 0,
        features: item.features || ''
      }))
    } catch (error) {
      console.error('获取后台分类关联属性失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.submitting = false
    state.loading = false
    state.quickSelectVisible = false
    state.itemList = []
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .select-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .form-item-tip {
    font-size: 12px;
    color: #909399;
  }

  :deep(.el-divider--horizontal) {
    margin: 12px 0;
  }
</style>
