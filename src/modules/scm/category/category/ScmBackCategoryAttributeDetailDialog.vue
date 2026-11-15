<template>
  <el-dialog
    v-model="state.visible"
    title="关联属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 关联属性 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联属性">
          <el-table :data="state.itemList" border size="small" height="380">
            <el-table-column prop="name" label="属性名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="属性编码" min-width="160" show-overflow-tooltip />
            <el-table-column label="属性类型" width="100" align="center">
              <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_TYPE, row.attributeType) || '-' }}</template>
            </el-table-column>
            <el-table-column label="输入方式" width="100" align="center">
              <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_INPUT_TYPE, row.inputType) || '-' }}</template>
            </el-table-column>
            <el-table-column label="必填" width="70" align="center">
              <template #default="{ row }">{{ row.requiredFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="展示" width="70" align="center">
              <template #default="{ row }">{{ row.displayFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="可搜索" width="80" align="center">
              <template #default="{ row }">{{ row.searchableFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <template #empty>暂无关联属性</template>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_SCM_ATTRIBUTE_TYPE, DICT_SCM_ATTRIBUTE_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryAttributeItemResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    itemList: [] as ScmBackCategoryAttributeItemResponseVo[]
  })

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      // 关联属性随后台分类详情接口一并返回
      const detail = await ScmBackCategoryApi.detail({ id: props.categoryId })
      state.itemList = detail.attributeList || []
    } catch (error) {
      console.error('获取关联属性失败', error)
      state.itemList = []
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
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
