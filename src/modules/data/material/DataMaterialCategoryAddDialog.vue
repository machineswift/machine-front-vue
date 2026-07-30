<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加素材分类"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="480px"
  >
    <el-form :model="state.form" :rules="rules" label-width="80px" ref="formRef" v-loading="state.loading">
      <el-form-item label="父分类" prop="parentId">
        <el-input v-model="state.parentCategoryName" disabled />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" placeholder="排序" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:MATERIAL_CATEGORY:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { DataMaterialCategoryApi } from '@/modules/data/material/api/DataMaterialCategory.api'
  import type { DataMaterialCategoryCreateRequestVo, DataMaterialCategorySimpleTreeResponseVo } from '@/modules/data/material/type/DataMaterialCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    parentId: { type: String, default: '' }
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
    rootNodeId: '',
    rootNodeName: '根节点',
    parentCategoryName: '根节点',
    form: {
      parentId: '',
      name: '',
      sort: 0
    } as DataMaterialCategoryCreateRequestVo & { sort: number }
  })

  const findNodeName = (nodeId: string, nodes: DataMaterialCategorySimpleTreeResponseVo[]): string | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node.name || null
      if (node.children?.length) {
        const found = findNodeName(nodeId, node.children)
        if (found) return found
      }
    }
    return null
  }

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { min: 1, max: 64, message: '长度在1到64个字符', trigger: 'blur' }
    ]
  }

  const loadTreeForParent = async () => {
    try {
      state.loading = true
      const response = await DataMaterialCategoryApi.treeSimple()
      const root = response as unknown as DataMaterialCategorySimpleTreeResponseVo & { children?: DataMaterialCategorySimpleTreeResponseVo[] }
      const children = root?.children || (root?.id ? [root] : [])
      if (root?.id) {
        state.rootNodeId = root.id
        state.rootNodeName = root.name || '根节点'
        state.form.parentId = props.parentId && props.parentId.trim() !== '' ? props.parentId : root.id
        state.parentCategoryName =
          props.parentId && props.parentId !== root.id ? findNodeName(state.form.parentId, children) || state.rootNodeName : state.rootNodeName
      }
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    state.form = { parentId: state.rootNodeId, name: '', sort: 0 }
    state.parentCategoryName = state.rootNodeName
    formRef.value?.resetFields()
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()
      await DataMaterialCategoryApi.create({
        parentId: state.form.parentId,
        name: state.form.name,
        sort: state.form.sort
      })
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  watch(
    [() => props.modelValue, () => props.parentId],
    async ([modelValue]) => {
      if (modelValue) await loadTreeForParent()
    },
    { immediate: false }
  )
</script>
