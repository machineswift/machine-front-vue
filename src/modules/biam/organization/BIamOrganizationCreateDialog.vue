<template>
  <el-dialog
    v-model="state.visible"
    title="新增组织"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="60%"
    top="5vh"
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="组织名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入组织名称" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" />
      </el-form-item>

      <el-form-item label="备注" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:CREATE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import type { BIamOrganizationCreateRequestVo, BIamOrganizationExpandTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'

  const props = defineProps<{
    modelValue: boolean
    parentNode: BIamOrganizationExpandTreeResponseVo | null
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  // 表单验证规则
  const rules = {
    name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }]
  }

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    formData: {
      parentId: '',
      name: '',
      sort: 0,
      description: ''
    } as BIamOrganizationCreateRequestVo
  })

  const formRef = ref()

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    state.formData = {
      parentId: props.parentNode?.id || '',
      name: '',
      sort: 0,
      description: ''
    }

    formRef.value?.resetFields()

    state.submitting = false
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await BIamOrganizationApi.create(state.formData)
      ElMessage.success('新增组织成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增组织失败', error)
    } finally {
      state.submitting = false
    }
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    state.formData = {
      parentId: props.parentNode?.id || '',
      name: '',
      sort: 0,
      description: ''
    }
  }

  /**
   * 监听props变化
   */
  watch(
    [() => props.modelValue, () => props.parentNode],
    async ([modelValue, parentNode]) => {
      if (modelValue && parentNode) {
        await initFormData()
      }
    },
    { immediate: false }
  )
</script>
