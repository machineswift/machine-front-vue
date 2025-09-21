<template>
  <el-dialog
    v-model="state.visible"
    title="编辑权限"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-skeleton :loading="state.loading" animated>
      <template #template>
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
        <el-skeleton-item variant="text" style="width: 50%" />
        <el-skeleton-item variant="text" />
      </template>
      <template #default>
        <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入权限名称" />
          </el-form-item>

          <el-form-item label="权限编码" prop="code">
            <el-input v-model="state.formData.code" placeholder="请输入权限编码" />
          </el-form-item>

          <el-form-item label="权限类型" prop="resourceType">
            <el-radio-group v-model="state.formData.resourceType" disabled>
              <el-radio v-for="item in state.permissionResourceTypes" :key="item.code" :value="item.code" border :disabled="shouldDisableRadio(item.code)">
                {{ item.message }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="图标" prop="icon">
            <el-input v-model="state.formData.icon" placeholder="请输入图标URL或el-icon名称">
              <template #append>
                <el-button @click="showIconSelector">选择图标</el-button>
              </template>
            </el-input>
          </el-form-item>

          <!-- 数据权限部分 -->
          <el-form-item v-if="state.formData.resourceType === 'MENU'" label="数据权限">
            <IamPermissionDataPermissionScope v-model="state.formData.dataPermissionMetaList" :form-ref="formRef" />
          </el-form-item>

          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="state.formData.sort" :min="0" />
          </el-form-item>

          <el-form-item label="备注" prop="description">
            <el-input v-model="state.formData.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      </template>
    </el-skeleton>

    <template #footer>
      <el-button @click="state.visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:AUTH:PERMISSION:UPDATE']">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type { DataPermissionMetaDto } from '@/modules/common/types/CommonIam.type'
  import IamPermissionDataPermissionScope from '@/modules/iam/permission/IamPermissionDataPermissionScope.vue'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    permissionId: { type: String, required: true }
  })

  const formRef = ref()
  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue', 'success'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,

    //枚举状态
    permissionResourceTypes: [],

    formData: {
      id: '',
      name: '',
      code: '',
      resourceType: 'MENU',
      icon: '',
      sort: 0,
      description: '',
      dataPermissionMetaList: [] as DataPermissionMetaDto[]
    }
  })

  const rules = {
    name: [
      { required: true, message: '请输入权限名称', trigger: ['blur', 'change'] },
      { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: ['blur', 'change'] }
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

  // 禁用 APP 和 MODULE 选项
  const shouldDisableRadio = (value: string) => {
    return ['APP', 'MODULE'].includes(value)
  }

  const showIconSelector = () => {
    ElMessage.info('图标选择器功能待实现')
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true

      const updateData = {
        id: state.formData.id,
        name: state.formData.name,
        code: state.formData.code,
        icon: state.formData.icon,
        sort: state.formData.sort,
        description: state.formData.description,
        dataPermissionMetaList: state.formData.resourceType === 'MENU' ? state.formData.dataPermissionMetaList : undefined
      }

      await IamPermissionApi.update(updateData)
      ElMessage.success('更新权限成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('更新权限失败', error)
      if (error instanceof Error) {
        ElMessage.error({
          message: error.message,
          duration: 5000,
          showClose: true
        })
      } else {
        ElMessage.error('更新权限失败，请检查表单数据')
      }
    } finally {
      state.submitting = false
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await IamPermissionApi.detail({ id: props.permissionId })
      state.formData = {
        id: res.id,
        name: res.name,
        code: res.code,
        resourceType: res.resourceType,
        icon: res.icon,
        sort: res.sort,
        description: res.description || '',
        dataPermissionMetaList: res.dataPermissionMetaList || []
      }
    } catch (error) {
      console.error('获取权限详情失败', error)
    } finally {
      state.loading = false
    }
  }

  /**
   * 对话框关闭时清理数据
   */
  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = {
      id: '',
      name: '',
      code: '',
      resourceType: 'MENU',
      icon: '',
      sort: 0,
      description: '',
      dataPermissionMetaList: [] as DataPermissionMetaDto[]
    }

    // 重置表单验证状态
    formRef.value?.resetFields()

    // 重置加载状态
    state.loading = false
    state.submitting = false

    // 如果是菜单类型，添加默认数据权限
    if (state.formData.resourceType === 'MENU' && state.formData.dataPermissionMetaList.length === 0) {
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
    [() => props.modelValue, () => props.permissionId],
    async ([modelValue, permissionId]) => {
      if (modelValue && permissionId) {
        state.permissionResourceTypes = enumStore.getEnumDataSync('IamPermissionResourceTypeEnum')
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>
