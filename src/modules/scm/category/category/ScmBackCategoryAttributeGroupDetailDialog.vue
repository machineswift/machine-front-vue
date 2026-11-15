<template>
  <el-dialog
    v-model="state.visible"
    title="关联属性分组"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(680px, 64vw, 1000px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 关联属性分组 -->
      <el-descriptions class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联属性分组">
          <el-table :data="state.groupList" border size="small" height="380">
            <el-table-column label="分组名称" min-width="120" align="center" fixed show-overflow-tooltip>
              <template #default="{ row }">{{ row.name || row.id }}</template>
            </el-table-column>
            <el-table-column label="分组编码" min-width="200" align="center" show-overflow-tooltip>
              <template #default="{ row }">{{ row.code || '-' }}</template>
            </el-table-column>
            <el-table-column label="组类型" width="80" align="center">
              <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_GROUP_TYPE, row.groupType) || '-' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ENABLE' ? 'success' : 'info'">{{ enumStore.getEnumLabel(DICT_STATUS, row.status) || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="50" align="center">
              <template #default="{ row }">{{ row.requiredFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="展示" width="50" align="center">
              <template #default="{ row }">{{ row.displayFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="可搜索" width="60" align="center">
              <template #default="{ row }">{{ row.searchableFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <template #empty>暂无关联属性分组</template>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_STATUS, DICT_SCM_ATTRIBUTE_GROUP_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'
  import type { ScmBackCategoryAttributeGroupItemResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    groupList: [] as ScmBackCategoryAttributeGroupItemResponseVo[]
  })

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      // 该接口返回分组信息 + 分组在此后台分类下的关联数据（必填/展示/可搜索/排序）
      state.groupList = await ScmAttributeGroupApi.listSimple({ backCategoryId: props.categoryId })
    } catch (error) {
      console.error('获取关联属性分组失败', error)
      state.groupList = []
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
    state.groupList = []
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
