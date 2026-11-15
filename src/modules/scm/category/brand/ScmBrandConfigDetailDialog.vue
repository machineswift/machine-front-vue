<template>
  <el-dialog
    v-model="state.visible"
    title="品牌配置详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="品牌名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="品牌编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拼音全拼">{{ state.detailData.namePinyinFull || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拼音首字母">{{ state.detailData.namePinyinInitial || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'info'">
            {{ enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="扩展特性" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.features }">{{ state.detailData.features || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 关联后台分类（只读展示） -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联后台分类">
          <el-table :data="state.detailData.backCategoryItemList || []" border size="small" max-height="280">
            <el-table-column label="后台分类" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryFullName || row.backCategoryId }}</template>
            </el-table-column>
            <el-table-column prop="backCategoryCode" label="分类编码" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryCode || '-' }}</template>
            </el-table-column>
            <el-table-column label="必填" width="60" align="center">
              <template #default="{ row }">{{ row.requiredFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="展示" width="60" align="center">
              <template #default="{ row }">{{ row.displayFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="可搜索" width="70" align="center">
              <template #default="{ row }">{{ row.searchableFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="推荐" width="60" align="center">
              <template #default="{ row }">{{ row.recommendFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="70" align="center" />
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
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'
  import type { ScmBrandConfigDetailResponseVo } from '@/modules/scm/category/brand/type/ScmBrandConfig.type'

  const props = defineProps<{
    modelValue: boolean
    configId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as ScmBrandConfigDetailResponseVo
  })

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const fetchData = async () => {
    if (!props.configId) return

    try {
      state.loading = true
      state.detailData = await ScmBrandConfigApi.detail({ id: props.configId })
    } catch (error) {
      console.error('获取品牌配置详情失败', error)
      state.detailData = {} as ScmBrandConfigDetailResponseVo
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.detailData = {} as ScmBrandConfigDetailResponseVo
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
