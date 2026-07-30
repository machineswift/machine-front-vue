<template>
  <el-dialog v-model="state.dialogVisible" title="新增素材" :close-on-click-modal="false" :destroy-on-close="true" @closed="handleDialogClosed" width="520px">
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="state.form.fileType" placeholder="请选择文件类型" style="width: 100%">
          <el-option v-for="option in state.fileTypeOptions" :key="option.code" :label="option.message" :value="option.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传文件" required>
        <div class="file-upload-block">
          <input ref="fileInputRef" type="file" class="hidden-file-input" @change="onFileChange" />
          <el-button type="primary" plain @click="triggerFileSelect" :loading="state.uploading">选择文件</el-button>
          <span v-if="state.selectedFileName" class="file-name-text">{{ state.selectedFileName }}</span>
          <span v-else class="file-name-placeholder">请选择要上传的文件</span>
        </div>
      </el-form-item>
      <el-form-item label="素材标题" prop="title">
        <el-input v-model="state.form.title" placeholder="请输入素材标题" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryIdSet">
        <div class="category-select-block">
          <el-alert title="请选择该素材所属的分类" type="info" show-icon :closable="false" class="category-alert" />
          <el-input v-model="state.categoryQuery" placeholder="请输入分类名称" @input="onCategoryQueryChanged" class="category-query-input" />
          <el-tree-v2
            ref="categoryTreeRef"
            :data="state.categoryTreeOptions"
            :props="categoryProps"
            :filter-method="categoryFilterMethod"
            @check="handleCategoryCheck"
            show-checkbox
            :height="220"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { ElTreeV2 } from 'element-plus'
  import { DataMaterialApi } from '@/modules/data/material/api/DataMaterial.api'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import { DataAttachmentApi } from '@/modules/data/attachment/api/DataAttachment.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { DataMaterialCreateRequestVo } from '@/modules/data/material/type/DataMaterial.type'
  import type { DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'

  /** 未分类虚拟节点 id，与后端一致，该节点不可选为分类 */
  const DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID = 'data_material_category_virtual_node'

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()
  const categoryTreeRef = ref<InstanceType<typeof ElTreeV2>>()
  const fileInputRef = ref<HTMLInputElement>()
  const enumStore = useDictionaryEnumStore()

  const categoryProps = { value: 'id', label: 'name', children: 'children', disabled: 'disabled' }

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    loading: false,
    submitting: false,
    uploading: false,
    selectedFileName: '',
    uploadedFileId: '',
    categoryQuery: '',
    fileTypeOptions: [] as Array<{ code: string; message: string }>,
    categoryTreeOptions: [] as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[],
    form: {
      fileType: '',
      title: '',
      categoryIdSet: [] as string[]
    } as DataMaterialCreateRequestVo & { categoryIdSet: string[] }
  })

  const rules = {
    fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
    title: [{ required: true, message: '请输入素材标题', trigger: 'blur' }]
  }

  /** 递归为虚拟节点设置 disabled，禁止选择为分类 */
  const setVirtualNodeDisabled = (nodes: (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]): void => {
    if (!nodes?.length) return
    for (const node of nodes) {
      if (node.id === DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID) {
        node.disabled = true
      }
      if (node.children?.length) {
        setVirtualNodeDisabled(node.children as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[])
      }
    }
  }

  const loadCategoryTree = async () => {
    try {
      state.loading = true
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const rawTree = root?.children?.length ? root.children : root?.id ? [root] : []
      const treeWithDisabled = JSON.parse(JSON.stringify(rawTree)) as (DataMaterialCategorySimpleTreeResponseVo & { disabled?: boolean })[]
      setVirtualNodeDisabled(treeWithDisabled)
      state.categoryTreeOptions = treeWithDisabled
    } catch (error) {
      console.error('加载分类树失败', error)
    } finally {
      state.loading = false
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

  const handleCategoryCheck = () => {
    if (categoryTreeRef.value) {
      state.form.categoryIdSet = TreeDataUtil.getRootNodesFromSelected(state.categoryTreeOptions, categoryTreeRef.value.getCheckedKeys())
        .map(node => node.id)
        .filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
    }
  }

  const syncCategoryTreeCheckedKeys = (ids: string[]) => {
    nextTick(() => {
      categoryTreeRef.value?.setCheckedKeys(ids || [])
    })
  }

  const loadEnums = async () => {
    state.fileTypeOptions = await enumStore.getEnumDataAsync('DataFileTypeEnum')
  }

  const triggerFileSelect = () => {
    fileInputRef.value?.click()
  }

  const onFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const f = target.files?.[0]
    if (!f) return
    try {
      state.uploading = true
      const res = await DataAttachmentApi.upload({ file: f })
      if (res?.id) {
        state.uploadedFileId = res.id
        state.selectedFileName = f.name
        ElMessage.success('文件上传成功')
      } else {
        ElMessage.error('文件上传失败')
      }
    } catch (error) {
      console.error('文件上传失败', error)
      ElMessage.error('文件上传失败')
    } finally {
      state.uploading = false
      target.value = ''
    }
  }

  const handleDialogClosed = () => {
    state.form = { fileType: '', title: '', categoryIdSet: [] }
    state.categoryQuery = ''
    state.selectedFileName = ''
    state.uploadedFileId = ''
    formRef.value?.resetFields()
    state.submitting = false
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      if (!state.uploadedFileId) {
        ElMessage.warning('请先上传文件')
        return
      }
      const categoryIdSet = state.form.categoryIdSet?.filter(id => id !== DATA_MATERIAL_CATEGORY_VIRTUAL_NODE_ID)
      const payload: DataMaterialCreateRequestVo = {
        fileType: state.form.fileType,
        title: state.form.title,
        fileTemp: { fileId: state.uploadedFileId },
        categoryIdSet: categoryIdSet?.length ? categoryIdSet : undefined
      }
      await DataMaterialApi.create(payload)
      ElMessage.success('新增成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('新增素材失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    () => props.modelValue,
    async modelValue => {
      if (modelValue) {
        await loadEnums()
        await loadCategoryTree()
        state.form.fileType = state.fileTypeOptions[0]?.code ?? ''
        syncCategoryTreeCheckedKeys(state.form.categoryIdSet || [])
      }
    },
    { immediate: false }
  )
</script>

<style scoped>
  .category-select-block {
    width: 100%;
  }
  .category-alert {
    margin-bottom: 12px;
  }
  .category-query-input {
    margin-bottom: 10px;
  }
  .file-upload-block {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .hidden-file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
  }
  .file-name-text {
    color: var(--el-color-success);
    font-size: 14px;
  }
  .file-name-placeholder {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }
</style>
