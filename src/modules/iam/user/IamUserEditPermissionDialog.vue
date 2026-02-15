<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="修改用户权限"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-tabs type="border-card" :loading="state.loading" class="custom-tabs">
      <!-- 组织关系 -->
      <el-tab-pane label="组织关系">
        <el-tabs type="border-card" class="custom-organization-tabs">
          <el-tab-pane v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message">
            <div class="tab-header">
              <el-input
                v-model="state.organizationQueryMap[option.code]"
                placeholder="请输入关键字"
                @input="val => handleOrganizationQueryChange(option.code, val)"
                clearable
                class="search-input"
              />
            </div>
            <el-tree-v2
              :key="`tree-${option.code}-${state.organizationTreeOptionsMap.get(option.code)?.length || 0}`"
              :ref="el => setOrganizationTreeRef(option.code, el)"
              :data="state.organizationTreeOptionsMap.get(option.code) || []"
              :props="state.organizationProps"
              :filter-method="organizationFilterMethod"
              @check="(node, data) => handleOrganizationCheckChange(option.code, data.checkedNodes)"
              :default-expanded-keys="state.organizationDefaultExpandedKeysMap.get(option.code) || []"
              :default-checked-keys="state.organizationDefaultCheckedKeysMap.get(option.code) || []"
              :height="450"
              show-checkbox
            />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 角色关系 -->
      <el-tab-pane label="角色关系">
        <el-tabs type="border-card" class="custom-role-tabs">
          <el-tab-pane v-for="option in state.roleTypeOptions" :key="option.code" :label="option.message">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="showRoleSelector(option)" v-hasPermission="['SYSTEM:AUTH:ROLE:PAGE_SIMPLE']">添加角色</el-button>
            </div>
            <el-table :data="getFilteredRoleList(option.code)" border style="width: 100%" height="450">
              <el-table-column prop="name" label="角色名称" width="180" align="center" fixed="left" />
              <el-table-column prop="code" label="角色编码" width="180" align="center" />
              <el-table-column prop="type" label="角色类型" width="96" align="center">
                <template #default="{ row }">
                  {{ getRoleTypeLabel(row.type) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="72" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'ENABLE' ? 'success' : 'danger'">
                    {{ row.status === 'ENABLE' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.sort" :min="0" :controls="false" :precision="0" @blur="handleSortChange(row)" class="sort-input" />
                </template>
              </el-table-column>
              <el-table-column label="关联门店" v-if="option.code === 'SHOP'" align="center" width="280" fixed="right">
                <template #default="{ row }">
                  <el-select
                    v-model="row.shopIdList"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="选择门店"
                    @change="val => handleShopSelectChange(val, row)"
                  >
                    <el-option v-for="shop in row.shopList" :key="shop.id" :label="shop.name" :value="shop.id" />
                    <template #prefix>
                      <el-button size="small" type="primary" plain @click.stop="() => showShopSelectorDialog(row)" style="margin-right: 8px; height: 24px">
                        选择
                      </el-button>
                    </template>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="default" @click="handleDeleteRole(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="state.submitting" v-hasPermission="['SYSTEM:AUTH:USER:UPDATE_PERMISSION']">保存</el-button>
    </template>
  </el-dialog>

  <IamRoleQuickSelectDialog
    v-model="state.showRoleSelector"
    :title="`选择${state.currentTabRoleLabel}角色`"
    :multiple="false"
    :selected-roles="getCurrentTabRoles()"
    :role-type="state.currentTabRoleType"
    @confirm="handleRoleSelect"
  />
  <DataShopQuickSelectDialog
    v-model="state.showShopSelector"
    title="选择关联门店"
    :multiple="true"
    :selected-shops="state.currentEditingRole?.shopList || []"
    @confirm="handleShopSelect"
  />
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { ref, reactive, watch, computed, nextTick } from 'vue'
  import { ElMessage, ElMessageBox, ElTreeV2 } from 'element-plus'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { IamUserApi } from '@/modules/iam/user/api/IamUser.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import type { DataShopSimpleListResponseVo } from '@/modules/data/shop/type/DataShop.type'
  import type { IamDictionaryEnumInfoResponse } from '@/modules/iam/dictionary/type/IamDictionaryEnum.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import type { IamRoleDetailResponseVo, IamRoleSimpleListResponseVo } from '@/modules/iam/role/type/IamRole.type'
  import type { IamUserDetailResponseVo, IamUserRoleInfoResponse, IamUserRoleUpdateRequestVo } from '@/modules/iam/user/type/IamUser.type'
  import IamRoleQuickSelectDialog from '@/modules/iam/role/IamRoleQuickSelectDialog.vue'
  import DataShopQuickSelectDialog from '@/modules/data/shop/DataShopQuickSelectDialog.vue'

  const enumStore = useDictionaryEnumStore()

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const organizationTreeRefMap = ref<Map<string, InstanceType<typeof ElTreeV2>>>(new Map())

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),

    loading: false,
    submitting: false,
    //枚举状态
    roleTypeOptions: [] as Array<{ code: string; message: string }>,
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,

    //组织树状态
    organizationQueryMap: {} as Record<string, string>,
    organizationDefaultCheckedKeysMap: new Map<string, string[]>(),
    organizationDefaultExpandedKeysMap: new Map<string, string[]>(),
    organizationTreeOptionsMap: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),

    //用户关联角色信息
    showRoleSelector: false,
    currentTabRoleType: 'COMPANY',
    currentTabRoleLabel: '',
    userRoleInfoList: [] as IamUserRoleInfoResponse[],

    // 门店角色
    showShopSelector: false,
    currentEditingRole: null as IamUserRoleInfoResponse | null,

    //表单数据
    formData: {
      id: '',
      organizationIdMap: new Map<string, string[]>(),
      userRoleInfoList: [] as IamUserRoleUpdateRequestVo[]
    },
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  // 获取角色类型标签
  const getRoleTypeLabel = (type: string) => {
    const enumItem = enumStore.getEnumItemByCodeSync('IamRoleTypeEnum', type)
    return enumItem?.message || type
  }

  const handleSortChange = (role: IamRoleDetailResponseVo) => {
    // 确保排序值不为空，如果为空则设置为0
    if (role.sort === null || role.sort === undefined || role.sort === '') {
      role.sort = 0
      ElMessage.warning('排序值不能为空，已自动设置为0')
    }

    // 确保是数字类型
    role.sort = Number(role.sort)

    // 更新角色列表中的排序值
    state.userRoleInfoList = state.userRoleInfoList.sort((a, b) => (b.sort || 0) - (a.sort || 0))
  }

  // 获取当前标签页的角色列表
  const getCurrentTabRoles = () => {
    return state.userRoleInfoList.filter(role => role.type === state.currentTabRoleType)
  }

  // 组织树相关方法
  const setOrganizationTreeRef = (code: string, el: InstanceType<typeof ElTreeV2>) => {
    if (!el) return
    organizationTreeRefMap.value.set(code, el)
    // 移除这里的 setExpandedKeys，因为已经使用了 default-expanded-keys
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

  const handleOrganizationCheckChange = (orgType: string, checkedNodes: IamOrganizationSimpleTreeResponseVo[]) => {
    if (checkedNodes?.length > 0) {
      state.formData.organizationIdMap.set(
        orgType,
        TreeDataUtil.getRootNodesFromSelected(
          state.organizationTreeOptionsMap.get(orgType),
          checkedNodes.map(r => r.id)
        ).map(r => r.id)
      )
    } else {
      state.formData.organizationIdMap.set(orgType, [])
    }
  }

  // 获取过滤后的角色列表
  const getFilteredRoleList = (roleType: string) => {
    return state.userRoleInfoList.filter(role => role.type === roleType)
  }

  const handleDeleteRole = async (role: IamRoleDetailResponseVo): Promise<void> => {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗?`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    state.userRoleInfoList = state.userRoleInfoList.filter(item => item.id !== role.id)
    ElMessage.success('角色删除成功')
  }

  const showRoleSelector = (option: IamDictionaryEnumInfoResponse) => {
    state.currentTabRoleType = option.code
    state.currentTabRoleLabel = option.message
    state.showRoleSelector = true
  }

  const handleRoleSelect = (roles: IamRoleSimpleListResponseVo[]) => {
    if (!roles || roles.length === 0) return

    const selectedRole = roles[0]

    // 检查角色类型是否匹配当前标签页
    if (selectedRole.type !== state.currentTabRoleType) {
      ElMessage.warning(`请选择${state.currentTabRoleLabel}类型的角色`)
      return
    }

    // 检查是否已经存在该角色
    const roleExists = state.userRoleInfoList.some(role => role.id === selectedRole.id)

    if (roleExists) {
      ElMessage.warning(`角色 ${selectedRole.name} 已存在`)
      return
    }

    // 创建新的角色信息对象
    const newRoleInfo: IamUserRoleInfoResponse = {
      id: selectedRole.id,
      name: selectedRole.name,
      code: selectedRole.code,
      type: selectedRole.type,
      status: selectedRole.status,
      sort: 0,
      shopList: [],
      createTime: Date.now()
    }

    // 添加到用户角色列表
    state.userRoleInfoList = [...state.userRoleInfoList, newRoleInfo]
    ElMessage.success(`角色 ${selectedRole.name} 添加成功`)
  }

  // 添加方法
  const showShopSelectorDialog = (role: IamUserRoleInfoResponse) => {
    state.currentEditingRole = role
    state.showShopSelector = true
  }

  const handleShopSelect = (shops: DataShopSimpleListResponseVo[]) => {
    if (!state.currentEditingRole) {
      return
    }

    // 更新当前角色的门店列表
    state.currentEditingRole.shopList = [
      ...shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        code: shop.code,
        sort: 0
      }))
    ]
    state.currentEditingRole.shopIdList = state.currentEditingRole.shopList.map(shop => shop.id)

    state.showShopSelector = false
    ElMessage.success('门店选择成功')
  }

  const handleShopSelectChange = (newShopIds: string[], role: IamUserRoleInfoResponse) => {
    // 清空所有选项
    if (newShopIds.length === 0) {
      role.shopList = []
      role.shopIdList = []
      return
    }

    // 移除数据
    role.shopIdList = role.shopIdList.filter(id => newShopIds.includes(id))
    role.shopList = role.shopList.filter(shop => newShopIds.includes(shop.id))
  }

  const handleDialogClosed = () => {
    // 清理组织树相关状态
    state.organizationTreeOptionsMap.clear()
    state.organizationQueryMap = {}
    state.organizationDefaultCheckedKeysMap.clear()
    state.organizationDefaultExpandedKeysMap.clear()

    // 重置角色相关数据
    state.userRoleInfoList = []
    state.roleTypeOptions = []
    state.organizationTypeOptions = []

    // 清空表单数据
    state.formData = {
      id: '',
      organizationIdMap: new Map(),
      userRoleInfoList: []
    }

    // 清理DOM引用
    organizationTreeRefMap.value.clear()

    // 重置所有加载状态
    state.loading = false
    state.submitting = false
    state.showRoleSelector = false
  }

  // 提交修改
  const handleSubmit = async () => {
    try {
      state.submitting = true

      await IamUserApi.updatePermission({
        id: props.userId,
        organizationIdMap: Object.fromEntries(state.formData.organizationIdMap),
        userRoleInfoList: state.userRoleInfoList.map(roleInfo => ({
          roleId: roleInfo.id,
          sort: roleInfo.sort,
          shopIdSet: roleInfo.shopList?.map(shop => shop.id) || []
        }))
      })

      ElMessage.success('权限修改成功')
      emit('success')
      state.dialogVisible = false
    } catch (error) {
      console.error('修改权限失败:', error)
    } finally {
      state.submitting = false
    }
  }

  // 初始化数据
  const initData = async () => {
    state.loading = true
    try {
      // 查询用户详情
      const userDetail: IamUserDetailResponseVo = await IamUserApi.detail({ id: props.userId })

      state.formData = {
        id: userDetail.id,
        organizationIdMap: userDetail.organizationIdMap ? new Map(Object.entries(userDetail.organizationIdMap)) : new Map()
      }
      state.userRoleInfoList = (userDetail.userRoleInfoList || [])
        .map(role => ({
          ...role,
          shopIdList: role.shopList?.map(shop => shop.id) || []
        }))
        .sort((a, b) => (b.sort || 0) - (a.sort || 0))

      // 设置组织状态数据 - 使用 nextTick 避免递归更新
      await nextTick()
      state.organizationTypeOptions?.forEach(option => {
        const orgType = option.code
        const treeData = state.organizationTreeOptionsMap.get(orgType)
        if (!treeData || treeData.length === 0) return

        const organizationIdSet: string[] = state.formData.organizationIdMap.get(orgType) || []

        // 设置选中状态
        if (organizationIdSet?.length > 0) {
          const checkedKeys = TreeDataUtil.getAllChildrenIdsIncludingSelf(treeData, organizationIdSet)
          state.organizationDefaultCheckedKeysMap.set(orgType, checkedKeys)
        } else {
          state.organizationDefaultCheckedKeysMap.set(orgType, [])
        }

        // 设置展开状态
        if (organizationIdSet?.length > 0) {
          const rootNodeIds = treeData.map(root => root.id)
          const allParentNodes = TreeDataUtil.getAllParentNodes(treeData, organizationIdSet)
          const expandedKeys = allParentNodes.filter(node => rootNodeIds.includes(node.id) || !organizationIdSet.includes(node.id)).map(node => node.id)
          state.organizationDefaultExpandedKeysMap.set(orgType, expandedKeys)
        } else {
          // 如果没有选中项，至少展开根节点
          const rootNodeIds = treeData.map(root => root.id)
          state.organizationDefaultExpandedKeysMap.set(orgType, rootNodeIds)
        }
      })
    } catch (error) {
      console.error('初始化权限数据失败:', error)
      ElMessage.error('初始化权限数据失败')
    } finally {
      state.loading = false
    }
  }

  // 监听props变化
  watch(
    [() => props.modelValue, () => props.userId],
    async ([modelValue, userId]) => {
      if (modelValue && userId) {
        state.loading = true
        try {
          // 枚举状态数据
          const [roleTypeOptions, organizationTypeOptions] = await Promise.all([
            enumStore.getEnumDataAsync('IamRoleTypeEnum'),
            enumStore.getEnumDataAsync('IamOrganizationTypeEnum')
          ])
          state.roleTypeOptions = roleTypeOptions
          state.organizationTypeOptions = organizationTypeOptions

          // 初始化组织树数据
          await Promise.all(
            state.organizationTypeOptions.map(async option => {
              const organizationTreeRes = await IamOrganizationApi.treeSimple({ type: option.code })
              state.organizationTreeOptionsMap.set(option.code, [organizationTreeRes])
            })
          )

          // 等待 DOM 更新后再初始化数据，避免递归更新
          await nextTick()
          await initData()
        } catch (error) {
          console.error('加载权限数据失败:', error)
        } finally {
          state.loading = false
        }
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .custom-tabs {
    min-height: 640px;
    width: 100%;

    .custom-organization-tabs {
      .tab-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        .search-input {
          width: 50%;
        }
      }
    }

    .custom-role-tabs {
      .operation-buttons {
        margin-bottom: 10px;
      }
      .sort-input {
        width: 80px;
      }
    }

    .el-select {
      min-width: 240px;
      max-width: 240px;

      :deep(.el-select__selection) {
        flex-wrap: nowrap;
      }
    }
  }
</style>
