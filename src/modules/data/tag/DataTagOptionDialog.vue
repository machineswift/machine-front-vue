<template>
  <el-dialog
    v-model="state.visible"
    title="标签选项管理"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="80%"
    top="8vh"
  >
    <div class="option-dialog-content">
      <div class="operation-buttons">
        <el-button type="primary" @click="openDialog('add')" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_OPTION:CREATE']">添加选项</el-button>
      </div>

      <el-table :data="state.tableData" border style="margin: 10px 0" v-loading="state.loading" max-height="800" stripe highlight-current-row>
        <el-table-column label="序号" align="center" type="index" width="60" fixed></el-table-column>
        <el-table-column prop="id" label="ID" align="center" v-if="false" fixed></el-table-column>
        <el-table-column prop="code" label="编码" align="center" width="160" fixed></el-table-column>
        <el-table-column prop="name" label="名称" align="center" width="160"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'ENABLE'"
              :inactive-value="'DISABLE'"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="val => toggleStatus(row, val)"
              v-hasPermission="['SYSTEM:BASIC_DATA:TAG_OPTION:UPDATE_STATUS']"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" align="center" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatTimestamp(row.createTime) }}
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
              <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_OPTION:DETAIL']">详情</el-button>
              <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="['SYSTEM:BASIC_DATA:TAG_OPTION:UPDATE']">编辑</el-button>
              <el-dropdown trigger="click" @command="command => handleMoreCommand(command, row)" placement="bottom-end">
                <el-button size="small" type="info">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="updateCode" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_OPTION:UPDATE_CODE'])">
                      <el-icon><EditPen /></el-icon>
                      <span>修改编码</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="updateSort" :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_OPTION:UPDATE_SORT'])">
                      <el-icon><Sort /></el-icon>
                      <span>修改排序</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided :disabled="!hasPermission(['SYSTEM:BASIC_DATA:TAG_OPTION:DELETE'])">
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
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>

    <!-- 子对话框 -->
    <DataTagOptionAddDialog v-model="state.dialog.add" :tagId="props.tagId" @success="handleSuccess" />
    <DataTagOptionEditDialog v-model="state.dialog.edit" :optionId="state.currentOptionId" @success="handleSuccess" />
    <DataTagOptionDetailDialog v-model="state.dialog.detail" :optionId="state.currentOptionId" />
    <DataTagOptionUpdateCodeDialog v-model="state.dialog.updateCode" :optionId="state.currentOptionId" @success="handleSuccess" />
    <DataTagOptionUpdateSortDialog v-model="state.dialog.updateSort" :optionId="state.currentOptionId" @success="handleSuccess" />
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowDown, EditPen, Sort, Delete } from '@element-plus/icons-vue'
  import { DataTagOptionApi } from '@/modules/data/tag/api/DataTagOption.api'
  import type { DataTagOptionExpandListResponseVo } from '@/modules/data/tag/type/DataTagOption.type'
  import { hasPermission } from '@/modules/common/utils/Permission.util'
  import DataTagOptionAddDialog from '@/modules/data/tag/DataTagOptionAddDialog.vue'
  import DataTagOptionEditDialog from '@/modules/data/tag/DataTagOptionEditDialog.vue'
  import DataTagOptionDetailDialog from '@/modules/data/tag/DataTagOptionDetailDialog.vue'
  import DataTagOptionUpdateCodeDialog from '@/modules/data/tag/DataTagOptionUpdateCodeDialog.vue'
  import DataTagOptionUpdateSortDialog from '@/modules/data/tag/DataTagOptionUpdateSortDialog.vue'

  const props = defineProps<{
    modelValue: boolean
    tagId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    tableData: [] as DataTagOptionExpandListResponseVo[],
    currentOptionId: '',
    isInitializing: false,
    dialog: {
      add: false,
      edit: false,
      detail: false,
      updateCode: false,
      updateSort: false
    }
  })

  const dialogMap: Record<string, keyof typeof state.dialog> = {
    updateCode: 'updateCode',
    updateSort: 'updateSort'
  }

  const formatTimestamp = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  const fetchData = async () => {
    if (!props.tagId) {
      state.tableData = []
      return
    }

    try {
      state.loading = true
      state.isInitializing = true
      const res = await DataTagOptionApi.listExpand({ tagId: props.tagId })
      state.tableData = Array.isArray(res) ? res : []
      await nextTick()
      setTimeout(() => {
        state.isInitializing = false
      }, 200)
    } catch (error) {
      console.error('获取选项列表失败', error)
      ElMessage.error('获取选项列表失败')
      state.tableData = []
      state.isInitializing = false
    } finally {
      state.loading = false
    }
  }

  const openDialog = (type: keyof typeof state.dialog, optionId = '') => {
    state.currentOptionId = optionId
    state.dialog[type] = true
  }

  const showDetailDialog = (row: DataTagOptionExpandListResponseVo) => openDialog('detail', row.id)
  const showEditDialog = (row: DataTagOptionExpandListResponseVo) => openDialog('edit', row.id)

  const handleMoreCommand = (command: string, row: DataTagOptionExpandListResponseVo) => {
    if (command === 'delete') {
      handleDelete(row)
      return
    }
    const dialogType = dialogMap[command]
    if (dialogType) {
      openDialog(dialogType, row.id)
    }
  }

  const toggleStatus = async (row: DataTagOptionExpandListResponseVo, newStatus: string) => {
    if (state.isInitializing) return

    const oldStatus = row.status
    try {
      await DataTagOptionApi.updateStatus({ id: row.id, status: newStatus })
      ElMessage.success('操作成功')
    } catch (error) {
      console.error('修改选项状态失败', error)
      row.status = oldStatus
      ElMessage.error('操作失败')
    }
  }

  const handleDelete = async (row: DataTagOptionExpandListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要删除选项 "${row.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await DataTagOptionApi.destroy({ id: row.id })
      ElMessage.success('删除成功')
      await fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除选项失败', error)
        ElMessage.error('删除失败')
      }
    }
  }

  const handleSuccess = () => fetchData()

  const handleDialogClosed = () => {
    state.tableData = []
    state.loading = false
    state.currentOptionId = ''
    state.isInitializing = false
  }

  watch(
    [() => props.modelValue, () => props.tagId],
    async ([modelValue, tagId]) => {
      if (modelValue && tagId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .option-dialog-content {
    .operation-buttons {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-bottom: 10px;
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
