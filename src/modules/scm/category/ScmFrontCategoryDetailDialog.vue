<template>
  <el-dialog
    v-model="state.visible"
    title="类目详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="720px"
    top="8vh"
  >
    <el-form :model="state.detailData" label-width="100px" v-loading="state.loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="类目名称">
            <el-input :model-value="state.detailData.name || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类目编码">
            <el-input :model-value="state.detailData.code || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="排序值">
        <el-input :model-value="state.detailData.sort ?? '-'" disabled style="width: 200px" />
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 关联后台分类 -->
      <el-divider content-position="left">关联后台分类</el-divider>

      <el-form-item label="后台分类">
        <TreeCheckPanel
          ref="backCategoryPanelRef"
          v-model="state.selectedBackCategoryIds"
          :roots="state.backCategoryTreeData"
          :height="260"
          placeholder="输入后台分类名称或编码搜索"
          :icon="FolderOpened"
          :closable-tags="false"
          empty-tags-text="暂无关联后台分类"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmFrontCategoryDetailResponseVo } from '@/modules/scm/category/type/ScmFrontCategory.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'

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
    detailData: {} as ScmFrontCategoryDetailResponseVo,
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    selectedBackCategoryIds: [] as string[]
  })

  const backCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const [res, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: props.categoryId }), ScmBackCategoryApi.treeSimple()])
      state.detailData = res || {}

      state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
      state.selectedBackCategoryIds = res.backCategoryIdSet || []
    } catch (error) {
      console.error('获取类目详情失败', error)
      state.detailData = {} as ScmFrontCategoryDetailResponseVo
    } finally {
      state.loading = false
      // 等骨架屏隐藏后再回显勾选
      await nextTick()
      backCategoryPanelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmFrontCategoryDetailResponseVo
    state.loading = false
    state.selectedBackCategoryIds = []
    state.backCategoryTreeData = []
    backCategoryPanelRef.value?.reset()
  }

  watch([() => props.modelValue, () => props.categoryId], async ([modelValue, categoryId]) => {
    if (modelValue && categoryId) {
      await fetchData()
    }
  })
</script>

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }
</style>
