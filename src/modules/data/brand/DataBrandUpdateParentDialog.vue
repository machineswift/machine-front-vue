<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="移动品牌"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="8vh"
  >
    <el-form :model="state.form" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="当前品牌">
        <el-input v-model="state.brandName" disabled />
      </el-form-item>

      <el-form-item label="父品牌类型">
        <el-radio-group v-model="state.parentType">
          <el-radio value="node">指定父品牌</el-radio>
          <el-radio value="root">一级品牌</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="新父品牌" prop="parentId" v-if="state.parentType === 'node'">
        <TreePickerPanel
          ref="parentPanelRef"
          v-model="state.form.parentId"
          lazy
          :load-roots="loadBrandRoots"
          :load-children="loadBrandChildren"
          :search-nodes="searchBrandNodes"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前品牌或其下级品牌作为父品牌"
          :icon="PriceTag"
          placeholder="输入品牌名称或编码搜索"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        :disabled="!canSubmit"
        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:BRAND:UPDATE_PARENT']"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { PriceTag } from '@element-plus/icons-vue'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import type { TreePickerNode } from '@/shared/types/Common.type'
  import { DataBrandApi } from '@/modules/data/brand/api/DataBrand.api'

  const DATA_BRAND_ROOT_PARENT_ID = 'root'
  const ROOT_PAGE_SIZE = 20
  const CHILDREN_PAGE_SIZE = 20
  const SEARCH_PAGE_SIZE = 20

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    brandId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()
  const parentPanelRef = ref<InstanceType<typeof TreePickerPanel>>()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    brandName: '',
    currentParentId: '',
    parentType: 'node' as 'node' | 'root',
    form: { id: '', parentId: '' }
  })

  const canSubmit = computed(() => state.parentType === 'root' || !!state.form.parentId)

  /**
   * 一级品牌列表：属于“分页查询品牌”，走 page_simple（create_time 倒序，与该分页接口一致）
   * 每页 20，总数不止 20 时面板末尾显示“加载更多”；hasMore 由分页接口返回的 total 推断
   */
  const loadBrandRoots = async (page: number) => {
    const response = await DataBrandApi.pageSimple({ parentId: DATA_BRAND_ROOT_PARENT_ID, current: page, size: ROOT_PAGE_SIZE })
    const records = (response?.records || []) as TreePickerNode[]
    const loaded = (page - 1) * ROOT_PAGE_SIZE + records.length
    return { records, hasMore: loaded < (response?.total || 0) }
  }

  /** 展开节点拉取下级品牌：属于“查询子品牌”，走 children_simple（sort 倒序） */
  const loadBrandChildren = async (parentId: string, page: number) => {
    const response = await DataBrandApi.childrenSimple({ parentId, current: page, size: CHILDREN_PAGE_SIZE })
    const records = (response?.records || []) as TreePickerNode[]
    const loaded = (page - 1) * CHILDREN_PAGE_SIZE + records.length
    return { records, hasMore: loaded < (response?.total || 0) }
  }

  /**
   * 关键字搜索（page_simple，扁平分页）：名称/编码由后端 keyword 模糊匹配，不补父链
   * hasMore 由分页接口返回的 total 推断（已加载条数 < total）
   */
  const searchBrandNodes = async (keyword: string, page: number) => {
    const response = await DataBrandApi.pageSimple({ keyword, current: page, size: SEARCH_PAGE_SIZE })
    const records = (response?.records || []) as TreePickerNode[]
    const loaded = (page - 1) * SEARCH_PAGE_SIZE + records.length
    return { records, hasMore: loaded < (response?.total || 0) }
  }

  const loadBrandData = async () => {
    if (!props.brandId) return

    try {
      const data = await DataBrandApi.detail({ id: props.brandId })
      state.brandName = data.name || ''
      state.currentParentId = data.parentId || ''
      state.form.id = data.id
      state.parentType = 'node'
      state.form.parentId = ''
    } catch (error) {
      console.error('加载品牌数据失败', error)
    }
  }

  const handleDialogClosed = () => {
    state.form = { id: '', parentId: '' }
    state.brandName = ''
    state.currentParentId = ''
    state.parentType = 'node'
    formRef.value?.resetFields()
    parentPanelRef.value?.reset()
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    const parentId = state.parentType === 'root' ? DATA_BRAND_ROOT_PARENT_ID : state.form.parentId
    if (parentId === state.currentParentId) {
      ElMessage.warning('新父品牌与当前父品牌相同')
      return
    }

    try {
      state.submitting = true
      await DataBrandApi.updateParent({ id: state.form.id, parentId })
      ElMessage.success('移动成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('移动品牌失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (!modelValue) return

      // 品牌树由面板自己拉（一级品牌分页 + 展开按需加载），这里只回显当前品牌
      try {
        state.loading = true
        await loadBrandData()
      } finally {
        state.loading = false
      }
    },
    { immediate: false }
  )
</script>
