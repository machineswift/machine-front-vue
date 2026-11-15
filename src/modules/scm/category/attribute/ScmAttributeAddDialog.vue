<template>
  <el-dialog
    v-model="state.visible"
    title="新增属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入属性名称" maxlength="32" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="属性类型" prop="attributeType">
        <el-select v-model="state.formData.attributeType" placeholder="请选择属性类型" clearable style="width: 100%">
          <el-option v-for="option in attributeTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="输入方式" prop="inputType">
        <el-select v-model="state.formData.inputType" placeholder="请选择输入方式" clearable style="width: 100%">
          <el-option v-for="option in inputTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否必填" prop="requiredFlag">
        <el-switch v-model="state.formData.requiredFlag" active-text="必填" inactive-text="非必填" inline-prompt />
      </el-form-item>

      <el-form-item label="是否多选" prop="multipleFlag">
        <el-switch
          v-model="state.formData.multipleFlag"
          :disabled="state.formData.inputType === 'INPUT'"
          active-text="多选"
          inactive-text="单选"
          inline-prompt
        />
      </el-form-item>

      <el-form-item label="是否可搜索" prop="searchableFlag">
        <el-switch v-model="state.formData.searchableFlag" active-text="是" inactive-text="否" inline-prompt />
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
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_SCM_ATTRIBUTE_TYPE, DICT_SCM_ATTRIBUTE_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import type { ScmAttributeCreateRequestVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE:CREATE'
  }

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const { options: attributeTypeOptions, load: loadAttributeTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_TYPE)
  const { options: inputTypeOptions, load: loadInputTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_INPUT_TYPE)

  const emptyFormData = (): ScmAttributeCreateRequestVo => ({
    name: '',
    attributeType: '',
    requiredFlag: false,
    inputType: '',
    multipleFlag: false,
    searchableFlag: false,
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

  /** 输入方式为「输入」时不支持多选 */
  watch(
    () => state.formData.inputType,
    inputType => {
      if (inputType === 'INPUT') {
        state.formData.multipleFlag = false
      }
    }
  )

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
    name: [
      { required: true, message: '请输入属性名称', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    attributeType: [{ required: true, message: '请选择属性类型', trigger: ['blur', 'change'] }],
    inputType: [{ required: true, message: '请选择输入方式', trigger: ['blur', 'change'] }],
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmAttributeApi.create(state.formData)
      ElMessage.success('新增属性成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增属性失败', error)
    } finally {
      state.submitting = false
    }
  }

  const resetForm = () => {
    state.formData = emptyFormData()
    state.submitting = false
    formRef.value?.resetFields()
  }

  const handleDialogClosed = () => resetForm()

  watch(
    () => props.modelValue,
    async modelValue => {
      if (!modelValue) return
      resetForm()
      await Promise.all([loadAttributeTypeOptions(), loadInputTypeOptions()])
    }
  )
</script>
