<template>
  <div class="json-editor" :class="{ 'is-invalid': !!errorText }">
    <div class="json-editor-toolbar">
      <span class="json-editor-state" :class="errorText ? 'is-error' : 'is-ok'">
        {{ errorText || 'JSON 合法' }}
      </span>
      <span class="json-editor-actions">
        <el-button link type="primary" size="small" @click="handleFormat">格式化</el-button>
        <el-button link type="primary" size="small" @click="handleClear">清空</el-button>
      </span>
    </div>
    <div ref="editorRef" class="json-editor-body" :style="{ height }" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { EditorView, basicSetup } from 'codemirror'
  import { EditorState } from '@codemirror/state'
  import { json } from '@codemirror/lang-json'

  const props = withDefaults(
    defineProps<{
      modelValue: string
      /** 编辑区高度，默认 180px */
      height?: string
      placeholder?: string
    }>(),
    { height: '180px', placeholder: '' }
  )

  const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
  }>()

  const editorRef = ref<HTMLElement | null>(null)
  let view: EditorView | null = null

  const errorText = computed(() => {
    const text = props.modelValue?.trim()
    if (!text) return ''
    try {
      JSON.parse(text)
      return ''
    } catch (error) {
      return `JSON 解析失败：${error instanceof Error ? error.message : '格式错误'}`
    }
  })

  const lightTheme = EditorView.theme({
    '&': { height: '100%', fontSize: '12px', border: 'none' },
    '.cm-scroller': { fontFamily: 'var(--el-font-family-mono, monospace)', lineHeight: '1.6' },
    '.cm-content': { padding: '8px 0' },
    '.cm-gutters': { backgroundColor: 'var(--el-fill-color-lighter)', borderRight: '1px solid var(--el-border-color-lighter)' },
    '&.cm-focused': { outline: 'none' }
  })

  const syncToView = (value: string) => {
    if (!view) return
    const current = view.state.doc.toString()
    if (current === value) return
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value }
    })
  }

  const handleFormat = () => {
    if (!view) return
    const text = view.state.doc.toString().trim()
    if (!text) return
    try {
      const formatted = JSON.stringify(JSON.parse(text), null, 2)
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } })
      emit('update:modelValue', formatted)
    } catch {
      // 非法 JSON 保持原样，错误提示由 errorText 呈现
    }
  }

  const handleClear = () => {
    if (!view) return
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } })
    emit('update:modelValue', '')
  }

  onMounted(() => {
    if (!editorRef.value) return
    view = new EditorView({
      state: EditorState.create({
        doc: props.modelValue || '',
        extensions: [
          basicSetup,
          json(),
          lightTheme,
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
          }),
          EditorView.domEventHandlers({
            blur: () => {
              // 失焦时自动格式化，避免用户保存未排版内容
              handleFormat()
            }
          })
        ]
      }),
      parent: editorRef.value
    })
    view.contentDOM.setAttribute('aria-label', props.placeholder || 'JSON 编辑器')
  })

  watch(
    () => props.modelValue,
    value => syncToView(value ?? '')
  )

  onBeforeUnmount(() => {
    view?.destroy()
    view = null
  })
</script>

<style scoped lang="scss">
  .json-editor {
    width: 100%;
    overflow: hidden;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    &.is-invalid {
      border-color: var(--el-color-danger);
    }
  }

  .json-editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 8px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .json-editor-state {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.is-ok {
      color: var(--el-color-success);
    }

    &.is-error {
      color: var(--el-color-danger);
    }
  }

  .json-editor-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .json-editor-body {
    overflow: auto;
  }
</style>
