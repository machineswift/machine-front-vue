<template>
  <div class="uri-list-editor" :class="{ 'is-disabled': disabled }">
    <!-- 已添加条目 -->
    <div v-if="innerValue.length" class="uri-items">
      <div v-for="(uri, index) in innerValue" :key="index" class="uri-item">
        <el-input
          v-model="innerValue[index]"
          :name="'uri-' + index"
          :placeholder="placeholder"
          :disabled="disabled"
          clearable
          @change="handleItemChange(index)"
          @keyup.enter="addUri"
        />
        <el-button class="uri-item-remove" type="danger" link :icon="Delete" :disabled="disabled" aria-label="删除该项" @click="removeUri(index)" />
      </div>
    </div>

    <!-- 操作行 -->
    <div class="uri-actions">
      <el-button size="small" type="primary" plain :icon="Plus" :disabled="disabled || innerValue.length >= maxCount" @click="addUri">添加一项</el-button>
      <el-button v-if="innerValue.length" size="small" link type="danger" :disabled="disabled" @click="clearAll">清空</el-button>
      <span class="uri-count">{{ innerValue.length }}/{{ maxCount }}</span>
    </div>

    <!-- 校验反馈 -->
    <transition name="el-fade-in">
      <div v-if="errorMessage" class="uri-feedback is-error">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- 说明 -->
    <div class="uri-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ tip }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Plus, Delete, WarningFilled, InfoFilled } from '@element-plus/icons-vue'

  /**
   * 通用 URI 列表编辑器（用于授权码模式的重定向URI / 登出后重定向URI）
   * 支持逐条添加、编辑、删除、清空，并对 URI 格式做轻量校验（http/https）。
   */

  const props = withDefaults(
    defineProps<{
      /** URI 列表（与外部表单双向绑定） */
      modelValue: string[]
      disabled?: boolean
      placeholder?: string
      maxCount?: number
      tip?: string
    }>(),
    {
      disabled: false,
      placeholder: '请输入以 http:// 或 https:// 开头的回调地址',
      maxCount: 20,
      tip: '授权成功后，浏览器将重定向到该地址，多个地址请分别添加。'
    }
  )

  const emit = defineEmits(['update:modelValue'])

  const innerValue = ref<string[]>([])
  const errorMessage = ref('')

  watch(
    () => props.modelValue,
    value => {
      // 保留空串行，便于编辑态下继续输入；空串在提交时由调用方过滤
      innerValue.value = [...(value || [])]
    },
    { immediate: true }
  )

  const syncToParent = (): void => {
    emit('update:modelValue', [...innerValue.value])
  }

  /** 校验 URI 是否为合法的 http/https 地址 */
  const isValidUri = (value: string): boolean => {
    const trimmed = value.trim()
    if (!trimmed) return false
    try {
      const url = new URL(trimmed)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const showError = (message: string): void => {
    errorMessage.value = message
  }

  const addUri = (): void => {
    if (innerValue.value.length >= props.maxCount) {
      showError(`最多支持 ${props.maxCount} 条 URI，请先移除部分条目后再添加`)
      return
    }
    innerValue.value = [...innerValue.value, '']
    syncToParent()
    errorMessage.value = ''
  }

  const removeUri = (index: number): void => {
    innerValue.value = innerValue.value.filter((_, i) => i !== index)
    syncToParent()
    errorMessage.value = ''
  }

  const clearAll = (): void => {
    innerValue.value = []
    syncToParent()
    errorMessage.value = ''
  }

  const handleItemChange = (index: number): void => {
    const value = innerValue.value[index]
    // 输入框被清空时移除该条目
    if (!value.trim()) {
      innerValue.value = innerValue.value.filter((_, i) => i !== index)
      syncToParent()
      errorMessage.value = ''
      return
    }
    if (!isValidUri(value)) {
      showError(`"${value.trim()}" 不是合法的回调地址，需以 http:// 或 https:// 开头`)
    } else {
      errorMessage.value = ''
    }
    syncToParent()
  }
</script>

<style scoped lang="scss">
  .uri-list-editor {
    width: 100%;

    &.is-disabled {
      opacity: 0.7;
    }

    .uri-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 8px;

      .uri-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .el-input {
          flex: 1;
          min-width: 0;
        }

        .uri-item-remove {
          flex-shrink: 0;
          margin-left: 0;
        }
      }
    }

    .uri-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .uri-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .uri-feedback {
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

    .uri-tip {
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
