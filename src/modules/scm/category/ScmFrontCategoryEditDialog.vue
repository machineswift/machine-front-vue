<template>
  <el-dialog
    v-model="state.visible"
    title="编辑"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="60%"
    top="8vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
          <el-form-item label="类目编码">
            <el-input v-model="state.formData.code" disabled>
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="类目名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入类目名称" maxlength="50" show-word-limit clearable />
          </el-form-item>

          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="state.formData.sort" :min="0" :max="99999" controls-position="right" style="width: 200px" />
            <span class="form-item-tip">数值越大，排序越靠前</span>
          </el-form-item>

          <el-form-item label="关联后台分类">
            <div class="back-category-selector">
              <el-input v-model="state.backCategoryQuery" placeholder="搜索后台分类" size="small" clearable @input="onBackCategoryQueryChanged" />
              <el-tree
                ref="backCategoryTreeRef"
                :data="state.backCategoryTreeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                show-checkbox
                :filter-node-method="backCategoryFilterMethod"
                @check="handleBackCategoryCheck"
                default-expand-all
                class="back-category-tree"
              />
              <div v-if="state.selectedBackCategoryNames.length" class="selected-tags">
                <span class="selected-label">已选：</span>
                <el-tag v-for="name in state.selectedBackCategoryNames" :key="name" closable size="small" @close="removeBackCategoryByName(name)">
                  {{ name }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:SCM:FRONT_CATEGORY:UPDATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElMessage, ElTree } from 'element-plus'
  import { Link } from '@element-plus/icons-vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import { TreeDataUtil } from '@/common/utils/TreeData.util'
  import type { ScmFrontCategoryUpdateRequestVo } from '@/modules/scm/category/type/ScmFrontCategory.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const backCategoryTreeRef = ref<InstanceType<typeof ElTree>>()

  /** 扁平化所有后台分类节点，用于快速 ID→名称 查找 */
  const allBackCategoryNodes = computed(() => TreeDataUtil.collectAllNodes(state.backCategoryTreeData))

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: {
      id: '',
      name: '',
      sort: 0,
      code: ''
    } as ScmFrontCategoryUpdateRequestVo & { code: string },
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    backCategoryQuery: '',
    selectedBackCategoryIds: [] as string[],
    selectedBackCategoryNames: [] as string[]
  })

  const rules = {
    name: [
      { required: true, message: '请输入类目名称', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: ['blur', 'change'] }
    ],
    sort: [{ required: true, message: '请输入排序值', trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await ScmFrontCategoryApi.update({
        id: state.formData.id,
        name: state.formData.name,
        sort: state.formData.sort,
        backCategoryIdSet: state.selectedBackCategoryIds
      })

      ElMessage.success({
        message: '编辑类目成功',
        duration: 2000
      })
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('编辑类目失败', error)
      if (error instanceof Error) {
        ElMessage.error({
          message: error.message,
          duration: 5000,
          showClose: true
        })
      }
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    if (!props.categoryId) return

    try {
      state.loading = true
      const res = await ScmFrontCategoryApi.detail({ id: props.categoryId })
      state.formData = {
        id: res.id,
        name: res.name,
        sort: res.sort,
        code: res.code || ''
      }
      state.selectedBackCategoryIds = res.backCategoryIdSet || []
    } catch (error) {
      console.error('获取类目详情失败', error)
    } finally {
      state.loading = false
    }
  }

  /** 同步树勾选状态到 selectedBackCategoryNames */
  const syncSelectedNames = () => {
    if (!backCategoryTreeRef.value) return
    const checkedKeys = backCategoryTreeRef.value.getCheckedKeys(false) as string[]
    // 用 getRootNodesFromSelected 去重：父级全选时只保留父级 ID
    const rootNodes = TreeDataUtil.getRootNodesFromSelected(state.backCategoryTreeData, checkedKeys)
    state.selectedBackCategoryIds = rootNodes.map(n => n.id)

    // 更新已选名称列表
    state.selectedBackCategoryNames = state.selectedBackCategoryIds
      .map(id => allBackCategoryNodes.value.find(n => n.id === id))
      .filter(Boolean)
      .map(n => n!.name)
  }

  // 加载后台分类树
  const loadBackCategoryTree = async () => {
    try {
      const res = await ScmBackCategoryApi.treeSimple()
      state.backCategoryTreeData = res.children || (res.id ? [res] : [])
      await nextTick()
      // 预勾选已有的后台分类
      if (backCategoryTreeRef.value && state.selectedBackCategoryIds.length) {
        backCategoryTreeRef.value.setCheckedKeys(state.selectedBackCategoryIds)
        syncSelectedNames()
      }
    } catch (error) {
      console.error('获取后台分类树失败', error)
    }
  }

  // 后台分类搜索
  const onBackCategoryQueryChanged = (val: string) => {
    if (backCategoryTreeRef.value) {
      backCategoryTreeRef.value.filter(val.trim())
    }
  }

  const backCategoryFilterMethod = (value: string, data: ScmBackCategoryTreeSimpleResponseVo) => {
    if (!value) return true
    return data.name?.toLowerCase().includes(value.toLowerCase()) || false
  }

  // 后台分类勾选
  const handleBackCategoryCheck = () => {
    syncSelectedNames()
  }

  // 通过标签移除后台分类
  const removeBackCategoryByName = (name: string) => {
    const node = allBackCategoryNodes.value.find(n => n.name === name)
    if (node && backCategoryTreeRef.value) {
      backCategoryTreeRef.value.setChecked(node.id, false, false)
      handleBackCategoryCheck()
    }
  }

  const handleDialogClosed = () => {
    state.formData = {
      id: '',
      name: '',
      sort: 0,
      code: ''
    }
    state.loading = false
    state.submitting = false
    state.selectedBackCategoryIds = []
    state.selectedBackCategoryNames = []
    state.backCategoryQuery = ''
    state.backCategoryTreeData = []
    formRef.value?.resetFields()
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await fetchData()
        await loadBackCategoryTree()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .form-item-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
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
</style>
