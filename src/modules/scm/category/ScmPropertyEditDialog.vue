<template>
  <el-dialog
    v-model="state.visible"
    title="编辑属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="640px"
    top="10vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
          <el-form-item label="编码">
            <el-input v-model="state.formData.code" disabled>
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入属性名称" maxlength="50" show-word-limit clearable />
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="属性类型">
                <el-input v-model="state.formData.propertyTypeLabel" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="输入方式" prop="inputType">
                <el-select v-model="state.formData.inputType" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in inputTypeOptions" :key="item.code" :label="item.message" :value="item.code" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="是否必填" prop="isRequired">
                <el-switch v-model="state.formData.isRequired" :active-value="true" :inactive-value="false" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否多选" prop="isMultiple">
                <el-switch v-model="state.formData.isMultiple" :active-value="true" :inactive-value="false" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否可搜索" prop="isSearch">
                <el-switch v-model="state.formData.isSearch" :active-value="true" :inactive-value="false" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="扩展特性" prop="features">
            <el-input v-model="state.formData.features" type="textarea" :rows="3" placeholder="请输入扩展特性JSON（可选）" clearable />
          </el-form-item>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:SCM:PROPERTY:UPDATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Link } from '@element-plus/icons-vue'
  import { ScmPropertyApi } from '@/modules/scm/category/api/ScmProperty.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_SCM_PROPERTY_TYPE, DICT_SCM_ITEM_INPUT_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import type { ScmPropertyUpdateRequestVo } from '@/modules/scm/category/type/ScmProperty.type'
  import type { IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'

  const props = defineProps<{
    modelValue: boolean
    propertyId: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  const { options: propertyTypeOptions, load: loadPropertyTypeOptions } = useEnumOptions(DICT_SCM_PROPERTY_TYPE)
  const { options: inputTypeOptions, load: loadInputTypeOptions } = useEnumOptions(DICT_SCM_ITEM_INPUT_TYPE)

  const getEnumLabel = (options: IamDictionaryEnumInfoResponse[], code?: string): string => {
    if (!code) return '-'
    const item = options.find(o => o.code === code)
    if (!item) {
      throw new Error(`[dictionary] 枚举选项中不存在 code=${code}`)
    }
    return item.message
  }

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    formData: {
      id: '',
      code: '',
      name: '',
      propertyType: '',
      propertyTypeLabel: '',
      inputType: '' as ScmPropertyUpdateRequestVo['inputType'] | '',
      isRequired: false,
      isMultiple: false,
      isSearch: false,
      features: ''
    }
  })

  const rules = {
    name: [
      { required: true, message: '请输入属性名称', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: ['blur', 'change'] }
    ],
    inputType: [{ required: true, message: '请选择输入方式', trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      const params: ScmPropertyUpdateRequestVo = {
        id: state.formData.id,
        name: state.formData.name,
        inputType: state.formData.inputType as ScmPropertyUpdateRequestVo['inputType'],
        isRequired: state.formData.isRequired,
        isMultiple: state.formData.isMultiple,
        isSearch: state.formData.isSearch
      }
      if (state.formData.features) {
        params.features = state.formData.features
      }

      await ScmPropertyApi.update(params)
      ElMessage.success('编辑属性成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('编辑属性失败', error)
      if (error instanceof Error) {
        ElMessage.error({
          message: error.message,
          duration: 5000,
          showClose: true
        })
      }
    } finally {
      state.submitting = false
    }
  }

  // 加载字典枚举
  const loadEnumData = async () => {
    try {
      await Promise.all([loadPropertyTypeOptions(), loadInputTypeOptions()])
    } catch (error) {
      console.error('加载字典枚举失败', error)
    }
  }

  const fetchData = async () => {
    if (!props.propertyId) return

    try {
      state.loading = true
      const res = await ScmPropertyApi.detail({ id: props.propertyId })
      state.formData = {
        id: res.id,
        code: res.code,
        name: res.name,
        propertyType: res.propertyType,
        propertyTypeLabel: getEnumLabel(propertyTypeOptions.value, res.propertyType),
        inputType: res.inputType,
        isRequired: res.isRequired,
        isMultiple: res.isMultiple,
        isSearch: res.isSearch,
        features: res.features || ''
      }
    } catch (error) {
      console.error('获取属性详情失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.formData = {
      id: '',
      code: '',
      name: '',
      propertyType: '',
      propertyTypeLabel: '',
      inputType: '',
      isRequired: false,
      isMultiple: false,
      isSearch: false,
      features: ''
    }
    state.loading = false
    state.submitting = false
    formRef.value?.resetFields()
  }

  onMounted(() => {
    loadEnumData()
  })

  watch(
    [() => props.modelValue, () => props.propertyId],
    async ([modelValue, propertyId]) => {
      if (modelValue && propertyId) {
        await loadEnumData()
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss"></style>
