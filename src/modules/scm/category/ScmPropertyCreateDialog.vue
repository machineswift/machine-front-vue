<template>
  <el-dialog
    v-model="state.visible"
    title="新增属性"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="640px"
    top="10vh"
  >
    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入属性编码" maxlength="50" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入属性名称" maxlength="50" show-word-limit clearable />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="属性类型" prop="propertyType">
            <el-select v-model="state.formData.propertyType" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in state.propertyTypeOptions" :key="item.code" :label="item.message" :value="item.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="输入方式" prop="inputType">
            <el-select v-model="state.formData.inputType" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in state.inputTypeOptions" :key="item.code" :label="item.message" :value="item.code" />
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

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:SCM:PROPERTY:CREATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ScmPropertyApi } from '@/modules/scm/category/api/ScmProperty.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { ScmPropertyCreateRequestVo } from '@/modules/scm/category/type/ScmProperty.type'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()
  const dictEnumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    propertyTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    inputTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    formData: {
      code: '',
      name: '',
      propertyType: '' as ScmPropertyCreateRequestVo['propertyType'] | '',
      inputType: '' as ScmPropertyCreateRequestVo['inputType'] | '',
      isRequired: false,
      isMultiple: false,
      isSearch: false,
      features: ''
    }
  })

  const rules = {
    code: [
      { required: true, message: '请输入属性编码', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: ['blur', 'change'] }
    ],
    name: [
      { required: true, message: '请输入属性名称', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: ['blur', 'change'] }
    ],
    propertyType: [{ required: true, message: '请选择属性类型', trigger: ['blur', 'change'] }],
    inputType: [{ required: true, message: '请选择输入方式', trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      const params: ScmPropertyCreateRequestVo = {
        code: state.formData.code,
        name: state.formData.name,
        propertyType: state.formData.propertyType as ScmPropertyCreateRequestVo['propertyType'],
        inputType: state.formData.inputType as ScmPropertyCreateRequestVo['inputType'],
        isRequired: state.formData.isRequired,
        isMultiple: state.formData.isMultiple,
        isSearch: state.formData.isSearch
      }
      if (state.formData.features) {
        params.features = state.formData.features
      }

      await ScmPropertyApi.create(params)
      ElMessage.success('新增属性成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增属性失败', error)
    } finally {
      state.submitting = false
    }
  }

  const initFormData = () => {
    state.formData = {
      code: '',
      name: '',
      propertyType: '',
      inputType: '',
      isRequired: false,
      isMultiple: false,
      isSearch: false,
      features: ''
    }
  }

  const handleDialogClosed = () => {
    state.submitting = false
    formRef.value?.resetFields()
  }

  // 加载字典枚举
  const loadEnumData = async () => {
    try {
      const [propertyTypeData, inputTypeData] = await Promise.all([
        dictEnumStore.getEnumDataAsync('ScmProperityTypeEnum'),
        dictEnumStore.getEnumDataAsync('ScmItemInputTypeEnum')
      ])
      state.propertyTypeOptions = propertyTypeData
      state.inputTypeOptions = inputTypeData
    } catch (error) {
      console.error('加载字典枚举失败', error)
    }
  }

  onMounted(() => {
    loadEnumData()
  })

  watch(
    () => props.modelValue,
    async val => {
      if (val) {
        initFormData()
        loadEnumData()
        await formRef.value?.clearValidate()
      }
    }
  )
</script>

<style scoped lang="scss"></style>
