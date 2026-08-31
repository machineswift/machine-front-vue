<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加角色"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" label-width="100px" :rules="state.rules" ref="formRef">
      <el-form-item label="角色类型" prop="type">
        <el-radio-group v-model="state.formData.type">
          <el-radio v-for="option in roleTypes" :key="option.code" :value="option.code">
            {{ option.message }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="数据权限" prop="dataPermissionScope">
        <el-radio-group v-model="state.formData.dataPermissionRule.scopeCode">
          <el-radio v-for="option in dataPermissionScopeTypes" :key="option.code" :value="option.code">
            {{ option.message }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="state.formData.dataPermissionRule.scopeCode === 'CUSTOM'">
        <el-tabs type="border-card" class="custom-tabs">
          <el-tab-pane v-for="option in organizationTypeOptions" :key="option.code" :label="option.message">
            <div class="tab-header">
              <el-input
                v-model="state.organizationQueryMap[option.code]"
                placeholder="请输入关键字"
                @input="(val: unknown) => handleOrganizationQueryChange(option.code, String(val))"
                clearable
                class="search-input"
              />
              <el-checkbox
                v-model="state.organizationCascadeSelectionMap[option.code]"
                @change="(val: unknown) => handleCascadeSelectionChange(option.code, val as boolean)"
              >
                父子联动
              </el-checkbox>
            </div>
            <el-tree-v2
              :ref="el => setOrganizationTreeRef(option.code, el)"
              :data="state.organizationTreeOptionsMap.get(option.code) || []"
              :props="state.organizationProps"
              :filter-method="organizationFilterMethod"
              @check="(node, data) => handleCheckChange(option.code, data.checkedNodes)"
              :height="300"
              show-checkbox
              :check-strictly="!state.organizationCascadeSelectionMap[option.code]"
            />
          </el-tab-pane>
        </el-tabs>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="3" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { ref, computed, reactive, watch, nextTick, type ComponentPublicInstance } from 'vue'
  import { ElMessage, ElTreeV2, type TreeNodeData } from 'element-plus'
  import { BIamRoleApi } from '@/modules/biam/role/api/BIamRole.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_ROLE_TYPE, DICT_IAM_ORG_TYPE, DICT_IAM_DATA_PERMISSION_SCOPE_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import type { DataPermissionRuleDto, DataPermissionRuleOrganizationNodeDto } from '@/shared/types/CommonIam.type'
  import type { BIamOrganizationSimpleTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'

  const DEFAULT_FORM_DATA: {
    type: string
    name: string
    description: string
    dataPermissionRule: DataPermissionRuleDto
  } = {
    type: 'COMPANY',
    name: '',
    description: '',
    dataPermissionRule: {
      functionCode: 'DEFAULT',
      scopeCode: 'ORG_AND_SUB',
      organizationNodeMap: new Map<string, DataPermissionRuleOrganizationNodeDto>()
    } as DataPermissionRuleDto
  }

  // 组件逻辑
  const { options: roleTypes, load: loadRoleTypes } = useEnumOptions(DICT_IAM_ROLE_TYPE)
  const { options: dataPermissionScopeTypes, load: loadDataPermissionScopeTypes } = useEnumOptions(DICT_IAM_DATA_PERMISSION_SCOPE_TYPE)
  const { options: organizationTypeOptions, load: loadOrganizationTypeOptions } = useEnumOptions(DICT_IAM_ORG_TYPE)

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => {
      if (!value) {
        // 取消时才触发关闭，避免循环
        handleCancel()
      }
      emit('update:modelValue', value)
    }
  })

  const formRef = ref()
  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())
  const isInitializing = ref(false) // 标记是否正在初始化，避免重复加载

  const state = reactive({
    submitting: false,

    //组织树
    organizationTreeOptionsMap: new Map<string, BIamOrganizationSimpleTreeResponseVo[]>(),

    //组织树状态信息
    organizationQueryMap: {} as Record<string, string>,
    organizationCascadeSelectionMap: {} as Record<string, boolean>,
    organizationDefaultExpandedKeysMap: new Map<string, string[]>(),

    formData: JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)) as typeof DEFAULT_FORM_DATA,
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },

    rules: {
      type: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 32, message: '长度在2到32个字符', trigger: 'blur' }
      ]
    }
  })

  // 组织树相关方法
  const setOrganizationTreeRef = (code: string, el: Element | ComponentPublicInstance | null) => {
    if (!el || el instanceof Element) return

    const treeEl = el as unknown as InstanceType<typeof ElTreeV2>
    organizationTreeRefMap.value.set(code, treeEl)

    // 使用 nextTick 确保在 DOM 更新后设置展开的 keys
    nextTick(() => {
      if (state.organizationDefaultExpandedKeysMap.has(code)) {
        const expandedKeys = state.organizationDefaultExpandedKeysMap.get(code)
        if (expandedKeys && expandedKeys.length > 0) {
          treeEl.setExpandedKeys(expandedKeys)
        }
      }
    })
  }

  const handleCascadeSelectionChange = (orgType: string, val: boolean) => {
    state.organizationCascadeSelectionMap[orgType] = val
  }

  const handleOrganizationQueryChange = debounce((orgType: string, query: string) => {
    state.organizationQueryMap[orgType] = query
    const treeRef = organizationTreeRefMap.value.get(orgType)

    if (treeRef) {
      treeRef.filter(query)
      if (query.trim() === '') {
        const expandedKeys = state.organizationDefaultExpandedKeysMap.get(orgType) || []
        if (expandedKeys.length > 0) {
          treeRef.setExpandedKeys(expandedKeys)
        }
      }
    }
  }, 300)

  const organizationFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleCheckChange = (_orgType: string, _checkedNodes: TreeNodeData[]) => {
    // 留空处理节点选择变化
  }

  const loadOrganizationTreeData = async (option: { code: string; message: string }) => {
    if (state.organizationTreeOptionsMap.has(option.code)) return

    try {
      //查询组织数据
      const res = await BIamOrganizationApi.treeSimple({ type: option.code })
      state.organizationTreeOptionsMap.set(option.code, [res])

      //设置默认展开的节点
      const treeData = state.organizationTreeOptionsMap.get(option.code)
      if (treeData && treeData.length > 0) {
        state.organizationDefaultExpandedKeysMap.set(
          option.code,
          treeData.map(root => root.id)
        )
      }
    } catch (error) {
      console.error(`加载组织树数据失败: ${option.code}`, error)
    }
  }

  // 表单提交
  const handleSubmit = async () => {
    if (state.submitting) return // 防止重复提交

    try {
      await formRef.value?.validate()

      state.submitting = true

      // 清空之前的选中数据
      state.formData.dataPermissionRule.organizationNodeMap.clear()

      // 处理每个组织类型的选中数据
      for (const option of organizationTypeOptions.value) {
        const treeRef = organizationTreeRefMap.value.get(option.code)
        if (!treeRef) continue

        const checkedKeys = treeRef.getCheckedKeys(false) as string[]
        if (!checkedKeys.length) continue

        const organizationNodeDto: DataPermissionRuleOrganizationNodeDto = {
          selectType: state.organizationCascadeSelectionMap[option.code] ? 'SELF_AND_SUB' : 'SELF',
          organizationIdSet: []
        }

        // 根据是否父子联动处理选中节点
        if (organizationNodeDto.selectType === 'SELF_AND_SUB') {
          const treeData = state.organizationTreeOptionsMap.get(option.code)
          if (treeData && treeData.length > 0) {
            organizationNodeDto.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(treeData, checkedKeys).map(node => node.id)
          }
        } else {
          organizationNodeDto.organizationIdSet = checkedKeys
        }

        // 只保存有选中数据的组织类型
        if (organizationNodeDto.organizationIdSet.length > 0) {
          state.formData.dataPermissionRule.organizationNodeMap.set(option.code, organizationNodeDto)
        }
      }

      await BIamRoleApi.create({
        type: state.formData.type,
        name: state.formData.name,
        description: state.formData.description || undefined,
        dataPermissionRule: {
          ...state.formData.dataPermissionRule,
          // Map 转普通对象后发送（JSON 序列化 Map 会丢失数据）
          organizationNodeMap: Object.fromEntries(state.formData.dataPermissionRule.organizationNodeMap) as unknown as Map<
            string,
            DataPermissionRuleOrganizationNodeDto
          >
        }
      })

      ElMessage.success('添加成功')
      emit('success')
      closeDialog()
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message
      if (msg) {
        ElMessage.error(msg)
      }
      console.error('添加角色失败', error)
    } finally {
      state.submitting = false
    }
  }

  /**
   * 关闭对话框
   */
  const closeDialog = () => {
    emit('update:modelValue', false)
  }

  /**
   * 取消操作
   */
  const handleCancel = () => {
    closeDialog()
  }

  /**
   * 重置表单状态
   */
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }

    // 深拷贝默认数据
    state.formData = JSON.parse(JSON.stringify(DEFAULT_FORM_DATA))
    state.organizationQueryMap = {}

    organizationTypeOptions.value.forEach(option => {
      state.organizationCascadeSelectionMap[option.code] = true
    })

    // 清除所有树形控件的选中状态
    organizationTreeRefMap.value.forEach(treeRef => {
      if (treeRef) {
        try {
          treeRef.setCheckedKeys([])
        } catch (error) {
          console.error('清除树选中状态失败', error)
        }
      }
    })
  }

  /**
   * 处理对话框关闭事件
   */
  const handleDialogClosed = () => {
    resetForm()
    state.submitting = false
  }

  /**
   * 初始化对话框数据
   */
  const initDialogData = async () => {
    if (isInitializing.value) return // 防止重复初始化

    isInitializing.value = true

    try {
      await loadRoleTypes()
      await loadDataPermissionScopeTypes()
      await loadOrganizationTypeOptions()

      // 设置默认父子联动
      organizationTypeOptions.value.forEach(option => {
        state.organizationCascadeSelectionMap[option.code] = true
      })

      // 如果当前选中的是自定义权限，需要加载组织树数据
      if (state.formData.dataPermissionRule.scopeCode === 'CUSTOM') {
        for (const option of organizationTypeOptions.value) {
          await loadOrganizationTreeData(option)
        }
      }
    } catch (error) {
      console.error('初始化对话框数据失败', error)
    } finally {
      isInitializing.value = false
    }
  }

  // 监听数据权限范围变化
  watch(
    () => state.formData.dataPermissionRule.scopeCode,
    async (scopeCode, oldScopeCode) => {
      // 只在真正变化且不是初始化状态时执行
      if (scopeCode === oldScopeCode || isInitializing.value) return

      if (scopeCode === 'CUSTOM' && organizationTypeOptions.value.length > 0) {
        for (const option of organizationTypeOptions.value) {
          await loadOrganizationTreeData(option)
        }
      }
    },
    { immediate: false }
  )

  // 监听对话框打开
  watch(
    () => props.modelValue,
    async (newVal, oldVal) => {
      if (newVal && !oldVal) {
        // 对话框打开时初始化数据
        await nextTick()
        await initDialogData()
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .custom-tabs {
    width: 100%;

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .search-input {
        width: 50%;
      }
    }
  }
</style>
