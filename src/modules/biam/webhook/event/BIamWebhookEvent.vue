<template>
  <div ref="pageContainerRef" class="webhook-event-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card ref="treeCardRef" class="box-card-tree-select">
          <div class="tree-toolbar">
            <el-input
              v-model="state.categoryQuery"
              placeholder="请输入关键字筛选分类"
              clearable
              class="tree-toolbar-input"
              @input="onCategoryQueryChanged"
              @keyup.enter="onCategoryQueryChanged"
            />
            <el-tooltip content="拖拽分类可调整层级" placement="top">
              <el-icon class="tree-drag-tip"><InfoFilled /></el-icon>
            </el-tooltip>
            <el-button type="primary" size="small" @click="showAddCategoryDialog()" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:CREATE']">
              添加
            </el-button>
          </div>

          <div v-show="treeHeightReady" class="tree-body">
            <el-tree-v2
              ref="categoryTreeRef"
              :data="state.categoryTreeOptions"
              :props="CATEGORY_TREE_PROPS"
              :filter-method="categoryFilterMethod"
              :default-expanded-keys="state.expandedCategoryKeys"
              :expand-on-click-node="false"
              show-checkbox
              :height="treeHeight"
              empty-text="暂无分类"
              @check="handleCategoryCheck"
              @node-expand="handleCategoryExpand"
              @node-collapse="handleCategoryCollapse"
            >
              <template #default="{ node, data }">
                <div
                  class="custom-tree-node"
                  :class="getDragClass(data as BIamWebhookEventCategorySimpleTreeResponseVo)"
                  draggable="true"
                  @dragstart.stop="handleCategoryDragStart($event, data as BIamWebhookEventCategorySimpleTreeResponseVo)"
                  @dragover.prevent.stop="handleCategoryDragOver($event, data as BIamWebhookEventCategorySimpleTreeResponseVo)"
                  @dragleave.stop="handleCategoryDragLeave(data as BIamWebhookEventCategorySimpleTreeResponseVo)"
                  @drop.prevent.stop="handleCategoryDrop($event, data as BIamWebhookEventCategorySimpleTreeResponseVo)"
                  @dragend="handleCategoryDragEnd"
                >
                  <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
                  <div class="tree-node-actions">
                    <el-dropdown
                      trigger="click"
                      placement="bottom-end"
                      @command="
                        (command: string | number | object) => handleDropdownCommand(command as string, data as BIamWebhookEventCategorySimpleTreeResponseVo)
                      "
                    >
                      <el-button type="primary" link class="tree-node-more-btn" @click.stop>
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="add" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:CREATE'])">
                            <el-icon><Plus /></el-icon>
                            <span>添加</span>
                          </el-dropdown-item>
                          <el-dropdown-item
                            command="edit"
                            :disabled="isRootCategory(data) || !hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:UPDATE'])"
                          >
                            <el-icon><Edit /></el-icon>
                            <span>修改</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="detail" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:DETAIL'])">
                            <el-icon><View /></el-icon>
                            <span>详情</span>
                          </el-dropdown-item>
                          <el-dropdown-item
                            command="updateParent"
                            :disabled="isRootCategory(data) || !hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:UPDATE_PARENT'])"
                          >
                            <el-icon><Connection /></el-icon>
                            <span>移动</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="delete" divided :disabled="!canDeleteCategory(data)">
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
          </div>
          <div v-show="!treeHeightReady" class="tree-placeholder">
            <el-skeleton :rows="8" animated />
          </div>
        </el-card>
      </el-splitter-panel>

      <el-splitter-panel :min="200">
        <div ref="rightContentRef" class="webhook-event-main-content">
          <transition name="slide-fade">
            <el-card ref="searchCardRef" v-show="state.showSearchCard" class="box-card-form">
              <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
                <div class="form-items-group">
                  <el-form-item label="事件编码:" prop="code" class="form-item-responsive">
                    <el-input v-model="state.searchForm.code" placeholder="请输入事件编码" clearable @keyup.enter="handleSearch" />
                  </el-form-item>
                  <el-form-item label="事件名称:" prop="name" class="form-item-responsive">
                    <el-input v-model="state.searchForm.name" placeholder="请输入事件名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>
                  <el-form-item label="状态:" prop="status" class="form-item-responsive">
                    <el-select v-model="state.searchForm.status" placeholder="请选择状态" clearable style="width: 100%">
                      <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
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
                </div>
                <div class="button-group">
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:PAGE_EXPAND']">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:PAGE_EXPAND']">
                      <el-icon><Refresh /></el-icon>
                      重置
                    </el-button>
                  </el-form-item>
                </div>
              </el-form>
            </el-card>
          </transition>

          <el-card ref="dataCardRef" class="box-card-data">
            <div ref="operationButtonsRef" class="operation-buttons">
              <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:CREATE']">新增</el-button>
              <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
            </div>

            <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
              <el-table
                :data="state.tableData"
                row-key="id"
                border
                style="margin: 10px 0"
                v-loading="state.loading"
                :height="tableHeight"
                stripe
                highlight-current-row
                class="webhook-event-table"
              >
                <el-table-column label="序号" align="center" type="index" width="60" fixed />
                <el-table-column prop="code" label="事件编码" align="center" min-width="220">
                  <template #default="{ row }">
                    <span class="text-ellipsis" :title="row.code">{{ row.code || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="事件名称" align="center" min-width="160">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.name }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="所属分类" align="center" width="150">
                  <template #default="{ row }">
                    <span class="text-ellipsis" :title="getCategoryName(row.categoryId)">{{ getCategoryName(row.categoryId) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center" width="110">
                  <template #default="{ row }">
                    <el-switch
                      v-model="row.status"
                      :active-value="'ENABLE'"
                      :inactive-value="'DISABLE'"
                      active-text="启用"
                      inactive-text="禁用"
                      inline-prompt
                      @change="toggleStatus(row)"
                      v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:UPDATE_STATUS']"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" align="center" width="80" />
                <el-table-column label="订阅接收端" align="center" width="110">
                  <template #header>
                    <el-tooltip content="显式订阅该事件的接收端数量；通过分类订阅覆盖该事件的情况不在此口径内" placement="top">
                      <span class="header-with-help">
                        订阅接收端
                        <el-icon class="header-help-icon"><QuestionFilled /></el-icon>
                      </span>
                    </el-tooltip>
                  </template>
                  <template #default="{ row }">
                    <el-tag v-if="Number(row.subscriberCount) > 0" size="small" type="success" effect="light">{{ row.subscriberCount }}</el-tag>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="事件描述" align="center" min-width="180">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.description" :content="row.description" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.description }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createName" label="创建人" align="center" width="110">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.createName }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="170">
                  <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
                </el-table-column>
                <el-table-column prop="updateName" label="修改人" align="center" width="110">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.updateName }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="修改时间" align="center" width="170">
                  <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:DETAIL']">详情</el-button>
                      <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:UPDATE']">
                        编辑
                      </el-button>
                      <el-tooltip :disabled="row.status !== 'ENABLE'" content="启用状态的事件不能删除" placement="top">
                        <span>
                          <el-button
                            size="small"
                            type="danger"
                            :disabled="row.status === 'ENABLE'"
                            @click="handleDeleteEvent(row)"
                            v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:DELETE']"
                          >
                            删除
                          </el-button>
                        </span>
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <el-pagination
                ref="paginationRef"
                v-model:current-page="state.pagination.current"
                v-model:page-size="state.pagination.size"
                :page-sizes="PAGE_SIZES"
                :background="true"
                layout="prev, pager, next, jumper, ->, total, sizes"
                :total="state.pagination.total"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:EVENT:PAGE_EXPAND']"
              />
            </div>

            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>

          <BIamWebhookEventAddDialog v-model="state.dialog.add" :default-category-id="defaultEventCategoryId" @success="handleEventSuccess" />
          <BIamWebhookEventEditDialog v-model="state.dialog.edit" :event-id="state.currentEventId" @success="handleEventSuccess" />
          <BIamWebhookEventDetailDialog v-model="state.dialog.detail" :event-id="state.currentEventId" />

          <BIamWebhookEventCategoryAddDialog v-model="state.dialog.addCategory" :parent-id="state.currentCategoryParentId" @success="handleCategorySuccess" />
          <BIamWebhookEventCategoryEditDialog v-model="state.dialog.editCategory" :category-id="state.currentCategoryId" @success="handleCategorySuccess" />
          <BIamWebhookEventCategoryDetailDialog v-model="state.dialog.detailCategory" :category-id="state.currentCategoryId" />
          <BIamWebhookEventCategoryUpdateParentDialog
            v-model="state.dialog.updateParentCategory"
            :category-id="state.currentCategoryId"
            @success="handleCategorySuccess"
          />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'BIamWebhookEvent'
  })

  import { computed, nextTick, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { ElMessage, ElMessageBox, ElTreeV2, type TreeNodeData } from 'element-plus'
  import { Refresh, Search, Plus, Edit, View, Connection, Delete, MoreFilled, QuestionFilled, InfoFilled } from '@element-plus/icons-vue'
  import { BIamWebhookEventApi } from './api/BIamWebhookEvent.api'
  import { BIamWebhookEventCategoryApi } from './api/BIamWebhookEventCategory.api'
  import BIamWebhookEventAddDialog from './BIamWebhookEventAddDialog.vue'
  import BIamWebhookEventEditDialog from './BIamWebhookEventEditDialog.vue'
  import BIamWebhookEventDetailDialog from './BIamWebhookEventDetailDialog.vue'
  import BIamWebhookEventCategoryAddDialog from './BIamWebhookEventCategoryAddDialog.vue'
  import BIamWebhookEventCategoryEditDialog from './BIamWebhookEventCategoryEditDialog.vue'
  import BIamWebhookEventCategoryDetailDialog from './BIamWebhookEventCategoryDetailDialog.vue'
  import BIamWebhookEventCategoryUpdateParentDialog from './BIamWebhookEventCategoryUpdateParentDialog.vue'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamWebhookEventListResponseVo, BIamWebhookEventPageQueryRequestVo } from './type/BIamWebhookEvent.type'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo } from './type/BIamWebhookEventCategory.type'

  /** 与后端 CommonBIamConstant.WebhookEventCategory 保持一致 */
  const EVENT_CATEGORY_ROOT_ID = 'webhook_event_category'
  const EVENT_CATEGORY_ROOT_PARENT_ID = 'root'

  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_STATUS)

  const CATEGORY_TREE_PROPS = { value: 'id', label: 'name', children: 'children' } as const
  const PAGE_SIZES = [20, 50, 100, 200]

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  const state = reactive({
    loading: false,
    showSearchCard: true,
    categoryQuery: '',
    categoryTreeOptions: [] as BIamWebhookEventCategorySimpleTreeResponseVo[],
    categoryMap: new Map<string, string>(),
    expandedCategoryKeys: [] as string[],
    currentEventId: '',
    currentCategoryId: '',
    currentCategoryParentId: '',
    tableData: [] as BIamWebhookEventListResponseVo[],
    pagination: { current: 1, size: 20, total: 0 },
    searchForm: {
      categoryIdSet: [] as string[],
      code: '',
      name: '',
      status: null as string | null,
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      edit: false,
      detail: false,
      addCategory: false,
      editCategory: false,
      detailCategory: false,
      updateParentCategory: false
    }
  })

  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const rightContentRef = ref<HTMLElement | null>(null)
  const treeCardRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  let isFirstActivation = true

  const { tableHeight, tableHeightReady, treeHeight, treeHeightReady, calculateTableHeight, calculateTreeHeight, setupResizeObserver } = useSplitCardHeights({
    dataCardRef,
    treeCardRef,
    treeReserve: 100,
    operationButtonsRef,
    paginationRef,
    observeRefs: [pageContainerRef, rightContentRef, searchCardRef]
  })

  const isRootCategory = (data: BIamWebhookEventCategorySimpleTreeResponseVo): boolean =>
    data?.id === EVENT_CATEGORY_ROOT_ID || data?.parentId === EVENT_CATEGORY_ROOT_PARENT_ID

  /** 根分类与存在子节点的分类不允许删除 */
  const canDeleteCategory = (data: BIamWebhookEventCategorySimpleTreeResponseVo): boolean =>
    !isRootCategory(data) && !data.children?.length && hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:DELETE'])

  const buildCategoryMap = (nodes: BIamWebhookEventCategorySimpleTreeResponseVo[]) => {
    nodes.forEach(node => {
      state.categoryMap.set(node.id, node.name)
      if (node.children?.length) buildCategoryMap(node.children)
    })
  }

  const reloadCategoryTree = async () => {
    try {
      const response = await BIamWebhookEventCategoryApi.treeSimple()
      const root = response as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      // 根节点仅用于承载层级，不在树中展示，直接以根节点的子节点作为树的顶层
      state.categoryTreeOptions = root?.children?.length ? root.children : []
      state.categoryMap.clear()
      buildCategoryMap(state.categoryTreeOptions)
      // 已选分类被删除时同步剔除过滤条件
      const existSelectedIdSet = state.searchForm.categoryIdSet.filter(categoryId => state.categoryMap.has(categoryId))
      if (existSelectedIdSet.length !== state.searchForm.categoryIdSet.length) {
        state.searchForm.categoryIdSet = existSelectedIdSet
      }
    } catch (error) {
      console.error('加载事件分类树失败', error)
    }
  }

  const categoryFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const onCategoryQueryChanged = () => {
    categoryTreeRef.value?.filter(state.categoryQuery.trim())
  }

  /** 勾选分类：事件只挂在叶子分类下，取选中子树中的叶子分类ID，点击搜索时再请求 */
  const handleCategoryCheck = () => {
    if (!categoryTreeRef.value) return
    const checkedKeys = categoryTreeRef.value.getCheckedKeys() as string[]
    state.searchForm.categoryIdSet = TreeDataUtil.getBottomLevelIds(state.categoryTreeOptions, checkedKeys)
  }

  const handleCategoryExpand = (data: TreeNodeData) => {
    const id = (data as BIamWebhookEventCategorySimpleTreeResponseVo).id
    if (!state.expandedCategoryKeys.includes(id)) state.expandedCategoryKeys = [...state.expandedCategoryKeys, id]
  }

  const handleCategoryCollapse = (data: TreeNodeData) => {
    const id = (data as BIamWebhookEventCategorySimpleTreeResponseVo).id
    state.expandedCategoryKeys = state.expandedCategoryKeys.filter(key => key !== id)
  }

  const buildQueryParams = (): BIamWebhookEventPageQueryRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.categoryIdSet.length > 0 && { categoryIdSet: searchForm.categoryIdSet }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.createStartTime != null && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime != null && { createEndTime: searchForm.createEndTime })
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await BIamWebhookEventApi.pageExpand(buildQueryParams())
      state.tableData = res.records || []
      state.pagination.total = res.total || 0
    } catch (error) {
      console.error('获取事件列表失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  const handleCreateTimeChange = () => {
    const range = state.searchForm.createTimeRange
    if (range?.length === 2) {
      state.searchForm.createStartTime = range[0]
      state.searchForm.createEndTime = range[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const resetSearch = () => {
    Object.assign(state.searchForm, {
      categoryIdSet: [] as string[],
      code: '',
      name: '',
      status: null,
      createTimeRange: [] as number[],
      createStartTime: undefined,
      createEndTime: undefined
    })
    state.categoryQuery = ''
    categoryTreeRef.value?.filter('')
    categoryTreeRef.value?.setCheckedKeys([])
    handleSearch()
  }

  const handlePageChange = () => fetchData()

  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const getCategoryName = (categoryId?: string) => (categoryId ? state.categoryMap.get(categoryId) || categoryId : '-')

  /** 新增事件时默认带入唯一勾选的叶子分类（事件只能挂在叶子分类下） */
  const defaultEventCategoryId = computed(() => {
    const { categoryIdSet } = state.searchForm
    return categoryIdSet.length === 1 ? categoryIdSet[0] : ''
  })

  const openDialog = (dialogKey: keyof typeof state.dialog, id?: string, parentId?: string) => {
    if (id !== undefined) state.currentCategoryId = id
    if (parentId !== undefined) state.currentCategoryParentId = parentId
    state.dialog[dialogKey] = true
  }

  const showAddDialog = () => {
    state.currentEventId = ''
    openDialog('add')
  }

  const showDetailDialog = (row: BIamWebhookEventListResponseVo) => {
    state.currentEventId = row.id
    openDialog('detail')
  }

  const showEditDialog = (row: BIamWebhookEventListResponseVo) => {
    state.currentEventId = row.id
    openDialog('edit')
  }

  const toggleStatus = async (row: BIamWebhookEventListResponseVo) => {
    const nextStatus = row.status
    const actionText = nextStatus === 'ENABLE' ? '启用' : '禁用'
    try {
      await ElMessageBox.confirm(`确定要${actionText}事件 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEventApi.updateStatus({ id: row.id, status: nextStatus })
      ElMessage.success(`${actionText}成功`)
    } catch (error: unknown) {
      row.status = nextStatus === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      if (error !== 'cancel') console.error('切换事件状态失败', error)
    }
  }

  const handleDeleteEvent = async (row: BIamWebhookEventListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除事件 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEventApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('删除事件失败', error)
    }
  }

  const showAddCategoryDialog = (parentId?: string) => openDialog('addCategory', '', parentId || '')

  const handleDropdownCommand = (command: string, data: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    const map: Record<string, () => void> = {
      add: () => showAddCategoryDialog(data.id),
      edit: () => openDialog('editCategory', data.id),
      detail: () => openDialog('detailCategory', data.id),
      updateParent: () => openDialog('updateParentCategory', data.id),
      delete: () => handleCategoryDelete(data)
    }
    map[command]?.()
  }

  const handleCategoryDelete = async (category: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await BIamWebhookEventCategoryApi.destroy({ id: category.id })
      ElMessage.success('删除成功')
      await reloadCategoryTree()
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') console.error('删除分类失败', error)
    }
  }

  const handleEventSuccess = async () => {
    // 事件挂载/迁移后分类的可操作性会变化，先刷新分类树再刷新列表
    await reloadCategoryTree()
    await fetchData()
  }

  const handleCategorySuccess = async () => {
    await reloadCategoryTree()
    await fetchData()
  }

  // ==================== 分类树拖拽移动 ====================
  const categoryDragState = reactive({ draggingId: '', dragOverId: '' })

  /** 是否可以放到目标节点下：排除自身、不存在的节点和自己的子孙节点 */
  const canDropCategory = (dragId: string, targetId: string) => {
    if (!dragId || !targetId || dragId === targetId) return false
    if (!TreeDataUtil.findNode(state.categoryTreeOptions, dragId) || !TreeDataUtil.findNode(state.categoryTreeOptions, targetId)) return false

    return !TreeDataUtil.getAllChildrenIdsIncludingSelf(state.categoryTreeOptions, [dragId]).includes(targetId)
  }

  const handleCategoryDragStart = (event: DragEvent, node: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    const eventTarget = event.target as HTMLElement | null
    const disabled =
      eventTarget?.closest('.tree-node-actions') || !hasPermission(['MANAGE_APP:SYSTEM:WEBHOOK:EVENT_CATEGORY:UPDATE_PARENT']) || isRootCategory(node)
    if (disabled) {
      event.preventDefault()
      return
    }

    categoryDragState.draggingId = node.id
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', node.id)
    }
  }

  const handleCategoryDragOver = (event: DragEvent, node: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    if (!canDropCategory(categoryDragState.draggingId, node.id)) {
      categoryDragState.dragOverId = ''
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
      return
    }

    categoryDragState.dragOverId = node.id
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  const handleCategoryDragLeave = (node: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    if (categoryDragState.dragOverId === node.id) categoryDragState.dragOverId = ''
  }

  const handleCategoryDragEnd = () => {
    categoryDragState.draggingId = ''
    categoryDragState.dragOverId = ''
  }

  const handleCategoryDrop = async (event: DragEvent, node: BIamWebhookEventCategorySimpleTreeResponseVo) => {
    const dragId = categoryDragState.draggingId || event.dataTransfer?.getData('text/plain') || ''
    handleCategoryDragEnd()
    if (!canDropCategory(dragId, node.id)) return

    try {
      await BIamWebhookEventCategoryApi.updateParent({ id: dragId, parentId: node.id })
      ElMessage.success(`已移动到「${node.name}」`)
      await handleCategorySuccess()
    } catch (error) {
      console.error('移动分类失败', error)
    }
  }

  const getDragClass = (node: BIamWebhookEventCategorySimpleTreeResponseVo) => ({
    'is-dragging': categoryDragState.draggingId === node.id,
    'is-drag-over': categoryDragState.dragOverId === node.id
  })

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  onMounted(async () => {
    await loadStatusOptions()
    await reloadCategoryTree()
    await fetchData()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
    await calculateTreeHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
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
  .webhook-event-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    box-sizing: border-box;
    :deep(.el-splitter) {
      height: 100%;
      min-height: 0;
    }
    :deep(.el-splitter-panel) {
      min-height: 0;
    }
    .box-card-tree-select {
      margin: 0 8px 0 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 12px;
      }

      .tree-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        flex-shrink: 0;

        .tree-toolbar-input {
          flex: 1;
          min-width: 0;
        }

        .el-button {
          flex-shrink: 0;
        }
      }

      .tree-body {
        flex: 1;
        min-height: 0;
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .webhook-event-main-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-card-form {
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

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

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }

  .box-card-data {
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      gap: 8px;
    }

    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .table-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    :deep(.el-button) {
      margin: 0;
      margin-right: 2px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .tree-drag-tip {
    flex: none;
    color: var(--el-text-color-secondary);
    cursor: help;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    font-size: 14px;
    border-radius: 4px;

    &.is-dragging {
      opacity: 0.4;
    }

    &.is-drag-over {
      outline: 1px dashed var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .tree-node-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
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

  .webhook-event-table .text-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .webhook-event-table .header-with-help {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    cursor: help;
  }
  .webhook-event-table .header-help-icon {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
</style>
