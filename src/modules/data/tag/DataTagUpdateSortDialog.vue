<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改排序"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="500px"
    top="20vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="标签名称:">
        <el-input v-model="state.tagName" disabled />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" placeholder="请输入排序" style="width: 100%" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG:UPDATE_SORT']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import type { DataTagUpdateSortRequestVo } from '@/modules/data/tag/type/DataTag.type'
  import type { DataTagDetailResponseVo } from '@/modules/data/tag/type/DataTag.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    tagId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    tagName: '',
    form: {
      id: '',
      sort: 0
    } as DataTagUpdateSortRequestVo
  })

  // 表单验证规则
  const validateSort = (_rule: FormItemRule, value: number) => {
    if (value === null || value === undefined) return Promise.reject('请输入排序')
    if (value < 0 || value > 999999) return Promise.reject('排序值在0到999999之间')
    return Promise.resolve()
  }

  const rules = {
    sort: [{ required: true, validator: validateSort, trigger: 'blur' }]
  }

  // 加载标签数据
  const loadTagData = async () => {
    if (!props.tagId) return
    try {
      state.loading = true
      const data: DataTagDetailResponseVo = await DataTagApi.detail({ id: props.tagId })
      state.tagName = data.name || ''
      state.form.id = data.id
      state.form.sort = data.sort || 0
    } catch (error) {
      console.error('加载标签数据失败', error)
      ElMessage.error('加载标签数据失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.form = {
      id: '',
      sort: 0
    }
    state.tagName = ''

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
    state.loading = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagApi.updateSort(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('修改排序失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和标签ID变化
  watch(
    [() => props.modelValue, () => props.tagId],
    async ([modelValue, tagId]) => {
      if (modelValue && tagId) {
        await loadTagData()
      }
    },
    { immediate: false }
  )
</script>
