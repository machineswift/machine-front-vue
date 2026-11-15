<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="品牌详情"
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
        <el-descriptions-item label="品牌编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
        <el-descriptions-item label="品牌全称">{{ state.detailData.fullName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="品牌名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
        <el-descriptions-item label="拼音全拼">{{ state.detailData.namePinyinFull || '无' }}</el-descriptions-item>
        <el-descriptions-item label="拼音首字母">{{ state.detailData.namePinyinInitial || '无' }}</el-descriptions-item>
        <el-descriptions-item label="英文名称">{{ state.detailData.nameEn || '无' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ state.detailData.sort ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'">
            {{ state.detailData.status === 'ENABLE' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="品牌LOGO" :span="2">
          <el-image v-if="state.logoUrl" :src="state.logoUrl" fit="contain" class="detail-logo" @click="handleViewLogoOrigin" />
          <span v-else class="detail-empty">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="品牌描述" :span="2" v-if="state.detailData.description">
          <span class="detail-text-break">{{ state.detailData.description }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 所属分类（只读展示）：与「修改分类」弹窗共用同一棵分类树 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="所属分类">
          <TreeCheckPanel
            ref="categoryPanelRef"
            v-model="state.selectedCategoryIds"
            :roots="state.categoryTreeData"
            :height="260"
            expand-checked-only
            placeholder="输入分类名称或编码搜索"
            :icon="FolderOpened"
            :closable-tags="false"
            empty-tags-text="暂无所属分类"
          />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

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
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataBrandCategoryApi } from '@/modules/data/brand/api/DataBrandCategory.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataBrandDetailResponseVo } from '@/modules/data/brand/type/DataBrand.type'
  import type { DataBrandCategorySimpleTreeResponseVo } from '@/modules/data/brand/type/DataBrandCategory.type'

  /** 【未分配】虚拟节点 id，与后端一致，该节点不可选为分类 */
  const DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID = 'data_brand_category_virtual_node'

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
    namePinyinFull: '',
    namePinyinInitial: '',
    nameEn: '',
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
    detailData: { ...EMPTY_DETAIL },
    /** 所属分类（只读展示） */
    categoryTreeData: [] as (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[],
    selectedCategoryIds: [] as string[]
  })

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  /** 递归为【未分配】虚拟节点设置 disabled，禁止选择为分类（与「修改分类」弹窗保持一致） */
  const setVirtualNodeDisabled = (nodes: (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[]): void => {
    if (!nodes?.length) return
    for (const node of nodes) {
      if (node.id === DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID) {
        node.disabled = true
      }
      if (node.children?.length) {
        setVirtualNodeDisabled(node.children as (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[])
      }
    }
  }

  /** 分类树：与「修改分类」弹窗同源（tree_simple），保证展示结果一致 */
  const loadCategoryTree = async () => {
    try {
      const response = await DataBrandCategoryApi.treeSimple()
      const root = response as unknown as DataBrandCategorySimpleTreeResponseVo & { children?: DataBrandCategorySimpleTreeResponseVo[] }
      const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
      const treeWithDisabled = JSON.parse(JSON.stringify(rawTree)) as (DataBrandCategorySimpleTreeResponseVo & { disabled?: boolean })[]
      setVirtualNodeDisabled(treeWithDisabled)
      state.categoryTreeData = treeWithDisabled
    } catch (error) {
      console.error('加载分类树失败', error)
    }
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
      // 详情与分类树并行加载
      const [response] = await Promise.all([DataBrandApi.detail({ id: props.brandId }), loadCategoryTree()])
      const detail = response || ({} as DataBrandDetailResponseVo)
      state.detailData = { ...EMPTY_DETAIL, ...detail }
      state.selectedCategoryIds = (detail.categoryIdSet || []).filter(id => id !== DATA_BRAND_CATEGORY_VIRTUAL_NODE_ID)
      state.logoUrl = await loadLogoUrl(detail.logoAttachmentId)
    } catch (error) {
      console.error('获取品牌详情失败', error)
      state.detailData = { ...EMPTY_DETAIL }
      state.selectedCategoryIds = []
      state.logoUrl = ''
    } finally {
      state.loading = false
      // 等 loading 遮罩隐藏、面板渲染后再回显勾选
      await nextTick()
      categoryPanelRef.value?.setCheckedKeys(state.selectedCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.detailData = { ...EMPTY_DETAIL }
    state.logoUrl = ''
    state.logoViewerVisible = false
    state.logoViewerUrlList = []
    state.loading = false
    state.selectedCategoryIds = []
    state.categoryTreeData = []
    categoryPanelRef.value?.reset()
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
  /* 只读展示：树复选框不可交互（保留滚动/搜索可用） */
  :deep(.tree-panel-tree .el-checkbox) {
    pointer-events: none;
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
