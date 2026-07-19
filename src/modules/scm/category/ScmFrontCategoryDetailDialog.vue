<template>
  <el-dialog
    v-model="state.visible"
    title="类目详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
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
        <div class="back-category-selector">
          <el-input v-model="state.backCategoryQuery" placeholder="搜索后台分类" size="small" clearable @input="onBackCategoryQueryChanged" />
          <el-tree
            ref="backCategoryTreeRef"
            :data="state.backCategoryTreeData"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            show-checkbox
            :filter-node-method="backCategoryFilterMethod"
            default-expand-all
            class="back-category-tree"
            @check="syncSelectedNames"
          />
          <div class="selected-tags">
            <span class="selected-label">已选：</span>
            <template v-if="state.selectedBackCategoryNames.length">
              <el-tag v-for="name in state.selectedBackCategoryNames" :key="name" size="small">
                {{ name }}
              </el-tag>
            </template>
            <span v-else class="empty-hint">暂无关联后台分类</span>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElTree } from 'element-plus'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
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
    backCategoryQuery: '',
    selectedBackCategoryIds: [] as string[],
    selectedBackCategoryNames: [] as string[]
  })

  const backCategoryTreeRef = ref<InstanceType<typeof ElTree>>()

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
      state.selectedBackCategoryNames = resolveNames(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取类目详情失败', error)
      state.detailData = {} as ScmFrontCategoryDetailResponseVo
    } finally {
      state.loading = false
      // 等骨架屏隐藏、tree渲染完成后勾选
      await nextTick()
      backCategoryTreeRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    }
  }

  /** 后台分类树搜索过滤 */
  const onBackCategoryQueryChanged = (val: string) => {
    if (backCategoryTreeRef.value) {
      backCategoryTreeRef.value.filter(val.trim())
    }
  }

  /** 缓存搜索关键字，避免每节点重复 toLowerCase */
  let cachedQuery = ''
  const backCategoryFilterMethod = (value: string, data: ScmBackCategoryTreeSimpleResponseVo) => {
    if (!value) return true
    cachedQuery = value.toLowerCase()
    return data.name?.toLowerCase().includes(cachedQuery) || false
  }

  /** 根据 ID 列表解析对应的后台分类名称 */
  const resolveNames = (ids: string[]): string[] => {
    if (!ids.length || !state.backCategoryTreeData.length) return []
    const allNodes = TreeDataUtil.collectAllNodes(state.backCategoryTreeData)
    return ids.map(id => allNodes.find(n => n.id === id)?.name).filter(Boolean) as string[]
  }

  const syncSelectedNames = () => {
    if (!backCategoryTreeRef.value) return
    const checkedKeys = backCategoryTreeRef.value.getCheckedKeys(false) as string[]
    state.selectedBackCategoryIds = checkedKeys
    state.selectedBackCategoryNames = resolveNames(checkedKeys)
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmFrontCategoryDetailResponseVo
    state.loading = false
    state.selectedBackCategoryIds = []
    state.selectedBackCategoryNames = []
    state.backCategoryTreeData = []
    state.backCategoryQuery = ''
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

  .back-category-selector {
    width: 100%;
  }

  .back-category-tree {
    margin-top: 8px;
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
  }

  .selected-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .selected-label {
    font-size: 12px;
    color: #909399;
    flex-shrink: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #c0c4cc;
  }
</style>
