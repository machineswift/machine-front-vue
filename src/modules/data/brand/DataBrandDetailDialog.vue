<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="品牌详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="720px"
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
          <el-form-item label="品牌全称">
            <el-input :model-value="state.detailData.fullName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="品牌名称">
            <el-input :model-value="state.detailData.name || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input :model-value="state.detailData.sort ?? 0" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="状态">
        <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
          {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
        </el-tag>
      </el-form-item>

      <el-form-item label="品牌LOGO">
        <el-image v-if="state.logoUrl" :src="state.logoUrl" fit="contain" class="detail-logo" @click="handleViewLogoOrigin" />
        <span v-else>无</span>
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

    <!-- LOGO 原图预览（详情只有缩略图，点击时才去取原图） -->
    <el-image-viewer
      v-if="state.logoViewerVisible"
      :url-list="state.logoViewerUrlList"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      hide-on-click-modal
      teleported
      @close="state.logoViewerVisible = false"
    />
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataBrandDetailResponseVo } from '@/modules/data/brand/type/DataBrand.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'close'])

  const EMPTY_DETAIL = {
    id: '',
    code: '',
    fullName: '',
    name: '',
    status: '',
    sort: 0,
    logoAttachmentId: '',
    description: '',
    createName: '',
    createBy: '',
    createTime: 0,
    updateName: '',
    updateBy: '',
    updateTime: 0
  } as DataBrandDetailResponseVo

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    /** LOGO 缩略图地址（附件接口返回，原图在点击时才去取） */
    logoUrl: '',
    /** LOGO 原图预览 */
    logoViewerVisible: false,
    logoViewerUrlList: [] as string[],
    detailData: { ...EMPTY_DETAIL }
  })

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  const loadLogoUrl = async (logoAttachmentId?: string) => {
    if (!logoAttachmentId) return ''

    try {
      const response = await DataAttachmentApi.thumbnail(logoAttachmentId)
      return response?.url || ''
    } catch (error) {
      console.error('获取品牌LOGO缩略图失败', error)
      return ''
    }
  }

  const fetchDetail = async () => {
    try {
      state.loading = true
      const response = (await DataBrandApi.detail({ id: props.brandId })) || ({} as DataBrandDetailResponseVo)
      state.detailData = { ...EMPTY_DETAIL, ...response }
      state.logoUrl = await loadLogoUrl(response.logoAttachmentId)
    } catch (error) {
      console.error('获取品牌详情失败', error)
      state.detailData = { ...EMPTY_DETAIL }
      state.logoUrl = ''
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = { ...EMPTY_DETAIL }
    state.logoUrl = ''
    state.logoViewerVisible = false
    state.logoViewerUrlList = []
    state.loading = false
  }

  /** 点击 LOGO 查看原图（详情只有缩略图，原图此时才去取） */
  const handleViewLogoOrigin = async () => {
    const logoAttachmentId = state.detailData.logoAttachmentId
    if (!logoAttachmentId) return

    try {
      const response = await DataAttachmentApi.preview(logoAttachmentId)
      state.logoViewerUrlList = [response?.url || '']
      state.logoViewerVisible = true
    } catch (error) {
      console.error('获取品牌LOGO原图失败', error)
    }
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

  /* 详情 LOGO（点击看原图） */
  .detail-logo {
    width: 50px;
    height: 50px;
    cursor: zoom-in;
    border-radius: 4px;
    overflow: hidden;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
</style>
