<template>
  <el-dialog
    v-model="state.visible"
    title="类目详情"
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

      <!-- 关联前台分类（只读展示）：仅叶子类目才有关联数据 -->
      <el-descriptions v-if="props.isLeaf" class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联前台分类">
          <TreeCheckPanel
            ref="frontCategoryPanelRef"
            v-model="state.selectedFrontCategoryIds"
            :roots="state.frontCategoryTreeData"
            :height="260"
            expand-checked-only
            placeholder="输入前台分类名称或编码搜索"
            :icon="FolderOpened"
            :closable-tags="false"
            empty-tags-text="暂无关联前台分类"
          />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联属性分组（只读展示） -->
      <el-descriptions v-if="state.detailData.attributeGroupList?.length" class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联属性分组">
          <el-table :data="state.detailData.attributeGroupList" border size="small" max-height="240">
            <el-table-column label="分组名称" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ row.name || row.id }}</template>
            </el-table-column>
            <el-table-column label="分组编码" min-width="160" show-overflow-tooltip>
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
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联属性（只读展示） -->
      <el-descriptions v-if="state.detailData.attributeList?.length" class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联属性">
          <el-table :data="state.detailData.attributeList" border size="small" max-height="240">
            <el-table-column prop="name" label="属性名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="属性编码" min-width="160" show-overflow-tooltip />
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
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联品牌（只读展示） -->
      <el-descriptions v-if="state.detailData.brandList?.length" class="detail-descriptions" :column="1" border>
        <el-descriptions-item label="关联品牌">
          <el-table :data="state.detailData.brandList" border size="small" max-height="240">
            <el-table-column prop="name" label="品牌名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="品牌编码" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ENABLE' ? 'success' : 'info'">{{ enumStore.getEnumLabel(DICT_STATUS, row.status) || '-' }}</el-tag>
              </template>
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
            <el-table-column label="推荐" width="70" align="center">
              <template #default="{ row }">{{ row.recommendFlag ? '是' : '否' }}</template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
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
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import {
    DICT_STATUS,
    DICT_SCM_ATTRIBUTE_GROUP_TYPE,
    DICT_SCM_ATTRIBUTE_TYPE,
    DICT_SCM_ATTRIBUTE_INPUT_TYPE
  } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import type { ScmBackCategoryDetailResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
  import type { ScmFrontCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      categoryId: string
      /** 是否为叶子类目：只有叶子类目才有关联前台分类 */
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
    detailData: {} as ScmBackCategoryDetailResponseVo,
    frontCategoryTreeData: [] as ScmFrontCategoryTreeSimpleResponseVo[],
    selectedFrontCategoryIds: [] as string[]
  })

  const frontCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const enumStore = useDictionaryEnumStore()

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
      // 非叶子类目不会有前台分类关联，连树一起省掉
      const [res, frontTree] = await Promise.all([ScmBackCategoryApi.detail({ id: props.categoryId }), props.isLeaf ? ScmFrontCategoryApi.treeSimple() : null])
      state.detailData = res || {}

      if (frontTree) {
        state.frontCategoryTreeData = frontTree.children || (frontTree.id ? [frontTree] : [])
        state.selectedFrontCategoryIds = res.frontCategoryIdSet || []
      }
    } catch (error) {
      console.error('获取类目详情失败', error)
      state.detailData = {} as ScmBackCategoryDetailResponseVo
    } finally {
      state.loading = false
      // 等 loading 遮罩隐藏/面板渲染后再回显勾选
      await nextTick()
      frontCategoryPanelRef.value?.setCheckedKeys(state.selectedFrontCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmBackCategoryDetailResponseVo
    state.loading = false
    state.selectedFrontCategoryIds = []
    state.frontCategoryTreeData = []
    frontCategoryPanelRef.value?.reset()
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

<style lang="scss" scoped>
  /* 只读展示：树复选框不可交互（保留滚动/搜索可用） */
  :deep(.tree-panel-tree .el-checkbox) {
    pointer-events: none;
  }
</style>
