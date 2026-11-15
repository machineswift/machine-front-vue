<template>
  <el-dialog
    v-model="state.visible"
    title="关联属性分组"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-divider content-position="left">选择属性分组</el-divider>

        <div class="select-toolbar">
          <el-button type="primary" plain @click="state.quickSelectVisible = true">选择属性分组</el-button>
          <span class="form-item-tip">支持跨页多选；已关联的分组默认勾选</span>
        </div>

        <el-divider content-position="left">关联配置</el-divider>

        <el-table :data="state.itemList" border size="small" height="320">
          <el-table-column label="分组名称" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.group.name || row.group.id }}</template>
          </el-table-column>
          <el-table-column label="分组编码" min-width="170" show-overflow-tooltip>
            <template #default="{ row }">{{ row.group.code || '-' }}</template>
          </el-table-column>
          <el-table-column label="组类型" width="100" align="center">
            <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_GROUP_TYPE, row.group.groupType) || '-' }}</template>
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
              <el-button link type="danger" size="small" @click="removeItem(row.group.id)">移除</el-button>
            </template>
          </el-table-column>
          <template #empty>请选择属性分组</template>
        </el-table>
        <div class="form-item-tip">排序值越大越靠前；必填/展示/可搜索为该分组在此后台分类下的配置</div>
      </template>
    </el-skeleton>

    <!-- 属性分组快速选择：已关联分组回显勾选 -->
    <ScmAttributeGroupQuickSelectDialog v-model="state.quickSelectVisible" :multiple="true" :selected-groups="selectedGroups" @confirm="handleGroupsSelected" />

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.updateAttributeGroup]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_SCM_ATTRIBUTE_GROUP_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import ScmAttributeGroupQuickSelectDialog from '@/modules/scm/category/attribute/ScmAttributeGroupQuickSelectDialog.vue'
  import type { ScmAttributeGroupSimpleListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'
  import type { ScmBackCategoryAttributeGroupItemResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const PERMISSION_CODE = {
    updateAttributeGroup: 'MANAGE_APP:SCM:CATEGORY:BACK:UPDATE_ATTRIBUTE_GROUP'
  }

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const enumStore = useDictionaryEnumStore()

  /** 关联项 = 属性分组信息 + 该分组在此后台分类下的关联配置 */
  interface AttributeGroupConfigItem {
    group: ScmBackCategoryAttributeGroupItemResponseVo
    requiredFlag: boolean
    displayFlag: boolean
    searchableFlag: boolean
    sort: number
    features: string
  }

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    quickSelectVisible: false,
    itemList: [] as AttributeGroupConfigItem[]
  })

  /** 快速选择弹窗的已选项（用于回显勾选） */
  const selectedGroups = computed(() => state.itemList.map(item => item.group))

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      // 该接口返回分组信息 + 分组在此后台分类下的关联数据（必填/展示/可搜索/排序/扩展特性）
      const groupList = await ScmAttributeGroupApi.listSimple({ backCategoryId: props.categoryId })
      state.itemList = groupList.map(group => ({
        group,
        requiredFlag: group.requiredFlag ?? false,
        displayFlag: group.displayFlag ?? true,
        searchableFlag: group.searchableFlag ?? false,
        sort: group.sort ?? 0,
        features: group.features || ''
      }))
    } catch (error) {
      console.error('获取后台分类关联属性分组失败', error)
    } finally {
      state.loading = false
    }
  }

  /** 选择结果：保留已有配置，新勾选分组给默认配置，取消勾选分组直接丢弃 */
  const handleGroupsSelected = (groups: ScmAttributeGroupSimpleListResponseVo[]) => {
    const itemMap = new Map(state.itemList.map(item => [item.group.id, item]))
    state.itemList = groups.map(
      group =>
        itemMap.get(group.id) ?? {
          group,
          requiredFlag: false,
          displayFlag: true,
          searchableFlag: false,
          sort: 0,
          features: ''
        }
    )
    state.quickSelectVisible = false
  }

  const removeItem = (groupId: string) => {
    state.itemList = state.itemList.filter(item => item.group.id !== groupId)
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await ScmBackCategoryApi.updateAttributeGroup({
        id: props.categoryId,
        // 全量替换：只提交关联配置字段，分组信息由后端按 groupId 关联
        attributeGroupItemList: state.itemList.map(item => ({
          groupId: item.group.id,
          requiredFlag: item.requiredFlag,
          displayFlag: item.displayFlag,
          searchableFlag: item.searchableFlag,
          sort: item.sort,
          features: item.features
        }))
      })
      ElMessage.success('修改关联属性分组成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改关联属性分组失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.submitting = false
    state.quickSelectVisible = false
    state.itemList = []
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
  .select-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .form-item-tip {
    font-size: 12px;
    color: #909399;
  }

  :deep(.el-divider--horizontal) {
    margin: 12px 0;
  }
</style>
