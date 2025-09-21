<template>
  <el-dialog
    v-model="state.dialogVisible"
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

      <el-form-item label="数据权限" prop="type">
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
              :data="state.organizationTreeOptionsMap.get(option.code)"
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
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['SYSTEM:AUTH:ROLE:UPDATE']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { ElMessage, ElTreeV2 } from 'element-plus'
  import { ref, watch, reactive, computed } from 'vue'
  import { IamRoleApi } from '@/modules/iam/role/api/IamRole.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { DataPermissionRuleDto, DataPermissionRuleOrganizationNodeDto } from '@/modules/common/types/CommonIam.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'

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

  const formRef = ref()
  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),

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

    formData: { ...DEFAULT_FORM_DATA },
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    rules: {
      type: [{ required: true, message: '请选择角色类型', trigger: 'blur' }],
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 32, message: '长度在2到32个字符', trigger: 'blur' }
      ],
      code: [{ pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }],
      description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
    }
  })

  // 组织树相关方法
  const setOrganizationTreeRef = (code: string, el: InstanceType<typeof ElTreeV2>) => {
    if (!el) return

    organizationTreeRefMap.value.set(code, el)
    if (state.organizationDefaultExpandedKeysMap.has(code)) {
      el.setExpandedKeys(state.organizationDefaultExpandedKeysMap.get(code)!)
    }
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
        treeRef.setExpandedKeys(state.organizationDefaultExpandedKeysMap.get(orgType) || [])
      }
    }
  }, 300)

  const organizationFilterMethod = (query: string, node: IamOrganizationSimpleTreeResponseVo) => {
    return !query || node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleCheckChange = (_orgType: string, _checkedNodes: IamOrganizationSimpleTreeResponseVo[]) => {
    // 留空处理节点选择变化
  }

  // 设置已选中的组织节点
  const setCheckedOrganizationNodes = async () => {
    if (!state.formData.dataPermissionRule.organizationNodeMap) {
      return
    }

    const organizationNodeMap: Map<string, string[]> = state.detailData.dataPermissionRule.organizationNodeMap
    state.organizationDefaultCheckedKeysMap = new Map()

    Object.entries(organizationNodeMap).forEach(([orgType, nodeDto]) => {
      //父子联动模式
      state.organizationCascadeSelectionMap[orgType] = nodeDto.selectType === 'SELF_AND_SUB'

      if (nodeDto.organizationIdSet?.length) {
        //设置选中节点
        const treeData = state.organizationTreeOptionsMap.get(orgType)
        if (nodeDto.selectType === 'SELF_AND_SUB') {
          const allChildrenIds = TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, nodeDto.organizationIdSet)
          state.organizationDefaultCheckedKeysMap.set(orgType, allChildrenIds)
        } else {
          state.organizationDefaultCheckedKeysMap.set(orgType, nodeDto.organizationIdSet)
        }

        //设置展开的节点
        const rootNodeIds = treeData.map(root => root.id)
        const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, nodeDto.organizationIdSet)
        const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !nodeDto.organizationIdSet.includes(node.id)).map(node => node.id)
        state.organizationDefaultExpandedKeysMap.set(orgType, expandedKeys)
      }
    })
  }

  const handleDialogClosed = () => {
    // 重置表单数据
    state.formData = { ...DEFAULT_FORM_DATA }

    // 清理组织树相关状态
    state.organizationTreeOptionsMap.clear()
    state.organizationQueryMap = {}
    state.organizationCascadeSelectionMap = {}
    state.organizationDefaultCheckedKeysMap.clear()
    state.organizationDefaultExpandedKeysMap.clear()

    // 清除组织树引用
    organizationTreeRefMap.value.clear()

    // 重置表单验证状态
    formRef.value?.resetFields()
  }

  // 表单提交
  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      state.submitting = true

      // 处理数据权限规则
      if (state.formData.dataPermissionRule.scopeCode === 'CUSTOM') {
        // 清空之前的选中数据
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
            if (treeData) {
              organizationNodeDto.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(treeData, checkedKeys).map(node => node.id)
            }
          } else {
            organizationNodeDto.organizationIdSet = checkedKeys
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
      state.dialogVisible = false
    } catch (error) {
      console.error('修改角色失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 获取角色详情
  const fetchData = async () => {
    try {
      state.loading = true
      const res = await IamRoleApi.detail({ id: props.roleId })

      // 转换organizationNodeMap为Map格式
      const organizationNodeMap = new Map<string, DataPermissionRuleOrganizationNodeDto>()
      if (res.dataPermissionRule?.organizationNodeMap) {
        Object.entries(res.dataPermissionRule.organizationNodeMap).forEach(([key, value]) => {
          organizationNodeMap.set(key, value as DataPermissionRuleOrganizationNodeDto)
        })
      }

      //初始化状态数据
      Object.assign(state.formData, {
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
      })

      // 如果是自定义数据权限，加载组织树数据
      if (state.formData.dataPermissionRule.scopeCode === 'CUSTOM') {
        // 设置已选中的组织节点
        await setCheckedOrganizationNodes()
      }
    } catch (error) {
      console.error('获取角色详情失败', error)
    } finally {
      state.loading = false
    }
  }

  // 监听对话框显示状态
  watch(
    [() => props.modelValue, () => props.roleId],
    async ([modelValue, roleId]) => {
      if (modelValue && roleId) {
        //初始化状态数据
        const [roleTypes, organizationTypeOptions, dataPermissionScopeTypes] = await Promise.all([
          enumStore.getEnumDataAsync('IamRoleTypeEnum'),
          enumStore.getEnumDataAsync('IamOrganizationTypeEnum'),
          enumStore.getEnumDataAsync('IamDataPermissionScopeTypeEnum')
        ])
        state.roleTypes = roleTypes
        state.organizationTypeOptions = organizationTypeOptions
        state.dataPermissionScopeTypes = dataPermissionScopeTypes

        //初始化组织树树数据
        await Promise.all(
          state.organizationTypeOptions.map(async option => {
            const organizationTreeRes = await IamOrganizationApi.treeSimple({ type: option.code })
            state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
          })
        )

        // 设置默认父子联动
        state.organizationTypeOptions.forEach(option => {
          state.organizationCascadeSelectionMap[option.code] = true
        })

        // 设置默认展开的节点
        state.organizationTypeOptions.forEach(option => {
          const treeData = state.organizationTreeOptionsMap.get(option.code)
          state.organizationDefaultExpandedKeysMap.set(
            option.code,
            treeData.map(root => root.id)
          )
        })

        await fetchData()
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
      margin-bottom: 10px;

      .search-input {
        width: 50%;
      }
    }
  }
</style>
