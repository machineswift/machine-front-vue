<template>
  <el-dialog
    v-model="state.visible"
    title="关联后台类目"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(600px, 56vw, 860px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 关联后台类目 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联后台类目">
          <el-table :data="state.itemList" border size="small" height="380">
            <el-table-column label="后台类目" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryFullName || row.backCategoryId }}</template>
            </el-table-column>
            <el-table-column label="类目编码" width="160" show-overflow-tooltip>
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
            <el-table-column label="推荐" width="70" align="center">
              <template #default="{ row }">{{ row.recommendFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <template #empty>暂无关联后台类目</template>
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
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'
  import type { ScmBrandConfigBackCategoryRelationItem } from '@/modules/scm/category/brand/type/ScmBrandConfig.type'

  const props = defineProps<{
    modelValue: boolean
    configId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    itemList: [] as ScmBrandConfigBackCategoryRelationItem[]
  })

  const fetchData = async () => {
    if (!props.configId) return

    try {
      state.loading = true
      // 关联后台类目随品牌配置详情接口一并返回，此处只展示关系数据
      const detail = await ScmBrandConfigApi.detail({ id: props.configId })
      state.itemList = detail.backCategoryItemList || []
    } catch (error) {
      console.error('获取关联后台类目失败', error)
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
    [() => props.modelValue, () => props.configId],
    async ([modelValue, configId]) => {
      if (modelValue && configId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss"></style>
