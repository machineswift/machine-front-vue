<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="订阅关系"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(760px, 72vw, 1200px)"
    align-center
  >
    <div class="subscription-body" v-loading="state.loading" :style="{ height: `${dialogBodyHeight}px` }">
      <el-alert :title="`接收端：${endpointName || '-'}，保存后按以下内容全量覆盖订阅关系`" type="info" :closable="false" show-icon />

      <el-divider content-position="left">订阅分类</el-divider>

      <TreeCheckPanel
        ref="categoryPanelRef"
        v-model="state.categoryIdSet"
        :roots="state.categoryTreeOptions"
        :height="180"
        :icon="FolderOpened"
        placeholder="输入分类名称或编码搜索"
        empty-tags-text="暂无订阅分类"
        :closable-tags="false"
      />

      <el-divider content-position="left">订阅事件</el-divider>

      <div class="event-toolbar">
        <el-input v-model="state.eventQuery.code" placeholder="请输入事件编码" clearable class="event-toolbar-input" @keyup.enter="handleEventSearch" />
        <el-input v-model="state.eventQuery.name" placeholder="请输入事件名称" clearable class="event-toolbar-input" @keyup.enter="handleEventSearch" />
        <el-button type="primary" plain @click="handleEventSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <span class="event-selected-count">已选 {{ selectedEventCount }} 个事件</span>
      </div>

      <el-table :data="state.eventList" v-loading="state.eventLoading" border size="small" height="240" row-key="id">
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-checkbox :model-value="isEventSelected(row.id)" @change="(value: unknown) => toggleEvent(row.id, value as boolean)" />
          </template>
        </el-table-column>
        <el-table-column prop="code" label="事件编码" align="left" min-width="220" show-overflow-tooltip />
        <el-table-column prop="name" label="事件名称" align="left" min-width="150" show-overflow-tooltip />
        <el-table-column label="所属分类" align="left" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ state.categoryMap.get(row.categoryId) || row.categoryId }}</template>
        </el-table-column>
        <el-table-column label="订阅动作" align="center" width="140">
          <template #default="{ row }">
            <el-select
              :model-value="getEventAction(row.id)"
              :disabled="!isEventSelected(row.id)"
              size="small"
              style="width: 100%"
              @change="(value: unknown) => setEventAction(row.id, value as string)"
            >
              <el-option v-for="option in actionOptions" :key="option.code" :label="option.message" :value="option.code" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="state.eventPagination.current"
        v-model:page-size="state.eventPagination.size"
        :page-sizes="EVENT_PAGE_SIZES"
        :background="true"
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="state.eventPagination.total"
        class="event-pagination"
        @current-change="loadEvents"
        @size-change="handleEventSizeChange"
      />
    </div>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:WEBHOOK:ENDPOINT:UPDATE_SUBSCRIPTION']">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import { FolderOpened, Search } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { BIamWebhookEndpointApi } from './api/BIamWebhookEndpoint.api'
  import { BIamWebhookEventApi } from '@/modules/biam/webhook/event/api/BIamWebhookEvent.api'
  import { BIamWebhookEventCategoryApi } from '@/modules/biam/webhook/event/api/BIamWebhookEventCategory.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_IAM_WEBHOOK_SUBSCRIPTION_ACTION } from '@/shared/constants/DictionaryEnum.constant'
  import type { BIamWebhookEventListResponseVo } from '@/modules/biam/webhook/event/type/BIamWebhookEvent.type'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo } from '@/modules/biam/webhook/event/type/BIamWebhookEventCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    endpointId: { type: String, default: '' },
    endpointName: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const EVENT_PAGE_SIZES = [20, 50, 100]
  const DEFAULT_ACTION = 'SUBSCRIBE'

  const { options: actionOptions, load: loadActionOptions } = useEnumOptions(DICT_IAM_WEBHOOK_SUBSCRIPTION_ACTION)

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    eventLoading: false,
    categoryIdSet: [] as string[],
    categoryTreeOptions: [] as BIamWebhookEventCategorySimpleTreeResponseVo[],
    categoryMap: new Map<string, string>(),
    /** 事件ID → 订阅动作；存在即表示已订阅 */
    eventActionMap: {} as Record<string, string>,
    eventList: [] as BIamWebhookEventListResponseVo[],
    eventQuery: { code: '', name: '' },
    eventPagination: { current: 1, size: 20, total: 0 }
  })

  const { height: windowHeight } = useWindowSize()

  const dialogBodyHeight = computed(() => Math.min(Math.max(windowHeight.value - 250, 480), 720))

  const selectedEventCount = computed(() => Object.keys(state.eventActionMap).length)

  const isEventSelected = (eventId: string): boolean => !!state.eventActionMap[eventId]

  const getEventAction = (eventId: string): string => state.eventActionMap[eventId] || DEFAULT_ACTION

  const toggleEvent = (eventId: string, selected: boolean) => {
    if (selected) {
      if (!state.eventActionMap[eventId]) state.eventActionMap[eventId] = DEFAULT_ACTION
      return
    }
    delete state.eventActionMap[eventId]
  }

  const setEventAction = (eventId: string, action: string) => {
    if (state.eventActionMap[eventId]) state.eventActionMap[eventId] = action
  }

  const buildCategoryMap = (nodes: BIamWebhookEventCategorySimpleTreeResponseVo[]) => {
    nodes.forEach(node => {
      state.categoryMap.set(node.id, node.name)
      if (node.children?.length) buildCategoryMap(node.children)
    })
  }

  const loadCategoryTree = async () => {
    try {
      const root = (await BIamWebhookEventCategoryApi.treeSimple()) as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      state.categoryTreeOptions = root?.children?.length ? root.children : []
      state.categoryMap.clear()
      buildCategoryMap(state.categoryTreeOptions)
    } catch (error) {
      console.error('加载事件分类树失败', error)
    }
  }

  const loadEvents = async () => {
    try {
      state.eventLoading = true
      const res = await BIamWebhookEventApi.pageExpand({
        current: state.eventPagination.current,
        size: state.eventPagination.size,
        ...(state.eventQuery.code && { code: state.eventQuery.code }),
        ...(state.eventQuery.name && { name: state.eventQuery.name })
      })
      state.eventList = res.records || []
      state.eventPagination.total = res.total || 0
    } catch (error) {
      console.error('获取事件列表失败', error)
    } finally {
      state.eventLoading = false
    }
  }

  const handleEventSearch = () => {
    state.eventPagination.current = 1
    loadEvents()
  }

  const handleEventSizeChange = (newSize: number) => {
    state.eventPagination.size = newSize
    state.eventPagination.current = 1
    loadEvents()
  }

  const loadEndpointSubscription = async () => {
    if (!props.endpointId) return
    const detail = await BIamWebhookEndpointApi.detail({ id: props.endpointId })
    state.categoryIdSet = [...(detail.categoryIdSet || [])]
    state.eventActionMap = (detail.eventSubscriptions || []).reduce<Record<string, string>>((acc, item) => {
      acc[item.eventId] = item.action || DEFAULT_ACTION
      return acc
    }, {})
    // 树渲染完成后再回显勾选，避免勾选落在未挂载的节点上
    categoryPanelRef.value?.setCheckedKeys(state.categoryIdSet)
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await BIamWebhookEndpointApi.updateSubscription({
        id: props.endpointId,
        categoryIdSet: state.categoryIdSet,
        eventSubscriptions: Object.entries(state.eventActionMap).map(([eventId, action]) => ({ eventId, action }))
      })
      ElMessage.success('保存成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('保存订阅关系失败', error)
    } finally {
      state.submitting = false
    }
  }

  const handleDialogClosed = () => {
    state.categoryIdSet = []
    state.categoryTreeOptions = []
    state.categoryMap.clear()
    state.eventActionMap = {}
    state.eventList = []
    state.eventQuery = { code: '', name: '' }
    state.eventPagination = { current: 1, size: 20, total: 0 }
    state.loading = false
    state.submitting = false
    state.eventLoading = false
    categoryPanelRef.value?.reset()
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (!modelValue) return
      try {
        state.loading = true
        await Promise.all([loadActionOptions(), loadCategoryTree()])
        await Promise.all([loadEndpointSubscription(), loadEvents()])
      } catch (error) {
        console.error('加载订阅关系失败', error)
        ElMessage.error('加载订阅关系失败')
      } finally {
        state.loading = false
      }
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  .subscription-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }
  .event-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;

    .event-toolbar-input {
      width: 220px;
    }

    .event-selected-count {
      margin-left: auto;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  .event-pagination {
    justify-content: flex-end;
  }
</style>
