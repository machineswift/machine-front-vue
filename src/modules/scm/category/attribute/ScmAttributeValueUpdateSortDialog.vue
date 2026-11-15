<template>
  <el-dialog
    v-model="state.visible"
    title="修改排序"
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
        <el-input v-model="state.formData.name" disabled />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="999999" controls-position="right" style="width: 100%" />
      </el-form-item>
    </el-form>
    <div class="form-item-tip">排序值越大越靠前</div>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.update]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmAttributeValueApi } from '@/modules/scm/category/attribute/api/ScmAttributeValue.api'
  import type { ScmAttributeValueListResponseVo, ScmAttributeValueUpdateRequestVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'

  /** 属性值无独立的排序接口，排序通过 update 提交，权限沿用 UPDATE */
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
    formData: emptyFormData()
  })

  const rules = {
    sort: [{ required: true, message: '请输入排序', trigger: ['blur', 'change'] }]
  }

  /** 属性值无 detail 接口，表单数据直接取列表行；排序外的字段原样回传，避免被覆盖 */
  const fillFormData = (row: ScmAttributeValueListResponseVo) => {
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
      ElMessage.success('修改排序成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('修改属性值排序失败', error)
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
    [() => props.modelValue, () => props.attributeValue],
    ([modelValue, attributeValue]) => {
      if (modelValue && attributeValue) {
        fillFormData(attributeValue)
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .form-item-tip {
    font-size: 12px;
    color: #909399;
  }
</style>
