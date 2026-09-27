<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="移动"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="600px"
    top="8vh"
  >
    <el-form :model="state.form" label-width="90px" ref="formRef" v-loading="state.loading">
      <el-form-item label="当前分类:">
        <el-input v-model="state.categoryName" disabled />
      </el-form-item>
      <el-form-item label="新父分类:" prop="parentId">
        <TreePickerPanel
          v-model="state.form.parentId"
          :roots="state.categoryTreeOptions"
          :exclude-id="state.form.id"
          exclude-message="不能选择当前分类或其下级分类作为父分类"
          :icon="FolderOpened"
          placeholder="输入分类名称或编码搜索"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm"
        :loading="state.submitting"
        :disabled="!state.form.parentId"
        v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:UPDATE_PARENT']"
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
  import { FolderOpened } from '@element-plus/icons-vue'
  import TreePickerPanel from '@/shared/components/TreePickerPanel.vue'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type {
    DataMaterialCategoryUpdateParentRequestVo,
    DataMaterialCategorySimpleTreeResponseVo,
    DataMaterialCategoryDetailResponseVo
  } from '@/modules/data/material/type/DataMaterialCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    categoryId: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref<FormInstance>()

  const state = reactive({
    dialogVisible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    loading: false,
    categoryName: '',
    categoryTreeOptions: [] as DataMaterialCategorySimpleTreeResponseVo[],
    form: { id: '', parentId: '' } as DataMaterialCategoryUpdateParentRequestVo
  })

  const loadCategoryTree = async () => {
    try {
      state.loading = true
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const children = root?.children || (root?.id ? [root] : [])
      state.categoryTreeOptions =
        root?.id && root?.name
          ? [
              {
                id: root.id,
                parentId: root.parentId ?? '',
                name: root.name,
                code: root.code ?? '',
                sort: root.sort ?? 0,
                children
              }
            ]
          : children
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const loadCategoryData = async () => {
    if (!props.categoryId) return
    try {
      const data: DataMaterialCategoryDetailResponseVo = await DataMaterialCategoryApi.detail({ id: props.categoryId })
      state.categoryName = data.name || ''
      state.form.id = data.id!
      state.form.parentId = data.parentId || ''
    } catch (error) {
      console.error('加载分类数据失败', error)
      ElMessage.error('加载分类数据失败')
    }
  }

  const handleDialogClosed = () => {
    state.form = { id: '', parentId: '' }
    state.categoryName = ''
    state.categoryTreeOptions = []
    formRef.value?.resetFields()
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    try {
      if (!state.form.parentId) {
        ElMessage.warning('请选择父分类')
        return
      }
      state.submitting = true
      await DataMaterialCategoryApi.updateParent(state.form)
      ElMessage.success('修改成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('移动失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.categoryId],
    async ([modelValue, categoryId]) => {
      if (modelValue && categoryId) {
        await loadCategoryData()
        await loadCategoryTree()
      }
    },
    { immediate: false }
  )
</script>
