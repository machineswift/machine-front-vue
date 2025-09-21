<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="门店标签管理"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="门店名称">
        {{ state.shopName }}
      </el-form-item>

      <el-form-item label="标签选项" prop="labelOptionIdSet">
        <el-select v-model="state.form.labelOptionIdSet" multiple filterable placeholder="请选择标签" style="width: 100%">
          <el-option v-for="option in state.labelOptions" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE:DATA:SHOP:UPDATE_LABEL_OPTION']">保存</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import type { DataShopDetailResponseVo, DataShopUpdateShopLabelOptionRequestVo } from '@/modules/data/shop/type/DataShop.type'
  import type { LabelOptionDto } from '@/modules/data/label/type/DataLabelOption.type'

  const props = defineProps<{
    modelValue: boolean
    shopId: string
  }>()

  const formRef = ref()
  const emit = defineEmits(['update:modelValue', 'success'])

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    shopName: '',
    labelOptions: [] as LabelOptionDto[],
    form: {
      id: props.shopId,
      labelOptionIdSet: [] as string[]
    } as DataShopUpdateShopLabelOptionRequestVo
  })

  // 获取门店数据和标签选项
  const fetchData = async () => {
    try {
      state.loading = true

      // 获取门店详情
      const shopDetail: DataShopDetailResponseVo = await DataShopApi.detail({ id: props.shopId })
      state.shopName = shopDetail.name
      state.form.labelOptionIdSet = shopDetail.labelOptionList?.map(item => item.id) || []

      // 获取所有标签选项（这里需要根据实际项目获取标签选项数据）
      // state.labelOptions = await getAllLabelOptions()
    } catch (error) {
      console.error('获取门店标签数据失败', error)
    } finally {
      state.loading = false
    }
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataShopApi.updateLabelOption(state.form)
      ElMessage.success('保存成功')
      emit('success')
      state.dialogVisible = false
    } catch (error) {
      console.error('保存门店标签失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 对话框关闭时的处理
  const handleDialogClosed = () => {
    // 重置表单数据
    state.form = {
      id: props.shopId,
      labelOptionIdSet: [] as string[]
    }
    // 重置其他状态
    state.shopName = ''
    state.labelOptions = []
    // 通知父组件对话框已关闭
    emit('update:modelValue', false)
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.shopId],
    async ([modelValue, shopId]) => {
      if (modelValue && shopId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
