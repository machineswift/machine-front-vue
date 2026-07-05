<template>
  <el-drawer
    v-model="state.visible"
    :before-close="handleDrawerClose"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    size="60%"
    style="height: 80vh; top: 5vh"
  >
    <template #header>
      <h4>菜单数据权限</h4>
      <el-progress v-if="state.loading" :percentage="state.loadProgress" :stroke-width="2" :show-text="false" />
    </template>

    <template #default>
      <el-skeleton :loading="state.loading" animated :rows="10">
        <el-tabs v-if="state.currentMenuPermissionNode?.dataPermissionMetaList?.length" type="border-card">
          <el-tab-pane v-for="meta in state.currentMenuPermissionNode.dataPermissionMetaList" :key="meta.functionCode" :label="meta.functionName">
            <el-radio-group v-model="state.currentMenuPermissionSelectedScopes[meta.functionCode]" :disabled="props.mode === 'view'">
              <el-radio v-for="scope in meta.scopeList" :key="scope.scopeCode" :value="scope.scopeCode">
                {{ scope.scopeName }}
              </el-radio>
            </el-radio-group>

            <template v-if="state.currentMenuPermissionSelectedScopes[meta.functionCode] === 'CUSTOM'">
              <el-tabs type="border-card" class="custom-tabs">
                <el-tab-pane v-for="option in props.organizationTypeOptions" :key="option.code" :label="option.message">
                  <div class="tab-header">
                    <el-input
                      :value="getOrganizationQuery(meta.functionCode, option.code)"
                      @input="val => handleOrganizationQueryChange(meta.functionCode, option.code, val)"
                      placeholder="请输入关键字"
                      clearable
                      class="search-input"
                    />

                    <el-checkbox
                      :checked="getOrganizationCascadeSelection(meta.functionCode, option.code)"
                      @change="val => handleOrganizationCascadeSelectionChange(meta.functionCode, option.code, val)"
                    >
                      父子联动
                    </el-checkbox>
                  </div>
                  <el-tree-v2
                    :ref="el => setOrganizationTreeRef(meta.functionCode, option.code, el)"
                    :data="state.drawerOrganizationTreeOptionsMap.get(meta.functionCode)?.get(option.code) || []"
                    :props="state.organizationProps"
                    :filter-method="organizationFilterMethod"
                    :height="400"
                    show-checkbox
                    :check-strictly="!getOrganizationCascadeSelection(meta.functionCode, option.code)"
                    :default-expanded-keys="state.drawerOrganizationDefaultExpandedKeysMap.get(meta.functionCode)?.get(option.code) || []"
                    :default-checked-keys="state.drawerOrganizationDefaultCheckedKeysMap.get(meta.functionCode)?.get(option.code) || []"
                  />
                </el-tab-pane>
              </el-tabs>
            </template>
          </el-tab-pane>
        </el-tabs>
        <el-empty v-else description="暂无数据权限配置" />
      </el-skeleton>
    </template>

    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawerCancelClick" :disabled="state.loading">取消</el-button>
        <el-button type="primary" @click="drawerConfirmClick" :loading="state.submitting" :disabled="state.loading">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { cloneDeep } from 'lodash-es'
  import { reactive, ref, computed, nextTick, watch } from 'vue'
  import { type ElTreeV2 } from 'element-plus'
  import { TreeDataUtil } from '@/common/utils/TreeData.util'
  import type { IamPermissionTreeExpandResponseVo } from '@/modules/iam/permission/type/IamPermission.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'

  interface OrganizationNode {
    selectType: 'SELF' | 'SELF_AND_SUB'
    organizationIdSet: string[]
  }

  interface DataPermissionRuleDto {
    functionCode: string
    scopeCode: string
    organizationNodeMap: Map<string, OrganizationNode>
  }

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    mode: { type: String as () => 'edit' | 'view', default: 'edit' },
    node: { type: Object as () => IamPermissionTreeExpandResponseVo | null, default: null },
    organizationTypeOptions: { type: Array as () => Array<{ code: string; message: string }>, required: true },
    organizationTreeOptionsMap: { type: Map<string, IamOrganizationSimpleTreeResponseVo[]>, required: true },
    dataPermissionRuleMap: {
      type: Map<string, DataPermissionRuleDto[]>,
      required: true,
      validator: (map: Map<string, string[]>) => {
        return Array.from(map.values()).every(rules =>
          rules.every(rule => rule.functionCode && rule.scopeCode && (rule.organizationNodeMap instanceof Map || typeof rule.organizationNodeMap === 'object'))
        )
      }
    }
  })

  const emit = defineEmits(['update:modelValue', 'update:dataPermissionRuleMap'])

  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    loadProgress: 0,

    // 组织树状态
    drawerOrganizationQueryMap: new Map<string, Map<string, string>>(),
    drawerOrganizationCascadeSelectionMap: new Map<string, Map<string, boolean>>(),
    drawerOrganizationDefaultExpandedKeysMap: new Map<string, Map<string, string[]>>(),
    drawerOrganizationDefaultCheckedKeysMap: new Map<string, Map<string, string[]>>(),
    drawerOrganizationTreeOptionsMap: new Map<string, Map<string, IamOrganizationSimpleTreeResponseVo[]>>(),

    // 当前节点状态
    currentMenuPermissionNode: null as IamPermissionTreeExpandResponseVo | null,
    currentMenuPermissionSelectedScopes: {} as Record<string, string>,

    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  // 组织树操作方法
  const getOrganizationQuery = (functionCode: string, orgType: string): string => {
    return state.drawerOrganizationQueryMap.get(functionCode)?.get(orgType) || ''
  }

  const getOrganizationCascadeSelection = (functionCode: string, orgType: string): boolean => {
    return state.drawerOrganizationCascadeSelectionMap.get(functionCode)?.get(orgType) ?? true
  }

  const handleOrganizationQueryChange = (functionCode: string, orgType: string, query: string) => {
    if (!state.drawerOrganizationQueryMap.has(functionCode)) {
      state.drawerOrganizationQueryMap.set(functionCode, new Map())
    }
    state.drawerOrganizationQueryMap.get(functionCode)?.set(orgType, query)

    const treeRef = organizationTreeRefMap.value.get(`${functionCode}-${orgType}`)
    if (treeRef) {
      treeRef.filter(query)
      if (query.trim() === '') {
        const expandedKeys = state.drawerOrganizationDefaultExpandedKeysMap.get(functionCode)?.get(orgType) || []
        treeRef.setExpandedKeys(expandedKeys)
      }
    }
  }

  const organizationFilterMethod = (query: string, node: IamOrganizationSimpleTreeResponseVo): boolean => {
    return !query || node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const handleOrganizationCascadeSelectionChange = (functionCode: string, orgType: string, val: boolean) => {
    if (!state.drawerOrganizationCascadeSelectionMap.has(functionCode)) {
      state.drawerOrganizationCascadeSelectionMap.set(functionCode, new Map())
    }
    state.drawerOrganizationCascadeSelectionMap.get(functionCode)?.set(orgType, val)
  }

  const setOrganizationTreeRef = (functionCode: string, orgType: string, el: InstanceType<typeof ElTreeV2> | null) => {
    if (!el) return
    organizationTreeRefMap.value.set(`${functionCode}-${orgType}`, el)
  }

  // 初始化方法
  const initializeDrawer = async () => {
    state.loadProgress = 0
    // 设置当前节点
    state.currentMenuPermissionNode = props.node
    state.currentMenuPermissionSelectedScopes = {}
    state.loadProgress = 30

    // 初始化数据
    if (props.node.dataPermissionMetaList) {
      await initializeMetaData()
      state.loadProgress = 70
    }

    // 应用保存的规则
    applySavedRules()
    state.loadProgress = 90

    // 刷新UI
    await nextTick()
    state.loadProgress = 100
  }

  const initializeMetaData = async () => {
    await Promise.all(
      props.node.dataPermissionMetaList!.map(async (meta, index) => {
        const functionCode = meta.functionCode

        // 初始化数据结构
        state.drawerOrganizationQueryMap.set(functionCode, new Map())
        state.drawerOrganizationCascadeSelectionMap.set(functionCode, new Map())
        state.drawerOrganizationTreeOptionsMap.set(functionCode, new Map())
        state.drawerOrganizationDefaultExpandedKeysMap.set(functionCode, new Map())
        state.drawerOrganizationDefaultCheckedKeysMap.set(functionCode, new Map())

        // 设置默认范围
        state.currentMenuPermissionSelectedScopes[functionCode] =
          meta.scopeList.find(scope => scope.scopeCode === 'ORG_AND_SUB')?.scopeCode || meta.scopeList[0]?.scopeCode || ''

        // 加载组织数据
        await initializeOrganizationData(functionCode)

        // 更新进度
        state.loadProgress = 30 + Math.floor((index / props.node.dataPermissionMetaList!.length) * 40)
      })
    )
  }

  const initializeOrganizationData = async (functionCode: string) => {
    await Promise.all(
      props.organizationTypeOptions.map(async option => {
        state.drawerOrganizationCascadeSelectionMap.get(functionCode)?.set(option.code, true)

        const organizationTreeRes = cloneDeep(props.organizationTreeOptionsMap.get(option.code) || [])
        state.drawerOrganizationTreeOptionsMap.get(functionCode).set(option.code, organizationTreeRes)

        const organizationTreeData = state.drawerOrganizationTreeOptionsMap.get(functionCode).get(option.code)
        const defaultExpandedKeys = organizationTreeData?.length > 0 ? [organizationTreeData[0].id] : []
        state.drawerOrganizationDefaultExpandedKeysMap.get(functionCode).set(option.code, defaultExpandedKeys || [])
      })
    )
  }

  const applySavedRules = () => {
    const menuId = props.node.id
    if (!props.dataPermissionRuleMap.has(menuId)) return

    const rules = props.dataPermissionRuleMap.get(menuId)
    props.node.dataPermissionMetaList?.forEach(meta => {
      const functionCode = meta.functionCode
      const rule = rules?.find(r => r.functionCode === functionCode)

      if (rule?.scopeCode === 'CUSTOM' && rule.organizationNodeMap) {
        state.currentMenuPermissionSelectedScopes[functionCode] = rule.scopeCode
        applyCustomRules(functionCode, rule.organizationNodeMap)
      }
    })
  }

  const applyCustomRules = (functionCode: string, orgNodeMap: Map<string, OrganizationNode> | Record<string, OrganizationNode>) => {
    const normalizedMap = orgNodeMap instanceof Map ? orgNodeMap : new Map(Object.entries(orgNodeMap))

    props.organizationTypeOptions.forEach(option => {
      const orgType = option.code
      const orgNode = normalizedMap.get(orgType)

      if (orgNode?.organizationIdSet?.length) {
        const treeData = state.drawerOrganizationTreeOptionsMap.get(functionCode)?.get(orgType) || []

        // 设置父子联动状态
        state.drawerOrganizationCascadeSelectionMap.get(functionCode)?.set(orgType, orgNode.selectType === 'SELF_AND_SUB')

        // 设置选中状态
        const checkedKeys =
          orgNode.selectType === 'SELF_AND_SUB' ? TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, orgNode.organizationIdSet) : orgNode.organizationIdSet
        state.drawerOrganizationDefaultCheckedKeysMap.get(functionCode).set(orgType, checkedKeys)

        // 设置展开状态
        const rootNodeIds = treeData.map(root => root.id)
        const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, orgNode.organizationIdSet)
        const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !orgNode.organizationIdSet.includes(node.id)).map(node => node.id)
        state.drawerOrganizationDefaultExpandedKeysMap.get(functionCode).set(orgType, expandedKeys)
      }
    })
  }

  // 抽屉关闭时倾立状态数据
  const handleDrawerClose = () => {
    //清理组织树相关状态
    state.drawerOrganizationQueryMap.clear()
    state.drawerOrganizationCascadeSelectionMap.clear()
    state.drawerOrganizationDefaultExpandedKeysMap.clear()
    state.drawerOrganizationDefaultCheckedKeysMap.clear()
    state.drawerOrganizationTreeOptionsMap.clear()

    //重置当前节点状态
    state.currentMenuPermissionNode = null
    state.currentMenuPermissionSelectedScopes = {}

    //清理DOM引用
    organizationTreeRefMap.value.clear()

    //重置加载状态
    state.loading = false
    state.submitting = false
    state.loadProgress = 0
    state.visible = false
  }

  const drawerCancelClick = () => {
    handleDrawerClose()
  }

  const drawerConfirmClick = async () => {
    if (!state.currentMenuPermissionNode) {
      handleDrawerClose()
      return
    }

    state.submitting = true
    try {
      const menuId = state.currentMenuPermissionNode.id
      const rules: DataPermissionRuleDto[] = []

      state.currentMenuPermissionNode.dataPermissionMetaList?.forEach(meta => {
        const functionCode = meta.functionCode
        const scopeCode = state.currentMenuPermissionSelectedScopes[functionCode]
        const organizationCascadeSelectionMap = state.drawerOrganizationCascadeSelectionMap.get(functionCode)

        const rule: DataPermissionRuleDto = {
          functionCode,
          scopeCode,
          organizationNodeMap: new Map()
        }

        if (scopeCode === 'CUSTOM') {
          props.organizationTypeOptions.forEach(option => {
            const orgType = option.code
            const treeRef = organizationTreeRefMap.value.get(`${functionCode}-${orgType}`)
            const cascadeSelection = organizationCascadeSelectionMap?.get(orgType) ?? true

            if (treeRef) {
              const checkedNodes = treeRef.getCheckedNodes() as IamOrganizationSimpleTreeResponseVo[]
              const checkedKeys = checkedNodes.map(node => node.id)

              if (checkedKeys.length) {
                rule.organizationNodeMap.set(orgType, {
                  selectType: cascadeSelection ? 'SELF_AND_SUB' : 'SELF',
                  organizationIdSet: cascadeSelection
                    ? TreeDataUtil.getRootNodesFromSelected(props.organizationTreeOptionsMap.get(orgType) || [], checkedKeys).map(node => node.id)
                    : checkedKeys
                })
              }
            }
          })
        }
        rules.push(rule)
      })

      const newDataPermissionRuleMap = new Map(props.dataPermissionRuleMap)
      newDataPermissionRuleMap.set(menuId, rules)
      emit('update:dataPermissionRuleMap', newDataPermissionRuleMap)
      handleDrawerClose()
    } finally {
      state.submitting = false
    }
  }

  // 监听props变化
  watch(
    () => [props.modelValue, props.node],
    async ([modelValue, node]) => {
      if (modelValue && node) {
        try {
          state.loading = true
          await initializeDrawer()
          state.loading = false
          state.visible = true
        } catch {
          state.loading = false
          state.visible = false
        }
      } else {
        state.visible = false
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .custom-tabs {
    margin-top: 10px;
    transition: all 0.3s ease;

    .tab-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      gap: 12px;

      .search-input {
        width: 200px;
        transition: width 0.3s;

        &:focus {
          width: 250px;
        }
      }
    }
  }
</style>
