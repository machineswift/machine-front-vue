<template>
  <div class="material-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card class="box-card-tree-select">
          <div class="tree-toolbar">
            <el-input
              v-model="state.categoryQuery"
              placeholder="请输入关键字筛选分类"
              clearable
              @input="onCategoryQueryChanged"
              @keyup.enter="onCategoryQueryChanged"
              class="tree-toolbar-input"
            />
            <el-button type="primary" size="small" @click="showAddCategoryDialog()" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:CREATE']">
              添加
            </el-button>
          </div>
          <el-tree-v2
            ref="categoryTreeRef"
            :data="currentCategoryTreeOptions"
            :props="CATEGORY_TREE_PROPS"
            :filter-method="categoryFilterMethod"
            @check="handleCategoryCheck"
            show-checkbox
            :height="760"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span class="tree-node-label">{{ node.label }}</span>
                <div class="tree-node-actions">
                  <el-tooltip v-if="isCategoryVirtualNode(data)" content="虚拟节点不可操作" placement="top">
                    <span class="tree-node-actions-wrap">
                      <el-dropdown disabled trigger="click" @command="command => handleDropdownCommand(command, data)" placement="bottom-end">
                        <el-button type="primary" link class="tree-node-more-btn" @click.stop disabled>
                          <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="add" disabled>
                              <el-icon><Plus /></el-icon>
                              <span>添加子分类</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="edit" disabled>
                              <el-icon><Edit /></el-icon>
                              <span>修改</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="detail" disabled>
                              <el-icon><View /></el-icon>
                              <span>详情</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updateParent" disabled>
                              <el-icon><Connection /></el-icon>
                              <span>修改父分类</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided disabled>
                              <el-icon><Delete /></el-icon>
                              <span>删除</span>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </span>
                  </el-tooltip>
                  <el-dropdown v-else trigger="click" @command="command => handleDropdownCommand(command, data)" placement="bottom-end">
                    <el-button type="primary" link class="tree-node-more-btn" @click.stop>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="add" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:CREATE'])">
                          <el-icon><Plus /></el-icon>
                          <span>添加子分类</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="edit" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE'])">
                          <el-icon><Edit /></el-icon>
                          <span>修改</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="detail" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:DETAIL'])">
                          <el-icon><View /></el-icon>
                          <span>详情</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="updateParent" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE_PARENT'])">
                          <el-icon><Connection /></el-icon>
                          <span>修改父分类</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:DELETE'])">
                          <el-icon><Delete /></el-icon>
                          <span>删除</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
          </el-tree-v2>
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <transition name="slide-fade">
          <el-card class="box-card-form" v-show="state.showSearchCard">
            <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
              <div class="form-items-group">
                <el-form-item label="文件类型:" prop="fileTypeSet" class="form-item-responsive">
                  <el-select
                    v-model="state.searchForm.fileTypeSet"
                    placeholder="请选择文件类型"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    @change="handleFileTypeChange"
                    style="width: 100%"
                  >
                    <el-option v-for="option in state.fileTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="素材标题:" prop="title" class="form-item-responsive">
                  <el-input v-model="state.searchForm.title" placeholder="请输入素材标题" clearable @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="素材名称:" prop="name" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="请输入素材名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="处理状态:" prop="processStatus" class="form-item-responsive">
                  <el-select v-model="state.searchForm.processStatus" placeholder="选择处理状态" clearable>
                    <el-option v-for="option in state.processStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="业务状态:" prop="businessStatus" class="form-item-responsive">
                  <el-select v-model="state.searchForm.businessStatus" placeholder="选择业务状态" clearable>
                    <el-option v-for="option in state.businessStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="审核状态:" prop="auditStatus" class="form-item-responsive">
                  <el-select v-model="state.searchForm.auditStatus" placeholder="选择审核状态" clearable>
                    <el-option v-for="option in state.auditStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="创建人:" prop="createUserIdSet" class="form-item-responsive user-selector">
                  <el-select
                    v-model="selectedCreateUserIds"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择创建人"
                    @remove-tag="removeQueryCreateUser"
                    @clear="clearSelectorAllCreateUsers"
                  >
                    <el-option v-for="user in state.selectedCreateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                    <template #prefix>
                      <el-button
                        size="small"
                        type="primary"
                        plain
                        @click.stop="showCreateUserSelectorDialog"
                        v-hasPermission="['SYSTEM:AUTH:USER:PAGE_SIMPLE']"
                        style="margin-right: 8px; height: 24px"
                      >
                        选择
                      </el-button>
                    </template>
                  </el-select>
                </el-form-item>
                <el-form-item label="修改人:" prop="updateUserIdSet" class="form-item-responsive user-selector">
                  <el-select
                    v-model="selectedUpdateUserIds"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择修改人"
                    @remove-tag="removeQueryUpdateUser"
                    @clear="clearSelectorAllUpdateUsers"
                  >
                    <el-option v-for="user in state.selectedUpdateUsers" :key="user.id" :label="user.name || user.username" :value="user.id" />
                    <template #prefix>
                      <el-button
                        size="small"
                        type="primary"
                        plain
                        @click.stop="showUpdateUserSelectorDialog"
                        v-hasPermission="['SYSTEM:AUTH:USER:PAGE_SIMPLE']"
                        style="margin-right: 8px; height: 24px"
                      >
                        选择
                      </el-button>
                    </template>
                  </el-select>
                </el-form-item>
                <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive form-item-date-picker">
                  <el-date-picker
                    v-model="state.searchForm.createTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="x"
                    @change="handleCreateTimeChange"
                  />
                </el-form-item>
                <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive form-item-date-picker">
                  <el-date-picker
                    v-model="state.searchForm.updateTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="x"
                    @change="handleUpdateTimeChange"
                  />
                </el-form-item>
              </div>
              <div class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSearch" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>
        </transition>

        <el-card class="box-card-data">
          <div class="operation-buttons">
            <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:CREATE']">新增素材</el-button>
            <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
          </div>

          <el-table
            :data="state.tableData"
            row-key="id"
            border
            style="margin: 10px 0"
            v-loading="state.loading"
            :height="state.dataCardHeight"
            stripe
            highlight-current-row
            class="material-table"
          >
            <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
            <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
            <el-table-column prop="title" label="素材标题" align="center" width="160" fixed>
              <template #default="{ row }">
                <el-tooltip v-if="row.title" :content="row.title" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.title }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="缩略图" align="center" width="80">
              <template #default="{ row }">
                <template v-if="row.fileType === 'IMAGE' && row.attachmentId">
                  <el-image
                    v-if="state.thumbnailUrlMap[row.attachmentId]"
                    :src="state.thumbnailUrlMap[row.attachmentId]"
                    fit="cover"
                    class="list-thumb material-preview-image"
                    :preview-src-list="[state.thumbnailUrlMap[row.attachmentId]]"
                    preview-teleported
                    hide-on-click-modal
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                  />
                  <span v-else class="thumb-placeholder">加载中</span>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="fileType" label="文件类型" align="center" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getEnumLabel('DataFileTypeEnum', row.fileType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="processStatus" label="处理状态" align="center" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ getEnumLabel('DataMaterialProcessStatusEnum', row.processStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="businessStatus" label="业务状态" align="center" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getEnumLabel('DataMaterialBusinessStatusEnum', row.businessStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="审核状态" align="center" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getEnumLabel('DataMaterialAuditStatusEnum', row.auditStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分类" align="center" width="140">
              <template #default="{ row }">
                <template v-if="row.categoryIdSet && row.categoryIdSet.length">
                  <el-tag v-for="cid in row.categoryIdSet.slice(0, 2)" :key="cid" size="small" style="margin: 1px">{{ getCategoryName(cid) }}</el-tag>
                  <el-tag v-if="row.categoryIdSet.length > 2" size="small">+{{ row.categoryIdSet.length - 2 }}</el-tag>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createName" label="创建人" align="center" width="100">
              <template #default="{ row }">
                <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.createName }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="170">
              <template #default="{ row }">{{ formatTimestamp(row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="updateName" label="修改人" align="center" width="100">
              <template #default="{ row }">
                <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.updateName }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center" width="170">
              <template #default="{ row }">{{ formatTimestamp(row.updateTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button
                    size="small"
                    @click="showDetailDialog(row)"
                    :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL:DETAIL'])"
                    v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:DETAIL']"
                  >
                    详情
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="showEditDialog(row)"
                    :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL:UPDATE'])"
                    v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:UPDATE']"
                  >
                    编辑
                  </el-button>
                  <el-dropdown trigger="click" @command="command => handleMaterialDropdownCommand(command, row)" placement="bottom-end">
                    <el-button size="small" type="info">
                      更多
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="category" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:MATERIAL:UPDATE_CATEGORY'])">
                          <el-icon><Connection /></el-icon>
                          <span>修改分类</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :page-sizes="PAGE_SIZES"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            v-hasPermission="['SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']"
          />
        </el-card>

        <DataMaterialAddDialog v-model="state.dialog.add" @success="handleAddSuccess" />
        <DataMaterialDetailDialog v-model="state.dialog.detail" :materialId="state.currentMaterialId" :categoryNameMap="state.categoryNameMap" />
        <DataMaterialEditDialog v-model="state.dialog.edit" :materialId="state.currentMaterialId" @success="handleEditSuccess" />
        <DataMaterialCategoryDialog v-model="state.dialog.category" :materialId="state.currentMaterialId" @success="handleCategoryUpdateSuccess" />

        <DataMaterialCategoryAddDialog v-model="state.dialog.addCategory" :parentId="state.currentCategoryParentId" @success="handleCategoryAddSuccess" />
        <DataMaterialCategoryEditDialog v-model="state.dialog.editCategory" :categoryId="state.currentCategoryId" @success="handleCategoryEditSuccess" />
        <DataMaterialCategoryDetailDialog v-model="state.dialog.detailCategory" :categoryId="state.currentCategoryId" />
        <DataMaterialCategoryUpdateParentDialog
          v-model="state.dialog.updateParentCategory"
          :categoryId="state.currentCategoryId"
          @success="handleCategoryUpdateParentSuccess"
        />

        <IamUserQuickSelectDialog
          v-model="state.createUserDialogVisible"
          @confirm="handleCreateUserSelect"
          :multiple="true"
          :selected-users="state.selectedCreateUsers"
        />
        <IamUserQuickSelectDialog
          v-model="state.updateUserDialogVisible"
          @confirm="handleUpdateUserSelect"
          :multiple="true"
          :selected-users="state.selectedUpdateUsers"
        />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'SYSTEM:BASIC_DATA:MATERIAL' })
  import { ElTreeV2 } from 'element-plus'
  import { onMounted, reactive, ref, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search, Plus, Edit, View, Connection, Delete, MoreFilled, ArrowDown } from '@element-plus/icons-vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import { hasPermission } from '@/modules/common/utils/Permission.util'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'
  import type { DataMaterialExpandListResponseVo, DataMaterialQueryPageRequestVo } from '@/modules/data/material/type/DataMaterial.type'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'
  import DataMaterialAddDialog from '@/modules/data/material/DataMaterialAddDialog.vue'
  import DataMaterialDetailDialog from '@/modules/data/material/DataMaterialDetailDialog.vue'
  import DataMaterialEditDialog from '@/modules/data/material/DataMaterialEditDialog.vue'
  import DataMaterialCategoryDialog from '@/modules/data/material/DataMaterialCategoryDialog.vue'
  import DataMaterialCategoryAddDialog from '@/modules/data/material/DataMaterialCategoryAddDialog.vue'
  import DataMaterialCategoryEditDialog from '@/modules/data/material/DataMaterialCategoryEditDialog.vue'
  import DataMaterialCategoryDetailDialog from '@/modules/data/material/DataMaterialCategoryDetailDialog.vue'
  import DataMaterialCategoryUpdateParentDialog from '@/modules/data/material/DataMaterialCategoryUpdateParentDialog.vue'
  import IamUserQuickSelectDialog from '@/modules/iam/user/IamUserQuickSelectDialog.vue'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { IamUserSimpleListResponseVo } from '@/modules/iam/user/type/IamUser.type'

  const enumStore = useDictionaryEnumStore()

  // ---------- 常量（与后端 CommonDataConstant 等保持一致） ----------
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'
  const CATEGORY_TREE_PROPS = { value: 'id', label: 'name', children: 'children' } as const
  const PAGE_SIZES = [20, 50, 100, 200, 500, 1000]
  const DATA_CARD_HEIGHT_OPEN = 'calc(100vh - 500px)'
  const DATA_CARD_HEIGHT_COLLAPSED = 'calc(100vh - 200px)'

  const isCategoryVirtualNode = (data: DataMaterialCategorySimpleTreeResponseVo) => data?.id === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID
  const formatTimestamp = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')
  /** 统一枚举文案（DataFileTypeEnum / DataMaterialProcessStatusEnum 等） */
  const getEnumLabel = (enumKey: string, code?: string) => (code ? (enumStore.getEnumItemByCodeSync(enumKey, code)?.message ?? code) : '-')

  const reloadCategoryTree = async () => {
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      const treeRoot = response as unknown as DataMaterialCategorySimpleTreeResponseVo
      state.categoryTreeOptions = treeRoot?.children?.length ? treeRoot.children : treeRoot?.id ? [treeRoot] : []
      currentCategoryTreeOptions.value = state.categoryTreeOptions
      buildCategoryMap(state.categoryTreeOptions)
      state.categoryNameMap = Object.fromEntries(state.categoryMap)
    } catch (error) {
      console.error('加载分类树失败', error)
    }
  }

  const buildCategoryMap = (nodes: DataMaterialCategorySimpleTreeResponseVo[]) => {
    nodes.forEach(node => {
      state.categoryMap.set(node.id, node.name)
      if (node.children?.length) buildCategoryMap(node.children)
    })
  }

  const resetCategoryTreeState = () => {
    state.searchForm.categoryIdSet = []
    state.categoryQuery = ''
    categoryTreeRef.value?.setExpandedKeys([])
    categoryTreeRef.value?.setCheckedKeys([])
  }

  const state = reactive({
    loading: false,
    showSearchCard: true,
    dataCardHeight: '580',
    fileTypeOptions: [] as Array<{ code: string; message: string }>,
    processStatusOptions: [] as Array<{ code: string; message: string }>,
    businessStatusOptions: [] as Array<{ code: string; message: string }>,
    auditStatusOptions: [] as Array<{ code: string; message: string }>,
    categoryQuery: '',
    categoryTreeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    categoryMap: new Map<string, string>(),
    categoryNameMap: {} as Record<string, string>,
    thumbnailUrlMap: {} as Record<string, string>,
    currentMaterialId: '',
    currentCategoryId: '',
    currentCategoryParentId: '',
    tableData: [] as DataMaterialExpandListResponseVo[],
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as IamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as IamUserSimpleListResponseVo[],
    pagination: { current: 1, size: 20, total: 0 },
    searchForm: {
      fileTypeSet: [] as string[],
      categoryIdSet: [] as string[],
      title: '',
      name: '',
      processStatus: null as string | null,
      businessStatus: null as string | null,
      auditStatus: null as string | null,
      createTimeRange: [] as number[],
      updateTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      detail: false,
      edit: false,
      category: false,
      addCategory: false,
      editCategory: false,
      detailCategory: false,
      updateParentCategory: false
    }
  })

  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const currentCategoryTreeOptions = ref<DataMaterialCategorySimpleTreeResponseVo[]>([])

  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || { id })
    }
  })
  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || { id })
    }
  })

  /** 左侧分类树勾选：将选中的根节点 id 同步到查询条件，点击搜索时再请求 */
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(currentCategoryTreeOptions.value, categoryTreeRef.value.getCheckedKeys()).map(
        node => node.id
      )
    }
  }

  const categoryFilterMethod = (query: string, node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(state.categoryQuery.trim())
      if (state.categoryQuery.trim() === '') categoryTreeRef.value.setExpandedKeys([])
    }
  }

  const buildQueryParams = (): DataMaterialQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.fileTypeSet.length > 0 && { fileTypeSet: searchForm.fileTypeSet }),
      ...(searchForm.categoryIdSet.length > 0 && { categoryIdSet: searchForm.categoryIdSet }),
      ...(searchForm.title && { title: searchForm.title }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.processStatus && { processStatus: searchForm.processStatus }),
      ...(searchForm.businessStatus && { businessStatus: searchForm.businessStatus }),
      ...(searchForm.auditStatus && { auditStatus: searchForm.auditStatus }),
      ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
      ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) }),
      ...(searchForm.createStartTime != null && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime != null && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime != null && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime != null && { updateEndTime: searchForm.updateEndTime })
    }
  }

  const loadThumbnailsForPage = (records: DataMaterialExpandListResponseVo[]) => {
    state.thumbnailUrlMap = {}
    records.forEach(row => {
      if (row.fileType === 'IMAGE' && row.attachmentId) {
        DataAttachmentApi.getThumbnailUrl(row.attachmentId)
          .then(r => {
            if (r?.url) state.thumbnailUrlMap[row.attachmentId!] = r.url
          })
          .catch(() => {})
      }
    })
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await DataMaterialApi.pageExpand(buildQueryParams())
      state.tableData = res.records || []
      state.pagination.total = res.total || 0
      loadThumbnailsForPage(state.tableData)
    } catch (error) {
      console.error('获取素材列表失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleFileTypeChange = () => {
    resetCategoryTreeState()
    state.pagination.current = 1
    fetchData()
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  const syncTimeRangeToForm = (range: number[] | undefined, startKey: 'createStartTime' | 'updateStartTime', endKey: 'createEndTime' | 'updateEndTime') => {
    if (range?.length === 2) {
      state.searchForm[startKey] = range[0]
      state.searchForm[endKey] = range[1]
    } else {
      state.searchForm[startKey] = undefined
      state.searchForm[endKey] = undefined
    }
  }
  const handleCreateTimeChange = () => syncTimeRangeToForm(state.searchForm.createTimeRange, 'createStartTime', 'createEndTime')
  const handleUpdateTimeChange = () => syncTimeRangeToForm(state.searchForm.updateTimeRange, 'updateStartTime', 'updateEndTime')

  const resetSearch = () => {
    Object.assign(state.searchForm, {
      fileTypeSet: [] as string[],
      title: '',
      name: '',
      processStatus: null,
      businessStatus: null,
      auditStatus: null,
      categoryIdSet: [] as string[],
      createTimeRange: [] as number[],
      updateTimeRange: [] as number[],
      createStartTime: undefined,
      createEndTime: undefined,
      updateStartTime: undefined,
      updateEndTime: undefined
    })
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    resetCategoryTreeState()
    handleSearch()
  }

  const handlePageChange = () => fetchData()
  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  /** 仅素材相关弹窗需要先选文件类型，分类管理不校验 */
  const needFileTypeCheck = (dialogKey: string) => !String(dialogKey).includes('Category')

  const checkFileTypeSelected = (): boolean => {
    if (!state.searchForm.fileTypeSet?.length) {
      ElMessage.warning('请先选择文件类型')
      return false
    }
    return true
  }

  const openDialog = (dialogKey: keyof typeof state.dialog, id?: string, parentId?: string) => {
    if (needFileTypeCheck(dialogKey) && !checkFileTypeSelected()) return
    if (id !== undefined) state.currentCategoryId = id
    if (parentId !== undefined) state.currentCategoryParentId = parentId
    if (dialogKey === 'add' && needFileTypeCheck(dialogKey)) state.currentMaterialId = ''
    state.dialog[dialogKey] = true
  }

  const showAddDialog = () => openDialog('add')
  const showDetailDialog = (row: DataMaterialExpandListResponseVo) => {
    state.currentMaterialId = row.id!
    openDialog('detail')
  }
  const showEditDialog = (row: DataMaterialExpandListResponseVo) => {
    state.currentMaterialId = row.id!
    openDialog('edit')
  }
  const showCategoryDialog = (row: DataMaterialExpandListResponseVo) => {
    state.currentMaterialId = row.id!
    openDialog('category')
  }

  const handleMaterialDropdownCommand = (command: string, row: DataMaterialExpandListResponseVo) => {
    const map: Record<string, () => void> = {
      category: () => showCategoryDialog(row)
    }
    map[command]?.()
  }

  const showAddCategoryDialog = (parentId?: string) => openDialog('addCategory', '', parentId || '')

  const handleDropdownCommand = (command: string, data: DataMaterialCategorySimpleTreeResponseVo) => {
    if (isCategoryVirtualNode(data)) return
    const map: Record<string, () => void> = {
      add: () => showAddCategoryDialog(data.id),
      edit: () => openDialog('editCategory', data.id),
      detail: () => openDialog('detailCategory', data.id),
      updateParent: () => openDialog('updateParentCategory', data.id),
      delete: () => handleCategoryDelete(data)
    }
    map[command]?.()
  }

  const handleCategoryDelete = async (category: DataMaterialCategorySimpleTreeResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗?`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
      await DataMaterialCategoryApi.destroy({ id: category.id })
      ElMessage.success('删除成功')
      await reloadCategoryTree()
      fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('删除分类失败', error)
    }
  }

  const handleAddSuccess = () => fetchData()
  const handleEditSuccess = () => fetchData()
  const handleCategoryUpdateSuccess = () => fetchData()

  const handleCategorySuccess = async () => {
    await reloadCategoryTree()
    fetchData()
  }
  const handleCategoryAddSuccess = handleCategorySuccess
  const handleCategoryEditSuccess = handleCategorySuccess
  const handleCategoryUpdateParentSuccess = handleCategorySuccess

  const showCreateUserSelectorDialog = () => (state.createUserDialogVisible = true)
  const clearSelectorAllCreateUsers = () => (state.selectedCreateUsers = [])
  const removeQueryCreateUser = (userId: string) => (state.selectedCreateUsers = state.selectedCreateUsers.filter(u => u.id !== userId))
  const handleCreateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }
  const showUpdateUserSelectorDialog = () => (state.updateUserDialogVisible = true)
  const clearSelectorAllUpdateUsers = () => (state.selectedUpdateUsers = [])
  const removeQueryUpdateUser = (userId: string) => (state.selectedUpdateUsers = state.selectedUpdateUsers.filter(u => u.id !== userId))
  const handleUpdateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  const getCategoryName = (categoryId: string) => state.categoryMap.get(categoryId) || categoryId

  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.dataCardHeight = newVal ? DATA_CARD_HEIGHT_OPEN : DATA_CARD_HEIGHT_COLLAPSED
      }, 80)
    },
    { immediate: false }
  )

  onMounted(async () => {
    const [fileTypeOptions, processStatusOptions, businessStatusOptions, auditStatusOptions] = await Promise.all([
      enumStore.getEnumDataAsync('DataFileTypeEnum'),
      enumStore.getEnumDataAsync('DataMaterialProcessStatusEnum'),
      enumStore.getEnumDataAsync('DataMaterialBusinessStatusEnum'),
      enumStore.getEnumDataAsync('DataMaterialAuditStatusEnum')
    ])
    state.fileTypeOptions = fileTypeOptions || []
    state.processStatusOptions = processStatusOptions || []
    state.businessStatusOptions = businessStatusOptions || []
    state.auditStatusOptions = auditStatusOptions || []
    await reloadCategoryTree()
    await fetchData()
  })
</script>

<style scoped lang="scss">
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.6s ease;
    overflow: hidden;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
    height: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  .material-page-div {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    .box-card-tree-select {
      margin: 4px 4px 4px 0;
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      .tree-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;

        .tree-toolbar-input {
          flex: 1;
          min-width: 0;
        }

        .el-button {
          flex-shrink: 0;
        }
      }
    }
  }
  .box-card-form {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    .search-form {
      display: flex;
      flex-direction: column;
      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: flex-start;
        .form-item-responsive {
          margin-bottom: 8px;
          flex: 1 1 280px;
          min-width: 100px;
          max-width: 280px;
          &.user-selector {
            min-width: 280px;
          }
          &.form-item-date-picker {
            flex: 1 1 320px;
            max-width: 320px;
          }
        }
      }
      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;
      }
    }
  }
  .box-card-data {
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
  }
  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    :deep(.el-button) {
      margin: 0 2px 0 0;
      &:last-child {
        margin-right: 0;
      }
    }
    :deep(.el-dropdown) {
      margin-left: 2px;
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    .tree-node-label {
      flex: 1;
      user-select: none;
    }
    .tree-node-actions-wrap {
      display: inline-block;
    }
    .tree-node-actions .tree-node-more-btn {
      padding: 0;
      width: 24px;
      height: 24px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    &:hover .tree-node-actions .tree-node-more-btn {
      opacity: 1;
    }
  }
  .material-table .text-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .list-thumb {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    vertical-align: middle;
  }
  .thumb-placeholder {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
