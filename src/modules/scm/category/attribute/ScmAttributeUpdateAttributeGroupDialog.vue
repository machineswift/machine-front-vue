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
    <el-divider content-position="left">选择属性分组</el-divider>

    <div class="select-toolbar">
      <el-button type="primary" plain @click="state.quickSelectVisible = true">选择属性分组</el-button>
      <span class="form-item-tip">支持跨页多选；已关联的属性分组默认勾选</span>
    </div>

    <el-divider content-position="left">关联配置</el-divider>

    <el-table :data="state.itemList" border size="small" height="320" v-loading="state.loading">
      <el-table-column prop="groupName" label="分组名称" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.groupName || row.groupId }}</template>
      </el-table-column>
      <el-table-column prop="groupCode" label="分组编码" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.groupCode || '-' }}</template>
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
      <el-table-column label="排序" width="130" align="center">
        <template #default="{ row }">
          <el-input-number v-model="row.sort" :min="0" :max="99999" controls-position="right" size="small" style="width: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="removeItem(row.groupId)">移除</el-button>
        </template>
      </el-table-column>
      <template #empty>请选择属性分组</template>
    </el-table>
    <div class="form-item-tip">排序值越大越靠前；必填/展示/可搜索为该属性分组在此属性下的配置</div>

    <!-- 属性分组快速选择：已关联属性分组回显勾选 -->
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
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import ScmAttributeGroupQuickSelectDialog from '@/modules/scm/category/attribute/ScmAttributeGroupQuickSelectDialog.vue'
  import type { ScmAttributeGroupItemVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'
  import type { ScmAttributeGroupSimpleListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'

  const PERMISSION_CODE = {
    updateAttributeGroup: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE:UPDATE_ATTRIBUTE_GROUP'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    /** 属性分组快速选择弹窗 */
    quickSelectVisible: false,
    /** 已关联属性分组（全量替换提交） */
    itemList: [] as ScmAttributeGroupItemVo[]
  })

  /** 快速选择弹窗的已选项（只用于回显勾选与去重，分组完整信息由接口数据回填） */
  const selectedGroups = computed<ScmAttributeGroupSimpleListResponseVo[]>(() =>
    state.itemList.map(item => ({ id: item.groupId, name: item.groupName || item.groupId, code: item.groupCode || '', groupType: '', status: '' }))
  )

  /** 选择结果：保留已有配置，新勾选分组给默认配置，取消勾选分组直接丢弃 */
  const handleGroupsSelected = (groups: ScmAttributeGroupSimpleListResponseVo[]) => {
    const itemMap = new Map(state.itemList.map(item => [item.groupId, item]))
    state.itemList = groups.map(
      group =>
        itemMap.get(group.id) ?? {
          groupId: group.id,
          groupName: group.name,
          groupCode: group.code,
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
    state.itemList = state.itemList.filter(item => item.groupId !== groupId)
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await ScmAttributeApi.updateAttributeGroup({
        id: props.attributeId,
        // 全量替换：只提交关联配置字段，不上送响应填充字段
        attributeGroupItemList: state.itemList.map(item => ({
          groupId: item.groupId,
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

  const fetchData = async () => {
    if (!props.attributeId) return

    try {
      state.loading = true
      const detail = await ScmAttributeApi.detail({ id: props.attributeId })
      state.itemList = (detail.attributeGroupItemList || []).map(item => ({
        groupId: item.groupId,
        groupName: item.groupName,
        groupCode: item.groupCode,
        requiredFlag: item.requiredFlag,
        displayFlag: item.displayFlag,
        searchableFlag: item.searchableFlag,
        sort: item.sort ?? 0,
        features: item.features || ''
      }))
    } catch (error) {
      console.error('获取属性关联属性分组失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.submitting = false
    state.loading = false
    state.quickSelectVisible = false
    state.itemList = []
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
