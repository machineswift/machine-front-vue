<template>
  <el-dialog
    v-model="state.visible"
    title="新增"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @close="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-alert v-if="parentHasBackCategory" title="上级类目已关联后台分类，不能再新增子类目" type="warning" show-icon :closable="false" class="parent-alert" />

    <el-form ref="formRef" :model="state.formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="上级类目" prop="parentName">
        <el-input v-model="state.parentName" disabled placeholder="顶级类目">
          <template #prefix>
            <el-icon><FolderOpened /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="state.formData.name" placeholder="请输入名称" maxlength="32" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="state.formData.sort" :min="0" :max="99999" controls-position="right" style="width: 200px" />
        <span class="form-item-tip">数值越大，排序越靠前</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="state.submitting" @click="state.visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="state.submitting"
        :disabled="parentHasBackCategory"
        v-hasPermission="['MANAGE_APP:SCM:CATEGORY:FRONT:CREATE']"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, watch, computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FolderOpened } from '@element-plus/icons-vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/category/api/ScmFrontCategory.api'
  import type { ScmFrontCategoryTreeExpandResponseVo, ScmFrontCategoryCreateRequestVo } from '@/modules/scm/category/category/type/ScmFrontCategory.type'

  const props = defineProps<{
    modelValue: boolean
    parentNode: ScmFrontCategoryTreeExpandResponseVo | null
    rootNodeId?: string
    rootNodeName?: string
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])
  const formRef = ref()

  /** 顶部「新增」是在根节点下建一级类目 */
  const isTopLevel = computed(() => !props.parentNode)

  /** 上级已关联后台分类时不能再新增子类目（后端会拒绝） */
  const parentHasBackCategory = computed(() => (props.parentNode?.backCategoryNumber ?? 0) > 0)

  const state = reactive({
    visible: computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val)
    }),
    submitting: false,
    parentName: '',
    formData: {
      parentId: '',
      name: '',
      sort: 50
    } as ScmFrontCategoryCreateRequestVo
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: ['blur', 'change'] },
      { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: ['blur', 'change'] }
    ],
    sort: [{ required: true, message: '请输入排序值', trigger: ['blur', 'change'] }]
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      state.submitting = true
      await ScmFrontCategoryApi.create(state.formData)
      ElMessage.success(isTopLevel.value ? '新增一级类目成功' : '新增子类目成功')
      emit('success')
      state.visible = false
    } catch (error) {
      console.error('新增类目失败', error)
    } finally {
      state.submitting = false
    }
  }

  const fillForm = () => {
    state.formData = {
      parentId: props.parentNode?.id || props.rootNodeId || '',
      name: '',
      sort: 50
    }
    state.parentName = props.parentNode?.name || props.rootNodeName || ''
  }

  const handleDialogClosed = () => {
    fillForm()
    state.submitting = false
    formRef.value?.resetFields()
  }

  watch([() => props.modelValue, () => props.parentNode], ([modelValue]) => {
    if (modelValue) fillForm()
  })
</script>

<style scoped lang="scss">
  .parent-alert {
    margin-bottom: 12px;
  }

  .form-item-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
