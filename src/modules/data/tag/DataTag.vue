<template>
  <div class="tag-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card class="box-card-tree-select">
          <template #header>
            <div class="tree-header">
              <el-select v-model="state.searchForm.type" @change="handleTypeChange">
                <el-option v-for="option in state.typeOptions" :key="option.code" :label="option.message" :value="option.code" />
              </el-select>
              <el-button type="primary" size="small" @click="showAddCategoryDialog()" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_CATEGORY:CREATE']">
                添加分类
              </el-button>
            </div>
          </template>
          <el-input v-model="state.categoryQuery" placeholder="请输入关键字" @input="onCategoryQueryChanged" />
          <!-- 树组件高度动态计算，初始不显示 -->
          <div v-show="treeHeightReady" style="flex: 1; min-height: 0">
            <el-tree-v2
              ref="categoryTreeRef"
              :data="currentCategoryTreeOptions"
              :props="state.categoryProps"
              :filter-method="categoryFilterMethod"
              @node-click="handleCategoryNodeClick"
              :height="treeHeight"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <span class="tree-node-label">{{ node.label }}</span>
                  <div class="tree-node-actions">
                    <el-dropdown trigger="click" @command="command => handleDropdownCommand(command, data)" placement="bottom-end">
                      <el-button type="primary" link class="tree-node-more-btn" @click.stop>
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="add" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:CREATE'])">
                            <el-icon><Plus /></el-icon>
                            <span>添加子分类</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="edit" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE'])">
                            <el-icon><Edit /></el-icon>
                            <span>修改</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="detail" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:DETAIL'])">
                            <el-icon><View /></el-icon>
                            <span>详情</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="updateSort" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE_SORT'])">
                            <el-icon><Sort /></el-icon>
                            <span>修改排序</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="updateParent" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:UPDATE_PARENT'])">
                            <el-icon><Connection /></el-icon>
                            <span>修改父分类</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="delete" divided :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_CATEGORY:DELETE'])">
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
        <div ref="pageContainerRef" class="tag-main-panel">
          <!-- 搜索卡片 -->
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
              <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
                <div class="form-items-group">
                  <el-form-item label="编码:" prop="code" class="form-item-responsive">
                    <el-input v-model="state.searchForm.code" placeholder="请输入编码" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="名称:" prop="name" class="form-item-responsive">
                    <el-input v-model="state.searchForm.name" placeholder="请输入名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="状态:" prop="status" class="form-item-responsive">
                    <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                      <el-option v-for="option in state.statusOptions" :key="option.code" :label="option.message" :value="option.code" />
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
                </div>

                <!-- 操作按钮组 -->
                <div class="button-group">
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch" v-hasPermission="['SYSTEM:BASIC_DATA:TAG:PAGE_EXPAND']">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetSearch" v-hasPermission="['SYSTEM:BASIC_DATA:TAG:PAGE_EXPAND']">
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
              <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['SYSTEM:BASIC_DATA:TAG:CREATE']">添加标签</el-button>
              <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
            </div>

            <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
            <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
              <el-table
                :data="state.tableData"
                border
                style="margin: 10px 0"
                v-loading="state.loading"
                :height="tableHeight"
                stripe
                highlight-current-row
                class="tag-table"
              >
                <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
                <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
                <el-table-column prop="code" label="编码" align="center" width="160" fixed>
                  <template #default="{ row }">
                    <el-tooltip v-if="row.code" :content="row.code" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.code }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称" align="center" width="160">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.name" :content="row.name" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.name }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center" width="120">
                  <template #default="{ row }">
                    <el-switch
                      v-model="row.status"
                      :active-value="'ENABLE'"
                      :inactive-value="'DISABLE'"
                      active-text="启用"
                      inactive-text="禁用"
                      inline-prompt
                      @change="toggleStatus(row)"
                      v-hasPermission="['SYSTEM:BASIC_DATA:TAG:UPDATE_STATUS']"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" align="center" width="100"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTimestamp(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="updateName" label="修改人" align="center" width="160">
                  <template #default="{ row }">
                    <el-tooltip v-if="row.updateName" :content="row.updateName" placement="top" :append-to-body="true">
                      <span class="text-ellipsis">{{ row.updateName }}</span>
                    </el-tooltip>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTimestamp(row.updateTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button
                        size="small"
                        @click="showDetailDialog(row)"
                        :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:DETAIL'])"
                        v-hasPermission="['SYSTEM:BASIC_DATA:TAG:DETAIL']"
                      >
                        详情
                      </el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="showEditDialog(row)"
                        :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:UPDATE'])"
                        v-hasPermission="['SYSTEM:BASIC_DATA:TAG:UPDATE']"
                      >
                        编辑
                      </el-button>
                      <el-dropdown trigger="click" @command="command => handleTagDropdownCommand(command, row)" placement="bottom-end">
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="updateCode" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:UPDATE_CODE'])">
                              <el-icon><EditPen /></el-icon>
                              <span>修改编码</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updateSort" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:UPDATE_SORT'])">
                              <el-icon><Sort /></el-icon>
                              <span>修改排序</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updateCategory" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:UPDATE_CATEGORY'])">
                              <el-icon><Connection /></el-icon>
                              <span>修改分类</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="option" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_OPTION:CREATE'])">
                              <el-icon><Setting /></el-icon>
                              <span>选项</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG:DELETE'])">
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
                v-hasPermission="['SYSTEM:BASIC_DATA:TAG:PAGE_EXPAND']"
              />
            </div>

            <!-- 骨架屏占位 -->
            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>

          <!-- 对话框组件 -->
          <DataTagAddDialog v-model="state.dialog.add" :type="state.searchForm.type" @success="handleAddSuccess" />
          <DataTagDetailDialog v-model="state.dialog.detail" :tagId="state.currentTagId" />
          <DataTagEditDialog v-model="state.dialog.edit" :tagId="state.currentTagId" @success="handleEditSuccess" />
          <DataTagCategoryAddDialog
            v-model="state.dialog.addCategory"
            :type="state.searchForm.type"
            :parentId="state.currentCategoryParentId"
            @success="handleCategoryAddSuccess"
          />
          <DataTagCategoryEditDialog v-model="state.dialog.editCategory" :categoryId="state.currentCategoryId" @success="handleCategoryEditSuccess" />
          <DataTagCategoryDetailDialog v-model="state.dialog.detailCategory" :categoryId="state.currentCategoryId" />
          <DataTagCategoryUpdateSortDialog
            v-model="state.dialog.updateSortCategory"
            :categoryId="state.currentCategoryId"
            @success="handleCategoryUpdateSortSuccess"
          />
          <DataTagCategoryUpdateParentDialog
            v-model="state.dialog.updateParentCategory"
            :categoryId="state.currentCategoryId"
            :type="state.searchForm.type"
            @success="handleCategoryUpdateParentSuccess"
          />
          <DataTagOptionDialog v-model="state.dialog.option" :tagId="state.currentTagId" />
          <DataTagUpdateCodeDialog v-model="state.dialog.updateCode" :tagId="state.currentTagId" @success="handleTagUpdateSuccess" />
          <DataTagUpdateSortDialog v-model="state.dialog.updateSort" :tagId="state.currentTagId" @success="handleTagUpdateSuccess" />
          <DataTagUpdateCategoryDialog
            v-model="state.dialog.updateCategory"
            :tagId="state.currentTagId"
            :type="state.searchForm.type"
            @success="handleTagUpdateSuccess"
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
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:BASIC_DATA:TAG'
  })
  import { ElTreeV2 } from 'element-plus'
  import { onMounted, reactive, ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search, Plus, Edit, View, Sort, Connection, Delete, MoreFilled, ArrowDown, EditPen, Setting } from '@element-plus/icons-vue'
  import { DataTagApi } from '@/modules/data/tag/api/DataTag.api'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import type { DataTagExpandListResponseVo, DataTagQueryPageRequestVo } from '@/modules/data/tag/type/DataTag.type'
  import type { DataTagCategoryTreeSimpleOutputDto } from '@/modules/data/tag/type/DataTagCategory.type'
  import DataTagAddDialog from '@/modules/data/tag/DataTagAddDialog.vue'
  import DataTagDetailDialog from '@/modules/data/tag/DataTagDetailDialog.vue'
  import DataTagEditDialog from '@/modules/data/tag/DataTagEditDialog.vue'
  import DataTagCategoryAddDialog from '@/modules/data/tag/DataTagCategoryAddDialog.vue'
  import DataTagCategoryEditDialog from '@/modules/data/tag/DataTagCategoryEditDialog.vue'
  import DataTagCategoryDetailDialog from '@/modules/data/tag/DataTagCategoryDetailDialog.vue'
  import DataTagCategoryUpdateSortDialog from '@/modules/data/tag/DataTagCategoryUpdateSortDialog.vue'
  import DataTagCategoryUpdateParentDialog from '@/modules/data/tag/DataTagCategoryUpdateParentDialog.vue'
  import DataTagOptionDialog from '@/modules/data/tag/DataTagOptionDialog.vue'
  import DataTagUpdateCodeDialog from '@/modules/data/tag/DataTagUpdateCodeDialog.vue'
  import DataTagUpdateSortDialog from '@/modules/data/tag/DataTagUpdateSortDialog.vue'
  import DataTagUpdateCategoryDialog from '@/modules/data/tag/DataTagUpdateCategoryDialog.vue'
  import IamUserQuickSelectDialog from '@/modules/iam/user/IamUserQuickSelectDialog.vue'
  import type { IamUserSimpleListResponseVo } from '@/modules/iam/user/type/IamUser.type'

  // ==================== 组合式函数 ====================
  const enumStore = useDictionaryEnumStore()

  /** 格式化时间戳 */
  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  /** 收集分类及其所有子节点的ID */
  const collectCategoryAndChildrenIds = (node: DataTagCategoryTreeSimpleOutputDto): string[] => {
    const ids: string[] = [node.id]
    node.children?.forEach(child => ids.push(...collectCategoryAndChildrenIds(child)))
    return ids
  }

  /** 重新加载分类树 */
  const reloadCategoryTree = async () => {
    const type = state.searchForm.type
    if (!type) return

    try {
      state.categoryTreeOptions.delete(type)
      const response = await DataTagCategoryApi.treeSimple({ type })
      state.categoryTreeOptions.set(type, response.children || [])
      currentCategoryTreeOptions.value = state.categoryTreeOptions.get(type) || []
    } catch (error) {
      console.error('加载分类树失败', error)
    }
  }

  /** 重置分类树状态 */
  const resetCategoryTreeState = () => {
    state.searchForm.categoryIdSet = []
    state.categoryQuery = ''
    categoryTreeRef.value?.setExpandedKeys([])
  }

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,

    //枚举状态
    statusOptions: [],
    typeOptions: [],

    //分类树相关状态
    categoryQuery: '',
    categoryTreeOptions: new Map<string, DataTagCategoryTreeSimpleOutputDto[]>(),
    currentTagId: '',
    currentCategoryId: '',
    currentCategoryParentId: '',
    tableData: [] as DataTagExpandListResponseVo[],

    // 用户选择相关状态
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as IamUserSimpleListResponseVo[],
    selectedUpdateUsers: [] as IamUserSimpleListResponseVo[],

    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      type: null as string | null,
      categoryIdSet: [] as string[],
      code: '',
      name: '',
      status: null
    },
    // 对话框状态
    dialog: {
      add: false,
      detail: false,
      edit: false,
      addCategory: false,
      editCategory: false,
      detailCategory: false,
      updateSortCategory: false,
      updateParentCategory: false,
      option: false,
      updateCode: false,
      updateSort: false,
      updateCategory: false
    },
    categoryProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    }
  })

  // ==================== Refs ====================
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const currentCategoryTreeOptions = ref<DataTagCategoryTreeSimpleOutputDto[]>([])
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  // 表格高度 - 初始为0，等计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  // 树组件高度
  const treeHeight = ref<number>(0)
  const treeHeightReady = ref<boolean>(false)

  let resizeObserver: ResizeObserver | null = null
  let isFirstTableCalculation = true
  let isFirstTreeCalculation = true

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

    // 首次计算完成后显示表格
    if (isFirstTableCalculation && tableHeight.value > 0) {
      tableHeightReady.value = true
      isFirstTableCalculation = false
    }
  }

  const calculateTreeHeight = async () => {
    await nextTick()
    const treeCard = document.querySelector('.box-card-tree-select')
    if (!treeCard) return
    const cardBody = treeCard.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return
    // 头部高度（select + 按钮）约 60px，输入框约 40px，内边距约 24px
    const headerHeight = 60
    const inputHeight = 40
    const paddingHeight = 24
    const contentSpacing = 16
    const newHeight = Math.max(400, cardBody.clientHeight - headerHeight - inputHeight - paddingHeight - contentSpacing)

    if (treeHeight.value !== newHeight) {
      treeHeight.value = newHeight
    }

    // 首次计算完成后显示树组件
    if (isFirstTreeCalculation && treeHeight.value > 0) {
      treeHeightReady.value = true
      isFirstTreeCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    const treeCardEl = document.querySelector('.box-card-tree-select')

    if (!pageContainerEl || !searchCardEl || !dataCardEl || !treeCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
      calculateTreeHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
    resizeObserver.observe(treeCardEl)
  }

  // ==================== 计算属性 ====================
  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || ({ id } as IamUserSimpleListResponseVo))
    }
  })

  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || ({ id } as IamUserSimpleListResponseVo))
    }
  })

  // ==================== 分类树相关 ====================
  /** 处理分类树节点点击 */
  const handleCategoryNodeClick = (data: DataTagCategoryTreeSimpleOutputDto) => {
    state.searchForm.categoryIdSet = collectCategoryAndChildrenIds(data)
    state.pagination.current = 1
    fetchData()
  }

  /** 分类树过滤方法 */
  const categoryFilterMethod = (query: string, node: DataTagCategoryTreeSimpleOutputDto) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  /** 分类查询变化处理 */
  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(state.categoryQuery.trim())
      if (state.categoryQuery.trim() === '') {
        categoryTreeRef.value.setExpandedKeys([])
      }
    }
  }

  // ==================== 数据获取 ====================
  /** 构建查询参数 */
  const buildQueryParams = (): DataTagQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      type: searchForm.type!,
      ...(searchForm.categoryIdSet.length > 0 && { categoryIdSet: searchForm.categoryIdSet }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(state.selectedCreateUsers.length > 0 && { createUserIdSet: state.selectedCreateUsers.map(u => u.id) }),
      ...(state.selectedUpdateUsers.length > 0 && { updateUserIdSet: state.selectedUpdateUsers.map(u => u.id) })
    }
  }

  /** 获取标签列表 */
  const fetchData = async () => {
    if (!state.searchForm.type) return
    try {
      state.loading = true
      const res = await DataTagApi.pageExpand(buildQueryParams())
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取标签列表失败', error)
    } finally {
      state.loading = false
    }
  }

  // ==================== 搜索和分页 ====================
  /** 处理类型变更 */
  const handleTypeChange = () => {
    resetCategoryTreeState()
    state.pagination.current = 1
    fetchData()
  }

  /** 搜索 */
  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  /** 重置搜索 */
  const resetSearch = () => {
    state.searchForm = {
      ...state.searchForm,
      categoryIdSet: [],
      code: '',
      name: '',
      status: null
    }
    state.selectedCreateUsers = []
    state.selectedUpdateUsers = []
    resetCategoryTreeState()
    handleSearch()
  }

  /** 分页改变 */
  const handlePageChange = () => fetchData()

  /** 分页大小改变 */
  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  // ==================== 对话框管理 ====================
  /** 检查类型是否已选择 */
  const checkTypeSelected = (): boolean => {
    if (!state.searchForm.type) {
      ElMessage.warning('请先选择类型')
      return false
    }
    return true
  }

  /** 打开对话框 */
  const openDialog = (dialogKey: keyof typeof state.dialog, id?: string, parentId?: string) => {
    const isCategoryDialog = String(dialogKey).includes('Category')
    if (isCategoryDialog && !checkTypeSelected()) return
    if (id) state.currentCategoryId = id
    if (parentId !== undefined) state.currentCategoryParentId = parentId
    // 只有在打开添加对话框时才清空 tagId，其他情况保持已设置的 tagId
    if (dialogKey === 'add' && !isCategoryDialog) {
      state.currentTagId = ''
    }
    state.dialog[dialogKey] = true
  }

  // 标签对话框
  const showAddDialog = () => checkTypeSelected() && openDialog('add')
  const showEditDialog = (row: DataTagExpandListResponseVo) => {
    state.currentTagId = row.id
    openDialog('edit')
  }
  const showDetailDialog = (row: DataTagExpandListResponseVo) => {
    state.currentTagId = row.id
    openDialog('detail')
  }
  const showOptionDialog = (row: DataTagExpandListResponseVo) => {
    state.currentTagId = row.id
    openDialog('option')
  }

  /** 处理标签下拉菜单命令 */
  const handleTagDropdownCommand = (command: string, row: DataTagExpandListResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updateCode: () => {
        state.currentTagId = row.id
        openDialog('updateCode')
      },
      updateSort: () => {
        state.currentTagId = row.id
        openDialog('updateSort')
      },
      updateCategory: () => {
        state.currentTagId = row.id
        openDialog('updateCategory')
      },
      option: () => showOptionDialog(row),
      delete: () => handleDelete(row)
    }
    commandMap[command]?.()
  }

  // 分类对话框
  const showAddCategoryDialog = (parentId?: string) => openDialog('addCategory', '', parentId || '')

  // ==================== 标签操作 ====================
  /** 切换标签状态 */
  const toggleStatus = async (row: DataTagExpandListResponseVo) => {
    try {
      // @change 事件触发时，row.status 已经是新状态了，所以需要反转判断
      const action = row.status === 'ENABLE' ? '启用' : '禁用'
      await ElMessageBox.confirm(`确定要${action}标签 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DataTagApi.updateStatus({ id: row.id, status: row.status })
    } catch (error) {
      if (error !== 'cancel') {
        console.error('修改标签状态失败', error)
        row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
      }
    }
  }

  /** 删除标签 */
  const handleDelete = async (row: DataTagExpandListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await DataTagApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除标签失败', error)
      }
    }
  }

  // ==================== 成功回调处理 ====================
  /** 标签操作成功回调 */
  const handleAddSuccess = () => fetchData()
  const handleEditSuccess = () => fetchData()
  const handleTagUpdateSuccess = () => fetchData()

  /** 分类操作成功回调（需要重新加载分类树） */
  const handleCategorySuccess = async () => {
    await reloadCategoryTree()
    fetchData()
  }

  const handleCategoryAddSuccess = handleCategorySuccess
  const handleCategoryEditSuccess = handleCategorySuccess
  const handleCategoryUpdateSortSuccess = handleCategorySuccess
  const handleCategoryUpdateParentSuccess = handleCategorySuccess

  // ==================== 用户选择相关方法 ====================
  // 创建人选择相关方法
  const showCreateUserSelectorDialog = () => {
    state.createUserDialogVisible = true
  }

  const clearSelectorAllCreateUsers = () => {
    state.selectedCreateUsers = []
  }

  const removeQueryCreateUser = (userId: string) => {
    state.selectedCreateUsers = state.selectedCreateUsers.filter(user => user.id !== userId)
  }

  const handleCreateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }

  // 修改人选择相关方法
  const showUpdateUserSelectorDialog = () => {
    state.updateUserDialogVisible = true
  }

  const clearSelectorAllUpdateUsers = () => {
    state.selectedUpdateUsers = []
  }

  const removeQueryUpdateUser = (userId: string) => {
    state.selectedUpdateUsers = state.selectedUpdateUsers.filter(user => user.id !== userId)
  }

  const handleUpdateUserSelect = (users: IamUserSimpleListResponseVo[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  // ==================== 分类操作 ====================
  /** 处理下拉菜单命令 */
  const handleDropdownCommand = (command: string, data: DataTagCategoryTreeSimpleOutputDto) => {
    const commandMap: Record<string, () => void> = {
      add: () => showAddCategoryDialog(data.id),
      edit: () => openDialog('editCategory', data.id),
      detail: () => openDialog('detailCategory', data.id),
      updateSort: () => openDialog('updateSortCategory', data.id),
      updateParent: () => openDialog('updateParentCategory', data.id),
      delete: () => handleCategoryDelete(data)
    }
    commandMap[command]?.()
  }

  /** 删除分类 */
  const handleCategoryDelete = async (category: DataTagCategoryTreeSimpleOutputDto) => {
    try {
      await ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await DataTagCategoryApi.destroy({ id: category.id })
      ElMessage.success('删除成功')
      await handleCategorySuccess()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除分类失败', error)
      }
    }
  }

  // ==================== 监听器 ====================
  /** 监听类型变化，加载分类树 */
  watch(
    () => state.searchForm.type,
    async type => {
      if (!type) return
      if (!state.categoryTreeOptions.has(type)) {
        try {
          const response = await DataTagCategoryApi.treeSimple({ type })
          state.categoryTreeOptions.set(type, response.children || [])
        } catch (error) {
          console.error('加载分类树失败', error)
        }
      }
      resetCategoryTreeState()
      currentCategoryTreeOptions.value = state.categoryTreeOptions.get(type) || []
    },
    { immediate: false }
  )

  /** 监听搜索卡片显示状态，调整表格高度 */
  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  // ==================== 初始化 ====================
  onMounted(async () => {
    const [statusOptions, typeOptions] = await Promise.all([enumStore.getEnumDataAsync('StatusEnum'), enumStore.getEnumDataAsync('ProfileSubjectTypeEnum')])
    state.statusOptions = statusOptions
    state.typeOptions = typeOptions

    if (typeOptions.length > 0) {
      state.searchForm.type = typeOptions[0].code
      await fetchData()
    }
    await nextTick()
    setupResizeObserver()
    await calculateTableHeight()
    await calculateTreeHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
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

  .tag-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    box-sizing: border-box;
    display: flex;
    align-items: stretch;

    :deep(.el-splitter) {
      width: 100%;
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

      .tree-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-select {
          flex: 1;
          margin: 0;
        }
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .tag-main-panel {
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
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;
      }
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

    .tree-node-actions {
      display: flex;
      align-items: center;
      margin-left: 8px;

      .tree-node-more-btn {
        padding: 0;
        width: 24px;
        height: 24px;
        opacity: 0;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 16px;
        }
      }
    }

    &:hover .tree-node-actions .tree-node-more-btn {
      opacity: 1;
    }
  }

  // 文本省略样式
  .tag-table {
    .text-ellipsis {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }
  }
</style>
