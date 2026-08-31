<template>
  <el-dialog
    v-model="dialogVisible"
    title="门店详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-descriptions :column="1" border v-loading="loading">
      <el-descriptions-item label="门店ID">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="门店编码">
        {{ detailData.code || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="门店名称">
        {{ detailData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="经营状态">
        <el-tag :type="getStatusTagType(detailData.businessStatus)">
          {{ detailData.businessStatus ? enumStore.getEnumLabel(DICT_DATA_SHOP_BUSINESS_STATUS, detailData.businessStatus) : '无' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="运营状态">
        <el-tag :type="getStatusTagType(detailData.operationStatus)">
          {{ detailData.operationStatus ? enumStore.getEnumLabel(DICT_DATA_SHOP_OPERATION_STATUS, detailData.operationStatus) : '无' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="物理状态">
        <el-tag :type="getStatusTagType(detailData.physicalStatus)">
          {{ detailData.physicalStatus ? enumStore.getEnumLabel(DICT_DATA_SHOP_PHYSICAL_STATUS, detailData.physicalStatus) : '无' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="门店地址">
        {{ formatAddress(detailData.addressInfo) }}
      </el-descriptions-item>
      <el-descriptions-item label="经纬度">{{ detailData.latitude }}, {{ detailData.longitude }}</el-descriptions-item>
      <el-descriptions-item label="门店描述">
        {{ detailData.description || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="关联组织">
        <el-tag v-for="org in detailData.organizationList" :key="org.id" style="margin-right: 5px">
          {{ org.name }}
        </el-tag>
        <span v-if="detailData.organizationList.length === 0">无</span>
      </el-descriptions-item>
      <el-descriptions-item label="门店标签">
        <el-tag v-for="tag in detailData.labelOptionList" :key="tag.id" style="margin-right: 5px">
          {{ tag.name }}
        </el-tag>
        <span v-if="detailData.labelOptionList.length === 0">无</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ detailData.createName || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatTime(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新人">
        {{ detailData.updateName || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatTime(detailData.updateTime) }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_DATA_SHOP_BUSINESS_STATUS, DICT_DATA_SHOP_OPERATION_STATUS, DICT_DATA_SHOP_PHYSICAL_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import type { DataShopDetailResponseVo } from '@/modules/data/shop/type/DataShop.type'
  import type { AddressInfoDto } from '@/shared/types/CommonData.type'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    shopId: {
      type: String,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'close'])

  const dialogVisible = ref(props.modelValue)
  const loading = ref(false)
  const detailData = ref<DataShopDetailResponseVo>({
    id: '',
    code: '',
    name: '',
    businessStatus: '',
    operationStatus: '',
    physicalStatus: '',
    addressInfo: undefined,
    latitude: 0,
    longitude: 0,
    description: '',
    organizationList: [],
    labelOptionList: [],
    createTime: 0,
    updateTime: 0
  })

  const fetchData = async () => {
    try {
      loading.value = true
      detailData.value = await DataShopApi.detail({ id: props.shopId })
    } catch (error) {
      console.error('获取门店详情失败', error)
    } finally {
      loading.value = false
    }
  }

  // 对话框关闭时的处理
  const handleDialogClosed = () => {
    detailData.value = {
      id: '',
      code: '',
      name: '',
      businessStatus: '',
      operationStatus: '',
      physicalStatus: '',
      addressInfo: undefined,
      latitude: 0,
      longitude: 0,
      description: '',
      organizationList: [],
      labelOptionList: [],
      createTime: 0,
      updateTime: 0
    }
    // 通知父组件对话框已关闭
    emit('update:modelValue', false)
    emit('close')
  }

  // 获取状态标签类型
  const getStatusTagType = (status: string): string => {
    switch (status) {
      case 'OPEN':
      case 'NORMAL':
      case 'ACTIVE':
        return 'success'
      case 'CLOSED':
      case 'ABNORMAL':
      case 'INACTIVE':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 格式化地址
  const formatAddress = (addressInfo?: AddressInfoDto): string => {
    if (!addressInfo) return '无'
    const { province, city, area, address } = addressInfo
    return `${province || ''}${city || ''}${area || ''}${address || ''}`
  }

  // 格式化时间戳
  const formatTime = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
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
