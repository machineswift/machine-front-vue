<template>
  <el-dialog
    v-model="state.visible"
    title="属性值管理"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div class="operation-buttons">
      <el-button type="primary" @click="showAddDialog" v-hasPermission="[PERMISSION_CODE.create]">添加</el-button>
      <span class="form-item-tip">所属属性：{{ props.attributeName || '-' }}</span>
    </div>

    <el-table :data="state.tableData" border size="small" height="380" v-loading="state.loading" stripe>
      <el-table-column label="序号" align="center" type="index" width="60" fixed />
      <el-table-column prop="code" label="编码" align="center" width="180" fixed show-overflow-tooltip />
      <el-table-column prop="name" label="名称" align="center" width="160" show-overflow-tooltip />
      <el-table-column prop="value" label="实际值" align="center" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.value || '-' }}</template>
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
            v-hasPermission="[PERMISSION_CODE.updateStatus]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" align="center" width="100" />
      <el-table-column prop="createTime" label="创建时间" align="center" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" align="center" width="180">
        <template #default="{ row }">
          {{ formatTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="showDetailDialog(row)" v-hasPermission="[PERMISSION_CODE.listExpand]">详情</el-button>
            <el-button size="small" type="primary" @click="showEditDialog(row)" v-hasPermission="[PERMISSION_CODE.update]">编辑</el-button>
            <el-dropdown trigger="click" @command="(command: string | number | object) => handleMoreCommand(command as string, row)" placement="bottom-end">
              <el-button size="small" type="info">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="updateCode" :disabled="!hasPermission([PERMISSION_CODE.updateCode])">
                    <el-icon><EditPen /></el-icon>
                    <span>编码</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="updateSort" :disabled="!hasPermission([PERMISSION_CODE.update])">
                    <el-icon><Sort /></el-icon>
                    <span>排序</span>
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
      <template #empty>暂无属性值</template>
    </el-table>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>

    <!-- 子对话框 -->
    <ScmAttributeValueAddDialog v-model="state.dialog.add" :attribute-id="props.attributeId" @success="handleSuccess" />
    <ScmAttributeValueEditDialog v-model="state.dialog.edit" :attribute-value="state.currentRow" @success="handleSuccess" />
    <ScmAttributeValueDetailDialog v-model="state.dialog.detail" :attribute-value="state.currentRow" />
    <ScmAttributeValueUpdateCodeDialog v-model="state.dialog.updateCode" :attribute-value="state.currentRow" @success="handleSuccess" />
    <ScmAttributeValueUpdateSortDialog v-model="state.dialog.updateSort" :attribute-value="state.currentRow" @success="handleSuccess" />
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowDown, Delete, EditPen, Sort } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { ScmAttributeValueApi } from '@/modules/scm/category/attribute/api/ScmAttributeValue.api'
  import type { ScmAttributeValueListResponseVo } from '@/modules/scm/category/attribute/type/ScmAttributeValue.type'
  import ScmAttributeValueAddDialog from '@/modules/scm/category/attribute/ScmAttributeValueAddDialog.vue'
  import ScmAttributeValueEditDialog from '@/modules/scm/category/attribute/ScmAttributeValueEditDialog.vue'
  import ScmAttributeValueDetailDialog from '@/modules/scm/category/attribute/ScmAttributeValueDetailDialog.vue'
  import ScmAttributeValueUpdateCodeDialog from '@/modules/scm/category/attribute/ScmAttributeValueUpdateCodeDialog.vue'
  import ScmAttributeValueUpdateSortDialog from '@/modules/scm/category/attribute/ScmAttributeValueUpdateSortDialog.vue'

  const PERMISSION_CODE = {
    create: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:CREATE',
    delete: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:DELETE',
    update: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:UPDATE',
    updateStatus: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:UPDATE_STATUS',
    updateCode: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:UPDATE_CODE',
    listExpand: 'MANAGE_APP:SCM:CATEGORY:ATTRIBUTE_VALUE:LIST_EXPAND'
  }

  const props = defineProps<{
    modelValue: boolean
    attributeId: string
    attributeName?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    tableData: [] as ScmAttributeValueListResponseVo[],
    /** 当前操作行（编辑/详情/修改编码/排序子弹窗共用，属性值无 detail 接口，直接用行数据） */
    currentRow: null as ScmAttributeValueListResponseVo | null,
    dialog: {
      add: false,
      edit: false,
      detail: false,
      updateCode: false,
      updateSort: false
    }
  })

  const formatTime = (timestamp?: number): string => {
    return timestamp ? new Date(timestamp).toLocaleString() : '无'
  }

  const fetchData = async () => {
    if (!props.attributeId) {
      state.tableData = []
      return
    }

    try {
      state.loading = true
      const res = await ScmAttributeValueApi.listExpand({ attributeId: props.attributeId })
      state.tableData = Array.isArray(res) ? res : []
    } catch (error) {
      console.error('获取属性值列表失败', error)
      state.tableData = []
    } finally {
      state.loading = false
    }
  }

  const showAddDialog = () => {
    state.currentRow = null
    state.dialog.add = true
  }

  const showDetailDialog = (row: ScmAttributeValueListResponseVo) => {
    state.currentRow = row
    state.dialog.detail = true
  }

  const showEditDialog = (row: ScmAttributeValueListResponseVo) => {
    state.currentRow = row
    state.dialog.edit = true
  }

  const showUpdateCodeDialog = (row: ScmAttributeValueListResponseVo) => {
    state.currentRow = row
    state.dialog.updateCode = true
  }

  const showUpdateSortDialog = (row: ScmAttributeValueListResponseVo) => {
    state.currentRow = row
    state.dialog.updateSort = true
  }

  /** 处理属性值下拉菜单命令 */
  const handleMoreCommand = (command: string, row: ScmAttributeValueListResponseVo) => {
    const commandMap: Record<string, () => void> = {
      updateCode: () => showUpdateCodeDialog(row),
      updateSort: () => showUpdateSortDialog(row),
      delete: () => handleDelete(row)
    }
    commandMap[command]?.()
  }

  const toggleStatus = async (row: ScmAttributeValueListResponseVo) => {
    try {
      await ElMessageBox.confirm(`确定要${row.status === 'ENABLE' ? '启用' : '禁用'}属性值「${row.name}」吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await ScmAttributeValueApi.updateStatus({ id: row.id, status: row.status })
      ElMessage.success('修改状态成功')
    } catch (error) {
      // 取消或失败时恢复原状态（接口错误消息由响应拦截器统一提示）
      if (error !== 'cancel') {
        console.error('修改属性值状态失败', error)
      }
      row.status = row.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    }
  }

  const handleDelete = (row: ScmAttributeValueListResponseVo) => {
    ElMessageBox.confirm(`确定要删除属性值「${row.name}」吗？启用状态的属性值不能删除。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await ScmAttributeValueApi.destroy({ id: row.id })
        ElMessage.success('删除成功')
        await fetchData()
      })
      .catch(() => {})
  }

  const handleSuccess = () => fetchData()

  const handleDialogClosed = () => {
    state.loading = false
    state.tableData = []
    state.currentRow = null
    state.dialog = {
      add: false,
      edit: false,
      detail: false,
      updateCode: false,
      updateSort: false
    }
  }

  watch(
    [() => props.modelValue, () => props.attributeId],
    async ([modelValue, attributeId]) => {
      if (modelValue && attributeId) {
        await fetchData()
      }
    },
    { immediate: false }
  )
</script>

<style scoped lang="scss">
  .operation-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .form-item-tip {
    font-size: 12px;
    color: #909399;
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
