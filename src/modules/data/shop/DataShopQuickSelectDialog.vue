<template>
  <el-dialog
    v-model="state.dialogVisible"
    :title="title || '选择门店'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="66%"
    top="5vh"
  >
    <el-splitter>
      <!-- 左侧组织树面板 -->
      <el-splitter-panel collapsible size="24%">
        <el-card class="box-card-tree-select">
          <template #header>
            <el-select v-model="state.searchForm.organizationType">
              <el-option v-for="option in state.organizationTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
          <el-input v-model="state.organizationQuery" placeholder="请输入关键字" @input="onOrganizationQueryChanged" />
          <el-tree-v2
            ref="organizationTreeRef"
            :data="currentOrganizationTreeOptions"
            :props="state.organizationProps"
            :filter-method="organizationFilterMethod"
            @check="handleOrganizationCheck"
            show-checkbox
            :height="440"
          />
        </el-card>
      </el-splitter-panel>

      <!-- 右侧内容面板 -->
      <el-splitter-panel :min="200">
        <div class="shop-selector-container">
          <!-- 搜索区域 -->
          <el-card class="box-card-form">
            <el-form :model="state.searchForm" class="search-form" :inline="true" label-width="100px">
              <div class="form-items-group">
                <el-form-item label="国家:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.countryCode" placeholder="选择国家" clearable>
                    <el-option v-for="option in state.countryOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="省市区:" class="form-item-responsive">
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
                <el-form-item label="门店名称:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.name" placeholder="请输入门店名称" clearable />
                </el-form-item>
                <el-form-item label="门店编码:" class="form-item-responsive">
                  <el-input v-model="state.searchForm.code" placeholder="请输入门店编码" clearable />
                </el-form-item>
                <el-form-item label="经营状态:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.businessStatusSet" placeholder="选择经营状态" multiple collapse-tags collapse-tags-tooltip clearable>
                    <el-option v-for="option in state.businessStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="运营状态:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.operationStatusSet" placeholder="选择运营状态" multiple collapse-tags collapse-tags-tooltip clearable>
                    <el-option v-for="option in state.operationStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
                <el-form-item label="物理状态:" class="form-item-responsive">
                  <el-select v-model="state.searchForm.physicalStatusSet" placeholder="选择物理状态" multiple collapse-tags collapse-tags-tooltip clearable>
                    <el-option v-for="option in state.physicalStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>
              </div>
              <!-- 操作按钮组 -->
              <div class="button-group">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>

          <!-- 门店列表 -->
          <el-table
            ref="shopTableRef"
            :data="state.shopList"
            row-key="id"
            height="400"
            v-loading="state.shopDataLoading"
            @selection-change="handleSelectionChange"
            border
            stripe
            style="margin: 10px 0"
          >
            <el-table-column v-if="multiple" type="selection" width="55" :reserve-selection="true" />
            <el-table-column v-else label="操作" width="55" fixed="left">
              <template #default="{ row }">
                <el-radio
                  v-model="state.singleSelected"
                  :label="row.id"
                  :disabled="isRowDisabled(row)"
                  @change="() => handleRadioChange(row)"
                  class="hidden-radio"
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="门店名称" align="center" width="150" fixed="left" />
            <el-table-column prop="code" label="门店编码" align="center" width="150" />
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
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :total="state.pagination.total"
            :pager-count="5"
            :page-sizes="[10, 20, 50, 200, 500]"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-splitter-panel>
    </el-splitter>

    <template #footer>
      <div class="footer-container">
        <div v-if="multiple" class="selected-info">
          已选择 {{ state.selectedCount }} 个门店
          <el-button type="warning" @click="clearAllSelection" v-if="state.selectedCount > 0">清空</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="state.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" v-hasPermission="['SYSTEM:BASIC_DATA:SHOP:PAGE_SIMPLE']">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElTable, ElTreeV2 } from 'element-plus'
  import { reactive, watch, computed, ref } from 'vue'
  import { DataShopApi } from '@/modules/data/shop/api/DataShop.api'
  import { IamOrganizationApi } from '@/modules/iam/organization/api/IamOrganization.api'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type {
    DataShopQueryPageRequestVo,
    DataShopSimpleListResponseVo,
    IamOrganizationSimpleTreeResponseVo,
    DataAreaSimpleTreeResponseVo
  } from '@/modules/data/shop/type/DataShop.type'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectedShops: {
      type: Array as () => DataShopSimpleListResponseVo[],
      default: () => []
    }
  })

  const emit = defineEmits(['update:modelValue', 'confirm'])

  const enumStore = useDictionaryEnumStore()
  const shopTableRef = ref<InstanceType<typeof ElTable>>()
  const organizationTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const currentAreaTreeOptions = ref<DataAreaSimpleTreeResponseVo[]>([])
  const currentOrganizationTreeOptions = ref<IamOrganizationSimpleTreeResponseVo[]>([])

  // 整合所有状态到一个对象中
  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    shopDataLoading: false,

    // 枚举状态
    countryOptions: [] as Array<{ code: string; message: string }>,
    businessStatusOptions: [] as Array<{ code: string; message: string }>,
    operationStatusOptions: [] as Array<{ code: string; message: string }>,
    physicalStatusOptions: [] as Array<{ code: string; message: string }>,
    organizationTypeOptions: [] as Array<{ code: string; message: string }>,

    // 组织树
    organizationQuery: '',
    areaTreeOptionsMap: new Map<string, DataAreaSimpleTreeResponseVo[]>(),
    organizationTreeOptionsMap: new Map<string, IamOrganizationSimpleTreeResponseVo[]>(),

    // 选择的门店信息
    shopList: [] as DataShopSimpleListResponseVo[],
    singleSelected: null as string | null,
    selectedRows: new Map<string, DataShopSimpleListResponseVo>(),
    selectedCount: computed(() => state.selectedRows.size),

    organizationProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },
    areaProps: {
      multiple: true,
      checkStrictly: true,
      value: 'code',
      label: 'name',
      children: 'children',
      expandTrigger: 'hover' as const
    },
    searchForm: {
      name: '',
      code: '',
      businessStatusSet: [] as string[],
      operationStatusSet: [] as string[],
      physicalStatusSet: [] as string[],
      countryCode: '',
      areaCodeSet: [] as string[],
      organizationType: null as string | null,
      organizationIdSet: [] as string[]
    },
    pagination: {
      current: 1,
      size: 10,
      total: 0
    }
  })

  // 方法
  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const isRowDisabled = (row: DataShopSimpleListResponseVo) => {
    return props.selectedShops.some(shop => shop.id === row.id)
  }

  const handleRadioChange = (row: DataShopSimpleListResponseVo) => {
    if (!isRowDisabled(row)) {
      state.singleSelected = row.id
    }
  }

  const handleSelectionChange = (rows: DataShopSimpleListResponseVo[]) => {
    const newSelectedRows = new Map(state.selectedRows)
    // 创建当前页所有行的ID集合
    const currentPageIds = new Set(state.shopList.map(row => row.id))

    // 移除当前页未选中的行
    currentPageIds.forEach(id => {
      if (!rows.some(row => row.id === id)) {
        newSelectedRows.delete(id)
      }
    })

    // 添加当前页新选中的行
    rows.forEach(row => {
      newSelectedRows.set(row.id, row)
    })

    state.selectedRows = newSelectedRows
  }

  const clearAllSelection = () => {
    state.selectedRows.clear()
    shopTableRef.value?.clearSelection()
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

  const handleSearch = () => {
    state.pagination.current = 1
    fetchShopList()
  }

  const resetSearch = () => {
    state.searchForm = {
      name: '',
      code: '',
      businessStatusSet: [],
      operationStatusSet: [],
      physicalStatusSet: [],
      countryCode: '',
      areaCodeSet: [],
      organizationType: state.searchForm.organizationType,
      organizationIdSet: []
    }
    state.organizationQuery = ''
    organizationTreeRef.value?.setCheckedKeys([])
    handleSearch()
  }

  const handleSizeChange = (size: number) => {
    state.pagination.size = size
    fetchShopList()
  }

  const handleCurrentChange = (current: number) => {
    state.pagination.current = current
    fetchShopList()
  }

  const fetchShopList = async () => {
    try {
      state.shopDataLoading = true
      const params: DataShopQueryPageRequestVo = {
        current: state.pagination.current,
        size: state.pagination.size,
        ...state.searchForm,
        ...(state.searchForm.areaCodeSet.length > 0 && {
          areaCodeSet: state.searchForm.areaCodeSet.map(subArray => subArray[subArray.length - 1])
        })
      }

      const res = await DataShopApi.pageSimple(params)
      state.shopList = res.records
      state.pagination.total = res.total

      // 设置选中状态
      if (props.multiple) {
        const newSelectedRows = new Map(state.selectedRows)
        shopTableRef.value?.clearSelection()
        state.shopList.forEach(row => {
          if (newSelectedRows.has(row.id)) {
            shopTableRef.value?.toggleRowSelection(row, true)
          }
        })
        state.selectedRows = newSelectedRows
      }
    } catch (error) {
      console.error('获取门店列表失败:', error)
    } finally {
      state.shopDataLoading = false
    }
  }

  const handleDialogClosed = () => {
    state.searchForm = {
      name: '',
      code: '',
      businessStatusSet: [],
      operationStatusSet: [],
      physicalStatusSet: [],
      countryCode: '',
      areaCodeSet: [],
      organizationType: null as string | null,
      organizationIdSet: []
    }
    state.organizationQuery = ''
    state.pagination.current = 1
    state.pagination.size = 10
    state.pagination.total = 0
    state.shopList = []
    if (!props.multiple) state.singleSelected = null
  }

  const handleConfirm = () => {
    if (props.multiple) {
      if (state.selectedCount === 0) {
        ElMessage.warning('请至少选择一个门店')
        return
      }
      emit('confirm', Array.from(state.selectedRows.values()))
    } else {
      if (!state.singleSelected) {
        ElMessage.warning('请选择一个门店')
        return
      }
      const selectedShop = state.shopList.find(row => row.id === state.singleSelected)
      if (selectedShop) {
        emit('confirm', [selectedShop])
      }
    }
    state.dialogVisible = false
  }

  // 获取状态标签
  const getBusinessStatusLabel = (type: string): string => {
    const enumItem = state.businessStatusOptions.find(item => item.code === type)
    return enumItem?.message || type
  }

  const getOperationStatusLabel = (type: string): string => {
    const enumItem = state.operationStatusOptions.find(item => item.code === type)
    return enumItem?.message || type
  }

  const getPhysicalStatusLabel = (type: string): string => {
    const enumItem = state.physicalStatusOptions.find(item => item.code === type)
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

  watch(
    () => state.searchForm.countryCode,
    async countryCode => {
      if (!countryCode) {
        currentAreaTreeOptions.value = []
        state.searchForm.areaCodeSet = []
        return
      }

      if (!state.areaTreeOptionsMap.has(countryCode)) {
        const response = await DataAreaApi.treeSimple({ countryCode })
        state.areaTreeOptionsMap.set(countryCode, response.children)
      }

      currentAreaTreeOptions.value = state.areaTreeOptionsMap.get(countryCode) || []
    },
    { immediate: false }
  )

  watch(
    () => state.searchForm.organizationType,
    async organizationType => {
      if (!organizationType) {
        return
      }

      if (!state.organizationTreeOptionsMap.has(organizationType)) {
        const response = await IamOrganizationApi.treeSimple({ type: organizationType })
        state.organizationTreeOptionsMap.set(organizationType, response.children)
      }

      state.searchForm.organizationIdSet = []
      organizationTreeRef.value?.setCheckedKeys([])
      currentOrganizationTreeOptions.value = state.organizationTreeOptionsMap.get(organizationType) || []
    },
    { immediate: false }
  )

  watch(
    () => props.modelValue,
    async val => {
      if (!val) {
        return
      }

      const [countryOptions, businessStatusOptions, operationStatusOptions, physicalStatusOptions, organizationTypeOptions] = await Promise.all([
        enumStore.getEnumDataAsync('DataCountryEnum'),
        enumStore.getEnumDataAsync('DataShopBusinessStatusEnum'),
        enumStore.getEnumDataAsync('DataShopOperationStatusEnum'),
        enumStore.getEnumDataAsync('DataShopPhysicalStatusEnum'),
        enumStore.getEnumDataAsync('IamOrganizationTypeEnum')
      ])

      state.countryOptions = countryOptions
      state.businessStatusOptions = businessStatusOptions
      state.operationStatusOptions = operationStatusOptions
      state.physicalStatusOptions = physicalStatusOptions
      state.organizationTypeOptions = organizationTypeOptions

      state.searchForm.organizationType = organizationTypeOptions[0].code

      // 初始化选择的数据状态
      if (props.multiple) {
        state.selectedRows = new Map()
        props.selectedShops.forEach(shop => {
          state.selectedRows.set(shop.id, shop)
        })
      }
      await fetchShopList()
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .shop-selector-container {
    padding: 2px;
  }

  .box-card-form {
    margin: 2px;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      flex-direction: column;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        align-items: flex-start;

        .form-item-responsive {
          margin-bottom: 2px;
          flex: 1 1 240px;
          min-width: 120px;
          max-width: 240px;
          :deep(.el-cascader__tags) {
            flex-wrap: nowrap;
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

  .box-card-tree-select {
    margin: 4px;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .el-select {
      margin: 0 0 0 0;
      width: 100%;
    }
  }

  :deep(.hidden-radio) {
    .el-radio__label {
      display: none !important;
    }
  }

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .selected-info {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }

    .footer-buttons {
      margin-left: auto;
    }
  }
</style>
