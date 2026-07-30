<template>
  <el-dialog
    v-model="state.visible"
    title="编辑"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="20vh"
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
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:UPDATE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Link } from '@element-plus/icons-vue'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryUpdateRequestVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    categoryId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

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
    } as ScmBackCategoryUpdateRequestVo & { code: string }
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

      await ScmBackCategoryApi.update({
        id: state.formData.id,
        name: state.formData.name,
        sort: state.formData.sort
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
      const res = await ScmBackCategoryApi.detail({ id: props.categoryId })
      state.formData = {
        id: res.id,
        name: res.name,
        sort: res.sort,
        code: res.code || ''
      }
    } catch (error) {
      console.error('获取类目详情失败', error)
    } finally {
      state.loading = false
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
    formRef.value?.resetFields()
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
  .form-item-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
