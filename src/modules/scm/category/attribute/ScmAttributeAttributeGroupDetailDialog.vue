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
    <div v-loading="state.loading" class="detail-dialog-body">
      <el-descriptions class="detail-descriptions" :column="1" border title="关联属性分组">
        <el-descriptions-item label="属性分组">
          <el-table :data="state.itemList" border size="small" height="380">
            <el-table-column prop="groupName" label="属性分组" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ row.groupName || row.groupId }}</template>
            </el-table-column>
            <el-table-column prop="groupCode" label="分组编码" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.groupCode || '-' }}</template>
            </el-table-column>
            <el-table-column label="必填" width="70" align="center">
              <template #default="{ row }">{{ row.requiredFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="展示" width="70" align="center">
              <template #default="{ row }">{{ row.displayFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column label="可搜索" width="80" align="center">
              <template #default="{ row }">{{ row.searchableFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <el-table-column prop="features" label="扩展特性" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.features || '-' }}</template>
            </el-table-column>
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
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import type { ScmAttributeGroupItemVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    itemList: [] as ScmAttributeGroupItemVo[]
  })

  const fetchData = async () => {
    if (!props.attributeId) return

    try {
      state.loading = true
      // 详情已返回关联的属性分组（含分组信息与关联配置），此处只展示
      const detail = await ScmAttributeApi.detail({ id: props.attributeId })
      state.itemList = detail.attributeGroupItemList || []
    } catch (error) {
      console.error('获取关联属性分组失败', error)
      state.itemList = []
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.loading = false
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
