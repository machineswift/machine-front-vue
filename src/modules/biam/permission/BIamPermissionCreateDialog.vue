<template>
  <el-dialog
    v-model="state.visible"
    title="新增权限"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <div class="permission-create-container">
      <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
        <!-- 基础信息部分 -->
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="state.formData.name" placeholder="请输入权限名称" @blur="validateField('name')" />
        </el-form-item>

        <el-form-item label="权限编码" prop="code">
          <el-input v-model="state.formData.code" placeholder="请输入权限编码" @blur="validateField('code')" />
        </el-form-item>

        <el-form-item label="权限类型" prop="resourceType">
          <el-radio-group v-model="state.formData.resourceType" @change="handleResourceTypeChange">
            <el-radio v-for="item in permissionResourceTypes" :key="item.code" :value="item.code" border :disabled="shouldDisableRadio(item.code)">
              {{ item.message }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="state.formData.icon" placeholder="请输入图标URL或el-icon名称">
            <template #append>
              <el-button @click="handleShowIconSelector">选择图标</el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 数据权限部分 -->
        <el-form-item v-if="state.formData.resourceType === 'MENU'" label="数据权限">
          <BIamPermissionDataPermissionScope v-model="state.formData.dataPermissionMetaList" :form-ref="formRef" />
        </el-form-item>

        <!-- 其他信息 -->
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="state.formData.sort" :min="0" />
        </el-form-item>

        <el-form-item label="备注" prop="description">
          <el-input v-model="state.formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:CREATE']">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref, nextTick } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import { BIamPermissionApi } from '@/modules/biam/permission/api/BIamPermission.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_PERMISSION_RESOURCE_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import type { DataPermissionMetaDto } from '@/shared/types/CommonIam.type'
  import BIamPermissionDataPermissionScope from '@/modules/biam/permission/BIamPermissionDataPermissionScope.vue'
  import type { BIamPermissionCreateRequestVo, BIamPermissionTreeExpandResponseVo } from '@/modules/biam/permission/type/BIamPermission.type'

  const props = defineProps<{
    modelValue: boolean
    parentNode: BIamPermissionTreeExpandResponseVo
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const { options: permissionResourceTypes, load: loadPermissionResourceTypes } = useEnumOptions(DICT_IAM_PERMISSION_RESOURCE_TYPE)
  const formRef = ref<FormInstance>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,

    formData: {
      name: '',
      code: '',
      resourceType: 'MENU',
      parentId: props.parentNode?.id || '',
      icon: '',
      sort: 0,
      description: '',
      dataPermissionMetaList: [] as DataPermissionMetaDto[]
    } as BIamPermissionCreateRequestVo & { dataPermissionMetaList: DataPermissionMetaDto[] }
  })

  const rules = {
    name: [
      { required: true, message: '请输入权限名称', trigger: ['blur', 'change'] },
      { min: 2, max: 24, message: '长度在 2 到 34 个字符', trigger: ['blur', 'change'] }
    ],
    code: [
      { required: true, message: '请输入权限编码', trigger: ['blur', 'change'] },
      {
        pattern: /^[a-zA-Z0-9_:-]+$/,
        message: '只能包含字母、数字、下划线、冒号和减号',
        trigger: ['blur', 'change']
      }
    ],
    resourceType: [{ required: true, message: '请选择权限类型', trigger: ['change', 'blur'] }],
    icon: [{ required: false, message: '请输入图标', trigger: ['blur'] }],
    sort: [{ required: true, message: '请输入排序值', trigger: ['blur', 'change'] }]
  }

  const validateField = (prop: string) => {
    formRef.value?.validateField(prop)
  }

  const shouldDisableRadio = (value: string) => {
    return ['APP', 'MODULE'].includes(value)
  }

  const handleResourceTypeChange = (value: string) => {
    if (value === 'MENU') {
      if (state.formData.dataPermissionMetaList.length === 0) {
        state.formData.dataPermissionMetaList.push({
          functionName: '默认',
          functionCode: 'DEFAULT',
          scopeList: [],
          selectedScopes: []
        })
      }
    } else {
      state.formData.dataPermissionMetaList = []
    }
    validateField('resourceType')
  }

  const handleShowIconSelector = () => {
    ElMessage.info('图标选择器功能待实现')
  }

  const handleSubmit = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      if (state.formData.resourceType === 'MENU') {
        await validatePermissionMetaData()
      }

      if (state.formData.resourceType !== 'MENU') {
        state.formData.dataPermissionMetaList = []
      }

      await BIamPermissionApi.create(state.formData)
      ElMessage.success({
        message: '新增权限成功',
        duration: 2000
      })
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增权限失败', error)
      if (error instanceof Error) {
        ElMessage.error({
          message: error.message,
          duration: 5000,
          showClose: true
        })

        await nextTick(() => {
          const firstError = document.querySelector('.is-error')
          if (firstError) {
            firstError.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        })
      }
    } finally {
      state.submitting = false
    }
  }

  const validatePermissionMetaData = async () => {
    state.formData.dataPermissionMetaList = state.formData.dataPermissionMetaList.map(item => ({
      ...item,
      scopeList: item.scopeList ? item.scopeList.filter(scope => scope.scopeName && scope.scopeCode) : []
    }))

    const invalidTabIndex = state.formData.dataPermissionMetaList.findIndex(item => !item.scopeList || item.scopeList.length === 0)

    if (invalidTabIndex >= 0) {
      throw new Error(`功能${invalidTabIndex + 1}至少需要一个权限范围`)
    }

    const invalidScopeTabIndex = state.formData.dataPermissionMetaList.findIndex(item => item.scopeList?.some(scope => !scope.scopeName || !scope.scopeCode))

    if (invalidScopeTabIndex >= 0) {
      throw new Error(`功能${invalidScopeTabIndex + 1}的范围名称和编码不能为空`)
    }

    for (let i = 0; i < state.formData.dataPermissionMetaList.length; i++) {
      await formRef.value?.validateField(`dataPermissionMetaList.${i}.functionName`)
      await formRef.value?.validateField(`dataPermissionMetaList.${i}.functionCode`)

      for (let j = 0; j < state.formData.dataPermissionMetaList[i].scopeList.length; j++) {
        await formRef.value?.validateField(`dataPermissionMetaList.${i}.scopeList.${j}.scopeName`)
        await formRef.value?.validateField(`dataPermissionMetaList.${i}.scopeList.${j}.scopeCode`)
      }
    }
  }

  const initFormData = () => {
    if (props.parentNode) {
      state.formData.parentId = props.parentNode.id
    }
    if (state.formData.resourceType === 'MENU' && state.formData.dataPermissionMetaList.length === 0) {
      state.formData.dataPermissionMetaList.push({
        functionName: '默认',
        functionCode: 'DEFAULT',
        scopeList: [],
        selectedScopes: []
      })
    }
  }

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    state.formData = {
      name: '',
      code: '',
      resourceType: 'MENU',
      parentId: props.parentNode?.id || '',
      icon: '',
      sort: 0,
      description: '',
      dataPermissionMetaList: [] as DataPermissionMetaDto[]
    }

    formRef.value?.resetFields()

    state.submitting = false

    // 如果是菜单类型，添加默认数据权限
    if (state.formData.resourceType === 'MENU') {
      state.formData.dataPermissionMetaList = [
        {
          functionName: '默认',
          functionCode: 'DEFAULT',
          scopeList: [],
          selectedScopes: []
        }
      ]
    }
  }

  watch(
    [() => props.modelValue, () => props.parentNode],
    async ([modelValue, parentNode]) => {
      if (modelValue && parentNode) {
        await loadPermissionResourceTypes()
        await initFormData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .permission-create-container {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 10px;
  }
</style>
