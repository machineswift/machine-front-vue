<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="680px"
    top="18vh"
  >
    <el-alert type="warning" :closable="false" show-icon title="凭据仅此一次展示，请立即复制并妥善保存；关闭后将无法再次查看密钥。" />

    <el-form label-width="110px" class="secret-form">
      <el-form-item label="客户端ID">
        <div class="secret-row">
          <el-input :model-value="props.clientId" readonly>
            <template #append>
              <el-button :icon="state.copyClientIdSuccess ? SuccessFilled : CopyDocument" aria-label="复制客户端ID" @click="handleCopyClientId" />
            </template>
          </el-input>
        </div>
      </el-form-item>

      <el-form-item label="客户端密钥">
        <div class="secret-row">
          <el-input :model-value="props.clientSecret" readonly type="textarea" :rows="2" resize="none" class="secret-textarea" />
          <el-button
            class="secret-copy-btn"
            :icon="state.copySecretSuccess ? SuccessFilled : CopyDocument"
            aria-label="复制客户端密钥"
            @click="handleCopySecret"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="dialogVisible = false">我已保存，关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { CopyDocument, SuccessFilled } from '@element-plus/icons-vue'
  import { copyToClipboard } from '@/shared/utils/Secret.util'

  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '客户端凭据' },
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const state = reactive({
    copyClientIdSuccess: false,
    copySecretSuccess: false
  })

  /** 复制并给出反馈（客户端ID/密钥共用） */
  const copyWithFeedback = async (text: string, successKey: 'copyClientIdSuccess' | 'copySecretSuccess', successMessage: string): Promise<void> => {
    if (!text) return
    const success = await copyToClipboard(text)
    if (success) {
      state[successKey] = true
      ElMessage.success(successMessage)
      setTimeout(() => (state[successKey] = false), 2000)
    } else {
      ElMessage.error('复制失败，请手动选择复制')
    }
  }

  const handleCopyClientId = (): Promise<void> => copyWithFeedback(props.clientId, 'copyClientIdSuccess', '客户端ID已复制')

  const handleCopySecret = (): Promise<void> => copyWithFeedback(props.clientSecret, 'copySecretSuccess', '客户端密钥已复制')

  // 关闭后清空凭据，避免组件内残留敏感信息
  const handleDialogClosed = () => {
    state.copyClientIdSuccess = false
    state.copySecretSuccess = false
  }
</script>

<style scoped lang="scss">
  .secret-form {
    margin-top: 16px;

    .secret-row {
      display: flex;
      width: 100%;
      gap: 8px;
      align-items: flex-start;

      .secret-textarea {
        flex: 1;
      }

      .secret-copy-btn {
        height: 56px;
        width: 40px;
      }
    }
  }
</style>
