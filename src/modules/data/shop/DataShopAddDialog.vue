<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加门店"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" :rules="rules" label-width="100px" ref="formRef">
      <el-form-item label="门店名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入门店名称" />
      </el-form-item>
      <el-form-item label="门店地址" prop="addressInfo">
        <el-select v-model="state.formData.addressInfo.countryCode" placeholder="请选择国家" change="" clear="" clearable>
          <el-option v-for="option in state.countryCodeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
        <el-tooltip :disabled="!!state.formData.addressInfo.countryCode" content="请先选择国家" placement="top">
          <div style="display: block; width: 100%">
            <el-cascader
              v-model="state.areaSelected"
              :options="currentAreaTreeOptions"
              :props="state.areaProps"
              placeholder="请选择省市区"
              style="width: 100%; margin-bottom: 10px"
              clearable
              filterable
              :disabled="!state.formData.addressInfo.countryCode"
            />
          </div>
        </el-tooltip>
        <el-input v-model="state.formData.addressInfo.address" placeholder="请输入详细地址" />
      </el-form-item>

      <el-form-item label="经纬度" prop="latitude">
        <div style="display: flex; gap: 10px">
          <el-input v-model="state.formData.latitude" placeholder="纬度" style="flex: 1" />
          <el-input v-model="state.formData.longitude" placeholder="经度" style="flex: 1" />
          <el-button type="primary" @click="handleSelectOnMap">地图选择</el-button>
        </div>
      </el-form-item>

      <el-form-item label="门店描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入门店描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:BASIC_DATA:SHOP:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, onMounted, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import type { DataShopCreateRequestVo } from '@/modules/data/shop/type/DataShop.type'
  import type { AddressInfoDto } from '@/shared/types/CommonData.type'
  import type { DataAreaSimpleTreeResponseVo, DataAreaTreeSimpleResponseVo } from '@/modules/data/area/type/DataArea.type'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const formRef = ref<FormInstance>()
  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'success'])

  const DEFAULT_FORM_DATA: DataShopCreateRequestVo = {
    name: '',
    addressInfo: {
      country: '',
      countryCode: '',
      province: '',
      provinceCode: '',
      city: '',
      cityCode: '',
      area: '',
      areaCode: '',
      town: '',
      townCode: '',
      address: ''
    },
    latitude: 0,
    longitude: 0,
    description: ''
  }

  // 统一状态管理
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    countryCodeOptions: [] as Array<{ code: string; message: string }>,
    areaTreeOptions: new Map<string, DataAreaSimpleTreeResponseVo[]>(),
    areaSelected: [] as string[],
    areaProps: {
      value: 'code',
      label: 'name',
      children: 'children',
      expandTrigger: 'hover' as const
    },
    formData: { ...DEFAULT_FORM_DATA }
  })

  // 计算当前省市区的状态
  const currentAreaTreeOptions = ref<DataAreaTreeSimpleResponseVo[]>([])
  watch(
    () => state.formData.addressInfo.countryCode,
    async countryCode => {
      if (!countryCode) {
        currentAreaTreeOptions.value = []
        state.formData.addressInfo = {}
        return
      }

      if (!state.areaTreeOptions.has(countryCode)) {
        const response = await DataAreaApi.treeSimple({ countryCode })
        state.areaTreeOptions.set(countryCode, response.children)
      }

      state.formData.addressInfo.country = getAreaCountryLabel(countryCode)
      currentAreaTreeOptions.value = state.areaTreeOptions.get(countryCode)!
    },
    { immediate: false }
  )

  // 表单验证规则
  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入门店名称')
    if (value.length < 2 || value.length > 64) return Promise.reject('长度在2到64个字符')
    return Promise.resolve()
  }

  const validateAddress = (_rule: FormItemRule, value: AddressInfoDto) => {
    if (!value || !value.address) return Promise.reject('请输入详细地址')
    if (!state.areaSelected || state.areaSelected.length < 3) return Promise.reject('请选择完整的省市区')
    return Promise.resolve()
  }

  const validateLatitude = (_rule: FormItemRule, value: number) => {
    if (value === null || value === undefined) return Promise.reject('请输入纬度')
    if (value < -90 || value > 90) return Promise.reject('纬度范围应在-90到90之间')
    return Promise.resolve()
  }

  const validateLongitude = (_rule: FormItemRule, value: number) => {
    if (value === null || value === undefined) return Promise.reject('请输入经度')
    if (value < -180 || value > 180) return Promise.reject('经度范围应在-180到180之间')
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    addressInfo: [{ required: true, validator: validateAddress, trigger: 'blur' }],
    latitude: [{ required: true, validator: validateLatitude, trigger: 'blur' }],
    longitude: [{ required: true, validator: validateLongitude, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  const getAreaCountryLabel = (code: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataCountryEnum', code)
    return enumItem?.message || code
  }

  // 地图选择坐标
  const handleSelectOnMap = () => {
    // 这里需要实现地图选择坐标的功能
    ElMessage.info('地图选择功能需要集成地图API')
  }

  const handleDialogClosed = () => {
    //重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }

    // 重置地区选择
    state.areaSelected = []
    currentAreaTreeOptions.value = []

    // 彻底重置表单验证状态
    formRef.value?.resetFields()
    formRef.value?.clearValidate()

    // 重置所有加载状态
    state.submitting = false
  }

  // 提交表单
  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      // 设置省市区信息
      const province: DataAreaTreeSimpleResponseVo = TreeDataUtil.findNode(currentAreaTreeOptions.value, state.areaSelected[0], { mode: 'bfs' })
      if (province) {
        state.formData.addressInfo.province = province.name
        state.formData.addressInfo.provinceCode = province.code
        const city: DataAreaTreeSimpleResponseVo = TreeDataUtil.findNode(province.children, state.areaSelected[1], { mode: 'bfs' })
        state.formData.addressInfo.city = city.name
        state.formData.addressInfo.cityCode = city.code
        if (city) {
          const area = TreeDataUtil.findNode(city.children, state.areaSelected[2], { mode: 'bfs' })
          if (area) {
            state.formData.addressInfo.area = area.name
            state.formData.addressInfo.areaCode = area.code
          }
        }
      }

      await DataShopApi.create(state.formData)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加门店失败', error)
    } finally {
      state.submitting = false
    }
  }

  onMounted(async () => {
    // 枚举选项
    state.countryCodeOptions = enumStore.getEnumDataSync('DataCountryEnum')
  })
</script>
