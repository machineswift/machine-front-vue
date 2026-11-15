<template>
  <div ref="pageContainerRef" class="attribute-group-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card ref="treeCardRef" class="box-card-tree-select">
          <template #header>
            <span class="tree-card-title">后台分类</span>
          </template>
          <div ref="treeBodyRef" class="tree-body">
            <el-input ref="treeSearchInputRef" v-model="state.categoryQuery" placeholder="请输入关键字" clearable @input="onCategoryQueryChanged" />
            <!-- 树组件高度动态计算，初始不显示 -->
            <div v-show="treeHeightReady" style="flex: 1; min-height: 0">
              <el-tree-v2
                ref="categoryTreeRef"
                :data="state.categoryTreeData"
                :props="state.categoryProps"
                :filter-method="categoryFilterMethod"
                @check="handleCategoryCheck"
                show-checkbox
                :height="categoryTreeHeight"
              />
            </div>
            <div v-show="!treeHeightReady" class="tree-placeholder">
              <el-skeleton :rows="6" animated />
            </div>
          </div>
        </el-card>
      </el-splitter-panel>

      <el-splitter-panel :min="200">
        <div ref="rightContentRef" class="attribute-group-main-content">
          <!-- 搜索卡片 -->
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
              <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
                <div class="form-items-group">
                  <el-form-item label="编码:" prop="code" class="form-item-responsive">
                    <el-input v-model="state.searchForm.code" placeholder="请输入分组编码" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="名称:" prop="name" class="form-item-responsive">
                    <el-input v-model="state.searchForm.name" placeholder="请输入分组名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="组类型:" prop="groupType" class="form-item-responsive">
                    <el-select v-model="state.searchForm.groupType" placeholder="选择组类型" clearable>
                      <el-option v-for="option in groupTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="状态:" prop="status" class="form-item-responsive">
                    <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
                      <el-option v-for="option in statusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>
                </div>

                <!-- 操作按钮组 -->
                <div class="button-group">
                  <el-form-item>
                    <span v-if="selectedCategoryCount > 0" class="tree-filter-hint">已选 {{ selectedCategoryCount }} 个后台分类</span>
                    <el-button type="primary" @click="handleSearch" v-hasPermission="[PERMISSION_CODE.pageExpand]">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetSearch" v-hasPermission="[PERMISSION_CODE.pageExpand]">
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
              <div class="operation-buttons-left">
                <el-button type="primary" size="default" @click="showCreateDialog" v-hasPermission="[PERMISSION_CODE.create]">新增</el-button>
              </div>
              <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
            </div>

            <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
            <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
              <el-table :data="state.tableData" border v-loading="state.loading" :height="tableHeight" stripe row-key="id">
                <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
                <el-table-column prop="code" label="编码" align="center" width="200" fixed></el-table-column>
                <el-table-column prop="name" label="名称" align="center" width="180" show-overflow-tooltip></el-table-column>
                <el-table-column prop="groupType" label="组类型" align="center" width="80">
                  <template #default="{ row }">
                    {{ enumStore.getEnumLabel(DICT_SCM_ATTRIBUTE_GROUP_TYPE, row.groupType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center" width="80">
                  <template #default="{ row }">
                    <el-switch
                      v-model="row.status"
                      :active-value="'ENABLE'"
                      :inactive-value="'DISABLE'"
                      active-text="启用"
                      inactive-text="禁用"
                      inline-prompt
                      @change="toggleStatus(row)"
                      v-hasPermission="[PERMISSION_CODE.updateStatus]"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="backCategoryCount" label="后台分类" align="center" width="100">
                  <template #default="{ row }">
                    <el-link v-if="(row.backCategoryCount ?? 0) > 0" type="primary" underline="never" @click="showBackCategoryDetailDialog(row)">
                      {{ row.backCategoryCount }}
                    </el-link>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="attributeCount" label="属性数量" align="center" width="100">
                  <template #default="{ row }">
                    <el-link v-if="(row.attributeCount ?? 0) > 0" type="primary" underline="never" @click="showAttributeDetailDialog(row)">
                      {{ row.attributeCount }}
                    </el-link>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createName" label="创建人" align="center" width="120"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="updateName" label="修改人" align="center" width="120"></el-table-column>
                <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.updateTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="[PERMISSION_CODE.detail]">详情</el-button>
                      <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="[PERMISSION_CODE.update]">编辑</el-button>
                      <el-dropdown
                        trigger="click"
                        @command="(command: string | number | object) => handleGroupDropdownCommand(command as string, row)"
                        placement="bottom-end"
                      >
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="updateCode" :disabled="!hasPermission([PERMISSION_CODE.updateCode])">
                              <el-icon><EditPen /></el-icon>
                              <span>修改编码</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updateBackCategory" :disabled="!hasPermission([PERMISSION_CODE.updateBackCategory])">
                              <el-icon><FolderOpened /></el-icon>
                              <span>后台分类</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="updateAttribute" :disabled="!hasPermission([PERMISSION_CODE.updateAttribute])">
                              <el-icon><List /></el-icon>
                              <span>关联属性</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided :disabled="!hasPermission([PERMISSION_CODE.delete])">
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
                :page-sizes="[20, 50, 100, 200, 500]"
                :background="true"
                layout="prev, pager, next, jumper, ->, total, sizes"
                :total="state.pagination.total"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                v-hasPermission="[PERMISSION_CODE.pageExpand]"
              />
            </div>

            <!-- 骨架屏占位 -->
            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>
        </div>

        <!-- 对话框组件 -->
        <ScmAttributeGroupAddDialog v-model="state.dialog.create" @success="fetchData" />
        <ScmAttributeGroupEditDialog v-model="state.dialog.edit" :group-id="state.currentId" @success="fetchData" />
        <ScmAttributeGroupUpdateCodeDialog v-model="state.dialog.updateCode" :group-id="state.currentId" @success="fetchData" />
        <ScmAttributeGroupDetailDialog v-model="state.dialog.detail" :group-id="state.currentId" />
        <ScmAttributeGroupUpdateBackCategoryDialog v-model="state.dialog.backCategoryEdit" :group-id="state.currentId" @success="fetchData" />
        <!-- 关联后台分类弹窗（仅展示关联数据，不含编辑） -->
        <ScmAttributeGroupBackCategoryDetailDialog v-model="state.dialog.backCategoryDetail" :group-id="state.currentId" />
        <!-- 关联属性弹窗（仅展示关联数据，不含编辑） -->
        <ScmAttributeGroupAttributeDetailDialog v-model="state.dialog.attributeDetail" :group-id="state.currentId" />
        <ScmAttributeGroupUpdateAttributeDialog v-model="state.dialog.attribute" :group-id="state.currentId" @success="fetchData" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'ScmAttributeGroup'
  })

  import { onMounted, onActivated, reactive, computed, ref, watch, nextTick } from 'vue'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { ElTreeV2, ElMessage, ElMessageBox } from 'element-plus'
  import type { TreeNodeData } from 'element-plus'
  import { Refresh, Search, ArrowDown, Delete, FolderOpened, List, EditPen } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS, DICT_SCM_ATTRIBUTE_GROUP_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmAttributeGroupApi } from '@/modules/scm/category/attribute/api/ScmAttributeGroup.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type {
    ScmAttributeGroupListResponseVo,
    ScmAttributeGroupQueryPageRequestVo,
    ScmAttributeGroupUpdateStatusRequestVo
  } from '@/modules/scm/category/attribute/type/ScmAttributeGroup.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
  import ScmAttributeGroupAddDialog from '@/modules/scm/category/attribute/ScmAttributeGroupAddDialog.vue'
  import ScmAttributeGroupEditDialog from '@/modules/scm/category/attribute/ScmAttributeGroupEditDialog.vue'
  import ScmAttributeGroupUpdateCodeDialog from '@/modules/scm/category/attribute/ScmAttributeGroupUpdateCodeDialog.vue'
  import ScmAttributeGroupDetailDialog from '@/modules/scm/category/attribute/ScmAttributeGroupDetailDialog.vue'
  import ScmAttributeGroupUpdateBackCategoryDialog from '@/modules/scm/category/attribute/ScmAttributeGroupUpdateBackCategoryDialog.vue'
  import ScmAttributeGroupBackCategoryDetailDialog from '@/modules/scm/category/attribute/ScmAttributeGroupBackCategoryDetailDialog.vue'
  import ScmAttributeGroupAttributeDetailDialog from '@/modules/scm/category/attribute/ScmAttributeGroupAttributeDetailDialog.vue'
  import ScmAttributeGroupUpdateAttributeDialog from '@/modules/scm/category/attribute/ScmAttributeGroupUpdateAttributeDialog.vue'

  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:CREATE',
    delete: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:DELETE',
    update: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE',
    updateCode: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE_CODE',
    updateStatus: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE_STATUS',
    updateBackCategory: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE_BACK_CATEGORY',
    updateAttribute: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:UPDATE_ATTRIBUTE',
    detail: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:DETAIL',
    pageExpand: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_GROUP:PAGE_EXPAND'
  }

  const enumStore = useDictionaryEnumStore()

  const { options: groupTypeOptions, load: loadGroupTypeOptions } = useEnumOptions(DICT_SCM_ATTRIBUTE_GROUP_TYPE)
  const { options: statusOptions, load: loadStatusOptions } = useEnumOptions(DICT_STATUS)

  const pageContainerRef = ref<HTMLElement | null>(null)
  const rightContentRef = ref<HTMLElement | null>(null)
  const treeCardRef = ref()
  const treeBodyRef = ref<HTMLElement | null>(null)
  const treeSearchInputRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  const state = reactive({
    loading: false,
    showSearchCard: true,
    tableData: [] as ScmAttributeGroupListResponseVo[],
    currentId: '',
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },
    searchForm: {
      code: '',
      name: '',
      groupType: null as string | null,
      status: null as string | null,
      backCategoryIdSet: [] as string[]
    },
    // 后台分类树相关状态
    categoryQuery: '',
    categoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    categoryProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    dialog: {
      create: false,
      edit: false,
      detail: false,
      updateCode: false,
      backCategoryDetail: false,
      backCategoryEdit: false,
      attributeDetail: false,
      attribute: false
    }
  })

  // 表格/树高度 - 初始为0，等计算完成后再显示
  let isFirstActivation = true

  const {
    tableHeight,
    tableHeightReady,
    treeHeight: categoryTreeHeight,
    treeHeightReady,
    calculateTableHeight,
    calculateTreeHeight,
    setupResizeObserver
  } = useSplitCardHeights({
    dataCardRef,
    treeCardRef,
    treeBodyRef,
    treeInputRef: treeSearchInputRef,
    operationButtonsRef,
    paginationRef,
    observeRefs: [pageContainerRef, rightContentRef, searchCardRef]
  })

  let fetchPromise: Promise<void> | null = null

  const selectedCategoryCount = computed(() => state.searchForm.backCategoryIdSet.length)

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  /** 默认收起：只展示第一级，下一级由用户按需展开 */
  const collapseAllNodes = () => {
    categoryTreeRef.value?.setExpandedKeys([])
  }

  const onCategoryQueryChanged = () => {
    categoryTreeRef.value?.filter(state.categoryQuery.trim())

    if (state.categoryQuery.trim() === '') {
      collapseAllNodes()
    }
  }

  const categoryFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    const keyword = query.toLowerCase()
    return node.name?.toLowerCase().includes(keyword) || node.code?.toLowerCase().includes(keyword) || false
  }

  /** 勾选后台分类只更新查询条件，点击搜索后生效（与用户管理页筛选交互保持一致） */
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.backCategoryIdSet = (categoryTreeRef.value.getCheckedKeys() as string[]).map(key => String(key))
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const res = await ScmBackCategoryApi.treeSimple()
      state.categoryTreeData = res.children || (res.id ? [res] : [])
      await nextTick()
      collapseAllNodes()
    } catch (error) {
      console.error('获取后台分类树失败', error)
    }
  }

  const buildQueryParams = (): ScmAttributeGroupQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.code ? { code: searchForm.code } : {}),
      ...(searchForm.name ? { name: searchForm.name } : {}),
      ...(searchForm.groupType ? { groupType: searchForm.groupType } : {}),
      ...(searchForm.status ? { status: searchForm.status } : {}),
      ...(searchForm.backCategoryIdSet.length > 0 ? { backCategoryIdSet: searchForm.backCategoryIdSet } : {})
    }
  }

  /** 请求去重 Promise，防止并发重复调用 */
  const fetchData = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmAttributeGroupApi.pageExpand(buildQueryParams())
        .then(res => {
          state.tableData = res.records
          state.pagination.total = res.total
        })
        .catch(error => {
          console.error('获取属性分组列表失败', error)
        })
      await fetchPromise
    } finally {
      fetchPromise = null
      state.loading = false
    }
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
    calculateTableHeight()
  }

  const resetSearch = () => {
    state.searchForm = {
      code: '',
      name: '',
      groupType: null,
      status: null,
      backCategoryIdSet: []
    }
    state.categoryQuery = ''
    categoryTreeRef.value?.setCheckedKeys([])

    handleSearch()
  }

  const handlePageChange = () => fetchData()

  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  const toggleStatus = async (row: ScmAttributeGroupListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '启用' : '禁用'}属性分组 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const params: ScmAttributeGroupUpdateStatusRequestVo = {
        id: row.id,
        status: row.status
      }

      await ScmAttributeGroupApi.updateStatus(params)
      ElMessage.success('修改状态成功')
    } catch (error) {
      console.error('修改属性分组状态失败', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  // 显示新增对话框
  const showCreateDialog = () => {
    state.currentId = ''
    state.dialog.create = true
  }

  // 显示编辑对话框
  const showEditDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.edit = true
  }

  // 显示修改编码对话框
  const showUpdateCodeDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.updateCode = true
  }

  // 显示详情对话框
  const showDetailDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.detail = true
  }

  // 显示关联后台分类对话框
  /** 点击后台分类数：只读查看该分组关联的后台分类 */
  const showBackCategoryDetailDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.backCategoryDetail = true
  }

  /** 下拉菜单：编辑该分组关联的后台分类 */
  const showBackCategoryEditDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.backCategoryEdit = true
  }

  /** 点击属性数量：只读查看该分组关联的属性 */
  const showAttributeDetailDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.attributeDetail = true
  }

  // 显示关联属性对话框
  const showAttributeDialog = (row: ScmAttributeGroupListResponseVo) => {
    state.currentId = row.id
    state.dialog.attribute = true
  }

  const handleDelete = async (row: ScmAttributeGroupListResponseVo) => {
    try {
      await ScmAttributeGroupApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除属性分组失败', error)
    }
  }

  /** 处理属性分组下拉菜单命令 */
  const handleGroupDropdownCommand = (command: string, row: ScmAttributeGroupListResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updateCode: () => showUpdateCodeDialog(row),
      updateBackCategory: () => showBackCategoryEditDialog(row),
      updateAttribute: () => showAttributeDialog(row),
      delete: () => {
        ElMessageBox.confirm(`确定要删除属性分组「${row.name}」吗？删除后关联的后台分类与属性将一并解除。`, '删除确认', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => handleDelete(row))
          .catch(() => {})
      }
    }
    commandMap[command]?.()
  }

  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  onMounted(async () => {
    await Promise.all([loadGroupTypeOptions(), loadStatusOptions()])
    await Promise.all([fetchData(), fetchCategoryTree()])
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

  .attribute-group-page-div {
    height: 100%;
    min-height: 0;
    padding: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    :deep(.el-splitter) {
      height: 100%;
      min-height: 0;
    }
    :deep(.el-splitter-panel) {
      min-height: 0;
    }

    .box-card-tree-select {
      margin: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      :deep(.el-card__header) {
        padding: 12px;
      }
      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        padding: 12px;
      }
      .tree-card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .tree-body {
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .attribute-group-main-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box-card-form {
    margin: 0;
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
          flex: 1 1 260px;
          min-width: 100px;
          max-width: 260px;
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;
        margin-top: 4px;

        .tree-filter-hint {
          margin-right: 12px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }

        .el-form-item {
          margin-bottom: 0;
        }
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

      .operation-buttons-left {
        display: flex;
        align-items: center;
        gap: 8px;
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
</style>
