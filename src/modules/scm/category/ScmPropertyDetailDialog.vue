<template>
  <el-dialog
    v-model="state.visible"
    title="属性详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="50%"
    top="8vh"
  >
    <el-form :model="state.detailData" label-width="100px" v-loading="state.loading">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="编码">
            <el-input :model-value="state.detailData.code || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名称">
            <el-input :model-value="state.detailData.name || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="属性类型">
            <el-tag :type="propertyTypeTag(state.detailData.propertyType)" size="small">
              {{ getEnumLabel(state.propertyTypeOptions, state.detailData.propertyType) }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="输入方式">
            <el-input :model-value="getEnumLabel(state.inputTypeOptions, state.detailData.inputType)" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="是否必填">
            <el-tag :type="state.detailData.isRequired ? 'danger' : 'info'" size="small">
              {{ state.detailData.isRequired ? '是' : '否' }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否多选">
            <el-tag :type="state.detailData.isMultiple ? 'warning' : 'info'" size="small">
              {{ state.detailData.isMultiple ? '是' : '否' }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否可搜索">
            <el-tag :type="state.detailData.isSearch ? 'success' : 'info'" size="small">
              {{ state.detailData.isSearch ? '是' : '否' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item v-if="state.detailData.features" label="扩展特性">
        <pre class="features-json">{{ state.detailData.features }}</pre>
      </el-form-item>

      <el-divider content-position="left">操作信息</el-divider>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建人">
            <el-input :model-value="state.detailData.createName || '无'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="修改人">
            <el-input :model-value="state.detailData.updateName || '无'" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input :model-value="formatTime(state.detailData.createTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间">
            <el-input :model-value="formatTime(state.detailData.updateTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 属性枚举值列表 -->
      <el-form-item v-if="state.detailData.valueList?.length" label="属性枚举值">
        <el-table :data="state.detailData.valueList" border size="small" max-height="260">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="value" label="属性值" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
        </el-table>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, onMounted } from 'vue'
  import { ScmPropertyApi } from '@/modules/scm/category/api/ScmProperty.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { ScmPropertyDetailResponseVo } from '@/modules/scm/category/type/ScmProperty.type'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'

  const props = defineProps<{
    modelValue: boolean
    propertyId: string
  }>()

  const emit = defineEmits(['update:modelValue'])
  const dictEnumStore = useDictionaryEnumStore()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    propertyTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    inputTypeOptions: [] as IamDictionaryEnumInfoResponse[],
    detailData: {} as ScmPropertyDetailResponseVo
  })

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '无'
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const getEnumLabel = (options: IamDictionaryEnumInfoResponse[], code?: string): string => {
    if (!code) return '无'
    const item = options.find(o => o.code === code)
    return item?.message || code
  }

  const propertyTypeTag = (type?: string): 'success' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'info'> = { KEY: 'success', SALE: 'warning', SPEC: 'info' }
    return type ? map[type] || 'info' : 'info'
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

  const fetchData = async () => {
    if (!props.propertyId) return

    try {
      state.loading = true
      const res = await ScmPropertyApi.detail({ id: props.propertyId })
      state.detailData = res || ({} as ScmPropertyDetailResponseVo)
    } catch (error) {
      console.error('获取属性详情失败', error)
      state.detailData = {} as ScmPropertyDetailResponseVo
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {} as ScmPropertyDetailResponseVo
    state.loading = false
  }

  onMounted(() => {
    loadEnumData()
  })

  watch([() => props.modelValue, () => props.propertyId], async ([modelValue, propertyId]) => {
    if (modelValue && propertyId) {
      await loadEnumData()
      await fetchData()
    }
  })
</script>

<style lang="scss" scoped>
  .el-row {
    width: 100%;
  }

  .features-json {
    margin: 0;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
</style>
