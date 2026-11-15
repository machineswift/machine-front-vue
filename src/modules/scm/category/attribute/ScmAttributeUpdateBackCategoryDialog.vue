<template>
  <el-dialog
    v-model="state.visible"
    title="关联后台分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(680px, 64vw, 1000px)"
    align-center
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-divider content-position="left">选择后台分类</el-divider>

        <TreeCheckPanel
          ref="categoryPanelRef"
          :model-value="state.selectedCategoryIds"
          :roots="state.categoryTreeData"
          :height="240"
          expand-checked-only
          check-strictly
          placeholder="输入后台分类名称或编码搜索"
          :icon="FolderOpened"
          :closable-tags="false"
          @update:model-value="handleCategoryChange"
        />

        <el-divider content-position="left">关联配置</el-divider>

        <el-table :data="state.itemList" border size="small" height="260">
          <el-table-column label="后台分类" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ state.fullNameMap.get(row.backCategoryId) || row.backCategoryId }}</template>
          </el-table-column>
          <el-table-column label="必填" width="70" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.requiredFlag" />
            </template>
          </el-table-column>
          <el-table-column label="展示" width="70" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.displayFlag" />
            </template>
          </el-table-column>
          <el-table-column label="可搜索" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.searchableFlag" />
            </template>
          </el-table-column>
          <el-table-column label="排序" width="140" align="center">
            <template #default="{ row }">
              <el-input-number v-model="row.sort" :min="0" :max="99999" controls-position="right" size="small" style="width: 110px" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="removeItem(row.backCategoryId)">移除</el-button>
            </template>
          </el-table-column>
          <template #empty>请选择后台分类</template>
        </el-table>
        <div class="form-item-tip">排序值越大越靠前；必填/展示/可搜索为该属性在此后台分类下的配置</div>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.updateBackCategory]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmAttributeUpdateBackCategoryItemVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const PERMISSION_CODE = {
    updateBackCategory: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE:UPDATE_BACK_CATEGORY'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  /** 子节点 -> 父节点索引（树加载后构建） */
  const parentIdMap = new Map<string, string>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    categoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    /** 树中勾选的后台分类ID（任意层级） */
    selectedCategoryIds: [] as string[],
    itemList: [] as ScmAttributeUpdateBackCategoryItemVo[],
    /** 后台分类ID -> 全称（用「-」连接父级名称） */
    fullNameMap: new Map<string, string>()
  })

  const buildFullNameMap = (nodes: ScmBackCategoryTreeSimpleResponseVo[], parentPath = '') => {
    nodes.forEach(node => {
      const fullName = parentPath ? `${parentPath}-${node.name}` : node.name
      state.fullNameMap.set(node.id, fullName)
      if (node.children?.length) buildFullNameMap(node.children, fullName)
    })
  }

  /** 子节点 -> 父节点索引：用于判断两个后台分类是否存在祖先/后代关系 */
  const buildParentIdMap = (nodes: ScmBackCategoryTreeSimpleResponseVo[], parentId = '') => {
    nodes.forEach(node => {
      if (parentId) parentIdMap.set(node.id, parentId)
      if (node.children?.length) buildParentIdMap(node.children, node.id)
    })
  }

  const collectAncestorIdSet = (id: string): Set<string> => {
    const ancestorIdSet = new Set<string>()
    let parentId = parentIdMap.get(id)
    while (parentId) {
      ancestorIdSet.add(parentId)
      parentId = parentIdMap.get(parentId)
    }
    return ancestorIdSet
  }

  /** 两个后台分类是否处于同一路径（祖先/后代关系，含自身相等） */
  const isSamePath = (firstId: string, secondId: string): boolean => {
    if (firstId === secondId) return true
    return collectAncestorIdSet(firstId).has(secondId) || collectAncestorIdSet(secondId).has(firstId)
  }

  const findNodeName = (id: string): string => TreeDataUtil.findNode(state.categoryTreeData, id)?.name || id

  /** 勾选变化：保留已有配置，新勾选项给默认配置，取消勾选项直接丢弃 */
  const handleCategoryChange = (ids: string[]) => {
    const previousIdSet = new Set(state.selectedCategoryIds)
    const nextIdSet = new Set(ids)
    const addedIds = ids.filter(id => !previousIdSet.has(id))
    const keptIds = state.selectedCategoryIds.filter(id => nextIdSet.has(id))

    // 同一属性的关联分类不能存在父子关系（后端 updateBackCategory 同样校验）：冲突的新增项拒选并还原树勾选，
    // 避免自动取消已选分类时连已有的配置一起被丢掉
    const conflict = addedIds.map(addedId => ({ addedId, conflictId: keptIds.find(keptId => isSamePath(addedId, keptId)) })).find(item => item.conflictId)

    if (conflict) {
      state.selectedCategoryIds = keptIds
      categoryPanelRef.value?.setCheckedKeys(keptIds)
      ElMessage.warning(`「${findNodeName(conflict.addedId)}」与已选「${findNodeName(conflict.conflictId!)}」存在父子关系，同一属性的关联分类不能存在父子关系`)
      return
    }

    state.selectedCategoryIds = ids

    const itemMap = new Map(state.itemList.map(item => [item.backCategoryId, item]))
    state.itemList = ids.map(
      id =>
        itemMap.get(id) ?? {
          backCategoryId: id,
          requiredFlag: false,
          displayFlag: true,
          searchableFlag: false,
          sort: 0,
          features: ''
        }
    )
  }

  const removeItem = (backCategoryId: string) => {
    const remainIds = state.selectedCategoryIds.filter(id => id !== backCategoryId)
    state.selectedCategoryIds = remainIds
    state.itemList = state.itemList.filter(item => item.backCategoryId !== backCategoryId)
    categoryPanelRef.value?.setCheckedKeys(remainIds)
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await ScmAttributeApi.updateBackCategory({
        id: props.attributeId,
        // 全量替换：只提交关联配置字段，不上送响应填充字段
        backCategoryItemList: state.itemList.map(item => ({
          backCategoryId: item.backCategoryId,
          requiredFlag: item.requiredFlag,
          displayFlag: item.displayFlag,
          searchableFlag: item.searchableFlag,
          sort: item.sort,
          features: item.features
        }))
      })
      ElMessage.success('修改关联后台分类成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改关联后台分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    if (!props.attributeId) return

    try {
      state.loading = true
      const [detail, categoryTree] = await Promise.all([ScmAttributeApi.detail({ id: props.attributeId }), ScmBackCategoryApi.treeSimple()])

      state.categoryTreeData = categoryTree.children || (categoryTree.id ? [categoryTree] : [])
      buildFullNameMap(state.categoryTreeData)
      buildParentIdMap(state.categoryTreeData)

      // 关系里可能残留已删除的后台分类：回显时过滤掉（后端 updateBackCategory 会校验分类存在）
      state.itemList = (detail.backCategoryList || [])
        .filter(item => TreeDataUtil.findNode(state.categoryTreeData, item.backCategoryId))
        .map(item => ({
          backCategoryId: item.backCategoryId,
          requiredFlag: item.requiredFlag,
          displayFlag: item.displayFlag,
          searchableFlag: item.searchableFlag,
          sort: item.sort ?? 0,
          features: item.features || ''
        }))
      state.selectedCategoryIds = state.itemList.map(item => item.backCategoryId)
    } catch (error) {
      console.error('获取属性关联后台分类失败', error)
    } finally {
      state.loading = false
      // 等 loading 结束后树面板才渲染，此时再回显勾选
      await nextTick()
      categoryPanelRef.value?.setCheckedKeys(state.selectedCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.submitting = false
    state.categoryTreeData = []
    state.selectedCategoryIds = []
    state.itemList = []
    state.fullNameMap.clear()
    parentIdMap.clear()
    categoryPanelRef.value?.reset()
  }

  watch(
    [() => props.modelValue, () => props.attributeId],
    async ([modelValue, attributeId]) => {
      if (modelValue && attributeId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .form-item-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
