<template>
  <el-dialog
    v-model="state.visible"
    title="关联品牌"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 关联品牌 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联品牌">
          <el-table :data="state.itemList" border size="small" height="380">
            <el-table-column prop="name" label="品牌名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="品牌编码" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ENABLE' ? 'success' : 'info'">{{ enumStore.getEnumLabel(DICT_STATUS, row.status) || '-' }}</el-tag>
              </template>
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
            <template #empty>暂无关联品牌</template>
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
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryBrandItemResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

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
    itemList: [] as ScmBackCategoryBrandItemResponseVo[]
  })

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      // 关联品牌随后台分类详情接口一并返回
      const detail = await ScmBackCategoryApi.detail({ id: props.categoryId })
      state.itemList = detail.brandList || []
    } catch (error) {
      console.error('获取关联品牌失败', error)
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
