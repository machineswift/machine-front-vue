<template>
  <el-dialog
    v-model="state.visible"
    title="修改编码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="clamp(400px, 38vw, 480px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right" v-loading="state.loading">
      <el-form-item label="名称">
        <el-input v-model="state.formData.name" disabled />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入属性分组编码" maxlength="32" show-word-limit clearable />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE_CODE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'

  const props = defineProps<{
    modelValue: boolean
    groupId: string
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
      code: ''
    }
  })

  const rules = {
    code: [
      { required: true, message: '请输入属性分组编码', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ]
  }

  const fetchData = async () => {
    if (!props.groupId) return

    try {
      state.loading = true
      const res = await ScmAttributeGroupApi.detail({ id: props.groupId })
      state.formData.id = res.id
      state.formData.name = res.name
      state.formData.code = res.code || ''
    } catch (error) {
      console.error('获取属性分组详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await ScmAttributeGroupApi.updateCode({ id: state.formData.id, code: state.formData.code })
      ElMessage.success('修改编码成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改属性分组编码失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = {
      id: '',
      name: '',
      code: ''
    }
    state.loading = false
    state.submitting = false
    formRef.value?.resetFields()
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

<style scoped lang="scss"></style>
