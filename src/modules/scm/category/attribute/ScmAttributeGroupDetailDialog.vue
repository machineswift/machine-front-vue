<template>
  <el-dialog
    v-model="state.visible"
    title="属性分组详情"
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
        <el-descriptions-item label="名称">{{ state.detailData.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="编码">{{ state.detailData.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="组类型">
          {{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_GROUP_TYPE, state.detailData.groupType) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'info'">
            {{ enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="扩展特性" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.features }">{{ state.detailData.features || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联后台分类 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="关联后台分类">
        <el-descriptions-item label="后台分类">
          <el-table :data="state.detailData.backCategoryItemList || []" border size="small" height="160">
            <el-table-column prop="backCategoryFullName" label="后台分类" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.backCategoryFullName || row.backCategoryId }}</template>
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
            <template #empty>暂无关联后台分类</template>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联属性 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="关联属性">
        <el-descriptions-item label="属性">
          <el-table :data="state.detailData.attributeItemList || []" border size="small" height="160">
            <el-table-column prop="name" label="属性名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="属性编码" min-width="120" show-overflow-tooltip />
            <el-table-column label="属性类型" width="100" align="center">
              <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_TYPE, row.attributeType) || '-' }}</template>
            </el-table-column>
            <el-table-column label="输入方式" width="100" align="center">
              <template #default="{ row }">{{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_INPUT_TYPE, row.inputType) || '-' }}</template>
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
            <template #empty>暂无关联属性</template>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="修改人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
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
  import {
    DICT_STATUS,
    DICT_SCM_ATTRIBUTE_GROUP_TYPE,
    DICT_SCM_ATTRIBUTE_TYPE,
    DICT_SCM_ATTRIBUTE_INPUT_TYPE
  } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'
  import type { ScmAttributeGroupDetailResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'

  const props = defineProps<{
    modelValue: boolean
    groupId: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    detailData: {} as ScmAttributeGroupDetailResponseVo
  })

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  const fetchData = async () => {
    if (!props.groupId) return

    try {
      state.loading = true
      const res = await ScmAttributeGroupApi.detail({ id: props.groupId })
      state.detailData = res || ({} as ScmAttributeGroupDetailResponseVo)
    } catch (error) {
      console.error('获取属性分组详情失败', error)
      state.detailData = {} as ScmAttributeGroupDetailResponseVo
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmAttributeGroupDetailResponseVo
    state.loading = false
  }

  watch(
    [() => props.modelValue, () => props.groupId],
    async ([modelValue, groupId]) => {
      if (modelValue && groupId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
