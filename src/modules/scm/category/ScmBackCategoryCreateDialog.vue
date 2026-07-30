<template>
  <el-dialog
    v-model="state.visible"
    title="新增"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="20vh"
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="上级类目" prop="parentName">
        <el-input v-model="state.parentName" disabled placeholder="顶级类目">
          <template #prefix>
            <el-icon><FolderOpened /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入名称" maxlength="50" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="99999" controls-position="right" style="width: 200px" />
        <span class="form-item-tip">数值越大，排序越靠前</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:BACK_CATEGORY:CREATE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import type { ScmBackCategoryTreeSimpleResponseVo, ScmBackCategoryCreateRequestVo } from '@/modules/scm/category/type/ScmBackCategory.type'

  const props = defineProps<{
    modelValue: boolean
    parentNode: ScmBackCategoryTreeSimpleResponseVo | null
    rootNodeId?: string
    rootNodeName?: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const isRoot = computed(() => !props.parentNode)

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    parentName: '',
    formData: {
      parentId: '',
      name: '',
      sort: 50
    } as ScmBackCategoryCreateRequestVo
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: ['blur', 'change'] }
    ],
    sort: [{ required: true, message: '请输入排序值', trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmBackCategoryApi.create(state.formData)
      ElMessage.success(isRoot.value ? '新增根类目成功' : '新增子类目成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增类目失败', error)
    } finally {
      state.submitting = false
    }
  }

  const initFormData = () => {
    state.formData = {
      parentId: props.parentNode?.id || props.rootNodeId || '',
      name: '',
      sort: 50
    }
    state.parentName = props.parentNode?.name || props.rootNodeName || ''
  }

  const handleDialogClosed = () => {
    state.formData = {
      parentId: props.parentNode?.id || props.rootNodeId || '',
      name: '',
      sort: 50
    }
    state.parentName = props.parentNode?.name || props.rootNodeName || ''
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch(
    [() => props.modelValue, () => props.parentNode],
    async ([modelValue]) => {
      if (modelValue) {
        await initFormData()
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
