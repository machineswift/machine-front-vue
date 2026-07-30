<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑角色"
    :loading="state.loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.formData" label-width="100px" :rules="state.rules" ref="formRef">
      <el-form-item label="角色ID" prop="id" v-if="false">
        <el-input v-model="state.formData.id" disabled />
      </el-form-item>
      <el-form-item label="角色类型" prop="type">
        <el-select v-model="state.formData.type" placeholder="请选择角色类型" disabled>
          <el-option v-for="option in state.roleTypes" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入角色名称" :disabled="state.formData.defaultRole" />
      </el-form-item>
      <el-form-item label="角色编码" prop="code">
        <el-input v-model="state.formData.code" placeholder="请输入角色编码" disabled />
      </el-form-item>

      <el-form-item label="数据权限" prop="dataPermissionScope">
        <el-radio-group v-model="state.formData.dataPermissionRule.scopeCode" :disabled="state.formData.defaultRole">
          <el-radio v-for="option in state.dataPermissionScopeTypes" :key="option.code" :value="option.code">
            {{ option.message }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="state.formData.dataPermissionRule.scopeCode === 'CUSTOM' && !state.formData.defaultRole">
        <el-tabs type="border-card" class="custom-tabs">
          <el-tab-pane v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message">
            <div class="tab-header">
              <el-input
                v-model="state.organizationQueryMap[option.code]"
                placeholder="请输入关键字"
                @input="val => handleOrganizationQueryChange(option.code, val)"
                clearable
                class="search-input"
              />
              <el-checkbox v-model="state.organizationCascadeSelectionMap[option.code]" @change="val => handleCascadeSelectionChange(option.code, val)">
                父子联动
              </el-checkbox>
            </div>
            <el-tree-v2
              :ref="el => setOrganizationTreeRef(option.code, el)"
              :data="state.organizationTreeOptionsMap.get(option.code) || []"
              :props="state.organizationProps"
              :filter-method="organizationFilterMethod"
              @check="(node, data) => handleCheckChange(option.code, data.checkedNodes)"
              :height="200"
              show-checkbox
              :check-strictly="!state.organizationCascadeSelectionMap[option.code]"
            />
          </el-tab-pane>
        </el-tabs>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.formData.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:ROLE:UPDATE']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { ElMessage, ElTreeV2 } from 'element-plus'
  import { ref, watch, reactive, computed, nextTick } from 'vue'
  import { IamRoleApi } from '@/modules/iam/role/api/IamRole.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { DataPermissionRuleDto, DataPermissionRuleOrganizationNodeDto } from '@/shared/types/CommonIam.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'

  // 常量定义
  const DEFAULT_FORM_DATA = {
    id: '',
    type: 'COMPANY',
    name: '',
    code: '',
    description: '',
    defaultRole: false,
    dataPermissionRule: {
      functionCode: 'DEFAULT',
      scopeCode: 'ORG_AND_SUB',
      organizationNodeMap: new Map<string, DataPermissionRuleOrganizationNodeDto>()
    } as DataPermissionRuleDto
  }

  // 组件逻辑
  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    roleId: { type: String, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'refresh'])

  // 独立的 computed 用于 v-model，不放在 reactive 中
  const dialogVisible = computed({
    get: () => props.modelValue,
    set: val => {
      if (!val) {
        handleCancel()
      }
      emit('update:modelValue', val)
    }
  })

  const formRef = ref()
  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())
  const isInitializing = ref(false) // 防止重复初始化

  const state = reactive({
    loading: false,
    submitting: false,

    //枚举状态
    roleTypes: [] as Array<{ code: string; message: string }>,
    dataPermissionScopeTypes: [] as Array<{ code: string; message: string }>,

    //组织树
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,
    organizationTreeOptionsMap: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),

    //组织树状态
    organizationQueryMap: {} as Record<string, string>,
    organizationCascadeSelectionMap: {} as Record<string, boolean>,
    organizationDefaultCheckedKeysMap: new Map<string, string[]>(),
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
      ],
      code: [{ pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }],
      description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
    }
  })

  // 创建深拷贝函数，处理 Map 对象
  const deepCloneFormData = (data: typeof DEFAULT_FORM_DATA) => {
    const cloned = JSON.parse(JSON.stringify(data))
    // 重新创建 Map 对象
    cloned.dataPermissionRule.organizationNodeMap = new Map<string, DataPermissionRuleOrganizationNodeDto>()

    if (data.dataPermissionRule.organizationNodeMap) {
      data.dataPermissionRule.organizationNodeMap.forEach((value, key) => {
        cloned.dataPermissionRule.organizationNodeMap.set(key, JSON.parse(JSON.stringify(value)))
      })
    }

    return cloned
  }

  // 组织树相关方法
  const setOrganizationTreeRef = (code: string, el: InstanceType<typeof ElTreeV2> | null) => {
    if (!el) return

    organizationTreeRefMap.value.set(code, el)

    nextTick(() => {
      // 设置展开的节点
      if (state.organizationDefaultExpandedKeysMap.has(code)) {
        const expandedKeys = state.organizationDefaultExpandedKeysMap.get(code)
        if (expandedKeys && expandedKeys.length > 0) {
          el.setExpandedKeys(expandedKeys)
        }
      }

      // 设置选中的节点
      if (state.organizationDefaultCheckedKeysMap.has(code)) {
        const checkedKeys = state.organizationDefaultCheckedKeysMap.get(code)
        if (checkedKeys && checkedKeys.length > 0) {
          el.setCheckedKeys(checkedKeys)
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

  const organizationFilterMethod = (query: string, node: IamOrganizationSimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleCheckChange = (_orgType: string, _checkedNodes: IamOrganizationSimpleTreeResponseVo[]) => {
    // 留空处理节点选择变化
  }

  // 设置已选中的组织节点
  const setCheckedOrganizationNodes = async () => {
    const organizationNodeMap = state.formData.dataPermissionRule.organizationNodeMap

    if (!organizationNodeMap || organizationNodeMap.size === 0) {
      return
    }

    // 等待所有组织树数据加载完成
    await nextTick()

    organizationNodeMap.forEach((nodeDto, orgType) => {
      // 父子联动模式
      state.organizationCascadeSelectionMap[orgType] = nodeDto.selectType === 'SELF_AND_SUB'

      if (nodeDto.organizationIdSet?.length) {
        const treeData = state.organizationTreeOptionsMap.get(orgType)
        if (!treeData || treeData.length === 0) return

        let checkedKeys: string[]

        if (nodeDto.selectType === 'SELF_AND_SUB') {
          // 获取所有子节点ID（包括自身）
          checkedKeys = TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, nodeDto.organizationIdSet)
        } else {
          checkedKeys = [...nodeDto.organizationIdSet]
        }

        state.organizationDefaultCheckedKeysMap.set(orgType, checkedKeys)

        // 设置展开的节点
        const rootNodeIds = treeData.map(root => root.id)
        const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, nodeDto.organizationIdSet)
        const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !nodeDto.organizationIdSet.includes(node.id)).map(node => node.id)

        state.organizationDefaultExpandedKeysMap.set(orgType, expandedKeys)
      }
    })
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = deepCloneFormData(DEFAULT_FORM_DATA)

    // 清理组织树相关状态
    state.organizationTreeOptionsMap.clear()
    state.organizationQueryMap = {}
    state.organizationCascadeSelectionMap = {}
    state.organizationDefaultCheckedKeysMap.clear()
    state.organizationDefaultExpandedKeysMap.clear()

    // 清除组织树引用
    organizationTreeRefMap.value.clear()

    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields()
    }

    state.loading = false
    state.submitting = false
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

  // 表单提交
  const submitForm = async () => {
    if (state.submitting) return // 防止重复提交

    try {
      await formRef.value?.validate()
      state.submitting = true

      // 处理数据权限规则
      if (state.formData.dataPermissionRule.scopeCode === 'CUSTOM') {
        // 创建新的 Map
        state.formData.dataPermissionRule.organizationNodeMap = new Map()

        // 处理每个组织类型的选中数据
        for (const orgType of state.organizationTypeOptions) {
          const treeRef = organizationTreeRefMap.value.get(orgType.code)
          if (!treeRef) continue

          const checkedKeys = treeRef.getCheckedKeys(false) as string[]
          if (!checkedKeys.length) continue

          const organizationNodeDto: DataPermissionRuleOrganizationNodeDto = {
            selectType: state.organizationCascadeSelectionMap[orgType.code] ? 'SELF_AND_SUB' : 'SELF',
            organizationIdSet: []
          }

          // 根据是否父子联动处理选中节点
          if (organizationNodeDto.selectType === 'SELF_AND_SUB') {
            const treeData = state.organizationTreeOptionsMap.get(orgType.code)
            if (treeData && treeData.length > 0) {
              organizationNodeDto.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(treeData, checkedKeys).map(node => node.id)
            }
          } else {
            organizationNodeDto.organizationIdSet = [...checkedKeys]
          }

          // 只保存有选中数据的组织类型
          if (organizationNodeDto.organizationIdSet.length > 0) {
            state.formData.dataPermissionRule.organizationNodeMap.set(orgType.code, organizationNodeDto)
          }
        }
      }

      await IamRoleApi.update({
        id: state.formData.id,
        name: state.formData.name,
        description: state.formData.description || undefined,
        dataPermissionRule: {
          ...state.formData.dataPermissionRule,
          organizationNodeMap: Object.fromEntries(state.formData.dataPermissionRule.organizationNodeMap)
        }
      })

      ElMessage.success('修改成功')
      emit('refresh')
      closeDialog()
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message
      if (msg) {
        ElMessage.error(msg)
      }
      console.error('修改角色失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 加载组织树数据
  const loadOrganizationTreeData = async () => {
    if (state.organizationTypeOptions.length === 0) return

    const loadPromises = state.organizationTypeOptions.map(async option => {
      if (state.organizationTreeOptionsMap.has(option.code)) return

      try {
        const organizationTreeRes = await IamOrganizationApi.treeSimple({ type: option.code })
        state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])

        // 设置默认展开的节点
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
    })

    await Promise.all(loadPromises)
  }

  // 初始化枚举数据
  const initEnumData = async () => {
    const [roleTypes, organizationTypeOptions, dataPermissionScopeTypes] = await Promise.all([
      enumStore.getEnumDataAsync('IamRoleTypeEnum'),
      enumStore.getEnumDataAsync('IamOrganizationTypeEnum'),
      enumStore.getEnumDataAsync('IamDataPermissionScopeTypeEnum')
    ])

    state.roleTypes = roleTypes || []
    state.organizationTypeOptions = organizationTypeOptions || []
    state.dataPermissionScopeTypes = dataPermissionScopeTypes || []

    // 设置默认父子联动
    state.organizationTypeOptions.forEach(option => {
      state.organizationCascadeSelectionMap[option.code] = true
    })
  }

  // 获取角色详情
  const fetchData = async () => {
    try {
      state.loading = true
      const res = await IamRoleApi.detail({ id: props.roleId })

      // 转换 organizationNodeMap 为 Map 格式
      const organizationNodeMap = new Map<string, DataPermissionRuleOrganizationNodeDto>()
      if (res.dataPermissionRule?.organizationNodeMap) {
        Object.entries(res.dataPermissionRule.organizationNodeMap).forEach(([key, value]) => {
          organizationNodeMap.set(key, value as DataPermissionRuleOrganizationNodeDto)
        })
      }

      // 更新表单数据
      state.formData = {
        id: res.id,
        type: res.type,
        name: res.name,
        code: res.code,
        description: res.description || '',
        defaultRole: res.defaultRole,
        dataPermissionRule: {
          functionCode: res.dataPermissionRule?.functionCode || 'DEFAULT',
          scopeCode: res.dataPermissionRule?.scopeCode || 'ORG_AND_SUB',
          organizationNodeMap: organizationNodeMap
        }
      }

      // 如果是自定义数据权限，需要加载组织树数据并设置选中状态
      if (state.formData.dataPermissionRule.scopeCode === 'CUSTOM') {
        // 先确保组织树数据已加载
        await loadOrganizationTreeData()
        // 等待 DOM 更新
        await nextTick()
        // 设置已选中的组织节点
        await setCheckedOrganizationNodes()
      }
    } catch (error) {
      console.error('获取角色详情失败', error)
      ElMessage.error('获取角色详情失败')
    } finally {
      state.loading = false
    }
  }

  // 初始化对话框
  const initDialog = async () => {
    if (isInitializing.value) return // 防止重复初始化

    isInitializing.value = true

    try {
      // 先加载枚举数据
      await initEnumData()
      // 加载组织树数据
      await loadOrganizationTreeData()
      // 获取角色详情
      await fetchData()
    } catch (error) {
      console.error('初始化对话框失败', error)
    } finally {
      isInitializing.value = false
    }
  }

  // 监听对话框显示状态
  watch(
    () => props.modelValue,
    async newVal => {
      if (newVal && props.roleId) {
        // 重置状态
        state.formData = deepCloneFormData(DEFAULT_FORM_DATA)
        state.organizationTreeOptionsMap.clear()
        state.organizationQueryMap = {}
        state.organizationCascadeSelectionMap = {}
        state.organizationDefaultCheckedKeysMap.clear()
        state.organizationDefaultExpandedKeysMap.clear()
        organizationTreeRefMap.value.clear()

        // 初始化对话框
        await nextTick()
        await initDialog()
      }
    },
    { immediate: false }
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
