<template>
  <el-dialog
    v-model="state.visible"
    title="编辑"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="640px"
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
            <TreeCheckPanel
              ref="backCategoryPanelRef"
              v-model="state.selectedBackCategoryIds"
              :roots="state.backCategoryTreeData"
              :height="260"
              placeholder="输入后台分类名称或编码搜索"
              :icon="FolderOpened"
            />
          </el-form-item>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Link, FolderOpened } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmFrontCategoryUpdateRequestVo } from '@/modules/scm/category/type/ScmFrontCategory.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const backCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

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
    selectedBackCategoryIds: [] as string[]
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

  const loadBackCategoryTree = async () => {
    try {
      const res = await ScmBackCategoryApi.treeSimple()
      state.backCategoryTreeData = res.children || (res.id ? [res] : [])
      backCategoryPanelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取后台分类树失败', error)
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
    state.backCategoryTreeData = []
    backCategoryPanelRef.value?.reset()
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
</style>
