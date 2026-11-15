<template>
  <el-dialog
    v-model="state.visible"
    title="类目详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="类目名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类目编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序值">{{ state.detailData.sort ?? '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 关联后台分类（只读展示）：仅叶子类目才有关联数据 -->
      <el-descriptions v-if="props.isLeaf" class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联后台分类">
          <TreeCheckPanel
            ref="backCategoryPanelRef"
            v-model="state.selectedBackCategoryIds"
            :roots="state.backCategoryTreeData"
            :height="260"
            expand-checked-only
            placeholder="输入后台分类名称或编码搜索"
            :icon="FolderOpened"
            :closable-tags="false"
            empty-tags-text="暂无关联后台分类"
          />
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmFrontCategoryDetailResponseVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      categoryId: string
      /** 是否为叶子类目：只有叶子类目才有关联后台分类 */
      isLeaf?: boolean
    }>(),
    {
      isLeaf: true
    }
  )

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as ScmFrontCategoryDetailResponseVo,
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    selectedBackCategoryIds: [] as string[]
  })

  const backCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      // 非叶子类目不会有后台分类关联，连树一起省掉
      const [res, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: props.categoryId }), props.isLeaf ? ScmBackCategoryApi.treeSimple() : null])
      state.detailData = res || {}

      if (backTree) {
        state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
        state.selectedBackCategoryIds = res.backCategoryIdSet || []
      }
    } catch (error) {
      console.error('获取类目详情失败', error)
      state.detailData = {} as ScmFrontCategoryDetailResponseVo
    } finally {
      state.loading = false
      // 等 loading 遮罩隐藏/面板渲染后再回显勾选
      await nextTick()
      backCategoryPanelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmFrontCategoryDetailResponseVo
    state.loading = false
    state.selectedBackCategoryIds = []
    state.backCategoryTreeData = []
    backCategoryPanelRef.value?.reset()
  }

  watch([() => props.modelValue, () => props.categoryId], async ([modelValue, categoryId]) => {
    if (modelValue && categoryId) {
      await fetchData()
    }
  })
</script>

<style lang="scss" scoped>
  /* 只读展示：树复选框不可交互（保留滚动/搜索可用） */
  :deep(.tree-panel-tree .el-checkbox) {
    pointer-events: none;
  }
</style>
