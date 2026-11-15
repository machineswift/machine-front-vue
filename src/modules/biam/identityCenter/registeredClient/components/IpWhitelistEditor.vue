<template>
  <div class="ip-whitelist-editor" :class="{ 'is-disabled': disabled }">
    <!-- 已添加条目 -->
    <div v-if="innerValue.length" class="ip-tags">
      <el-tag
        v-for="(ip, index) in innerValue"
        :key="ip"
        type="info"
        effect="plain"
        closable
        :disable-transitions="true"
        :disabled="disabled"
        @close="removeIp(index)"
      >
        {{ ip }}
      </el-tag>
      <span class="ip-count">{{ innerValue.length }}/{{ maxCount }}</span>
    </div>

    <!-- 输入行 -->
    <div class="ip-input-line">
      <el-input
        ref="inputRef"
        v-model="inputValue"
        class="ip-input"
        name="ip-whitelist"
        :placeholder="placeholder"
        :disabled="disabled"
        clearable
        @keyup.enter="addInputValue"
        @keydown.delete="handleBackspace"
        @paste="handlePaste"
        @input="handleInput"
      >
        <template #prefix>
          <el-icon><Aim /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" plain :disabled="disabled || !inputValue.trim() || innerValue.length >= maxCount" @click="addInputValue">添加</el-button>
      <el-button v-if="innerValue.length" link type="danger" :disabled="disabled" @click="clearAll">清空</el-button>
    </div>

    <!-- 校验反馈 -->
    <transition name="el-fade-in">
      <div v-if="errorMessage" class="ip-feedback is-error">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- 格式说明 -->
    <div class="ip-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ tip }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import { Aim, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
  import { isValidIpEntry, splitIpText, normalizeIpEntries } from '@/shared/utils/IpAddress.util'

  const props = withDefaults(
    defineProps<{
      /** 白名单数组（可能与外部表单双向绑定） */
      modelValue: string[]
      disabled?: boolean
      placeholder?: string
      maxCount?: number
      tip?: string
    }>(),
    {
      disabled: false,
      placeholder: '输入 IPv4 / IPv6 地址，多个可用逗号、分号、空格或换行分隔',
      maxCount: 100,
      tip: '支持 IPv4、IPv6 单个地址，自动去重排序；留空表示不限制访问来源 IP。'
    }
  )

  const emit = defineEmits(['update:modelValue'])

  const inputRef = ref()
  const inputValue = ref('')
  const errorMessage = ref('')

  // 内部维护的条目（已去重排序），与外部 modelValue 双向同步
  const innerValue = ref<string[]>([])

  watch(
    () => props.modelValue,
    value => {
      innerValue.value = normalizeIpEntries(value || [])
    },
    { immediate: true }
  )

  const syncToParent = (): void => {
    emit('update:modelValue', [...innerValue.value])
  }

  const showError = (message: string): void => {
    errorMessage.value = message
  }

  /** 解析并添加一段文本（支持批量粘贴 / 输入多个值），无效项丢弃并提示 */
  const tryAdd = (text: string): void => {
    const entries = splitIpText(text)
    if (!entries.length) {
      inputValue.value = ''
      return
    }

    if (innerValue.value.length >= props.maxCount) {
      showError(`IP 白名单最多支持 ${props.maxCount} 条，请先移除部分条目后再添加`)
      inputValue.value = ''
      return
    }

    const valid: string[] = []
    const invalid: string[] = []
    for (const entry of entries) {
      if (innerValue.value.length + valid.length >= props.maxCount) {
        invalid.push(`${entry}（超出数量上限）`)
      } else if (isValidIpEntry(entry)) {
        valid.push(entry)
      } else {
        invalid.push(entry)
      }
    }

    if (valid.length) {
      innerValue.value = normalizeIpEntries([...innerValue.value, ...valid])
      syncToParent()
    }

    errorMessage.value = invalid.length ? `已忽略 ${invalid.length} 项无效内容：${invalid.join('、')}。仅支持 IPv4 / IPv6 地址格式。` : ''

    // 无论成功与否都清空输入框，无效项已展示在错误提示中
    inputValue.value = ''
  }

  const addInputValue = (): void => {
    if (!inputValue.value.trim()) return
    tryAdd(inputValue.value)
  }

  const removeIp = (index: number): void => {
    innerValue.value = innerValue.value.filter((_, i) => i !== index)
    syncToParent()
    errorMessage.value = ''
  }

  const clearAll = (): void => {
    innerValue.value = []
    syncToParent()
    errorMessage.value = ''
    inputRef.value?.focus()
  }

  const handleBackspace = (event: KeyboardEvent): void => {
    // 输入框为空时按退格删除最后一条
    if (!inputValue.value && innerValue.value.length) {
      event.preventDefault()
      innerValue.value = innerValue.value.slice(0, -1)
      syncToParent()
    }
  }

  const handlePaste = (): void => {
    // 粘贴事件会先更新 v-model，nextTick 后统一解析
    nextTick(() => {
      if (inputValue.value) {
        tryAdd(inputValue.value)
      }
    })
  }

  const handleInput = (value: string): void => {
    if (errorMessage.value) errorMessage.value = ''
    // 输入逗号 / 分号等分隔符时立即解析，交互更流畅
    if (/[,，;；\n]$/.test(value)) {
      tryAdd(value)
    }
  }
</script>

<style scoped lang="scss">
  .ip-whitelist-editor {
    width: 100%;

    &.is-disabled {
      opacity: 0.7;
    }

    .ip-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      padding: 4px 0 8px;

      .ip-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .ip-input-line {
      display: flex;
      align-items: center;
      gap: 8px;

      .ip-input {
        flex: 1;
        min-width: 0;
      }
    }

    .ip-feedback {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.5;

      &.is-error {
        color: var(--el-color-danger);
      }
    }

    .ip-tip {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
</style>
