<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="编辑用户"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="40%"
    top="25vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="用户ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="state.formData.username" disabled />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="姓名" prop="name" class="form-row-item">
          <el-input v-model="state.formData.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="gender" class="form-row-item">
          <el-select v-model="state.formData.gender" placeholder="请选择性别">
            <el-option v-for="option in userGenders" :key="option.code" :label="option.message" :value="option.code" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:UPDATE']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_GENDER } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamUserApi } from '@/modules/biam/user/api/BIamUser.api'
  import type { BIamUserUpdateRequestVo } from '@/modules/biam/user/type/BIamUser.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    userId: { type: String, required: true }
  })

  const formRef = ref()
  const { options: userGenders, load: loadUserGenders } = useEnumOptions(DICT_GENDER)
  const emit = defineEmits(['update:modelValue', 'close', 'success'])

  const DEFAULT_FORM_DATA: BIamUserUpdateRequestVo = {
    id: '',
    username: '',
    name: '',
    gender: 'UNDEFINED',
    description: ''
  }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: { ...DEFAULT_FORM_DATA }
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 32, message: '长度在2到32个字符', trigger: 'blur' }
    ],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const data = await BIamUserApi.detail({ id: props.userId })
      state.formData = {
        id: data.id,
        username: data.username,
        name: data.name,
        gender: data.gender || 'UNDEFINED',
        description: data.description || ''
      }
    } catch (error) {
      console.error('获取用户数据失败', error)
    } finally {
      state.loading = false
    }
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await BIamUserApi.update(state.formData)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改用户失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置所有加载状态
    state.loading = false
    state.submitting = false
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.userId],
    async ([modelValue, userId]) => {
      if (modelValue && userId) {
        await fetchData()
      }
    },
    { immediate: false }
  )

  onMounted(async () => {
    await loadUserGenders()
  })
</script>

<style scoped>
  .form-row {
    display: flex;
    gap: 16px;
  }

  .form-row-item {
    flex: 1;
  }
</style>
