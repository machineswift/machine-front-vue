<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加客户端"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="500px"
    top="20vh"
  >
    <el-form :model="state.formData" label-width="120px" :rules="state.rules" ref="formRef">
      <el-form-item label="客户端名称" prop="clientName">
        <el-input v-model="state.formData.clientName" placeholder="请输入客户端名称" maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="客户端密钥" prop="clientSecret">
        <el-input v-model="state.formData.clientSecret" type="password" placeholder="请输入客户端密钥" show-password maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="作用域" prop="scopes">
        <el-select v-model="state.formData.scopes" multiple filterable allow-create default-first-option placeholder="请输入或选择作用域" style="width: 100%">
          <el-option v-for="option in state.scopeOptions" :key="option" :label="option" :value="option" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.submitting"
        v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:CREATE']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { IamAuth2RegisteredClientApi } from '@/modules/iam/auth2RegisteredClient/api/IamAuth2RegisteredClient.api'

  const DEFAULT_FORM_DATA = {
    clientName: '',
    clientSecret: '',
    scopes: [] as string[]
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const formRef = ref()

  const state = reactive({
    submitting: false,

    scopeOptions: ['openid', 'profile', 'email', 'phone', 'address'],

    formData: { ...DEFAULT_FORM_DATA, scopes: [...DEFAULT_FORM_DATA.scopes] },

    rules: {
      clientName: [
        { required: true, message: '请输入客户端名称', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ],
      clientSecret: [{ required: true, message: '请输入客户端密钥', trigger: 'blur' }],
      scopes: [
        { required: true, message: '请输入作用域', trigger: 'change' },
        { type: 'array', min: 1, message: '至少选择一个作用域', trigger: 'change' }
      ]
    }
  })

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      await IamAuth2RegisteredClientApi.create({
        clientName: state.formData.clientName,
        clientSecret: state.formData.clientSecret,
        scopes: state.formData.scopes
      })

      ElMessage.success('添加成功')
      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('添加客户端失败', error)
    } finally {
      state.submitting = false
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    state.formData = { ...DEFAULT_FORM_DATA, scopes: [...DEFAULT_FORM_DATA.scopes] }
  }

  const handleDialogClosed = () => {
    resetForm()
    state.submitting = false
  }
</script>

<style scoped lang="scss"></style>
