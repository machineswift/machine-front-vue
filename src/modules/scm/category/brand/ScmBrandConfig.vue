<template>
  <div ref="pageContainerRef" class="brand-config-page-div">
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
        <div ref="rightContentRef" class="brand-config-main-content">
          <!-- 搜索卡片 -->
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
              <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
                <div class="form-items-group">
                  <el-form-item label="名称:" prop="name" class="form-item-responsive">
                    <el-input v-model="state.searchForm.name" placeholder="品牌名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="拼音全拼:" prop="namePinyinFull" class="form-item-responsive">
                    <el-input v-model="state.searchForm.namePinyinFull" placeholder="品牌拼音全拼" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="首字母:" prop="namePinyinInitial" class="form-item-responsive">
                    <el-input v-model="state.searchForm.namePinyinInitial" placeholder="品牌拼音首字母" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="英文名称:" prop="nameEn" class="form-item-responsive">
                    <el-input v-model="state.searchForm.nameEn" placeholder="品牌英文名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="编码:" prop="code" class="form-item-responsive">
                    <el-input v-model="state.searchForm.code" placeholder="品牌编码" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="状态:" prop="status" class="form-item-responsive">
                    <el-select v-model="state.searchForm.status" placeholder="选择状态" clearable>
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
                      @change="handleCreateTimeRangeChange"
                    />
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
                <el-table-column prop="code" label="编码" align="center" width="180" fixed>
                  <template #default="{ row }">{{ row.code || '-' }}</template>
                </el-table-column>
                <el-table-column prop="name" label="品牌名称" align="center" width="160" fixed show-overflow-tooltip>
                  <template #default="{ row }">{{ row.name || row.brandId }}</template>
                </el-table-column>
                <el-table-column prop="namePinyinFull" label="拼音全拼" align="center" width="140" show-overflow-tooltip>
                  <template #default="{ row }">{{ row.namePinyinFull || '-' }}</template>
                </el-table-column>
                <el-table-column prop="namePinyinInitial" label="拼音首字母" align="center" width="110">
                  <template #default="{ row }">{{ row.namePinyinInitial || '-' }}</template>
                </el-table-column>
                <el-table-column prop="status" label="状态" align="center" width="90">
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
                <el-table-column prop="backCategoryNumber" label="关联后台类目数" align="center" width="130">
                  <template #default="{ row }">
                    <el-link v-if="(row.backCategoryNumber ?? 0) > 0" type="primary" underline="never" @click="showBackCategoryDetailDialog(row)">
                      {{ row.backCategoryNumber }}
                    </el-link>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createName" label="创建人" align="center" width="120" show-overflow-tooltip></el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="180">
                  <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
                </el-table-column>
                <el-table-column prop="updateName" label="修改人" align="center" width="120" show-overflow-tooltip></el-table-column>
                <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
                  <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="[PERMISSION_CODE.detail]">详情</el-button>
                      <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="[PERMISSION_CODE.update]">编辑</el-button>
                      <el-dropdown
                        trigger="click"
                        @command="(command: string | number | object) => handleDropdownCommand(command as string, row)"
                        placement="bottom-end"
                      >
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="updateBackCategory" :disabled="!hasPermission([PERMISSION_CODE.updateBackCategory])">
                              <el-icon><Connection /></el-icon>
                              <span>后台分类</span>
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
      </el-splitter-panel>
    </el-splitter>

    <!-- 对话框组件 -->
    <ScmBrandConfigAddDialog v-model="state.dialog.create" @success="fetchData" />
    <ScmBrandConfigEditDialog v-model="state.dialog.edit" :config-id="state.currentId" @success="fetchData" />
    <ScmBrandConfigDetailDialog v-model="state.dialog.detail" :config-id="state.currentId" />
    <ScmBrandConfigBackCategoryDetailDialog v-model="state.dialog.backCategoryDetail" :config-id="state.currentId" />
    <ScmBrandConfigUpdateBackCategoryDialog v-model="state.dialog.updateBackCategory" :config-id="state.currentId" @success="fetchData" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'ScmBrandConfig'
  })

  import { onMounted, onActivated, reactive, computed, ref, nextTick, watch } from 'vue'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { ElTreeV2, ElMessage, ElMessageBox } from 'element-plus'
  import type { TreeNodeData } from 'element-plus'
  import { Refresh, Search, ArrowDown, Delete, Connection } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { ScmBrandConfigApi } from '@/modules/scm/category/brand/api/ScmBrandConfig.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/category/api/ScmBackCategory.api'
  import type { ScmBrandConfigListResponseVo, ScmBrandConfigQueryPageRequestVo } from '@/modules/scm/category/brand/type/ScmBrandConfig.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/category/type/ScmBackCategory.type'
  import ScmBrandConfigAddDialog from '@/modules/scm/category/brand/ScmBrandConfigAddDialog.vue'
  import ScmBrandConfigEditDialog from '@/modules/scm/category/brand/ScmBrandConfigEditDialog.vue'
  import ScmBrandConfigDetailDialog from '@/modules/scm/category/brand/ScmBrandConfigDetailDialog.vue'
  import ScmBrandConfigBackCategoryDetailDialog from '@/modules/scm/category/brand/ScmBrandConfigBackCategoryDetailDialog.vue'
  import ScmBrandConfigUpdateBackCategoryDialog from '@/modules/scm/category/brand/ScmBrandConfigUpdateBackCategoryDialog.vue'

  /** 权限编码与后端 @PreAuthorize 保持一致（ScmBrandConfigController） */
  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:BRAND_CONFIG:CREATE',
    delete: 'MANAGE_APP:SCM:BRAND_CONFIG:DELETE',
    update: 'MANAGE_APP:SCM:BRAND_CONFIG:UPDATE',
    updateStatus: 'MANAGE_APP:SCM:BRAND_CONFIG:UPDATE_STATUS',
    updateBackCategory: 'MANAGE_APP:SCM:BRAND_CONFIG:UPDATE_BACK_CATEGORY',
    detail: 'MANAGE_APP:SCM:BRAND_CONFIG:DETAIL',
    pageExpand: 'MANAGE_APP:SCM:BRAND_CONFIG:PAGE_EXPAND'
  }

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
  const searchFormRef = ref()
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  const state = reactive({
    loading: false,
    showSearchCard: true,
    tableData: [] as ScmBrandConfigListResponseVo[],
    currentId: '',
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },
    searchForm: {
      code: '',
      name: '',
      namePinyinFull: '',
      namePinyinInitial: '',
      nameEn: '',
      status: null as string | null,
      backCategoryIdSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined
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
      backCategoryDetail: false,
      updateBackCategory: false
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

  /** 勾选后台分类只更新查询条件，点击搜索后生效 */
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

  const buildQueryParams = (): ScmBrandConfigQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.code ? { code: searchForm.code } : {}),
      ...(searchForm.name ? { name: searchForm.name } : {}),
      ...(searchForm.namePinyinFull ? { namePinyinFull: searchForm.namePinyinFull } : {}),
      ...(searchForm.namePinyinInitial ? { namePinyinInitial: searchForm.namePinyinInitial } : {}),
      ...(searchForm.nameEn ? { nameEn: searchForm.nameEn } : {}),
      ...(searchForm.status ? { status: searchForm.status } : {}),
      ...(searchForm.backCategoryIdSet.length > 0 ? { backCategoryIdSet: searchForm.backCategoryIdSet } : {}),
      ...(searchForm.createStartTime ? { createStartTime: searchForm.createStartTime } : {}),
      ...(searchForm.createEndTime ? { createEndTime: searchForm.createEndTime } : {})
    }
  }

  /** 请求去重 Promise，防止并发重复调用 */
  const fetchData = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmBrandConfigApi.pageExpand(buildQueryParams())
        .then(res => {
          state.tableData = res.records
          state.pagination.total = res.total
        })
        .catch(error => {
          console.error('获取品牌配置列表失败', error)
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

  const handleCreateTimeRangeChange = (value: number[] | null) => {
    if (value?.length === 2) {
      state.searchForm.createStartTime = value[0]
      state.searchForm.createEndTime = value[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.searchForm.code = ''
    state.searchForm.name = ''
    state.searchForm.namePinyinFull = ''
    state.searchForm.namePinyinInitial = ''
    state.searchForm.nameEn = ''
    state.searchForm.status = null
    state.searchForm.backCategoryIdSet = []
    state.searchForm.createTimeRange = []
    state.searchForm.createStartTime = undefined
    state.searchForm.createEndTime = undefined
    state.categoryQuery = ''
    categoryTreeRef.value?.setCheckedKeys([])
    state.showSearchCard = true

    handleSearch()
  }

  const handlePageChange = () => fetchData()

  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  // 显示新增对话框
  const showCreateDialog = () => {
    state.currentId = ''
    state.dialog.create = true
  }

  // 显示编辑对话框
  const showEditDialog = (row: ScmBrandConfigListResponseVo) => {
    state.currentId = row.id
    state.dialog.edit = true
  }

  // 显示详情对话框
  const showDetailDialog = (row: ScmBrandConfigListResponseVo) => {
    state.currentId = row.id
    state.dialog.detail = true
  }

  // 点击关联后台类目数：只读查看该品牌配置关联的后台类目
  const showBackCategoryDetailDialog = (row: ScmBrandConfigListResponseVo) => {
    state.currentId = row.id
    state.dialog.backCategoryDetail = true
  }

  // 显示关联后台分类对话框
  const showUpdateBackCategoryDialog = (row: ScmBrandConfigListResponseVo) => {
    state.currentId = row.id
    state.dialog.updateBackCategory = true
  }

  /** 切换品牌配置状态：先确认，失败时回滚开关 */
  const toggleStatus = async (row: ScmBrandConfigListResponseVo) => {
    try {
      const action = row.status === 'ENABLE' ? '启用' : '禁用'
      await ElMessageBox.confirm(`确定要${action}品牌「${row.name || row.brandId}」的配置吗？`, '状态确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await ScmBrandConfigApi.updateStatus({ id: row.id, status: row.status || '' })
      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('修改品牌配置状态失败', error)
      // 操作取消或失败时，恢复原来的状态
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const handleDelete = async (row: ScmBrandConfigListResponseVo) => {
    try {
      await ScmBrandConfigApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除品牌配置失败', error)
    }
  }

  /** 处理品牌配置下拉菜单命令 */
  const handleDropdownCommand = (command: string, row: ScmBrandConfigListResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updateBackCategory: () => showUpdateBackCategoryDialog(row),
      delete: () => {
        ElMessageBox.confirm(`确定要删除品牌「${row.name || row.brandId}」的配置吗？`, '删除确认', {
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

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  onMounted(async () => {
    await loadStatusOptions()
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

  .brand-config-page-div {
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

  .brand-config-main-content {
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

        .form-item-date-picker {
          flex: 1 1 360px;
          max-width: 360px;
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
