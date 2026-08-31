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
        <el-select v-model="state.form.labelOptionIdSet" multiple filterable placeholder="请选择标签" style="width: 100%" :disabled="state.loading">
          <template v-if="state.labelOptions.length > 0">
            <el-option v-for="option in state.labelOptions" :key="option.id" :label="option.name" :value="option.id" />
          </template>
          <el-option v-else disabled value="">暂无可用标签选项</el-option>
        </el-select>
        <div v-if="state.labelOptions.length === 0 && !state.loading" style="color: #909399; font-size: 12px; margin-top: 4px">
          提示：当前门店暂无标签选项，请先为门店添加标签
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:MANAGE:DATA:SHOP:UPDATE_LABEL_OPTION']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import type { DataShopDetailResponseVo, DataShopUpdateShopLabelOptionRequestVo } from '@/modules/data/shop/type/DataShop.type'
  import type { LabelOptionDto } from '@/modules/data/shop/type/DataShop.type'

  const props = defineProps<{
    modelValue: boolean
    shopId: string
  }>()

  const formRef = ref()
  const emit = defineEmits(['update:modelValue', 'success'])

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
      id: '',
      labelOptionIdSet: [] as string[]
    } as DataShopUpdateShopLabelOptionRequestVo
  })

  const fetchData = async () => {
    if (!props.shopId) {
      console.warn('shopId 为空，无法获取门店标签数据')
      return
    }

    try {
      state.loading = true
      state.form.id = props.shopId

      const shopDetail: DataShopDetailResponseVo = await DataShopApi.detail({ id: props.shopId })
      state.shopName = shopDetail.name || ''
      state.form.labelOptionIdSet = shopDetail.labelOptionList?.map(item => item.id) || []

      // 从门店详情中获取所有已存在的标签选项作为可选列表
      // 注意：这里暂时使用门店已有的标签选项，实际应该从 API 获取所有可用的标签选项
      if (shopDetail.labelOptionList && shopDetail.labelOptionList.length > 0) {
        state.labelOptions = shopDetail.labelOptionList.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code,
          labelId: item.labelId
        }))
      }
    } catch (error) {
      console.error('获取门店标签数据失败', error)
      ElMessage.error('获取门店标签数据失败')
    } finally {
      state.loading = false
    }
  }

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
    state.form = {
      id: '',
      labelOptionIdSet: [] as string[]
    }
    state.shopName = ''
    state.labelOptions = []
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.shopId],
    async ([modelValue, shopId]) => {
      if (modelValue && shopId) {
        await fetchData()
      } else if (!modelValue) {
        // 对话框关闭时重置状态
        handleDialogClosed()
      }
    },
    { immediate: false }
  )
</script>
