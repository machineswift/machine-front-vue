<template>
  <el-dialog
    v-model="state.dialogVisible"
    title="添加分类"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="80%"
    top="5vh"
  >
    <el-form :model="state.form" :rules="rules" label-width="100px" ref="formRef" v-loading="state.loading">
      <el-form-item label="父分类" prop="parentId">
        <el-input v-model="state.parentCategoryName" disabled style="width: 100%" />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入名称" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.form.sort" :min="0" :max="999999" placeholder="请输入排序" style="width: 100%" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="state.form.description" type="textarea" :rows="4" placeholder="请输入描述" maxlength="512" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="state.dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="state.submitting" v-hasPermission="['MANAGE_APP:SYSTEM:BASIC_DATA:TAG_CATEGORY:CREATE']">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormItemRule } from 'element-plus'
  import { DataTagCategoryApi } from '@/modules/data/tag/api/DataTagCategory.api'
  import type { DataTagCategoryCreateRequestVo } from '@/modules/data/tag/type/DataTagCategory.type'
  import type { DataTagCategoryTreeSimpleOutputDto } from '@/modules/data/tag/type/DataTagCategory.type'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    type: { type: String, default: null },
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
    categoryTreeOptions: [] as DataTagCategoryTreeSimpleOutputDto[],
    fullTreeData: null as DataTagCategoryTreeSimpleOutputDto | null,
    rootNodeId: '',
    rootNodeName: '根节点',
    parentCategoryName: '根节点',
    form: {
      parentId: '',
      name: '',
      sort: 0,
      description: ''
    } as DataTagCategoryCreateRequestVo
  })

  // 表单验证规则 - 父分类不再需要验证，因为会自动设置为根节点

  const validateName = (_rule: FormItemRule, value: string) => {
    if (!value) return Promise.reject('请输入名称')
    if (value.length < 1 || value.length > 32) return Promise.reject('长度在1到32个字符')
    return Promise.resolve()
  }

  const validateSort = (_rule: FormItemRule, value: number) => {
    if (value === null || value === undefined) return Promise.reject('请输入排序')
    if (value < 0 || value > 999999) return Promise.reject('排序值在0到999999之间')
    return Promise.resolve()
  }

  const rules = {
    name: [{ required: true, validator: validateName, trigger: 'blur' }],
    sort: [{ required: true, validator: validateSort, trigger: 'blur' }],
    description: [{ max: 512, message: '描述不能超过512个字符', trigger: 'blur' }]
  }

  // 从树中查找节点名称
  const findNodeName = (nodeId: string, nodes: DataTagCategoryTreeSimpleOutputDto[]): string | null => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node.name || null
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeName(nodeId, node.children)
        if (found) return found
      }
    }
    return null
  }

  // 更新父分类名称
  const updateParentCategoryName = () => {
    if (!state.form.parentId || state.form.parentId.trim() === '') {
      state.parentCategoryName = state.rootNodeName
      return
    }

    if (state.form.parentId === state.rootNodeId) {
      state.parentCategoryName = state.rootNodeName
      return
    }

    // 从完整树中查找父分类名称
    if (state.fullTreeData) {
      const parentName = findNodeName(state.form.parentId, [state.fullTreeData])
      if (parentName) {
        state.parentCategoryName = parentName
      } else {
        state.parentCategoryName = state.rootNodeName
      }
    } else {
      // 如果完整树数据不存在，从 categoryTreeOptions 中查找
      const parentName = findNodeName(state.form.parentId, state.categoryTreeOptions)
      state.parentCategoryName = parentName || state.rootNodeName
    }
  }

  const loadCategoryTree = async () => {
    if (!props.type) return
    try {
      state.loading = true
      const response = await DataTagCategoryApi.treeSimple({ type: props.type })
      // 保存完整的树数据（根节点）
      state.fullTreeData = response
      // treeSimple 返回的是根节点，需要获取其 children 或包装成数组
      state.categoryTreeOptions = response.children && response.children.length > 0 ? response.children : response.id ? [response] : []

      // 设置根节点ID和名称
      if (response.id) {
        state.rootNodeId = response.id
        state.rootNodeName = response.name || '根节点'
        // 如果传入了 parentId，使用传入的 parentId，否则使用根节点ID
        state.form.parentId = props.parentId && props.parentId.trim() !== '' ? props.parentId : response.id
        // 更新父分类名称
        updateParentCategoryName()
      }
    } catch (error) {
      console.error('加载分类树失败', error)
      ElMessage.error('加载分类树失败')
    } finally {
      state.loading = false
    }
  }

  const handleDialogClosed = () => {
    //重置表单数据（保留根节点ID）
    state.form = {
      parentId: state.rootNodeId,
      name: '',
      sort: 0,
      description: ''
    }
    state.parentCategoryName = state.rootNodeName

    //重置表单验证状态
    formRef.value?.resetFields()

    //重置提交状态
    state.submitting = false
    state.loading = false
  }

  const submitForm = async () => {
    try {
      state.submitting = true
      await formRef.value?.validate()

      await DataTagCategoryApi.create(state.form)
      ElMessage.success('添加成功')
      state.dialogVisible = false
      emit('success')
    } catch (error) {
      console.error('添加分类失败', error)
    } finally {
      state.submitting = false
    }
  }

  // 监听对话框打开和类型变化
  watch(
    [() => props.modelValue, () => props.type, () => props.parentId],
    async ([modelValue, type, parentId]) => {
      if (modelValue && type) {
        await loadCategoryTree()
        // 如果 parentId 有值，确保使用传入的 parentId（loadCategoryTree 中已处理，这里作为保险）
        if (parentId && parentId.trim() !== '') {
          state.form.parentId = parentId
          updateParentCategoryName()
        } else if (state.rootNodeId) {
          // 如果没有 parentId，使用根节点ID
          state.form.parentId = state.rootNodeId
          state.parentCategoryName = state.rootNodeName
        }
      }
    },
    { immediate: false }
  )
</script>
