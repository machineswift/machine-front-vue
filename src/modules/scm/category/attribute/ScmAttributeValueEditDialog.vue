<template>
  <el-dialog
    v-model="state.visible"
    title="编辑属性值"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(400px, 38vw, 480px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="编码">
        <el-input v-model="state.code" disabled />
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
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.update]">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmAttributeValueApi } from '@/modules/scm/category/attribute/api/ScmAttributeValue.api'
  import type { ScmAttributeValueListResponseVo, ScmAttributeValueUpdateRequestVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

  const PERMISSION_CODE = {
    update: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:UPDATE'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeValue: ScmAttributeValueListResponseVo | null
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const emptyFormData = (): ScmAttributeValueUpdateRequestVo => ({
    id: '',
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
    /** 编码不可修改，仅展示 */
    code: '',
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
    name: [
      { required: true, message: '请输入属性值名称', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    value: [{ max: 256, message: '实际值不能超过 256 个字符', trigger: ['blur', 'change'] }],
    sort: [{ required: true, message: '请输入排序', trigger: ['blur', 'change'] }],
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  /** 属性值无 detail 接口，表单数据直接取列表行 */
  const fillFormData = (row: ScmAttributeValueListResponseVo) => {
    state.code = row.code || ''
    state.formData = {
      id: row.id,
      name: row.name || '',
      value: row.value || '',
      sort: row.sort ?? 0,
      features: row.features || ''
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await ScmAttributeValueApi.update(state.formData)
      ElMessage.success('编辑属性值成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('编辑属性值失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.code = ''
    state.formData = emptyFormData()
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch(
    [() => props.modelValue, () => props.attributeValue],
    ([modelValue, attributeValue]) => {
      if (modelValue && attributeValue) {
        fillFormData(attributeValue)
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss"></style>
