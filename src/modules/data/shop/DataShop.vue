<template>
  <div ref="pageContainerRef" class="shop-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card class="box-card-tree-select">
          <template #header>
            <el-select v-model="state.searchForm.organizationType">
              <el-option v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
          <el-input v-model="state.organizationQuery" placeholder="请输入关键字" @input="onOrganizationQueryChanged" />
          <!-- 树组件高度动态计算，初始不设置默认值 -->
          <div v-show="treeHeightReady" style="flex: 1; min-height: 0">
            <el-tree-v2
              ref="organizationTreeRef"
              :data="currentOrganizationTreeOptions"
              :props="state.organizationProps"
              :filter-method="organizationFilterMethod"
              @check="handleOrganizationCheck"
              show-checkbox
              :height="treeHeight"
            />
          </div>
          <div v-show="!treeHeightReady" class="tree-placeholder">
            <el-skeleton :rows="6" animated />
          </div>
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div ref="rightContentRef" class="shop-main-content">
          <!-- 搜索卡片 -->
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
              <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
                <!-- 表单项保持不变 -->
                <div class="form-items-group">
                  <el-form-item label="门店名称:" prop="name" class="form-item-responsive">
                    <el-input v-model="state.searchForm.name" placeholder="请输入门店名称" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="门店编码:" prop="code" class="form-item-responsive">
                    <el-input v-model="state.searchForm.code" placeholder="请输入门店编码" clearable @keyup.enter="handleSearch" />
                  </el-form-item>

                  <el-form-item label="经营状态:" prop="businessStatusSet" class="form-item-responsive">
                    <el-select v-model="state.searchForm.businessStatusSet" placeholder="请选择经营状态" multiple collapse-tags collapse-tags-tooltip clearable>
                      <el-option v-for="option in state.businessStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="运营状态:" prop="operationStatusSet" class="form-item-responsive">
                    <el-select
                      v-model="state.searchForm.operationStatusSet"
                      placeholder="请选择运营状态"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      clearable
                    >
                      <el-option v-for="option in state.operationStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="物理状态:" prop="physicalStatusSet" class="form-item-responsive">
                    <el-select v-model="state.searchForm.physicalStatusSet" placeholder="请选择物理状态" multiple collapse-tags collapse-tags-tooltip clearable>
                      <el-option v-for="option in state.physicalStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="国家:" prop="countryCode" class="form-item-responsive">
                    <el-select v-model="state.searchForm.countryCode" placeholder="请选择国家" clearable>
                      <el-option v-for="option in state.countryCodeOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="省市区:" prop="areaCodeSet" class="form-item-responsive">
                    <el-tooltip :disabled="!!state.searchForm.countryCode" content="请先选择国家" placement="top">
                      <div style="display: block; width: 100%">
                        <el-cascader
                          v-model="state.searchForm.areaCodeSet"
                          placeholder="请选择省市区"
                          :options="currentAreaTreeOptions"
                          :props="state.areaProps"
                          collapse-tags
                          collapse-tags-tooltip
                          :max-collapse-tags="1"
                          clearable
                          filterable
                          :disabled="!state.searchForm.countryCode"
                        />
                      </div>
                    </el-tooltip>
                  </el-form-item>

                  <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive form-item-date-picker">
                    <el-date-picker
                      v-model="state.searchForm.createTimeRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="x"
                      @change="handleCreateTimeChange()"
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
                      @change="handleUpdateTimeChange()"
                    />
                  </el-form-item>
                </div>

                <!-- 操作按钮组 -->
                <div class="button-group">
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:PAGE_EXPAND']">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:PAGE_EXPAND']">
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
                <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:CREATE']">添加</el-button>
                <template v-if="hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:EXPORT'])">
                  <el-dropdown trigger="click" @command="handleExportCommand">
                    <el-button type="primary" size="default">
                      导出
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="currentList">当前列表</el-dropdown-item>
                        <el-dropdown-item command="currentSelected" :disabled="selectedRowCount === 0">当前选中</el-dropdown-item>
                        <el-dropdown-item command="currentCondition" divided>当前条件</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </div>
              <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
            </div>

            <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
            <div v-show="tableHeightReady" style="flex: 1; min-height: 0">
              <el-table
                ref="tableRef"
                row-key="id"
                :data="state.tableData"
                border
                style="margin: 10px 0"
                v-loading="state.loading"
                :height="tableHeight"
                stripe
                highlight-current-row
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" align="center" fixed :reserve-selection="true" />
                <el-table-column label="序号" align="center" type="index" width="60" fixed />
                <el-table-column prop="id" label="ID" align="center" v-if="false" fixed />
                <el-table-column prop="name" label="门店名称" align="center" width="160" fixed show-overflow-tooltip />
                <el-table-column prop="code" label="门店编码" align="center" width="180" show-overflow-tooltip />
                <el-table-column prop="businessStatus" label="经营状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.businessStatus)">
                      {{ getBusinessStatusLabel(row.businessStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="operationStatus" label="运营状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.operationStatus)">
                      {{ getOperationStatusLabel(row.operationStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="physicalStatus" label="物理状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.physicalStatus)">
                      {{ getPhysicalStatusLabel(row.physicalStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="addressInfo" label="地址" align="center" width="200" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ formatAddress(row.addressInfo) || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" align="center" width="150" show-overflow-tooltip />
                <el-table-column prop="labelOptionList" label="标签" align="center" width="150">
                  <template #default="{ row }">
                    <el-tag v-for="tag in row.labelOptionList" :key="tag.id" size="small" style="margin-right: 5px; margin-bottom: 5px">
                      {{ tag.name }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTimestamp(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="updateName" label="修改人" align="center" width="120" />
                <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
                  <template #default="{ row }">
                    {{ formatTimestamp(row.updateTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:DETAIL']">详情</el-button>
                      <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:UPDATE']">
                        编辑
                      </el-button>
                      <el-dropdown trigger="click" @command="command => handleShopDropdownCommand(command, row)" placement="bottom-end">
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item v-if="hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:UPDATE_CERTIFICATE'])" command="certificate">
                              <el-icon><Document /></el-icon>
                              <span>证件管理</span>
                            </el-dropdown-item>
                            <el-dropdown-item v-if="hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:UPDATE_LABEL_OPTION'])" command="label">
                              <el-icon><Collection /></el-icon>
                              <span>标签管理</span>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <el-pagination
                v-if="hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:SHOP:PAGE_EXPAND'])"
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

            <!-- 骨架屏占位 -->
            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>

          <!-- 对话框组件 -->
          <DataShopAddDialog v-model="state.dialog.add" @success="handleAddSuccess" />
          <DataShopDetailDialog v-model="state.dialog.detail" :shopId="state.currentShopId" />
          <DataShopEditDialog v-model="state.dialog.edit" :shopId="state.currentShopId" @success="handleEditSuccess" />
          <DataShopCertificateDialog v-model="state.dialog.certificate" :shopId="state.currentShopId" @success="handleCertificateUpdateSuccess" />
          <DataShopLabelDialog v-if="state.currentShopId" v-model="state.dialog.label" :shopId="state.currentShopId" @success="handleLabelUpdateSuccess" />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:BASIC_DATA:SHOP'
  })
  import { ElTreeV2 } from 'element-plus'
  import { ref, watch, onMounted, reactive, computed, nextTick, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { Refresh, Search, ArrowDown, Document, Collection } from '@element-plus/icons-vue'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { AddressInfoDto } from '@/shared/types/CommonData.type'
  import type {
    DataShopExpandPageResponse,
    DataShopQueryPageRequestVo,
    DataShopDetailResponseVo,
    DataShopExportRequestVo
  } from '@/modules/data/shop/type/DataShop.type'
  import DataShopAddDialog from '@/modules/data/shop/DataShopAddDialog.vue'
  import DataShopDetailDialog from '@/modules/data/shop/DataShopDetailDialog.vue'
  import DataShopEditDialog from '@/modules/data/shop/DataShopEditDialog.vue'
  import DataShopCertificateDialog from '@/modules/data/shop/DataShopCertificateDialog.vue'
  import DataShopLabelDialog from '@/modules/data/shop/DataShopLabelDialog.vue'
  import type { DataAreaSimpleTreeResponseVo, DataAreaTreeSimpleResponseVo } from '@/modules/data/area/type/DataArea.type'
  import type { IamOrganizationSimpleTreeResponseVo } from '@/modules/iam/organization/type/IamOrganization.type'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import { hasPermission } from '@/shared/utils/Permission.util'

  const router = useRouter()
  const enumStore = useDictionaryEnumStore()
  const organizationTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const tableRef = ref<InstanceType<typeof import('element-plus').ElTable>>()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const rightContentRef = ref<HTMLElement | null>(null)
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

  /** 跨页选中的门店 ID 集合，翻页后仍保留 */
  const selectedShopIdSet = ref<Set<string>>(new Set())
  /** 恢复勾选时忽略 selection-change */
  const isRestoringSelection = ref(false)
  /** 待恢复的选中 ID（翻页前保存），watch tableData 后再恢复，避免被 selection-change([]) 冲掉 */
  const pendingRestoreIds = ref<Set<string> | null>(null)
  const currentAreaTreeOptions = ref<DataAreaTreeSimpleResponseVo[]>([])
  const currentOrganizationTreeOptions = ref<IamOrganizationSimpleTreeResponseVo[]>([])

  const selectedRowCount = computed(() => selectedShopIdSet.value.size)

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
    // 头部高度（header + select）约 100px，输入框约 40px
    const headerHeight = 100
    const inputHeight = 40
    const contentSpacing = 16
    const newHeight = Math.max(400, cardBody.clientHeight - headerHeight - inputHeight - contentSpacing)

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
    const rightContentEl = rightContentRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(dataCardRef.value)
    const treeCardEl = document.querySelector('.box-card-tree-select')

    if (!pageContainerEl || !rightContentEl || !searchCardEl || !dataCardEl || !treeCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
      calculateTreeHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(rightContentEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
    resizeObserver.observe(treeCardEl)
  }

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,

    //枚举状态
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,
    countryCodeOptions: [] as Array<{ code: string; message: string }>,
    businessStatusOptions: [] as Array<{ code: string; message: string }>,
    operationStatusOptions: [] as Array<{ code: string; message: string }>,
    physicalStatusOptions: [] as Array<{ code: string; message: string }>,

    currentShopId: '',
    organizationQuery: '',

    //区域组织数据
    areaTreeOptions: new Map<string, DataAreaSimpleTreeResponseVo[]>(),
    organizationTreeOptions: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),

    //表格数据
    tableData: [] as DataShopDetailResponseVo[],

    //组织选择
    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    //省市区选择
    areaProps: {
      multiple: true,
      checkStrictly: true,
      value: 'code',
      label: 'name',
      children: 'children',
      expandTrigger: 'hover' as const
    },
    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      code: '',
      name: '',
      countryCode: '',
      areaCodeSet: [] as string[],
      organizationType: null as string | null,
      organizationIdSet: [] as string[],
      businessStatusSet: [] as string[],
      operationStatusSet: [] as string[],
      physicalStatusSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },

    // 对话框状态
    dialog: {
      add: false,
      detail: false,
      edit: false,
      certificate: false,
      label: false
    }
  })

  /** 选择变化时：当前页外的已选 ID 保留，当前页以本次勾选为准，实现跨页多选 */
  const handleSelectionChange = (rows: DataShopDetailResponseVo[]) => {
    if (isRestoringSelection.value || pendingRestoreIds.value !== null) return
    const currentPageIds = new Set(state.tableData.map(r => r.id))
    const selectedIds = new Set(rows.map(r => r.id))
    const otherPageIds = [...selectedShopIdSet.value].filter(id => !currentPageIds.has(id))
    selectedShopIdSet.value = new Set([...otherPageIds, ...selectedIds])
  }

  /** 根据 ID 集合恢复当前页勾选（在表格渲染完成后调用） */
  const doRestoreTableSelection = (idsToSelect: Set<string>) => {
    const table = tableRef.value
    if (!table || !state.tableData.length) return
    isRestoringSelection.value = true
    state.tableData.forEach(row => {
      table.toggleRowSelection(row, idsToSelect.has(row.id))
    })
    selectedShopIdSet.value = new Set(idsToSelect)
    nextTick(() => {
      isRestoringSelection.value = false
      pendingRestoreIds.value = null
    })
  }

  /** 构建导出请求参数（与查询条件一致，支持可选 shopIdSet） */
  const buildExportRequest = (options: { shopIdSet?: string[] }): DataShopExportRequestVo => {
    const { searchForm } = state
    const base: DataShopExportRequestVo = {
      ...(options.shopIdSet && options.shopIdSet.length > 0 && { shopIdSet: options.shopIdSet }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.organizationType && { organizationType: searchForm.organizationType }),
      ...(searchForm.organizationIdSet && searchForm.organizationIdSet.length > 0 && { organizationIdSet: searchForm.organizationIdSet }),
      ...(searchForm.countryCode && { countryCode: searchForm.countryCode }),
      ...(searchForm.areaCodeSet &&
        searchForm.areaCodeSet.length > 0 && {
          areaCodeSet: searchForm.areaCodeSet.map((subArray: string[] | string) => (Array.isArray(subArray) ? subArray[subArray.length - 1] : subArray))
        }),
      ...(searchForm.businessStatusSet && searchForm.businessStatusSet.length > 0 && { businessStatusSet: searchForm.businessStatusSet }),
      ...(searchForm.operationStatusSet && searchForm.operationStatusSet.length > 0 && { operationStatusSet: searchForm.operationStatusSet }),
      ...(searchForm.physicalStatusSet && searchForm.physicalStatusSet.length > 0 && { physicalStatusSet: searchForm.physicalStatusSet }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
    return base
  }

  /** 导出下拉：当前列表 | 当前选中 | 当前条件 */
  const handleExportCommand = async (command: 'currentList' | 'currentSelected' | 'currentCondition') => {
    let request: DataShopExportRequestVo
    if (command === 'currentList') {
      const ids = state.tableData.map(r => r.id)
      request = buildExportRequest(ids.length > 0 ? { shopIdSet: ids } : {})
    } else if (command === 'currentSelected') {
      const ids = Array.from(selectedShopIdSet.value)
      request = buildExportRequest(ids.length > 0 ? { shopIdSet: ids } : {})
    } else {
      request = buildExportRequest({})
    }

    try {
      await DataShopApi.exportShop(request)
      await ElMessageBox.confirm('导出任务已创建，文件生成后可到下载中心查看并下载。', '导出成功', {
        confirmButtonText: '前往下载中心',
        cancelButtonText: '知道了',
        type: 'success'
      })
      router.push('/system/workspace/download')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导出门店失败', error)
      }
    }
  }

  // 构建查询参数
  const buildQueryParams = (): DataShopQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.organizationType && { organizationType: searchForm.organizationType }),
      ...(searchForm.organizationIdSet.length > 0 && { organizationIdSet: searchForm.organizationIdSet }),
      ...(searchForm.countryCode && { countryCode: searchForm.countryCode }),
      ...(searchForm.areaCodeSet.length > 0 && { areaCodeSet: searchForm.areaCodeSet.map(subArray => subArray[subArray.length - 1]) }),
      ...(searchForm.businessStatusSet.length > 0 && { businessStatusSet: searchForm.businessStatusSet }),
      ...(searchForm.operationStatusSet.length > 0 && { operationStatusSet: searchForm.operationStatusSet }),
      ...(searchForm.physicalStatusSet.length > 0 && { physicalStatusSet: searchForm.physicalStatusSet }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
  }

  const onOrganizationQueryChanged = () => {
    if (organizationTreeRef.value) {
      organizationTreeRef.value.filter(state.organizationQuery.trim())
    }

    if (state.organizationQuery.trim() === '') {
      organizationTreeRef.value?.setExpandedKeys([])
    }
  }

  const organizationFilterMethod = (query: string, node: IamOrganizationSimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  // 处理组织树勾选事件
  const handleOrganizationCheck = () => {
    if (organizationTreeRef.value) {
      state.searchForm.organizationIdSet = TreeDataUtil.getRootNodesFromSelected(
        currentOrganizationTreeOptions.value,
        organizationTreeRef.value.getCheckedKeys()
      ).map(node => node.id)
    }
  }

  // 获取门店列表
  const fetchData = async () => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const res: DataShopExpandPageResponse = await DataShopApi.pageExpand(params)
      pendingRestoreIds.value = new Set(selectedShopIdSet.value)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取门店列表失败', error)
    } finally {
      state.loading = false
    }
  }

  // 处理时间范围变更
  const handleCreateTimeChange = () => {
    const range = state.searchForm.createTimeRange
    if (range && range.length === 2) {
      state.searchForm.createStartTime = range[0]
      state.searchForm.createEndTime = range[1]
    } else {
      state.searchForm.createStartTime = undefined
      state.searchForm.createEndTime = undefined
    }
  }

  const handleUpdateTimeChange = () => {
    const range = state.searchForm.updateTimeRange
    if (range && range.length === 2) {
      state.searchForm.updateStartTime = range[0]
      state.searchForm.updateEndTime = range[1]
    } else {
      state.searchForm.updateStartTime = undefined
      state.searchForm.updateEndTime = undefined
    }
  }

  // 搜索
  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  // 重置搜索
  const resetSearch = () => {
    state.searchForm = {
      code: '',
      name: '',
      countryCode: '',
      areaCodeSet: [],
      organizationType: state.searchForm.organizationType,
      organizationIdSet: [] as string[],
      businessStatusSet: [],
      operationStatusSet: [],
      physicalStatusSet: [],
      createTimeRange: [],
      createStartTime: undefined,
      createEndTime: undefined,
      updateTimeRange: [],
      updateStartTime: undefined,
      updateEndTime: undefined
    }

    state.organizationQuery = ''
    organizationTreeRef.value?.setCheckedKeys([])
    selectedShopIdSet.value = new Set()

    handleSearch()
  }

  // 分页改变
  const handlePageChange = () => fetchData()

  // 分页大小改变
  const handleSizeChange = (newSize: number) => {
    state.pagination.size = newSize
    state.pagination.current = 1
    fetchData()
  }

  // 显示添加门店对话框
  const showAddDialog = () => {
    state.currentShopId = ''
    state.dialog.add = true
  }

  // 显示编辑门店对话框
  const showEditDialog = (row: DataShopDetailResponseVo) => {
    state.currentShopId = row.id
    state.dialog.edit = true
  }

  // 显示门店详情对话框
  const showDetailDialog = (row: DataShopDetailResponseVo) => {
    state.currentShopId = row.id
    state.dialog.detail = true
  }

  // 显示证件管理对话框
  const showCertificateDialog = (row: DataShopDetailResponseVo) => {
    state.currentShopId = row.id
    state.dialog.certificate = true
  }

  // 显示标签管理对话框
  const showLabelDialog = (row: DataShopDetailResponseVo) => {
    state.currentShopId = row.id
    state.dialog.label = true
  }

  /** 处理门店下拉菜单命令 */
  const handleShopDropdownCommand = (command: string, row: DataShopDetailResponseVo) => {
    const commandMap: Record<string, () => void> = {
      certificate: () => showCertificateDialog(row),
      label: () => showLabelDialog(row)
    }
    commandMap[command]?.()
  }

  // 处理操作成功
  const handleAddSuccess = () => fetchData()
  const handleEditSuccess = () => fetchData()
  const handleCertificateUpdateSuccess = () => fetchData()
  const handleLabelUpdateSuccess = () => fetchData()

  // 获取状态标签
  const getBusinessStatusLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataShopBusinessStatusEnum', type)
    return enumItem?.message || type
  }

  const getOperationStatusLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataShopOperationStatusEnum', type)
    return enumItem?.message || type
  }

  const getPhysicalStatusLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataShopPhysicalStatusEnum', type)
    return enumItem?.message || type
  }

  // 获取状态标签类型
  const getStatusTagType = (status: string): string => {
    switch (status) {
      case 'OPEN':
      case 'NORMAL':
      case 'ACTIVE':
        return 'success'
      case 'CLOSED':
      case 'ABNORMAL':
      case 'INACTIVE':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 格式化地址
  const formatAddress = (addressInfo?: AddressInfoDto): string => {
    if (!addressInfo) return '无'
    const { country, province, city, area, address } = addressInfo
    return `${country || ''}${province || ''}${city || ''}${area || ''}${address || ''}`
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  watch(
    () => state.searchForm.organizationType,
    async organizationType => {
      if (!organizationType) {
        return
      }

      if (!state.organizationTreeOptions.has(organizationType)) {
        const response = await IamOrganizationApi.treeSimple({ type: organizationType })
        state.organizationTreeOptions.set(organizationType, response.children)
      }

      state.searchForm.organizationIdSet = []
      organizationTreeRef.value?.setCheckedKeys([])
      currentOrganizationTreeOptions.value = state.organizationTreeOptions.get(organizationType)!
    },
    { immediate: false }
  )

  watch(
    () => state.searchForm.countryCode,
    async countryCode => {
      if (!countryCode) {
        currentAreaTreeOptions.value = []
        state.searchForm.countryCode = ''
        state.searchForm.areaCodeSet = []
        return
      }

      if (!state.areaTreeOptions.has(countryCode)) {
        const response = await DataAreaApi.treeSimple({ countryCode })
        state.areaTreeOptions.set(countryCode, response.children)
      }

      currentAreaTreeOptions.value = state.areaTreeOptions.get(countryCode)!
    },
    { immediate: false }
  )

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  /** tableData 变化后（含翻页）再恢复勾选，避免被表格的 selection-change([]) 冲掉 */
  watch(
    () => state.tableData,
    newData => {
      const ids = pendingRestoreIds.value
      if (!ids || !newData?.length) {
        if (ids && !newData?.length) pendingRestoreIds.value = null
        return
      }
      nextTick(() => {
        setTimeout(() => {
          doRestoreTableSelection(new Set(ids))
        }, 50)
      })
    },
    { flush: 'post' }
  )

  // 初始化
  onMounted(async () => {
    // 枚举选项
    const [countryCodeOptions, businessStatusOptions, operationStatusOptions, physicalStatusOptions, organizationTypeOptions] = await Promise.all([
      enumStore.getEnumDataAsync('DataCountryEnum'),
      enumStore.getEnumDataAsync('DataShopBusinessStatusEnum'),
      enumStore.getEnumDataAsync('DataShopOperationStatusEnum'),
      enumStore.getEnumDataAsync('DataShopPhysicalStatusEnum'),
      enumStore.getEnumDataAsync('IamOrganizationTypeEnum')
    ])

    state.countryCodeOptions = countryCodeOptions
    state.businessStatusOptions = businessStatusOptions
    state.operationStatusOptions = operationStatusOptions
    state.physicalStatusOptions = physicalStatusOptions
    state.organizationTypeOptions = organizationTypeOptions

    if (organizationTypeOptions.length > 0) {
      state.searchForm.organizationType = organizationTypeOptions[0].code
    }

    await fetchData()
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

  .shop-page-div {
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

      .el-select {
        margin: 0 0 0 0;
        width: 100%;
      }

      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 12px;
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .shop-main-content {
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

          .el-cascader {
            width: 100%;
          }

          :deep(.el-cascader__tags) {
            flex-wrap: nowrap;
          }

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
      }
    }
  }

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

  .text-ellipsis {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
</style>
