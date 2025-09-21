<template>
  <div class="material-page-div">
    <el-splitter>
      <!-- 左侧分类树 -->
      <el-splitter-panel collapsible size="18%">
        <el-card class="box-card-tree-select">
          <el-input v-model="state.categoryQuery" placeholder="请输入分类名称" @input="onCategoryQueryChanged" />
          <el-tree-v2
            ref="categoryTreeRef"
            :data="state.categoryTreeOptions"
            :props="state.categoryProps"
            :filter-method="categoryFilterMethod"
            @check="handleCategoryCheck"
            show-checkbox
            :height="760"
          />
        </el-card>
      </el-splitter-panel>

      <el-splitter-panel :min="200">
        <!-- 搜索卡片 -->
        <transition name="slide-fade">
          <el-card class="box-card-form" v-show="state.showSearchCard">
            <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="100px">
              <div class="form-items-group">
                <el-form-item label="素材名称:" prop="title" class="form-item-responsive">
                  <el-input v-model="state.searchForm.title" placeholder="请输入素材名称" clearable @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="素材类型:" prop="type" class="form-item-responsive">
                  <el-select v-model="state.searchForm.type" placeholder="请选择素材类型" clearable>
                    <el-option v-for="option in state.materialTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>

                <el-form-item label="存储类型:" prop="storageType" class="form-item-responsive">
                  <el-select v-model="state.searchForm.storageType" placeholder="请选择存储类型" clearable>
                    <el-option v-for="option in state.storageTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>

                <el-form-item label="状态:" prop="status" class="form-item-responsive">
                  <el-select v-model="state.searchForm.status" placeholder="请选择状态" clearable>
                    <el-option v-for="option in state.statusOptions" :key="option.code" :label="option.message" :value="option.code" />
                  </el-select>
                </el-form-item>

                <el-form-item label="创建时间:" prop="createTimeRange" class="form-item-responsive">
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

                <el-form-item label="修改时间:" prop="updateTimeRange" class="form-item-responsive">
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
                  <el-button type="primary" @click="handleSearch">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="resetSearch">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </el-card>
        </transition>

        <!-- 数据卡片 -->
        <el-card class="box-card-data">
          <div class="operation-buttons">
            <el-button type="primary" size="default" @click="showUploadDialog">上传素材</el-button>
            <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
          </div>

          <el-table :data="state.tableData" border style="margin: 10px 0" v-loading="state.loading" :height="state.dataCardHeight" stripe highlight-current-row>
            <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
            <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
            <el-table-column prop="title" label="素材名称" align="center" width="160" fixed></el-table-column>
            <el-table-column prop="type" label="素材类型" align="center" width="120">
              <template #default="{ row }">
                <el-tag>{{ getMaterialTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="storageType" label="存储类型" align="center" width="120">
              <template #default="{ row }">
                <el-tag>{{ getStorageTypeLabel(row.storageType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分类" align="center" width="150">
              <template #default="{ row }">
                <el-tag v-for="categoryId in row.categoryIdSet" :key="categoryId" size="small" style="margin-right: 5px; margin-bottom: 5px">
                  {{ getCategoryName(categoryId) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" align="center" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="expireTime" label="过期时间" align="center" width="180">
              <template #default="{ row }">
                {{ row.expireTime ? formatTimestamp(row.expireTime) : '永久' }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="180">
              <template #default="{ row }">
                {{ formatTimestamp(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="updateName" label="修改人" align="center" width="120"></el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
              <template #default="{ row }">
                {{ formatTimestamp(row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="showDetailDialog(row)">详情</el-button>
                <el-button size="small" type="primary" @click="showEditDialog(row)">编辑</el-button>
                <el-button size="small" type="info" @click="showCategoryDialog(row)">分类管理</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="state.pagination.current"
            v-model:page-size="state.pagination.size"
            :page-sizes="[20, 50, 100, 200, 500, 1000]"
            :background="true"
            layout="prev, pager, next, jumper, ->, total, sizes"
            :total="state.pagination.total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </el-card>

        <!-- 对话框组件 -->
        <DataMaterialUploadDialog v-model="state.dialog.upload" @success="handleUploadSuccess" />
        <DataMaterialDetailDialog v-model="state.dialog.detail" :materialId="state.currentMaterialId" />
        <DataMaterialEditDialog v-model="state.dialog.edit" :materialId="state.currentMaterialId" @success="handleEditSuccess" />
        <DataMaterialCategoryDialog v-model="state.dialog.category" :materialId="state.currentMaterialId" @success="handleCategoryUpdateSuccess" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
  import { ElTreeV2, ElMessage } from 'element-plus'
  import { ref, watch, onMounted, reactive } from 'vue'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import { useDictionaryEnumStore } from '@/modules/common/stores/DictionaryEnum.store'
  import type {
    DataMaterialExpandPageResponse,
    DataMaterialQueryPageRequestVo,
    DataMaterialDetailResponseVo
  } from '@/modules/data/material/type/DataMaterial.type'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'
  import DataMaterialUploadDialog from '@/modules/data/material/DataMaterialUploadDialog.vue'
  import DataMaterialDetailDialog from '@/modules/data/material/DataMaterialDetailDialog.vue'
  import DataMaterialEditDialog from '@/modules/data/material/DataMaterialEditDialog.vue'
  import DataMaterialCategoryDialog from '@/modules/data/material/DataMaterialCategoryDialog.vue'
  import { TreeDataUtil } from '@/modules/common/utils/TreeData.util'

  const enumStore = useDictionaryEnumStore()
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()

  // 统一状态管理
  const state = reactive({
    loading: false,
    showSearchCard: true,
    dataCardHeight: 'calc(100vh - 450px)',
    currentMaterialId: '',
    categoryQuery: '',

    //枚举状态
    materialTypeOptions: [] as Array<{ code: string; message: string }>,
    storageTypeOptions: [] as Array<{ code: string; message: string }>,
    statusOptions: [] as Array<{ code: string; message: string }>,

    //分类树数据
    categoryTreeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    categoryMap: new Map<string, string>(), // 用于快速查找分类名称

    //分类选择配置
    categoryProps: {
      value: 'id',
      label: 'name',
      children: 'children'
    },

    //表格数据
    tableData: [] as DataMaterialDetailResponseVo[],

    // 分页数据
    pagination: {
      current: 1,
      size: 20,
      total: 0
    },

    // 搜索表单
    searchForm: {
      title: '',
      type: '',
      storageType: '',
      status: '',
      categoryIdSet: [] as string[],
      createTimeRange: [] as number[],
      createStartTime: undefined as number | undefined,
      createEndTime: undefined as number | undefined,
      updateTimeRange: [] as number[],
      updateStartTime: undefined as number | undefined,
      updateEndTime: undefined as number | undefined
    },

    // 对话框状态
    dialog: {
      upload: false,
      detail: false,
      edit: false,
      category: false
    }
  })

  // 构建查询参数
  const buildQueryParams = (): DataMaterialQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.title && { title: searchForm.title }),
      ...(searchForm.type && { type: searchForm.type }),
      ...(searchForm.storageType && { storageType: searchForm.storageType }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.categoryIdSet.length > 0 && { categoryIdSet: searchForm.categoryIdSet }),
      ...(searchForm.createStartTime && { createStartTime: searchForm.createStartTime }),
      ...(searchForm.createEndTime && { createEndTime: searchForm.createEndTime }),
      ...(searchForm.updateStartTime && { updateStartTime: searchForm.updateStartTime }),
      ...(searchForm.updateEndTime && { updateEndTime: searchForm.updateEndTime })
    }
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(state.categoryQuery.trim())
    }

    if (state.categoryQuery.trim() === '') {
      categoryTreeRef.value?.setExpandedKeys([])
    }
  }

  const categoryFilterMethod = (query: string, node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  // 处理分类树勾选事件
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(state.categoryTreeOptions, categoryTreeRef.value.getCheckedKeys()).map(
        node => node.id
      )
    }
  }

  // 获取素材列表
  const fetchData = async () => {
    try {
      state.loading = true
      const params = buildQueryParams()
      const res: DataMaterialExpandPageResponse = await DataMaterialApi.pageExpand(params)
      state.tableData = res.records
      state.pagination.total = res.total
    } catch (error) {
      console.error('获取素材列表失败', error)
    } finally {
      state.loading = false
    }
  }

  // 获取分类树
  const fetchCategoryTree = async () => {
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      state.categoryTreeOptions = response.children || []

      // 构建分类名称映射
      const buildCategoryMap = (nodes: DataMaterialCategorySimpleTreeResponseVo[]) => {
        nodes.forEach(node => {
          state.categoryMap.set(node.id, node.name)
          if (node.children) {
            buildCategoryMap(node.children)
          }
        })
      }
      buildCategoryMap(state.categoryTreeOptions)
    } catch (error) {
      console.error('获取分类树失败', error)
    }
  }

  // 处理时间范围变更
  const handleCreateTimeChange = () => {
    const range = state.searchForm.createTimeRange
    if (range && range.length === 2) {
      state.searchForm[`createStartTime`] = range[0]
      state.searchForm[`createEndTime`] = range[1]
    } else {
      state.searchForm[`createStartTime`] = undefined
      state.searchForm[`createEndTime`] = undefined
    }
  }

  const handleUpdateTimeChange = () => {
    const range = state.searchForm.updateTimeRange
    if (range && range.length === 2) {
      state.searchForm[`updateStartTime`] = range[0]
      state.searchForm[`updateEndTime`] = range[1]
    } else {
      state.searchForm[`updateStartTime`] = undefined
      state.searchForm[`updateEndTime`] = undefined
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
      title: '',
      type: '',
      storageType: '',
      status: '',
      categoryIdSet: [],
      createTimeRange: [],
      createStartTime: undefined,
      createEndTime: undefined,
      updateTimeRange: [],
      updateStartTime: undefined,
      updateEndTime: undefined
    }

    state.categoryQuery = ''
    categoryTreeRef.value?.setCheckedKeys([])

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

  // 显示上传素材对话框
  const showUploadDialog = () => {
    state.currentMaterialId = ''
    state.dialog.upload = true
  }

  // 显示编辑素材对话框
  const showEditDialog = (row: DataMaterialDetailResponseVo) => {
    state.currentMaterialId = row.id!
    state.dialog.edit = true
  }

  // 显示素材详情对话框
  const showDetailDialog = (row: DataMaterialDetailResponseVo) => {
    state.currentMaterialId = row.id!
    state.dialog.detail = true
  }

  // 显示分类管理对话框
  const showCategoryDialog = (row: DataMaterialDetailResponseVo) => {
    state.currentMaterialId = row.id!
    state.dialog.category = true
  }

  // 删除素材
  const handleDelete = async (row: DataMaterialDetailResponseVo) => {
    try {
      await DataMaterialApi.destroy({ id: row.id! })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error) {
      console.error('删除素材失败', error)
    }
  }

  // 处理操作成功
  const handleUploadSuccess = () => fetchData()
  const handleEditSuccess = () => fetchData()
  const handleCategoryUpdateSuccess = () => fetchData()

  // 获取枚举标签
  const getMaterialTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialTypeEnum', type)
    return enumItem?.message || type
  }

  const getStorageTypeLabel = (type: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialStorageTypeEnum', type)
    return enumItem?.message || type
  }

  const getStatusLabel = (status: string): string => {
    const enumItem = enumStore.getEnumItemByCodeSync('DataMaterialStatusEnum', status)
    return enumItem?.message || status
  }

  // 获取分类名称
  const getCategoryName = (categoryId: string): string => {
    return state.categoryMap.get(categoryId) || categoryId
  }

  // 获取状态标签类型
  const getStatusTagType = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'INACTIVE':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  watch(
    () => state.showSearchCard,
    newVal => {
      setTimeout(() => {
        state.dataCardHeight = newVal ? 'calc(100vh - 450px)' : 'calc(100vh - 230px)'
      }, 80)
    },
    { immediate: false }
  )

  // 初始化
  onMounted(async () => {
    // 枚举选项
    const [materialTypeOptions, storageTypeOptions, statusOptions] = await Promise.all([
      enumStore.getEnumDataAsync('DataMaterIalTypeEnum'),
      enumStore.getEnumDataAsync('SystemStorageTypeEnum'),
      enumStore.getEnumDataAsync('DataMaterialStatusEnum')
    ])

    state.materialTypeOptions = materialTypeOptions
    state.storageTypeOptions = storageTypeOptions
    state.statusOptions = statusOptions

    await fetchCategoryTree()
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
    display: flex;
    align-items: flex-start;

    .box-card-tree-select {
      margin: 4px;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

      .tree-header {
        font-weight: bold;
        padding: 8px 0;
      }
    }
  }

  .box-card-form {
    margin: 4px;
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
          flex: 1 1 320px;
          min-width: 120px;
          max-width: 320px;
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
    margin: 4px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.6s ease;

    .operation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-switch {
        margin-left: 8px;
      }
    }
  }
</style>
