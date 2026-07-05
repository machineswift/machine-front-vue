<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="品牌详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="8vh"
  >
    <el-form :model="state.detailData" label-width="100px" v-loading="state.loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="品牌编码">
            <el-input :model-value="state.detailData.code || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌名称">
            <el-input :model-value="state.detailData.name || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-form-item label="品牌LOGO">
        <DataBrandLogoPreview :url="state.detailData.logoUrl" />
      </el-form-item>

      <el-form-item label="品牌描述" v-if="state.detailData.description">
        <el-input :model-value="state.detailData.description" type="textarea" :rows="3" disabled />
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

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

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
