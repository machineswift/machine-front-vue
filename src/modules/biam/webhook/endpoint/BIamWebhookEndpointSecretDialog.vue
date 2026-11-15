<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :destroy-on-close="true"
    @closed="handleDialogClosed"
    width="clamp(480px, 46vw, 640px)"
    align-center
  >
    <el-alert type="warning" :closable="false" show-icon title="凭据仅此一次展示，请立即复制并妥善保存；关闭后将无法再次查看密钥。" />

    <el-form label-width="110px" class="secret-form">
      <el-form-item label="接收端编码">
        <div class="secret-row">
          <el-input :model-value="props.endpointCode" readonly>
            <template #append>
              <el-button :icon="state.copyCodeSuccess ? SuccessFilled : CopyDocument" aria-label="复制接收端编码" @click="handleCopyCode" />
            </template>
          </el-input>
        </div>
      </el-form-item>

      <el-form-item label="签名密钥">
        <div class="secret-row">
          <el-input :model-value="props.endpointSecret" readonly type="textarea" :rows="2" resize="none" class="secret-textarea" />
          <el-button
            class="secret-copy-btn"
            :icon="state.copySecretSuccess ? SuccessFilled : CopyDocument"
            aria-label="复制签名密钥"
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
    title: { type: String, default: '接收端凭据' },
    endpointCode: { type: String, default: '' },
    endpointSecret: { type: String, default: '' }
  })

  const emit = defineEmits(['update:modelValue'])

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  })

  const state = reactive({
    copyCodeSuccess: false,
    copySecretSuccess: false
  })

  /** 复制并给出反馈（接收端编码/签名密钥共用） */
  const copyWithFeedback = async (text: string, successKey: 'copyCodeSuccess' | 'copySecretSuccess', successMessage: string): Promise<void> => {
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

  const handleCopyCode = (): Promise<void> => copyWithFeedback(props.endpointCode, 'copyCodeSuccess', '接收端编码已复制')

  const handleCopySecret = (): Promise<void> => copyWithFeedback(props.endpointSecret, 'copySecretSuccess', '签名密钥已复制')

  // 关闭后重置复制状态，避免组件内残留敏感信息
  const handleDialogClosed = () => {
    state.copyCodeSuccess = false
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
