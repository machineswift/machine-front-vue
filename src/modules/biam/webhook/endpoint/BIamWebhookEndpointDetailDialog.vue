<template>
  <el-dialog
    v-model="state.visible"
    title="Webhook接收端详情"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(560px, 54vw, 800px)"
    align-center
  >
    <div v-loading="state.loading" class="detail-dialog-body">
      <!-- 基本信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="基本信息">
        <el-descriptions-item label="接收端编码">{{ state.detailData.code || '无' }}</el-descriptions-item>
        <el-descriptions-item label="接收端名称">{{ state.detailData.name || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="state.detailData.status === 'ENABLE' ? 'success' : 'danger'" effect="light">
            {{ state.detailData.status ? enumStore.getEnumLabel(DICT_STATUS, state.detailData.status) : '无' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投递状态">
          <el-tag :type="state.detailData.pauseFlag ? 'warning' : 'success'" effect="light">
            {{ state.detailData.pauseFlag ? '暂停' : '正常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联客户端">{{ state.clientName || state.detailData.clientId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="接收地址">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.endpointUrl }">{{ state.detailData.endpointUrl || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          <span class="detail-text-break" :class="{ 'detail-empty': !state.detailData.description }">{{ state.detailData.description || '无' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 重试策略 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="重试策略">
        <el-descriptions-item label="重试间隔">
          <div class="retry-policy">
            <div class="retry-policy-chain">
              <template v-for="(interval, index) in WEBHOOK_RETRY_INTERVALS" :key="index">
                <el-tag size="small" type="primary" effect="plain">{{ formatRetryInterval(interval) }}</el-tag>
                <el-icon v-if="index < WEBHOOK_RETRY_INTERVALS.length - 1" class="retry-policy-arrow"><Right /></el-icon>
              </template>
            </div>
            <div class="retry-policy-summary">共 {{ WEBHOOK_RETRY_INTERVALS.length }} 次重试，全部失败后停止投递（系统固定策略，不可修改）</div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 订阅关系 -->
      <el-descriptions class="detail-descriptions" :column="1" border title="订阅关系">
        <el-descriptions-item label="订阅分类">
          <TreeCheckPanel
            v-if="state.categoryTreeOptions.length"
            ref="categoryPanelRef"
            class="readonly-category-panel"
            :model-value="state.categoryIdSet"
            :roots="state.categoryTreeOptions"
            :height="180"
            :icon="FolderOpened"
            placeholder="输入分类名称或编码搜索"
            empty-tags-text="暂无订阅分类"
            :closable-tags="false"
            expand-checked-only
          />
          <span v-else class="detail-empty">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="订阅事件">
          <el-table v-if="eventSubscriptions.length" :data="eventSubscriptions" border size="small" max-height="220" style="width: 100%">
            <el-table-column prop="code" label="事件编码" align="left" min-width="200" show-overflow-tooltip />
            <el-table-column prop="name" label="事件名称" align="left" min-width="140" show-overflow-tooltip />
            <el-table-column prop="action" label="订阅动作" align="center" width="110">
              <template #default="{ row }">
                <el-tag size="small" :type="row.action === 'SUBSCRIBE' ? 'success' : 'info'">
                  {{ enumStore.getEnumLabel(DICT_IAM_WEBHOOK_SUBSCRIPTION_ACTION, row.action) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <span v-else class="detail-empty">无</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作信息 -->
      <el-descriptions class="detail-descriptions" :column="2" border title="操作信息">
        <el-descriptions-item label="创建人">{{ state.detailData.createName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ state.detailData.updateName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(state.detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(state.detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="state.visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened, Right } from '@element-plus/icons-vue'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { BIamWebhookEndpointApi } from './api/BIamWebhookEndpoint.api'
  import { BIamWebhookEventCategoryApi } from '@/modules/biam/webhook/event/api/BIamWebhookEventCategory.api'
  import { BIamAuth2RegisteredClientApi } from '@/modules/biam/identityCenter/registeredClient/api/BIamAuth2RegisteredClient.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_WEBHOOK_SUBSCRIPTION_ACTION, DICT_STATUS } from '@/shared/constants/DictionaryEnum.constant'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { formatRetryInterval, WEBHOOK_RETRY_INTERVALS } from './type/BIamWebhookEndpoint.type'
  import type { BIamWebhookEndpointDetailResponseVo } from './type/BIamWebhookEndpoint.type'
  import type { BIamWebhookEventCategorySimpleTreeResponseVo } from '@/modules/biam/webhook/event/type/BIamWebhookEventCategory.type'

  const props = defineProps<{
    modelValue: boolean
    endpointId?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const enumStore = useDictionaryEnumStore()

  const categoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    clientName: '',
    categoryIdSet: [] as string[],
    categoryTreeOptions: [] as BIamWebhookEventCategorySimpleTreeResponseVo[],
    detailData: {} as Partial<BIamWebhookEndpointDetailResponseVo>
  })

  const eventSubscriptions = computed(() => state.detailData.eventSubscriptions || [])

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '无')

  /** 关联客户端名称（详情仅返回 clientId，按 clientId 反查） */
  const loadClientName = async (clientId?: string) => {
    if (!clientId) return
    if (!hasPermission(['MANAGE_APP:SYSTEM:IDENTITY_CENTER:AUTH2_REGISTERED_CLIENT:PAGE_EXPAND'])) {
      state.clientName = clientId
      return
    }
    try {
      const res = await BIamAuth2RegisteredClientApi.pageExpand({ current: 1, size: 10, clientId })
      state.clientName = res.records?.[0]?.clientName || clientId
    } catch (error) {
      console.error('加载关联客户端失败', error)
      state.clientName = clientId
    }
  }

  /** 订阅分类树（与修改订阅关系一致，只读回显已勾选分类） */
  const loadCategoryTree = async (categoryIdSet: string[]) => {
    if (!categoryIdSet.length) {
      state.categoryTreeOptions = []
      return
    }
    try {
      const root = (await BIamWebhookEventCategoryApi.treeSimple()) as unknown as BIamWebhookEventCategorySimpleTreeResponseVo
      state.categoryTreeOptions = root?.children?.length ? root.children : []
    } catch (error) {
      console.error('加载事件分类失败', error)
      state.categoryTreeOptions = []
    }
  }

  const fetchData = async () => {
    if (!props.endpointId) return
    try {
      state.loading = true
      const detail = (await BIamWebhookEndpointApi.detail({ id: props.endpointId })) || {}
      state.detailData = detail
      state.categoryIdSet = [...(detail.categoryIdSet || [])]
      await Promise.all([loadClientName(detail.clientId), loadCategoryTree(state.categoryIdSet)])
      // 树渲染完成后再回显勾选，避免勾选落在未挂载的节点上
      await nextTick()
      categoryPanelRef.value?.setCheckedKeys(state.categoryIdSet)
    } catch (error) {
      console.error('获取接收端详情失败', error)
      ElMessage.error('获取接收端详情失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.detailData = {}
    state.clientName = ''
    state.categoryIdSet = []
    state.categoryTreeOptions = []
    state.loading = false
    categoryPanelRef.value?.reset()
  }

  watch(
    [() => props.modelValue, () => props.endpointId],
    async ([modelValue, endpointId]) => {
      if (modelValue && endpointId) await fetchData()
    },
    { immediate: false }
  )
</script>

<style lang="scss" scoped>
  // 只读分类树：仅禁用复选框交互，保留树的展开/滚动/搜索
  .readonly-category-panel {
    :deep(.tree-panel-tree .el-checkbox) {
      pointer-events: none;
    }
  }

  .retry-policy {
    width: 100%;
  }

  .retry-policy-chain {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .retry-policy-arrow {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  .retry-policy-summary {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
</style>
