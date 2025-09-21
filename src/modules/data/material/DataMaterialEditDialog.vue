<template>
  <el-dialog v-model="visible" title="编辑素材" width="600px" :close-on-click-modal="false" @closed="handleClosed">
    <el-form ref="formRef" :model="form" label-width="100px" :rules="rules">
      <el-form-item label="素材标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入素材标题" />
      </el-form-item>

      <el-form-item label="素材类型">
        <el-tag>{{ getMaterialTypeLabel(form.type) }}</el-tag>
      </el-form-item>

      <el-form-item label="存储类型">
        <el-tag>{{ getStorageTypeLabel(form.storageType) }}</el-tag>
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>

      <el-form-item label="过期时间">
        <el-date-picker v-model="form.expireTime" type="datetime" placeholder="选择过期时间" value-format="x" :disabled-date="disabledDate" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入素材描述" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { DataMaterialDetailResponseVo, DataMaterialUpdateRequestVo } from '@/modules/data/material/type/DataMaterial.type'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    materialId: {
      type: String,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const enumStore = useDictionaryEnumStore()
  const formRef = ref()
  const visible = ref(false)
  const loading = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({} as DataMaterialDetailResponseVo)

  const form = ref<DataMaterialUpdateRequestVo>({
    id: '',
    title: '',
    description: '',
    expireTime: undefined,
    status: ''
  })

  const rules = {
    title: [{ required: true, message: '请输入素材标题', trigger: 'blur' }]
  }

  const statusOptions = ref<Array<{ code: string; message: string }>>([])

  // 禁用今天之前的日期
  const disabledDate = (time: Date) => {
    return time.getTime() < Date.now() - 8.64e7
  }

  // 获取素材详情
  const fetchDetail = async () => {
    if (!props.materialId) return
    try {
      const res = await DataMaterialApi.detail({ id: props.materialId })
      detailData.value = res
      form.value = {
        id: res.id!,
        title: res.title || '',
        description: res.description || '',
        expireTime: res.expireTime,
        status: res.status || ''
      }
    } catch (error) {
      console.error('获取素材详情失败', error)
    }
  }

  const handleSubmit = async () => {
    if (!(await formRef.value.validate())) return

    try {
      loading.value = true
      await DataMaterialApi.update(form.value)
      ElMessage.success('保存成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.error('保存素材失败', error)
      ElMessage.error('保存失败')
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value.resetFields()
  }

  // 获取素材类型标签
  const getMaterialTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialTypeEnum', type)
    return enumItem?.message || type
  }

  // 获取存储类型标签
  const getStorageTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialStorageTypeEnum', type)
    return enumItem?.message || type
  }

  watch(
    () => props.modelValue,
    val => {
      visible.value = val
      if (val && props.materialId) {
        fetchDetail()
      }
    }
  )

  watch(visible, val => {
    emit('update:modelValue', val)
  })

  // 初始化枚举数据
  const initEnums = async () => {
    statusOptions.value = await enumStore.getEnumDataAsync('DataMaterialStatusEnum')
  }

  initEnums()
</script>
