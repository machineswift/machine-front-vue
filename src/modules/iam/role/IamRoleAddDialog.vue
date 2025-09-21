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
          <el-radio v-for="option in state.roleTypes" :key="option.code" :value="option.code">
            {{ option.message }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="数据权限" prop="type">
        <el-radio-group v-model="state.formData.dataPermissionRule.scopeCode">
          <el-radio v-for="option in state.dataPermissionScopeTypes" :key="option.code" :value="option.code">
            {{ option.message }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="state.formData.dataPermissionRule.scopeCode === 'CUSTOM'">
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
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:AUTH:ROLE:CREATE']">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { ref, computed, reactive, watch } from 'vue'
  import { ElMessage, ElTreeV2 } from 'element-plus'
  import { IamRoleApi } from '@/modules/iam/role/api/IamRole.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { DataPermissionRuleDto, DataPermissionRuleOrganizationNodeDto } from '@/modules/common/types/CommonIam.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'

  // 常量定义
  const DEFAULT_FORM_DATA = {
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
  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const formRef = ref()
  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())

  const state = reactive({
    submitting: false,
    //枚举信息
    roleTypes: [] as Array<{ code: string; message: string }>,
    dataPermissionScopeTypes: [] as Array<{ code: string; message: string }>,
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,

    //组织树
    organizationTreeOptionsMap: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),

    //组织树状态信息
    organizationQueryMap: {} as Record<string, string>,
    organizationCascadeSelectionMap: {} as Record<string, boolean>,
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
      ]
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

  // 加载组织树数据
  const loadOrganizationTreeData = async (option: IamDictionaryEnumInfoResponse) => {
    if (state.organizationTreeOptionsMap.has(option.code)) return

    //查询组织数据
    const res = await IamOrganizationApi.treeSimple({ type: option.code })
    state.organizationTreeOptionsMap.set(option.code, [res])

    //设置默认展开的节点
    const treeData = state.organizationTreeOptionsMap.get(option.code)
    state.organizationDefaultExpandedKeysMap.set(
      option.code,
      treeData.map(root => root.id)
    )
  }

  // 表单提交
  const handleSubmit = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      // 清空之前的选中数据
      state.formData.dataPermissionRule.organizationNodeMap.clear()

      // 处理每个组织类型的选中数据
      for (const option of state.organizationTypeOptions) {
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
          if (treeData) {
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

      await IamRoleApi.create({
        type: state.formData.type,
        name: state.formData.name,
        description: state.formData.description || undefined,
        dataPermissionRule: {
          ...state.formData.dataPermissionRule,
          organizationNodeMap: Object.fromEntries(state.formData.dataPermissionRule.organizationNodeMap)
        }
      })

      ElMessage.success('添加成功')
      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('添加角色失败', error)
    } finally {
      state.submitting = false
    }
  }

  /**
   * 重置表单状态
   */
  const resetForm = () => {
    formRef.value?.resetFields()
    state.formData = { ...DEFAULT_FORM_DATA }
    state.organizationQueryMap = {}

    // 重置父子联动状态
    state.organizationTypeOptions.forEach(option => {
      state.organizationCascadeSelectionMap[option.code] = true
    })

    // 清除所有树形控件的选中状态
    organizationTreeRefMap.value.forEach(treeRef => {
      treeRef?.setCheckedKeys([])
    })
  }

  /**
   * 处理对话框关闭事件
   */
  const handleDialogClosed = () => {
    resetForm()
    state.submitting = false
  }

  // 监听数据权限范围变化
  watch(
    () => state.formData.dataPermissionRule.scopeCode,
    async scopeCode => {
      if (scopeCode === 'CUSTOM') {
        for (const option of state.organizationTypeOptions) {
          await loadOrganizationTreeData(option)
        }
      }
    },
    { immediate: false }
  )

  watch(
    [() => props.modelValue],
    async ([modelValue]) => {
      if (modelValue) {
        const [roleTypes, organizationTypeOptions, dataPermissionScopeTypes] = await Promise.all([
          enumStore.getEnumDataAsync('IamRoleTypeEnum'),
          enumStore.getEnumDataAsync('IamOrganizationTypeEnum'),
          enumStore.getEnumDataAsync('IamDataPermissionScopeTypeEnum')
        ])

        state.roleTypes = roleTypes
        state.organizationTypeOptions = organizationTypeOptions
        state.dataPermissionScopeTypes = dataPermissionScopeTypes

        // 设置默认父子联动
        state.organizationTypeOptions.forEach(option => {
          state.organizationCascadeSelectionMap[option.code] = true
        })
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
