<template>
  <el-dialog
    v-model="state.visible"
    title="属性值详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'info'">
            {{ enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="实际值" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.value }">{{ state.detailData.value || '-' }}</span>
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
  import type { ScmAttributeValueListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

  const props = defineProps<{
    modelValue: boolean
    attributeValue: ScmAttributeValueListResponseVo | null
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    /** 属性值无 detail 接口，详情数据直接取列表行 */
    detailData: {} as ScmAttributeValueListResponseVo
  })

  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmAttributeValueListResponseVo
  }

  watch(
    [() => props.modelValue, () => props.attributeValue],
    ([modelValue, attributeValue]) => {
      if (modelValue && attributeValue) {
        state.detailData = { ...attributeValue }
      }
    },
    { immediate: false }
  )
</script>
