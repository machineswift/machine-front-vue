<template>
  <el-dialog
    v-model="state.visible"
    title="关联前台分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body detail-section">
      <!-- 关联前台分类 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联前台分类">
          <TreeCheckPanel
            ref="panelRef"
            v-model="state.selectedCategoryIds"
            :roots="state.treeData"
            :height="260"
            expand-checked-only
            placeholder="输入前台分类名称或编码搜索"
            :icon="FolderOpened"
            :closable-tags="false"
            empty-tags-text="暂无关联前台分类"
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
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import type { ScmFrontCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    treeData: [] as ScmFrontCategoryTreeSimpleResponseVo[],
    selectedCategoryIds: [] as string[]
  })

  const panelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const [detail, frontTree] = await Promise.all([ScmBackCategoryApi.detail({ id: props.categoryId }), ScmFrontCategoryApi.treeSimple()])

      state.treeData = frontTree.children || (frontTree.id ? [frontTree] : [])
      state.selectedCategoryIds = detail.frontCategoryIdSet || []
    } catch (error) {
      console.error('获取关联前台分类失败', error)
    } finally {
      state.loading = false
      // 等 loading 结束后树面板才回显勾选
      await nextTick()
      panelRef.value?.setCheckedKeys(state.selectedCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.treeData = []
    state.selectedCategoryIds = []
    panelRef.value?.reset()
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

<style scoped lang="scss">
  .detail-section {
    padding: 0;

    /* 仅展示关联数据：复选框不可交互（保留树的滚动/搜索可用） */
    :deep(.tree-panel-tree .el-checkbox) {
      pointer-events: none;
    }
  }
</style>
