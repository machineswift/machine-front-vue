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
          <el-table-column label="推荐" width="70" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.recommendFlag" />
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
        <div class="form-item-tip">排序值越大越靠前；必填/展示/可搜索/推荐为该品牌在此后台分类下的配置</div>
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
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmBrandConfigBackCategoryItemVo } from '@/modules/scm/category/brand/type/ScmBrandConfig.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const PERMISSION_CODE = {
    updateBackCategory: 'MANAGE_APP:SCM:BRAND_CONFIG:UPDATE_BACK_CATEGORY'
  }

  const props = defineProps<{
    modelValue: boolean
    configId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    /** 提交时使用的品牌ID（由详情回填） */
    brandId: '',
    categoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    /** 树中勾选的后台分类ID（任意层级） */
    selectedCategoryIds: [] as string[],
    itemList: [] as ScmBrandConfigBackCategoryItemVo[],
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

  /** 勾选变化：保留已有配置，新勾选项给默认配置，取消勾选项直接丢弃 */
  const handleCategoryChange = (ids: string[]) => {
    state.selectedCategoryIds = ids
    const itemMap = new Map(state.itemList.map(item => [item.backCategoryId, item]))
    state.itemList = ids.map(
      id =>
        itemMap.get(id) ?? {
          backCategoryId: id,
          requiredFlag: false,
          displayFlag: true,
          searchableFlag: false,
          recommendFlag: false,
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
      await ScmBrandConfigApi.updateBackCategory({
        brandId: state.brandId,
        // 全量替换：只提交关联配置字段，不上送响应填充字段
        backCategoryItemList: state.itemList.map(item => ({
          backCategoryId: item.backCategoryId,
          requiredFlag: item.requiredFlag,
          displayFlag: item.displayFlag,
          searchableFlag: item.searchableFlag,
          recommendFlag: item.recommendFlag,
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
    if (!props.configId) return

    try {
      state.loading = true
      const [detail, categoryTree] = await Promise.all([ScmBrandConfigApi.detail({ id: props.configId }), ScmBackCategoryApi.treeSimple()])

      state.brandId = detail.brandId
      state.categoryTreeData = categoryTree.children || (categoryTree.id ? [categoryTree] : [])
      buildFullNameMap(state.categoryTreeData)

      // 关系里可能残留已删除的后台分类：回显时过滤掉（后端 updateBackCategory 会校验分类存在）
      state.itemList = (detail.backCategoryItemList || [])
        .filter(item => TreeDataUtil.findNode(state.categoryTreeData, item.backCategoryId))
        .map(item => ({
          backCategoryId: item.backCategoryId,
          requiredFlag: item.requiredFlag ?? false,
          displayFlag: item.displayFlag ?? true,
          searchableFlag: item.searchableFlag ?? false,
          recommendFlag: item.recommendFlag ?? false,
          sort: item.sort ?? 0,
          features: item.features || ''
        }))
      state.selectedCategoryIds = state.itemList.map(item => item.backCategoryId)
    } catch (error) {
      console.error('获取品牌配置关联后台分类失败', error)
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
    state.brandId = ''
    state.categoryTreeData = []
    state.selectedCategoryIds = []
    state.itemList = []
    state.fullNameMap.clear()
    categoryPanelRef.value?.reset()
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

<style scoped lang="scss">
  .form-item-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
