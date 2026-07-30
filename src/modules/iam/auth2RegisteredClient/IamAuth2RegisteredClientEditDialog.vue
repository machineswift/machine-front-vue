<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑客户端"
    v-loading="state.loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="500px"
    top="20vh"
  >
    <el-form :model="state.formData" label-width="120px" :rules="state.rules" ref="formRef">
      <el-form-item label="客户端ID">
        <el-input :model-value="state.formData.clientId" disabled />
      </el-form-item>

      <el-form-item label="客户端名称" prop="clientName">
        <el-input v-model="state.formData.clientName" placeholder="请输入客户端名称" maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="客户端密钥" prop="clientSecret">
        <el-input v-model="state.formData.clientSecret" type="password" placeholder="留空则不修改" show-password maxlength="64" show-word-limit />
      </el-form-item>

      <el-form-item label="作用域" prop="scopes">
        <el-select v-model="state.formData.scopes" multiple filterable allow-create default-first-option placeholder="请输入或选择作用域" style="width: 100%">
          <el-option v-for="option in state.scopeOptions" :key="option" :label="option" :value="option" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        v-hasPermission="['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:UPDATE']"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { ref, watch, reactive, computed } from 'vue'
  import { IamAuth2RegisteredClientApi } from '@/modules/iam/auth2RegisteredClient/api/IamAuth2RegisteredClient.api'
  import type { IamAuth2RegisteredClientDetailResponseVo } from '@/modules/iam/auth2RegisteredClient/type/IamAuth2RegisteredClient.type'

  const DEFAULT_FORM_DATA = {
    id: '',
    clientId: '',
    clientName: '',
    clientSecret: '',
    scopes: [] as string[]
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    clientId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const formRef = ref()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),

    loading: false,
    submitting: false,

    scopeOptions: ['openid', 'profile', 'email', 'phone', 'address'],

    formData: { ...DEFAULT_FORM_DATA, scopes: [...DEFAULT_FORM_DATA.scopes] },

    rules: {
      clientName: [
        { required: true, message: '请输入客户端名称', trigger: 'blur' },
        { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
      ],
      scopes: [
        { required: true, message: '请输入作用域', trigger: 'change' },
        { type: 'array', min: 1, message: '至少选择一个作用域', trigger: 'change' }
      ]
    }
  })

  const handleDialogClosed = () => {
    state.formData = { ...DEFAULT_FORM_DATA, scopes: [...DEFAULT_FORM_DATA.scopes] }
    formRef.value?.resetFields()
  }

  const fetchDetail = async () => {
    try {
      state.loading = true
      const res: IamAuth2RegisteredClientDetailResponseVo = await IamAuth2RegisteredClientApi.detail({ id: props.clientId })
      state.formData = {
        id: res.id,
        clientId: res.clientId,
        clientName: res.clientName,
        clientSecret: '',
        scopes: res.scopes || []
      }
    } catch (error) {
      console.error('获取客户端详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      await IamAuth2RegisteredClientApi.update({
        id: state.formData.id,
        clientName: state.formData.clientName,
        clientSecret: state.formData.clientSecret || undefined,
        scopes: state.formData.scopes
      })

      ElMessage.success('修改成功')
      emit('success')
      state.dialogVisible = false
    } catch (error) {
      console.error('修改客户端失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.clientId],
    ([newVisible, newClientId]) => {
      if (newVisible && newClientId) {
        fetchDetail()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss"></style>
