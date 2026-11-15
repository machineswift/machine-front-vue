<template>
  <el-dialog
    v-model="state.visible"
    title="关联后台分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <div v-loading="state.loading">
      <TreeCheckPanel
        ref="panelRef"
        :model-value="state.selectedBackCategoryIds"
        :roots="state.backCategoryTreeData"
        :height="260"
        expand-checked-only
        placeholder="输入后台分类名称或编码搜索"
        :icon="FolderOpened"
        tip="只能关联后台叶子类目"
        @update:model-value="handleSelectionChange"
      />
    </div>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" :loading="state.submitting" @click="handleSubmit" v-hasPermission="['MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE_BACK_CATEGORY']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const panelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    selectedBackCategoryIds: [] as string[]
  })

  /** 只允许关联后台叶子分类：el-tree-v2 全选下级时会自动勾上父节点（TreeCheckPanel 只抛该父节点），这里展开回全部叶子后代 */
  const toLeafCategoryIds = (ids: string[]): string[] => {
    const leafIdSet = new Set<string>()

    const collectLeafIds = (node: ScmBackCategoryTreeSimpleResponseVo): void => {
      if (!node.children?.length) {
        leafIdSet.add(node.id)
        return
      }
      node.children.forEach(collectLeafIds)
    }

    ids.forEach(id => {
      const node = TreeDataUtil.findNode(state.backCategoryTreeData, id)
      if (node) collectLeafIds(node)
    })

    return [...leafIdSet]
  }

  const handleSelectionChange = (ids: string[]) => {
    state.selectedBackCategoryIds = toLeafCategoryIds(ids)
  }

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const [detail, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: props.categoryId }), ScmBackCategoryApi.treeSimple()])
      state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
      // 历史数据可能存在非叶子后台类目：回显时过滤掉（保存后会自动清除）
      state.selectedBackCategoryIds = TreeDataUtil.getBottomLevelIds(state.backCategoryTreeData, detail.backCategoryIdSet || [])

      await nextTick()
      panelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取关联后台分类失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await ScmFrontCategoryApi.updateBackCategory({ id: props.categoryId, backCategoryIdSet: state.selectedBackCategoryIds })
      ElMessage.success('保存成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改关联后台分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.submitting = false
    state.backCategoryTreeData = []
    state.selectedBackCategoryIds = []
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
