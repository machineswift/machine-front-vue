<template>
  <el-dialog
    v-model="state.visible"
    title="添加属性值"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(400px, 38vw, 480px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入属性值编码" maxlength="32" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入属性值名称" maxlength="32" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="实际值" prop="value">
        <el-input v-model="state.formData.value" placeholder="可选，属性值实际值" maxlength="256" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="999999" controls-position="right" style="width: 100%" />
      </el-form-item>

      <el-form-item label="扩展特性" prop="features">
        <el-input
          v-model="state.formData.features"
          type="textarea"
          :rows="3"
          placeholder='可选，扩展特性JSON，例如 {"key":"value"}'
          maxlength="1024"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.create]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmAttributeValueApi } from '@/modules/scm/category/attribute/api/ScmAttributeValue.api'
  import type { ScmAttributeValueCreateRequestVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:CREATE'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const emptyFormData = (): Omit<ScmAttributeValueCreateRequestVo, 'attributeId'> => ({
    code: '',
    name: '',
    value: '',
    sort: 0,
    features: ''
  })

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    formData: emptyFormData()
  })

  /** 扩展特性是自由 JSON，提交前校验格式，避免脏数据落到后端 */
  const validateFeatures = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback()
      return
    }
    try {
      JSON.parse(value)
      callback()
    } catch {
      callback(new Error('扩展特性必须是合法的JSON'))
    }
  }

  const rules = {
    code: [
      { required: true, message: '请输入属性值编码', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    name: [
      { required: true, message: '请输入属性值名称', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    value: [{ max: 256, message: '实际值不能超过 256 个字符', trigger: ['blur', 'change'] }],
    sort: [{ required: true, message: '请输入排序', trigger: ['blur', 'change'] }],
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await ScmAttributeValueApi.create({ ...state.formData, attributeId: props.attributeId })
      ElMessage.success('新增属性值成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增属性值失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = emptyFormData()
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch(
    () => props.modelValue,
    val => {
      if (!val) return
      state.formData = emptyFormData()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss"></style>
