<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="品牌详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="品牌ID" v-if="false">
        {{ state.detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="品牌编码">
        {{ state.detailData.code || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="品牌名称">
        {{ state.detailData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ state.detailData.createName || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新人">
        {{ state.detailData.updateName || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatTime(state.detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatTime(state.detailData.updateTime) }}
      </el-descriptions-item>
      <el-descriptions-item></el-descriptions-item>
      <el-descriptions-item label="品牌LOGO" span="2">
        <DataBrandLogoPreview :url="state.detailData.logoUrl" />
      </el-descriptions-item>
      <el-descriptions-item label="品牌描述" span="2">
        {{ state.detailData.description || '无' }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="state.dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import DataBrandLogoPreview from '@/modules/data/brand/DataBrandLogoPreview.vue'
  import type { DataBrandDetailResponseVo } from '@/modules/data/types'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'close'])

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {
      id: '',
      code: '',
      name: '',
      status: '',
      logoMaterialId: '',
      logoUrl: '',
      description: '',
      createName: '',
      createBy: '',
      createTime: 0,
      updateName: '',
      updateBy: '',
      updateTime: 0
    } as DataBrandDetailResponseVo
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  // 获取详情
  const fetchDetail = async () => {
    try {
      state.loading = true
      const response = await DataBrandApi.detail({ id: props.brandId })
      state.detailData = response || {}
    } catch (error) {
      console.error('获取品牌详情失败', error)
      state.detailData = {}
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    // 重置详情数据
    state.detailData = {
      id: '',
      code: '',
      name: '',
      status: '',
      logoMaterialId: '',
      logoUrl: '', // 特别注意清空LOGO URL
      description: '',
      createName: '',
      createBy: '',
      createTime: 0,
      updateName: '',
      updateBy: '',
      updateTime: 0
    }

    // 重置加载状态
    state.loading = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.brandId],
    async ([modelValue, brandId]) => {
      if (modelValue && brandId) {
        await fetchDetail()
      }
    },
    { immediate: false }
  )
</script>
