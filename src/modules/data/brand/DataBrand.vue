<template>
  <div ref="pageContainerRef" class="brand-page">
    <!-- 搜索卡片 -->
    <transition name="slide-fade">
      <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
        <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
          <div class="form-items-group">
            <el-form-item label="名称:" prop="name" class="form-item-responsive">
              <el-input v-model="state.searchForm.name" placeholder="品牌名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="编码:" prop="code" class="form-item-responsive">
              <el-input v-model="state.searchForm.code" placeholder="品牌编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>

            <el-form-item label="状态:" prop="status" class="form-item-responsive">
              <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                <el-option v-for="option in brandStatus" :key="option.code" :label="option.message" :value="option.code" />
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
                    v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']"
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
                    v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:USER:PAGE_SIMPLE']"
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
                @change="handleCreateTimeRangeChange"
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
                @change="handleUpdateTimeRangeChange"
              />
            </el-form-item>
          </div>

          <!-- 操作按钮组 -->
          <div class="button-group">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:PAGE_EXPAND']">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </transition>

    <!-- 数据卡片 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <div ref="operationButtonsRef" class="operation-buttons">
        <el-button type="primary" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE']">添加</el-button>
        <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
      </div>

      <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
        <el-table
          :data="state.tableData"
          border
          v-loading="state.loading"
          :height="tableHeight"
          style="margin: 10px 0"
          stripe
          highlight-current-row
          row-key="id"
          default-expand-all
          class="brand-table"
          @expand-change="handleExpandChange"
        >
          <el-table-column prop="id" label="ID" align="center" v-if="false" />
          <el-table-column label="序号" align="center" type="index" width="60" fixed />
          <el-table-column prop="name" label="名称" align="center" width="160" fixed show-overflow-tooltip>
            <template #default="{ row }">
              <!-- 子品牌懒加载占位行：点击加载下一页子品牌 -->
              <el-link v-if="row.__more" type="primary" underline="never" :disabled="isLoadingMore(row.parentId)" @click="handleLoadMoreChildren(row)">
                <el-icon v-if="isLoadingMore(row.parentId)" class="is-loading"><Loading /></el-icon>
                <span>{{ isLoadingMore(row.parentId) ? '加载中…' : '加载更多' }}</span>
              </el-link>
              <template v-else>
                <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                  <span class="text-ellipsis">{{ row.name }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="编码" align="center" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.code" :content="row.code" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.code }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" align="center" width="120">
            <template #default="{ row }">
              <el-switch
                v-if="!row.__more"
                v-model="row.status"
                :active-value="'ENABLE'"
                :inactive-value="'DISABLE'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="toggleStatus(row)"
                v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE_STATUS']"
              />
            </template>
          </el-table-column>

          <el-table-column prop="logoAttachmentId" label="LOGO" align="center" width="120">
            <template #default="{ row }">
              <template v-if="!row.__more">
                <el-image
                  v-if="state.logoUrlMap[row.logoAttachmentId]"
                  :src="state.logoUrlMap[row.logoAttachmentId]"
                  fit="contain"
                  class="brand-logo"
                  @click="handleViewLogoOrigin(row.logoAttachmentId)"
                />
                <span v-else>无</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" align="center" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.description" :content="row.description" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.description }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createName" label="创建人" align="center" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.createName" :content="row.createName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.createName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="updateName" label="修改人" align="center" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                <span class="text-ellipsis">{{ row.updateName }}</span>
              </el-tooltip>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
            <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions" v-if="!row.__more">
                <el-button size="small" @click="showDetail(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:DETAIL']">详情</el-button>
                <el-button size="small" type="primary" @click="showEdit(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE']">编辑</el-button>
                <el-dropdown trigger="click" @command="onBrandDropdownCommand($event, row)" placement="bottom-end">
                  <el-button size="small" type="info">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="addChild" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:CREATE'])">
                        <el-icon><Plus /></el-icon>
                        <span>新增</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="updateParent" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE_PARENT'])">
                        <el-icon><Connection /></el-icon>
                        <span>移动</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:DELETE'])">
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          ref="paginationRef"
          v-model:current-page="state.pagination.current"
          v-model:page-size="state.pagination.size"
          :page-sizes="[20, 50, 100, 200, 500, 1000]"
          :background="true"
          layout="prev, pager, next, jumper, ->, total, sizes"
          :total="state.pagination.total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>

      <!-- 骨架屏占位，避免高度突变 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <DataBrandAddDialog v-model="state.dialog.add" @success="fetchBrandList" />
    <DataBrandAddDialog v-model="state.dialog.addChild" :parent-node="state.currentBrandNode" @success="fetchBrandList" />
    <DataBrandEditDialog v-model="state.dialog.edit" :brand-id="state.currentBrandId" @success="fetchBrandList" />
    <DataBrandDetailDialog v-model="state.dialog.detail" :brand-id="state.currentBrandId" />
    <DataBrandUpdateParentDialog v-model="state.dialog.updateParent" :brand-id="state.currentBrandId" @success="fetchBrandList" />

    <!-- LOGO 原图预览（列表只有缩略图，点击时才去取原图） -->
    <el-image-viewer
      v-if="state.logoViewerVisible"
      :url-list="state.logoViewerUrlList"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      hide-on-click-modal
      teleported
      @close="state.logoViewerVisible = false"
    />

    <BIamUserQuickSelectDialog
      v-model="state.createUserDialogVisible"
      @confirm="handleCreateUserSelect"
      :multiple="true"
      :selected-users="state.selectedCreateUsers"
    />
    <BIamUserQuickSelectDialog
      v-model="state.updateUserDialogVisible"
      @confirm="handleUpdateUserSelect"
      :multiple="true"
      :selected-users="state.selectedUpdateUsers"
    />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:BASIC_DATA:BRAND'
  })
  import { ref, reactive, onMounted, onActivated, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, ArrowDown, Connection, Loading, Plus, Delete } from '@element-plus/icons-vue'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { DataBrandExpandListResponseVo } from '@/modules/data/brand/type/DataBrand.type'
  import DataBrandAddDialog from '@/modules/data/brand/DataBrandAddDialog.vue'
  import DataBrandDetailDialog from '@/modules/data/brand/DataBrandDetailDialog.vue'
  import DataBrandEditDialog from '@/modules/data/brand/DataBrandEditDialog.vue'
  import DataBrandUpdateParentDialog from '@/modules/data/brand/DataBrandUpdateParentDialog.vue'
  import BIamUserQuickSelectDialog from '@/modules/biam/user/BIamUserQuickSelectDialog.vue'
  import type { BIamUserSimpleListResponseVo } from '@/modules/biam/user/type/BIamUser.type'

  const { options: brandStatus, load: loadBrandStatus } = useEnumOptions(DICT_STATUS)

  /** 子品牌懒加载：每页条数 */
  const CHILDREN_PAGE_SIZE = 20

  /** “加载更多”占位行的ID前缀 */
  const MORE_ROW_ID_PREFIX = '__more__:'

  /** 列表树的行：在品牌展开项基础上支持“加载更多”占位行 */
  type BrandTreeRow = DataBrandExpandListResponseVo & { __more?: boolean }

  const state = reactive({
    loading: false,
    showSearchCard: true,
    currentBrandId: '',
    /** 新增下级时的父品牌节点 */
    currentBrandNode: null as BrandTreeRow | null,
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    searchForm: {
      code: '',
      name: '',
      status: null as string | null,
      createUserIdSet: [] as string[],
      updateUserIdSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },
    dialog: {
      add: false,
      addChild: false,
      edit: false,
      detail: false,
      updateParent: false
    },
    tableData: [] as BrandTreeRow[],
    logoUrlMap: {} as Record<string, string>,
    childLoad: {} as Record<string, { page: number; loaded: number; total: number }>,
    loadingMoreIds: [] as string[],
    logoViewerVisible: false,
    logoViewerUrlList: [] as string[],
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as BIamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as BIamUserSimpleListResponseVo[]
  })

  const searchFormRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref<HTMLElement | null>(null)
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true
  let isFirstActivation = true
  /** 列表加载世代：fetchBrandList 重建列表时自增，用于丢弃过期的子品牌懒加载响应 */
  let listGeneration = 0

  const resolveElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const calculateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    const operationButtonsHeight = operationButtonsRef.value?.offsetHeight || 50
    const paginationHeight = paginationRef.value?.offsetHeight || 60
    const contentSpacing = 16
    const newHeight = Math.max(320, cardBody.clientHeight - operationButtonsHeight - paginationHeight - contentSpacing)

    if (tableHeight.value !== newHeight) {
      tableHeight.value = newHeight
    }

    if (isFirstCalculation && tableHeight.value > 0) {
      tableHeightReady.value = true
      isFirstCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || ({ id: id } as BIamUserSimpleListResponseVo))
    }
  })

  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || ({ id: id } as BIamUserSimpleListResponseVo))
    }
  })

  // 品牌下拉命令
  const onBrandDropdownCommand = async (command: string, row: { id: string; name: string }) => {
    if (command === 'addChild') {
      showAddChild(row)
      return
    }

    if (command === 'updateParent') {
      showUpdateParent(row)
      return
    }

    if (command === 'delete') {
      await handleDelete(row)
    }
  }

  /** 新增下级：带上当前行作为父品牌（弹窗内只读，不可修改） */
  const showAddChild = (row: { id: string; name: string }) => {
    state.currentBrandNode = row as DataBrandExpandListResponseVo
    state.dialog.addChild = true
  }

  /** 移动品牌：打开弹窗并传入当前品牌ID */
  const showUpdateParent = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.updateParent = true
  }

  /** 是否为“加载更多”占位行 */
  const isMoreRow = (row: DataBrandExpandListResponseVo | BrandTreeRow | undefined): boolean => !!(row as BrandTreeRow | undefined)?.__more

  /** 构造“加载更多”占位行（点击后加载该父品牌的下一页子品牌） */
  const buildMoreRow = (parentId: string): BrandTreeRow => ({
    id: MORE_ROW_ID_PREFIX + parentId,
    parentId,
    name: '加载更多',
    __more: true
  })

  /**
   * 是否还有未加载的子品牌
   * 已懒加载过：按分页进度判断
   * 未加载过：只要 hasChildren 就算（page_expand 只返回「分页命中的品牌 + 父链」，
   *   节点下已带回的子节点往往只是命中结果的一部分，不是该父品牌的完整子品牌列表，
   *   所以即使已有 children 也要保留“加载更多”，否则子品牌多的品牌永远拉不出剩余的）
   */
  const hasUnloadedChildren = (node: BrandTreeRow): boolean => {
    const loadState = state.childLoad[node.id]
    if (loadState) {
      return loadState.loaded < loadState.total
    }
    return !!node.hasChildren
  }

  /** 同步节点的“加载更多”占位行（追加到子节点末尾，全部加载完则移除） */
  const syncMoreRow = (node: BrandTreeRow) => {
    const children = (node.children ?? []).filter(child => !isMoreRow(child)) as BrandTreeRow[]
    node.children = hasUnloadedChildren(node) ? [...children, buildMoreRow(node.id)] : children
  }

  /** 整棵树补上“加载更多”占位行（含后端补齐的父链节点） */
  const applyMoreRows = (records: BrandTreeRow[]) => {
    records.forEach(node => {
      if (node.children?.length) {
        applyMoreRows(node.children as BrandTreeRow[])
      }
      syncMoreRow(node)
    })
  }

  /** 在树里按ID查找节点 */
  const findTreeNode = (records: BrandTreeRow[], id: string): BrandTreeRow | undefined => {
    for (const node of records) {
      if (node.id === id) return node
      const matched = node.children?.length ? findTreeNode(node.children as BrandTreeRow[], id) : undefined
      if (matched) return matched
    }
    return undefined
  }

  /** 某个父品牌是否正在加载子品牌 */
  const isLoadingMore = (parentId?: string): boolean => !!parentId && state.loadingMoreIds.includes(parentId)

  /**
   * 调用 children_expand 拉取某个父品牌的指定页子品牌，按ID去重后并入其 children
   * 新的子品牌追加在末尾（命中父链带回的子节点保持在前面，不干扰搜索结果）
   */
  const loadChildrenPage = async (parentNode: BrandTreeRow, page: number) => {
    const parentId = parentNode.id
    if (!parentId || isLoadingMore(parentId)) return

    const generation = listGeneration
    state.loadingMoreIds.push(parentId)
    try {
      const response = await DataBrandApi.childrenExpand({ parentId, current: page, size: CHILDREN_PAGE_SIZE })
      //请求期间列表被重新加载（搜索/翻页/增删改）：该节点已不在新树上，丢弃本次结果
      //否则会把旧进度写进 childLoad，导致新列表里同 ID 节点的“加载更多”状态错乱
      if (generation !== listGeneration) return

      const records = (response?.records || []) as BrandTreeRow[]

      //已加载的子品牌（含命中父链带回的节点）与分页数据按ID去重
      const children = ((parentNode.children ?? []) as BrandTreeRow[]).filter(child => !isMoreRow(child))
      const loadedIds = new Set(children.map(child => child.id))
      const newRecords = records.filter(record => !loadedIds.has(record.id))
      parentNode.children = [...children, ...newRecords]

      state.childLoad[parentId] = {
        page,
        loaded: (state.childLoad[parentId]?.loaded || 0) + records.length,
        total: response?.total || 0
      }

      syncMoreRow(parentNode)
      await resolveBrandLogoUrlList(newRecords)
    } catch (error) {
      console.error('加载子品牌失败', error)
    } finally {
      state.loadingMoreIds = state.loadingMoreIds.filter(id => id !== parentId)
    }
  }

  /**
   * 点击“加载更多”：拉取该父品牌的下一页子品牌
   * 一页展示不下时末尾会一直保留“加载更多”占位行，直到全部加载完
   */
  const handleLoadMoreChildren = async (row: BrandTreeRow) => {
    const parentId = row.parentId
    if (!parentId || isLoadingMore(parentId)) return

    const parentNode = findTreeNode(state.tableData, parentId)
    if (!parentNode) return

    await loadChildrenPage(parentNode, (state.childLoad[parentId]?.page || 0) + 1)
  }

  /**
   * 手动展开某一行时：若该品牌还有未加载的子品牌，自动拉取第一页
   * 已加载过（有分页进度）的不重复拉；default-expand-all 不会触发该事件，只有用户手动展开才会
   */
  const handleExpandChange = async (row: BrandTreeRow, expanded: boolean) => {
    if (!expanded || !row || isMoreRow(row)) return

    const node = findTreeNode(state.tableData, row.id) ?? row
    if (state.childLoad[node.id] || isLoadingMore(node.id) || !hasUnloadedChildren(node)) return

    await loadChildrenPage(node, 1)
  }

  /** 收集树里所有 LOGO 附件ID（含后端补齐的父链节点） */
  const collectLogoAttachmentIds = (records: BrandTreeRow[]): string[] => {
    const idList: string[] = []
    const walk = (nodes: BrandTreeRow[]): void => {
      for (const node of nodes) {
        if (node.logoAttachmentId) idList.push(node.logoAttachmentId)
        if (node.children?.length) walk(node.children as BrandTreeRow[])
      }
    }
    walk(records)
    return idList
  }

  /** 取 LOGO 缩略图地址（列表只返回 attachmentId，图片地址走附件接口） */
  const resolveBrandLogoUrlList = async (records: BrandTreeRow[]) => {
    const idSet = [...new Set(collectLogoAttachmentIds(records))]
    await Promise.all(
      idSet.map(async attachmentId => {
        try {
          const response = await DataAttachmentApi.thumbnail(attachmentId)
          state.logoUrlMap[attachmentId] = response?.url || ''
        } catch (error) {
          console.error('获取品牌LOGO失败', error)
          state.logoUrlMap[attachmentId] = ''
        }
      })
    )
  }

  /** 点击 LOGO 查看原图（列表只有缩略图，原图此时才去取） */
  const handleViewLogoOrigin = async (attachmentId?: string) => {
    if (!attachmentId) return

    try {
      const response = await DataAttachmentApi.preview(attachmentId)
      state.logoViewerUrlList = [response?.url || '']
      state.logoViewerVisible = true
    } catch (error) {
      console.error('获取品牌LOGO原图失败', error)
    }
  }

  const handleDelete = async (row: { id: string; name: string }) => {
    try {
      await ElMessageBox.confirm(`确定要删除品牌 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await DataBrandApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchBrandList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除品牌失败', error)
      }
    }
  }

  const fetchBrandList = async () => {
    try {
      state.loading = true
      const params = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...(state.searchForm.code && { code: state.searchForm.code }),
        ...(state.searchForm.name && { name: state.searchForm.name }),
        ...(state.searchForm.status && { status: state.searchForm.status }),
        ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
        ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) }),
        ...(state.searchForm.createStartTime && { createStartTime: state.searchForm.createStartTime }),
        ...(state.searchForm.createEndTime && { createEndTime: state.searchForm.createEndTime }),
        ...(state.searchForm.updateStartTime && { updateStartTime: state.searchForm.updateStartTime }),
        ...(state.searchForm.updateEndTime && { updateEndTime: state.searchForm.updateEndTime })
      }

      const res = await DataBrandApi.pageExpand(params)
      //重新加载列表时重置子品牌懒加载进度（世代 +1，让在途的懒加载响应失效）
      listGeneration += 1
      state.childLoad = {}
      state.loadingMoreIds = []
      state.tableData = res.records
      state.pagination.total = res.total

      //子品牌懒加载：有子品牌未带出子节点的，追加“加载更多”占位行
      applyMoreRows(state.tableData)

      // LOGO 地址：列表只返回 attachmentId，图片地址走附件缩略图接口
      await resolveBrandLogoUrlList(res.records)
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    } finally {
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchBrandList()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.createTimeRange = []
    state.searchForm.createStartTime = undefined
    state.searchForm.createEndTime = undefined
    state.searchForm.updateTimeRange = []
    state.searchForm.updateStartTime = undefined
    state.searchForm.updateEndTime = undefined
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    handleSearch()
  }

  const handlePageChange = () => fetchBrandList()
  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    state.pagination.current = 1
    fetchBrandList()
  }

  const showAddDialog = () => {
    state.dialog.add = true
  }

  const showDetail = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.detail = true
  }

  const showEdit = (row: { id: string }) => {
    state.currentBrandId = row.id
    state.dialog.edit = true
  }

  // 新增的时间范围处理方法
  const handleCreateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.createStartTime = value[0]
      state.searchForm.createEndTime = value[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeRangeChange = (value: number[] | null): void => {
    if (value?.length === 2) {
      state.searchForm.updateStartTime = value[0]
      state.searchForm.updateEndTime = value[1]
    } else {
      state.searchForm.updateStartTime = undefined
      state.searchForm.updateEndTime = undefined
    }
  }

  // 新增的用户选择相关方法
  const showCreateUserSelectorDialog = () => {
    state.createUserDialogVisible = true
  }

  const clearSelectorAllCreateUsers = () => {
    state.selectedCreateUsers = []
  }

  const removeQueryCreateUser = (userId: string) => {
    state.selectedCreateUsers = state.selectedCreateUsers.filter(user => user.id !== userId)
  }

  const handleCreateUserSelect = (users: BIamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }

  const showUpdateUserSelectorDialog = () => {
    state.updateUserDialogVisible = true
  }

  const clearSelectorAllUpdateUsers = () => {
    state.selectedUpdateUsers = []
  }

  const removeQueryUpdateUser = (userId: string) => {
    state.selectedUpdateUsers = state.selectedUpdateUsers.filter(user => user.id !== userId)
  }

  const handleUpdateUserSelect = (users: BIamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  const toggleStatus = async (row: { id: string; name: string; status: string }) => {
    try {
      const action = row.status === 'ENABLE' ? '禁用' : '启用'
      await ElMessageBox.confirm(`确定要${action}品牌 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DataBrandApi.updateStatus({
        id: row.id,
        status: row.status
      })

      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('修改品牌状态失败:', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  onMounted(async () => {
    await loadBrandStatus()
    await fetchBrandList()
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchBrandList()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  /* 添加动画效果 */
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

  .brand-page {
    height: 100%;
    min-height: 0;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  /* 列表 LOGO（点击看原图） */
  .brand-logo {
    width: 50px;
    height: 50px;
    cursor: zoom-in;
    border-radius: 4px;
    overflow: hidden;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .box-card-form {
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;
  }

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

          // 优化标签间距
          :deep(.el-select__tags) {
            .el-tag {
              margin-right: 4px;
              margin-left: 0;
              padding: 0 6px;

              &:first-child {
                margin-left: 0;
              }
            }
          }
        }

        // 创建时间和修改时间字段特殊宽度
        &.form-item-date-picker {
          flex: 1 1 320px;
          max-width: 320px;

          :deep(.el-date-editor) {
            width: 100%;
            max-width: 320px;
          }
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

      .el-switch {
        margin-left: 8px;
      }
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

  // 优化表格行高
  .brand-table {
    :deep(.el-table__body) {
      td {
        padding: 8px 0;
      }
    }

    :deep(.el-table__header) {
      th {
        padding: 8px 0;
      }
    }

    // 文本省略样式
    .text-ellipsis {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .form-item-responsive {
      flex-basis: 30% !important;
    }
  }

  @media (max-width: 768px) {
    .form-item-responsive {
      flex-basis: 45% !important;
    }

    .button-group {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
