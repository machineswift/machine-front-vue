<template>
  <el-dialog v-model="visible" title="素材详情" width="700px" :close-on-click-modal="false">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="素材ID">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="素材标题">{{ detailData.title }}</el-descriptions-item>
      <el-descriptions-item label="素材类型">
        <el-tag>{{ getMaterialTypeLabel(detailData.type) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="存储类型">
        <el-tag>{{ getStorageTypeLabel(detailData.storageType) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusTagType(detailData.status)">
          {{ getStatusLabel(detailData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        <el-tag v-for="categoryId in detailData.categoryIdSet" :key="categoryId" size="small" style="margin-right: 5px; margin-bottom: 5px">
          {{ getCategoryName(categoryId) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="文件大小">{{ formatFileSize(detailData.size) }}</el-descriptions-item>
      <el-descriptions-item label="过期时间">{{ detailData.expireTime ? formatTimestamp(detailData.expireTime) : '永久' }}</el-descriptions-item>
      <el-descriptions-item label="描述">{{ detailData.description || '无' }}</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ detailData.createName }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatTimestamp(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="修改人">{{ detailData.updateName }}</el-descriptions-item>
      <el-descriptions-item label="修改时间">{{ formatTimestamp(detailData.updateTime) }}</el-descriptions-item>
    </el-descriptions>

    <!-- 根据不同类型显示元数据 -->
    <div v-if="detailData.textMetaInfo" class="meta-info-section">
      <h3>文本信息</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="格式">{{ detailData.textMetaInfo.format }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <pre>{{ detailData.textMetaInfo.content }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="detailData.imageMetaInfo" class="meta-info-section">
      <h3>图片信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="格式">{{ detailData.imageMetaInfo.format }}</el-descriptions-item>
        <el-descriptions-item label="宽度">{{ detailData.imageMetaInfo.width }}px</el-descriptions-item>
        <el-descriptions-item label="高度">{{ detailData.imageMetaInfo.height }}px</el-descriptions-item>
        <el-descriptions-item label="DPI">{{ detailData.imageMetaInfo.dpi || '未知' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 其他类型的元数据显示类似 -->

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { DataMaterialDetailResponseVo } from '@/modules/data/material/type/DataMaterial.type'

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

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()
  const visible = ref(false)
  const detailData = ref<DataMaterialDetailResponseVo>({} as DataMaterialDetailResponseVo)
  const categoryMap = ref<Map<string, string>>(new Map())

  // 获取素材详情
  const fetchDetail = async () => {
    if (!props.materialId) return
    try {
      const res = await DataMaterialApi.detail({ id: props.materialId })
      detailData.value = res
    } catch (error) {
      console.error('获取素材详情失败', error)
    }
  }

  // 获取分类名称
  const getCategoryName = (categoryId: string): string => {
    return categoryMap.value.get(categoryId) || categoryId
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

  // 获取状态标签
  const getStatusLabel = (status: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialStatusEnum', status)
    return enumItem?.message || status
  }

  // 获取状态标签类型
  const getStatusTagType = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'INACTIVE':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
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

  // 初始化分类映射
  const initCategoryMap = async () => {
    // 这里需要实现获取分类映射的逻辑
    // 可以从父组件传递过来，或者单独调用API获取
  }

  initCategoryMap()
</script>

<style scoped>
  .meta-info-section {
    margin-top: 20px;
  }
  .meta-info-section h3 {
    margin: 10px 0;
    font-size: 16px;
    font-weight: bold;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
  }
</style>
