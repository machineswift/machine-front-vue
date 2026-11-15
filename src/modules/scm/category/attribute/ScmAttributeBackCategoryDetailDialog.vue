<template>
  <el-dialog
    v-model="state.visible"
    title="关联后台分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <el-descriptions class="detail-descriptions" :column="1" border title="关联后台分类">
        <el-descriptions-item label="后台分类">
          <!-- 固定高度：数据超出时表格内部滚动，避免弹窗高度随数据变化 -->
          <el-table :data="state.itemList" border size="small" height="380">
            <el-table-column label="后台分类" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryFullName || row.backCategoryId }}</template>
            </el-table-column>
            <el-table-column prop="backCategoryCode" label="分类编码" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryCode || '-' }}</template>
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
            <template #empty>暂无关联后台分类</template>
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
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import type { ScmAttributeBackCategoryItemVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    itemList: [] as ScmAttributeBackCategoryItemVo[]
  })

  const fetchData = async () => {
    if (!props.attributeId) return

    try {
      state.loading = true
      // 详情已返回关联的后台分类（含全称、编码与关联配置），此处只展示
      const detail = await ScmAttributeApi.detail({ id: props.attributeId })
      state.itemList = detail.backCategoryList || []
    } catch (error) {
      console.error('获取关联后台分类失败', error)
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
    [() => props.modelValue, () => props.attributeId],
    async ([modelValue, attributeId]) => {
      if (modelValue && attributeId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
