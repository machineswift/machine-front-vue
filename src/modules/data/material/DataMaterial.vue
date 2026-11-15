<template>
  <div ref="pageContainerRef" class="material-page-div">
    <el-splitter>
      <el-splitter-panel collapsible size="18%">
        <el-card ref="treeCardRef" class="box-card-tree-select">
          <div class="tree-toolbar">
            <el-input
              v-model="state.categoryQuery"
              placeholder="请输入关键字筛选分类"
              clearable
              @input="onCategoryQueryChanged"
              @keyup.enter="onCategoryQueryChanged"
              class="tree-toolbar-input"
            />
            <el-tooltip content="拖拽分类可调整层级" placement="top">
              <el-icon class="tree-drag-tip"><InfoFilled /></el-icon>
            </el-tooltip>
            <el-button type="primary" size="small" @click="showAddCategoryDialog()" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:CREATE']">
              添加
            </el-button>
          </div>
          <!-- 树组件高度动态计算，初始不显示 -->
          <div v-show="treeHeightReady" style="flex: 1; min-height: 0">
            <el-tree-v2
              ref="categoryTreeRef"
              :data="currentCategoryTreeOptions"
              :props="CATEGORY_TREE_PROPS"
              :filter-method="categoryFilterMethod"
              @check="handleCategoryCheck"
              show-checkbox
              :height="treeHeight"
            >
              <template #default="{ node, data }">
                <div
                  class="custom-tree-node"
                  :class="getDragClass(data as DataMaterialCategorySimpleTreeResponseVo)"
                  draggable="true"
                  @dragstart.stop="handleCategoryDragStart($event, data as DataMaterialCategorySimpleTreeResponseVo)"
                  @dragover.prevent.stop="handleCategoryDragOver($event, data as DataMaterialCategorySimpleTreeResponseVo)"
                  @dragleave.stop="handleCategoryDragLeave(data as DataMaterialCategorySimpleTreeResponseVo)"
                  @drop.prevent.stop="handleCategoryDrop($event, data as DataMaterialCategorySimpleTreeResponseVo)"
                  @dragend="handleCategoryDragEnd"
                >
                  <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
                  <div class="tree-node-actions">
                    <el-tooltip v-if="isCategoryVirtualNode(data)" content="虚拟节点不可操作" placement="top">
                      <span class="tree-node-actions-wrap">
                        <el-dropdown
                          disabled
                          trigger="click"
                          @command="
                            (command: string | number | object) => handleDropdownCommand(command as string, data as DataMaterialCategorySimpleTreeResponseVo)
                          "
                          placement="bottom-end"
                        >
                          <el-button type="primary" link class="tree-node-more-btn" @click.stop disabled>
                            <el-icon><MoreFilled /></el-icon>
                          </el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="add" disabled>
                                <el-icon><Plus /></el-icon>
                                <span>添加</span>
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
                                <span>移动</span>
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
                    <el-dropdown
                      v-else
                      trigger="click"
                      @command="
                        (command: string | number | object) => handleDropdownCommand(command as string, data as DataMaterialCategorySimpleTreeResponseVo)
                      "
                      placement="bottom-end"
                    >
                      <el-button type="primary" link class="tree-node-more-btn" @click.stop>
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="add" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:CREATE'])">
                            <el-icon><Plus /></el-icon>
                            <span>添加</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="edit" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE'])">
                            <el-icon><Edit /></el-icon>
                            <span>修改</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="detail" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:DETAIL'])">
                            <el-icon><View /></el-icon>
                            <span>详情</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="updateParent" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE_PARENT'])">
                            <el-icon><Connection /></el-icon>
                            <span>移动</span>
                          </el-dropdown-item>
                          <el-dropdown-item
                            command="delete"
                            divided
                            :disabled="
                              !hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:DELETE']) ||
                              isDeleteCategoryDisabled(data as DataMaterialCategorySimpleTreeResponseVo)
                            "
                          >
                            <el-icon><Delete /></el-icon>
                            <span :title="getDeleteDisabledReason(data as DataMaterialCategorySimpleTreeResponseVo)">删除</span>
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
        <div ref="rightContentRef" class="material-main-content">
          <transition name="slide-fade">
            <el-card ref="searchCardRef" class="box-card-form" v-show="state.showSearchCard">
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
                      <el-option v-for="option in fileTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="素材标题:" prop="title" class="form-item-responsive">
                    <el-input v-model="state.searchForm.title" placeholder="请输入素材标题" clearable @keyup.enter="handleSearch" />
                  </el-form-item>
                  <el-form-item label="处理状态:" prop="processStatus" class="form-item-responsive">
                    <el-select v-model="state.searchForm.processStatus" placeholder="选择处理状态" clearable>
                      <el-option v-for="option in processStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="业务状态:" prop="businessStatus" class="form-item-responsive">
                    <el-select v-model="state.searchForm.businessStatus" placeholder="选择业务状态" clearable>
                      <el-option v-for="option in businessStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="审核状态:" prop="auditStatus" class="form-item-responsive">
                    <el-select v-model="state.searchForm.auditStatus" placeholder="选择审核状态" clearable>
                      <el-option v-for="option in auditStatusOptions" :key="option.code" :label="option.message" :value="option.code" />
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
                    <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']">
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
              <el-button type="primary" size="default" @click="showAddDialog" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:CREATE']">
                新增
              </el-button>
              <div class="operation-right">
                <el-switch v-model="state.showSearchCard" inline-prompt active-text="展开" inactive-text="收起" size="large" />
              </div>
            </div>

            <!-- 表格区域：初始不显示，等高度计算完成后再显示 -->
            <div v-show="tableHeightReady" class="table-area">
              <el-table
                :data="state.tableData"
                row-key="id"
                border
                style="margin: 10px 0"
                v-loading="state.loading"
                :height="tableHeight"
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
                        lazy
                        class="list-thumb material-preview-image"
                        :preview-src-list="[state.thumbnailUrlMap[row.attachmentId]]"
                        preview-teleported
                        hide-on-click-modal
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                      />
                      <span v-else class="thumb-placeholder">-</span>
                    </template>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="fileType" label="文件类型" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ getEnumLabel(DICT_DATA_FILE_TYPE, row.fileType) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="processStatus" label="处理状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" type="info">{{ getEnumLabel(DICT_DATA_MATERIAL_PROCESS_STATUS, row.processStatus) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="businessStatus" label="业务状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ getEnumLabel(DICT_DATA_MATERIAL_BUSINESS_STATUS, row.businessStatus) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="auditStatus" label="审核状态" align="center" width="120">
                  <template #default="{ row }">
                    <el-tag size="small">{{ getEnumLabel(DICT_DATA_MATERIAL_AUDIT_STATUS, row.auditStatus) }}</el-tag>
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
                  <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
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
                  <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button
                        size="small"
                        @click="showDetailDialog(row)"
                        :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:DETAIL'])"
                        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:DETAIL']"
                      >
                        详情
                      </el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="showEditDialog(row)"
                        :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE'])"
                        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE']"
                      >
                        编辑
                      </el-button>
                      <el-dropdown
                        trigger="click"
                        @command="(command: string | number | object) => handleMaterialDropdownCommand(command as string, row)"
                        placement="bottom-end"
                      >
                        <el-button size="small" type="info">
                          更多
                          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="category" :disabled="!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE_CATEGORY'])">
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
                ref="paginationRef"
                v-model:current-page="state.pagination.current"
                v-model:page-size="state.pagination.size"
                :page-sizes="PAGE_SIZES"
                :background="true"
                layout="prev, pager, next, jumper, ->, total, sizes"
                :total="state.pagination.total"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:PAGE_EXPAND']"
              />
            </div>

            <!-- 骨架屏占位 -->
            <div v-show="!tableHeightReady" class="table-placeholder">
              <el-skeleton :rows="8" animated />
            </div>
          </el-card>

          <DataMaterialAddDialog v-model="state.dialog.add" @success="handleAddSuccess" />
          <DataMaterialDetailDialog
            v-model="state.dialog.detail"
            :material-id="state.currentMaterialId"
            :has-prev="hasPrevDetail"
            :has-next="hasNextDetail"
            :category-tree="currentCategoryTreeOptions"
            @prev="showPrevDetail"
            @next="showNextDetail"
            @edit="handleDetailEdit"
            @category="handleDetailCategory"
          />
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

          <QuickSelectHost
            kind="iam.user"
            v-model="state.createUserDialogVisible"
            @confirm="handleCreateUserSelect"
            :multiple="true"
            :selected-users="state.selectedCreateUsers"
          />
          <QuickSelectHost
            kind="iam.user"
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
  defineOptions({
    name: 'DataMaterial'
  })
  import { onMounted, onActivated, reactive, ref, watch, computed, nextTick } from 'vue'
  import { ElTreeV2, type TreeNodeData } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Refresh, Search, Plus, Edit, View, Connection, Delete, MoreFilled, ArrowDown, InfoFilled } from '@element-plus/icons-vue'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import {
    DICT_DATA_FILE_TYPE,
    DICT_DATA_MATERIAL_PROCESS_STATUS,
    DICT_DATA_MATERIAL_BUSINESS_STATUS,
    DICT_DATA_MATERIAL_AUDIT_STATUS
  } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { useSplitCardHeights } from '@/shared/composables/useSplitCardHeights'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
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
  import QuickSelectHost from '@/shared/components/QuickSelectHost.vue'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import type { UserSummaryDto } from '@/shared/types/CommonBusiness.type'

  const enumStore = useDictionaryEnumStore()

  const { options: fileTypeOptions, load: loadFileTypeOptions } = useEnumOptions(DICT_DATA_FILE_TYPE)
  const { options: processStatusOptions, load: loadProcessStatusOptions } = useEnumOptions(DICT_DATA_MATERIAL_PROCESS_STATUS)
  const { options: businessStatusOptions, load: loadBusinessStatusOptions } = useEnumOptions(DICT_DATA_MATERIAL_BUSINESS_STATUS)
  const { options: auditStatusOptions, load: loadAuditStatusOptions } = useEnumOptions(DICT_DATA_MATERIAL_AUDIT_STATUS)

  // ---------- 常量（与后端 CommonDataConstant 等保持一致） ----------
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'
  const CATEGORY_TREE_PROPS = { value: 'id', label: 'name', children: 'children' } as const
  const PAGE_SIZES = [20, 50, 100, 200]
  const DAY_END_OFFSET = 86_399_999

  const isCategoryVirtualNode = (data: DataMaterialCategorySimpleTreeResponseVo) => data?.id === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID
  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')
  /** 统一枚举文案（DataFileTypeEnum / DataMaterialProcessStatusEnum 等）：code 为空回退 '-'；未命中自动加载并回退原始 code */
  const getEnumLabel = (enumKey: string, code?: string) => enumStore.getEnumLabel(enumKey, code, '-')

  const reloadCategoryTree = async () => {
    const previousCheckedKeys = (categoryTreeRef.value?.getCheckedKeys() as string[]) || [...state.searchForm.categoryIdSet]
    try {
      const response = await DataMaterialCategoryApi.treeSimple()
      const treeRoot = response as unknown as DataMaterialCategorySimpleTreeResponseVo
      state.categoryTreeOptions = treeRoot?.children?.length ? treeRoot.children : treeRoot?.id ? [treeRoot] : []

      state.categoryMap = {}
      currentCategoryTreeOptions.value = state.categoryTreeOptions
      buildCategoryMap(state.categoryTreeOptions)

      await nextTick()
      const validCheckedKeys = previousCheckedKeys.filter(key => key === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID || !!state.categoryMap[key])
      categoryTreeRef.value?.setCheckedKeys(validCheckedKeys)
      if (state.categoryQuery.trim()) {
        categoryTreeRef.value?.filter(state.categoryQuery.trim())
      }
      state.searchForm.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(state.categoryTreeOptions, validCheckedKeys).map(node => node.id)
    } catch (error) {
      console.error('加载分类树失败', error)
    }
  }

  const buildCategoryMap = (nodes: DataMaterialCategorySimpleTreeResponseVo[]) => {
    nodes.forEach(node => {
      state.categoryMap[node.id] = node.name
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
    categoryQuery: '',
    categoryTreeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    categoryMap: {} as Record<string, string>,
    thumbnailUrlMap: {} as Record<string, string>,
    currentMaterialId: '',
    currentCategoryId: '',
    currentCategoryParentId: '',
    tableData: [] as DataMaterialExpandListResponseVo[],
    createUserDialogVisible: false,
    updateUserDialogVisible: false,
    selectedCreateUsers: [] as UserSummaryDto[],
    selectedUpdateUsers: [] as UserSummaryDto[],
    pagination: { current: 1, size: 20, total: 0 },
    searchForm: {
      fileTypeSet: [] as string[],
      categoryIdSet: [] as string[],
      title: '',
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
  const pageContainerRef = ref<HTMLElement | null>(null)
  const rightContentRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const treeCardRef = ref()
  const dataCardRef = ref()
  const operationButtonsRef = ref<HTMLElement | null>(null)
  const paginationRef = ref<HTMLElement | null>(null)

  const { tableHeight, tableHeightReady, treeHeight, treeHeightReady, calculateTableHeight, calculateTreeHeight, setupResizeObserver } = useSplitCardHeights({
    dataCardRef,
    treeCardRef,
    operationButtonsRef,
    paginationRef,
    treeReserve: 84,
    observeRefs: [pageContainerRef, rightContentRef, searchCardRef, dataCardRef, treeCardRef]
  })

  let isFirstActivation = true

  const selectedCreateUserIds = computed({
    get: () => state.selectedCreateUsers.map(u => u.id),
    set: newIds => {
      state.selectedCreateUsers = newIds.map(id => state.selectedCreateUsers.find(user => user.id === id) || ({ id } as UserSummaryDto))
    }
  })
  const selectedUpdateUserIds = computed({
    get: () => state.selectedUpdateUsers.map(u => u.id),
    set: newIds => {
      state.selectedUpdateUsers = newIds.map(id => state.selectedUpdateUsers.find(user => user.id === id) || ({ id } as UserSummaryDto))
    }
  })

  /** 左侧分类树勾选：将选中的根节点 id 同步到查询条件，点击搜索时再请求 */
  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.searchForm.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(
        currentCategoryTreeOptions.value,
        categoryTreeRef.value.getCheckedKeys() as string[]
      ).map(node => node.id)
    }
  }

  const categoryFilterMethod = (query: string, node: TreeNodeData) => {
    if (!query) return true
    return node.name?.toLowerCase().includes(query.toLowerCase()) || false
  }

  const onCategoryQueryChanged = () => {
    if (categoryTreeRef.value) {
      categoryTreeRef.value.filter(state.categoryQuery.trim())
      if (state.categoryQuery.trim() === '') categoryTreeRef.value.setExpandedKeys([])
    }
  }

  const isDeleteCategoryDisabled = (data: DataMaterialCategorySimpleTreeResponseVo) => !!data.children?.length

  const getDeleteDisabledReason = (data: DataMaterialCategorySimpleTreeResponseVo) => (data.children?.length ? '该分类存在子分类，不能删除' : '')

  // ==================== 分类树拖拽移动 ====================
  const categoryDragState = reactive({ draggingId: '', dragOverId: '' })

  /** 是否可以放到目标节点下：排除自身、虚拟节点和自己的子孙节点 */
  const canDropCategory = (dragId: string, targetId: string) => {
    if (!dragId || !targetId || dragId === targetId) return false

    const dragNode = TreeDataUtil.findNode(currentCategoryTreeOptions.value, dragId)
    const targetNode = TreeDataUtil.findNode(currentCategoryTreeOptions.value, targetId)
    if (!dragNode || !targetNode || isCategoryVirtualNode(dragNode) || isCategoryVirtualNode(targetNode)) return false

    return !TreeDataUtil.getAllChildrenIdsIncludingSelf(currentCategoryTreeOptions.value, [dragId]).includes(targetId)
  }

  const handleCategoryDragStart = (event: DragEvent, node: DataMaterialCategorySimpleTreeResponseVo) => {
    const eventTarget = event.target as HTMLElement | null
    const disabled =
      eventTarget?.closest('.tree-node-actions') ||
      !hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE_PARENT']) ||
      isCategoryVirtualNode(node)
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

  const handleCategoryDragOver = (event: DragEvent, node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (!canDropCategory(categoryDragState.draggingId, node.id)) {
      categoryDragState.dragOverId = ''
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
      return
    }

    categoryDragState.dragOverId = node.id
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  const handleCategoryDragLeave = (node: DataMaterialCategorySimpleTreeResponseVo) => {
    if (categoryDragState.dragOverId === node.id) categoryDragState.dragOverId = ''
  }

  const handleCategoryDragEnd = () => {
    categoryDragState.draggingId = ''
    categoryDragState.dragOverId = ''
  }

  const handleCategoryDrop = async (event: DragEvent, node: DataMaterialCategorySimpleTreeResponseVo) => {
    const dragId = categoryDragState.draggingId || event.dataTransfer?.getData('text/plain') || ''
    handleCategoryDragEnd()
    if (!canDropCategory(dragId, node.id)) return

    try {
      await DataMaterialCategoryApi.updateParent({ id: dragId, parentId: node.id })
      ElMessage.success(`已移动到「${node.name}」`)
      await reloadCategoryTree()
      fetchData()
    } catch (error) {
      console.error('移动分类失败', error)
    }
  }

  const getDragClass = (node: DataMaterialCategorySimpleTreeResponseVo) => ({
    'is-dragging': categoryDragState.draggingId === node.id,
    'is-drag-over': categoryDragState.dragOverId === node.id
  })

  const currentDetailIndex = computed(() => state.tableData.findIndex(row => row.id === state.currentMaterialId))
  const hasPrevDetail = computed(() => currentDetailIndex.value > 0)
  const hasNextDetail = computed(() => currentDetailIndex.value >= 0 && currentDetailIndex.value < state.tableData.length - 1)

  const showPrevDetail = () => {
    if (hasPrevDetail.value) {
      state.currentMaterialId = state.tableData[currentDetailIndex.value - 1].id as string
    }
  }

  const showNextDetail = () => {
    if (hasNextDetail.value) {
      state.currentMaterialId = state.tableData[currentDetailIndex.value + 1].id as string
    }
  }

  const handleDetailEdit = () => {
    state.dialog.detail = false
    state.dialog.edit = true
  }

  const handleDetailCategory = () => {
    state.dialog.detail = false
    state.dialog.category = true
  }

  const buildQueryParams = (): DataMaterialQueryPageRequestVo => {
    const { searchForm, pagination } = state
    return {
      current: pagination.current,
      size: pagination.size,
      ...(searchForm.fileTypeSet.length > 0 && { fileTypeSet: searchForm.fileTypeSet }),
      ...(searchForm.categoryIdSet.length > 0 && { categoryIdSet: searchForm.categoryIdSet }),
      ...(searchForm.title && { title: searchForm.title }),
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

  /** 整页一次批量获取缩略图，避免每行一次请求 */
  const loadThumbnailsForPage = async (records: DataMaterialExpandListResponseVo[]) => {
    const attachmentIdSet = new Set(records.filter(row => row.fileType === 'IMAGE' && row.attachmentId).map(row => row.attachmentId as string))
    if (!attachmentIdSet.size) {
      state.thumbnailUrlMap = {}
      return
    }

    try {
      state.thumbnailUrlMap = (await DataAttachmentApi.mapThumbnail([...attachmentIdSet])) || {}
    } catch (error) {
      console.error('获取缩略图失败', error)
      state.thumbnailUrlMap = {}
    }
  }

  const fetchData = async () => {
    try {
      state.loading = true
      const res = await DataMaterialApi.pageExpand(buildQueryParams())
      state.tableData = res.records || []
      state.pagination.total = res.total || 0
      void loadThumbnailsForPage(state.tableData)
    } catch (error) {
      console.error('获取素材列表失败', error)
    } finally {
      state.loading = false
    }
  }

  const handleFileTypeChange = () => {
    state.pagination.current = 1
    fetchData()
  }

  const handleSearch = () => {
    state.pagination.current = 1
    fetchData()
  }

  const syncTimeRangeToForm = (range: number[] | undefined, startKey: 'createStartTime' | 'updateStartTime', endKey: 'createEndTime' | 'updateEndTime') => {
    if (range?.length === 2) {
      // el-date-picker 的 value-format="x" 返回字符串，且 daterange 结束值是当天 00:00，需要补到当天 23:59:59.999
      state.searchForm[startKey] = Number(range[0])
      state.searchForm[endKey] = Number(range[1]) + DAY_END_OFFSET
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

  const openDialog = (dialogKey: keyof typeof state.dialog, id?: string, parentId?: string) => {
    if (id !== undefined) state.currentCategoryId = id
    if (parentId !== undefined) state.currentCategoryParentId = parentId
    if (dialogKey === 'add') state.currentMaterialId = ''
    state.dialog[dialogKey] = true
  }

  const showAddDialog = () => openDialog('add')
  const showDetailDialog = (row: DataMaterialExpandListResponseVo) => {
    if (!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:DETAIL'])) return
    state.currentMaterialId = row.id!
    openDialog('detail')
  }
  const showEditDialog = (row: DataMaterialExpandListResponseVo) => {
    if (!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE'])) return
    state.currentMaterialId = row.id!
    openDialog('edit')
  }
  const showCategoryDialog = (row: DataMaterialExpandListResponseVo) => {
    if (!hasPermission(['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:UPDATE_CATEGORY'])) return
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

  const handleAddSuccess = () => {
    state.pagination.current = 1
    fetchData()
  }
  const handleEditSuccess = () => fetchData()
  const handleCategoryUpdateSuccess = () => fetchData()

  const handleCategorySuccess = async () => {
    await reloadCategoryTree()
    await fetchData()
  }
  const handleCategoryAddSuccess = handleCategorySuccess
  const handleCategoryEditSuccess = handleCategorySuccess
  const handleCategoryUpdateParentSuccess = handleCategorySuccess

  const showCreateUserSelectorDialog = () => (state.createUserDialogVisible = true)
  const clearSelectorAllCreateUsers = () => (state.selectedCreateUsers = [])
  const removeQueryCreateUser = (userId: string) => (state.selectedCreateUsers = state.selectedCreateUsers.filter(u => u.id !== userId))
  const handleCreateUserSelect = (users: UserSummaryDto[]) => {
    state.selectedCreateUsers = users
    state.createUserDialogVisible = false
  }
  const showUpdateUserSelectorDialog = () => (state.updateUserDialogVisible = true)
  const clearSelectorAllUpdateUsers = () => (state.selectedUpdateUsers = [])
  const removeQueryUpdateUser = (userId: string) => (state.selectedUpdateUsers = state.selectedUpdateUsers.filter(u => u.id !== userId))
  const handleUpdateUserSelect = (users: UserSummaryDto[]) => {
    state.selectedUpdateUsers = users
    state.updateUserDialogVisible = false
  }

  const getCategoryName = (categoryId: string) => state.categoryMap[categoryId] || categoryId

  watch(
    () => state.showSearchCard,
    () => {
      calculateTableHeight()
    }
  )

  onMounted(async () => {
    await Promise.all([loadFileTypeOptions(), loadProcessStatusOptions(), loadBusinessStatusOptions(), loadAuditStatusOptions()])
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
  .material-page-div {
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
        margin-bottom: 10px;
        flex-shrink: 0;

        .tree-toolbar-input {
          flex: 1;
          min-width: 0;
        }

        .tree-drag-tip {
          flex: none;
          color: var(--el-text-color-secondary);
          cursor: help;
        }

        .el-button {
          flex-shrink: 0;
        }
      }
    }

    .tree-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  .material-main-content {
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
    .operation-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .table-area {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
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
