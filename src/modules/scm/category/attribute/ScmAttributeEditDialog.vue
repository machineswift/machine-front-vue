<template>
  <el-dialog
    v-model="state.visible"
    title="编辑属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
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
          <el-form-item label="属性编码">
            <el-input v-model="state.code" disabled>
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="属性类型">
            <el-input :model-value="enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_TYPE, state.attributeType)" disabled />
          </el-form-item>

          <el-form-item label="输入方式">
            <el-input :model-value="enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_INPUT_TYPE, state.inputType)" disabled />
          </el-form-item>

          <el-form-item label="名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入属性名称" maxlength="32" show-word-limit clearable />
          </el-form-item>

          <el-form-item label="是否必填" prop="requiredFlag">
            <el-switch v-model="state.formData.requiredFlag" active-text="必填" inactive-text="非必填" inline-prompt />
          </el-form-item>

          <el-form-item label="是否多选" prop="multipleFlag">
            <el-switch v-model="state.formData.multipleFlag" :disabled="state.inputType === 'INPUT'" active-text="多选" inactive-text="单选" inline-prompt />
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
      </template>
    </el-skeleton>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="[PERMISSION_CODE.update]">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Link } from '@element-plus/icons-vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_SCM_ATTRIBUTE_TYPE, DICT_SCM_ATTRIBUTE_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeApi } from '@/modules/scm/category/attribute/api/ScmAttribute.api'
  import type { ScmAttributeUpdateRequestVo } from '@/modules/scm/category/attribute/type/ScmAttribute.type'

  const PERMISSION_CODE = {
    update: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE:UPDATE'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()
  const enumStore = useDictionaryEnumStore()

  const emptyFormData = (): ScmAttributeUpdateRequestVo => ({
    id: '',
    name: '',
    requiredFlag: false,
    multipleFlag: false,
    searchableFlag: false,
    features: ''
  })

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    code: '',
    attributeType: '',
    inputType: '',
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
      { required: true, message: '请输入属性名称', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    features: [{ validator: validateFeatures, trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmAttributeApi.update(state.formData)
      ElMessage.success('编辑属性成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('编辑属性失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    if (!props.attributeId) return

    try {
      state.loading = true
      const res = await ScmAttributeApi.detail({ id: props.attributeId })
      state.code = res.code
      state.attributeType = res.attributeType
      state.inputType = res.inputType
      state.formData = {
        id: res.id,
        name: res.name,
        requiredFlag: res.requiredFlag,
        multipleFlag: res.multipleFlag,
        searchableFlag: res.searchableFlag,
        features: res.features || ''
      }
    } catch (error) {
      console.error('获取属性详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.code = ''
    state.attributeType = ''
    state.inputType = ''
    state.formData = emptyFormData()
    state.loading = false
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch(
    [() => props.modelValue, () => props.attributeId],
    async ([modelValue, attributeId]) => {
      if (modelValue && attributeId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
