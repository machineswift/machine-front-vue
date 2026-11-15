<template>
  <el-dialog
    v-model="state.visible"
    title="修改编码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(400px, 38vw, 480px)"
    align-center
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="名称">
        <el-input v-model="state.name" disabled />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入属性值编码" maxlength="32" show-word-limit clearable />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.updateCode]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmAttributeValueApi } from '@/modules/scm/category/attribute/api/ScmAttributeValue.api'
  import type { ScmAttributeValueListResponseVo, ScmAttributeValueUpdateCodeRequestVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

  const PERMISSION_CODE = {
    updateCode: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:UPDATE_CODE'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeValue: ScmAttributeValueListResponseVo | null
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const emptyFormData = (): ScmAttributeValueUpdateCodeRequestVo => ({
    id: '',
    code: ''
  })

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    /** 名称仅展示，不可修改 */
    name: '',
    formData: emptyFormData()
  })

  const rules = {
    code: [
      { required: true, message: '请输入属性值编码', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ]
  }

  /** 属性值无 detail 接口，表单数据直接取列表行 */
  const fillFormData = (row: ScmAttributeValueListResponseVo) => {
    state.name = row.name || ''
    state.formData = {
      id: row.id,
      code: row.code || ''
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      await ScmAttributeValueApi.updateCode(state.formData)
      ElMessage.success('修改编码成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改属性值编码失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.name = ''
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
