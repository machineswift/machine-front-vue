<template>
  <el-dialog
    v-model="state.visible"
    title="编辑组织"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="60%"
    top="5vh"
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
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:UPDATE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { IamOrganizationUpdateRequestVo } from '@/modules/iam/types'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    organizationId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  // 表单验证规则
  const rules = {
    name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }]
  }

  // 合并所有状态到state对象
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
      description: ''
    } as IamOrganizationUpdateRequestVo
  })

  const formRef = ref()

  // 对话框关闭时清理数据
  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = {
      id: '',
      name: '',
      sort: 0,
      description: ''
    }

    // 重置表单验证状态
    formRef.value?.resetFields()

    // 重置加载状态
    state.loading = false
    state.submitting = false
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      const updateData = {
        id: state.formData.id,
        name: state.formData.name,
        sort: state.formData.sort,
        description: state.formData.description
      }

      await IamOrganizationApi.update(updateData)
      ElMessage.success('更新组织成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('更新组织失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await IamOrganizationApi.detail({ id: props.organizationId })
      Object.assign(state.formData, {
        id: res.id,
        name: res.name,
        sort: res.sort,
        description: res.description || ''
      })
    } catch (error) {
      console.error('获取组织详情失败', error)
    } finally {
      state.loading = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.organizationId],
    async ([modelValue, organizationId]) => {
      if (modelValue && organizationId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
