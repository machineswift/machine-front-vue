<template>
  <div class="json-tree">
    <div v-for="(node, idx) in data" :key="node.path + '-' + idx" class="tree-node" :style="{ paddingLeft: (node.depth || 0) * 16 + 'px' }">
      <div
        class="node-row"
        :class="{ 'tree-highlight': isMatch(node) }"
        :data-path="node.path"
        @mouseenter="hoverPath = node.path"
        @mouseleave="hoverPath = ''"
      >
        <button v-if="node.children && node.children.length > 0" class="node-toggle" @click="toggleCollapse(node)">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" :class="{ rotated: !node.collapsed }">
            <path d="M8 5l8 7-8 7V5z" />
          </svg>
        </button>
        <span v-else class="node-toggle-placeholder"></span>

        <span class="node-key" @dblclick="startEditKey(node)">{{ node.key }}</span>
        <span class="node-colon">:</span>

        <template v-if="node.children && node.children.length > 0">
          <span class="node-bracket">{{ node.type === 'array' ? '[' : '{' }}</span>
          <span class="node-count">{{ node.size || node.children.length }}</span>
          <span class="node-bracket" v-if="node.collapsed">
            {{ node.type === 'array' ? ']' : '}' }}
          </span>
          <span class="node-bracket" v-else></span>
        </template>

        <template v-else-if="node.type === 'string'">
          <span class="node-quote">"</span>
          <span v-if="editingNode === node" class="node-edit-inline">
            <input
              ref="editInputRef"
              v-model="editValue"
              class="node-edit-input"
              @blur="saveEdit(node)"
              @keydown.enter="saveEdit(node)"
              @keydown.escape="cancelEdit"
              @click.stop
            />
          </span>
          <span v-else class="node-value node-string" @dblclick="startEditValue(node)">{{ displayString(node.value) }}</span>
          <span class="node-quote">"</span>
        </template>

        <template v-else-if="node.type === 'number'">
          <span v-if="editingNode === node" class="node-edit-inline">
            <input
              ref="editInputRef"
              v-model="editValue"
              class="node-edit-input"
              @blur="saveEdit(node)"
              @keydown.enter="saveEdit(node)"
              @keydown.escape="cancelEdit"
              @click.stop
            />
          </span>
          <span v-else class="node-value node-number" @dblclick="startEditValue(node)">{{ node.value }}</span>
        </template>

        <template v-else-if="node.type === 'boolean'">
          <span class="node-value node-boolean" @click="toggleBoolean(node)">{{ node.value }}</span>
        </template>

        <template v-else-if="node.type === 'null'">
          <span class="node-value node-null">null</span>
        </template>

        <div v-if="hoverPath === node.path" class="node-actions" @click.stop>
          <button class="na-btn" title="复制值" @click="copyValue(node)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1M15,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V11L15,5M8,21V7H14V12H19V21H8Z" />
            </svg>
          </button>
          <button class="na-btn" title="复制路径" @click="copyPath(node)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path
                d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.68,13.17 19.32,13.17 19.71,13.41L21.19,11.93C23.6,9.5 23.6,5.99 21.19,3.58C18.78,1.17 15.26,1.17 12.85,3.58L9.17,7.26C6.76,9.67 6.76,13.19 9.17,15.6C11.58,18.01 15.09,18.01 17.5,15.6L19.78,13.41L18.29,11.93L16.09,14.12C14.66,15.55 12.37,15.55 10.95,14.12C9.55,12.71 9.55,10.41 10.95,9L14.5,5.5C15.9,4.1 18.19,4.1 19.59,5.5C21,6.9 21,9.2 19.59,10.6L18.1,12.09C18.37,12.44 18.61,12.81 18.79,13.21L21.19,10.8C23.21,8.78 23.21,5.39 21.19,3.37C19.17,1.35 15.79,1.35 13.77,3.37L10.59,6.55C7.83,9.31 7.83,13.77 10.59,16.53C13.26,19.19 17.52,19.3 20.26,16.83L17.53,14.1L16.09,15.54C14.66,16.97 12.37,16.97 10.95,15.54C9.55,14.14 9.55,11.84 10.95,10.44L13.77,7.62C14.17,7.22 14.17,6.59 13.77,6.19C13.38,5.79 12.74,5.79 12.35,6.19L10.59,7.95C9.17,9.37 9.17,11.62 10.59,13.04C11,13.43 11,14.07 10.59,14.46Z"
              />
            </svg>
          </button>
          <button class="na-btn" title="复制键名" @click="copyKey(node)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M7.5,15V13H16.5V15H7.5M7.5,9H16.5V11H7.5V9Z"
              />
            </svg>
          </button>
          <button class="na-btn na-delete" title="删除" @click="deleteNode(node)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </button>
        </div>

        <span v-if="!node.isLast" class="node-comma">,</span>
      </div>

      <div v-if="node.children && node.children.length > 0 && !node.collapsed" class="node-children">
        <JsonTree
          :data="node.children"
          :search="search"
          :path="node.path"
          @update:data="(children: any) => updateChildren(node, children)"
          @copy="(type: string, path: string, value?: any) => emit('copy', type, path, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { ref, nextTick } from 'vue'

  interface TreeNode {
    key: string
    value: any
    type: string
    path: string
    children: TreeNode[]
    collapsed: boolean
    depth: number
    isLast: boolean
    size?: number
  }

  const props = defineProps<{
    data: TreeNode[]
    search: string
    path: string
  }>()

  const emit = defineEmits<{
    'update:data': [data: TreeNode[]]
    copy: [type: string, path: string, value?: any]
  }>()

  const hoverPath = ref('')
  const editingNode = ref<TreeNode | null>(null)
  const editValue = ref('')
  const editInputRef = ref<HTMLInputElement | null>(null)

  function toggleCollapse(node: TreeNode) {
    node.collapsed = !node.collapsed
    emit('update:data', [...props.data])
  }

  function startEditKey(node: TreeNode) {
    editingNode.value = node
    editValue.value = node.key
    nextTick(() => {
      editInputRef.value?.focus()
      editInputRef.value?.select()
    })
  }

  function startEditValue(node: TreeNode) {
    editingNode.value = node
    editValue.value = String(node.value ?? '')
    nextTick(() => {
      editInputRef.value?.focus()
      editInputRef.value?.select()
    })
  }

  function saveEdit(node: TreeNode) {
    if (!editingNode.value) return
    node.value = editValue.value
    editingNode.value = null
    emit('update:data', [...props.data])
  }

  function cancelEdit() {
    editingNode.value = null
  }

  function toggleBoolean(node: TreeNode) {
    node.value = node.value === 'true' ? 'false' : 'true'
    emit('update:data', [...props.data])
  }

  function updateChildren(node: TreeNode, children: TreeNode[]) {
    node.children = children
    emit('update:data', [...props.data])
  }

  function treeToValue(node: TreeNode): any {
    if (node.children && node.children.length > 0) {
      const isArr = node.children.every(c => /^\d+$/.test(c.key))
      if (isArr) {
        const arr: any[] = []
        for (const c of node.children) arr[parseInt(c.key)] = treeToValue(c)
        return arr
      }
      const obj: Record<string, any> = {}
      for (const c of node.children) obj[c.key] = treeToValue(c)
      return obj
    }
    return node.value
  }

  function copyValue(node: TreeNode) {
    const val = node.children && node.children.length > 0 ? treeToValue(node) : node.value
    emit('copy', 'value', node.path, val)
  }
  function copyPath(node: TreeNode) {
    emit('copy', 'path', node.path)
  }
  function copyKey(node: TreeNode) {
    emit('copy', 'key', node.path, node.key)
  }
  function deleteNode(node: TreeNode) {
    const idx = props.data.indexOf(node)
    if (idx === -1) return
    const newData = [...props.data]
    newData.splice(idx, 1)
    emit('update:data', newData)
  }

  function isMatch(node: TreeNode): boolean {
    if (!props.search) return false
    const q = props.search.toLowerCase()
    return node.key.toLowerCase().includes(q) || (node.value !== undefined && String(node.value).toLowerCase().includes(q))
  }

  function displayString(val: string): string {
    if (!val) return ''
    return val.length > 80 ? val.substring(0, 77) + '...' : val
  }
</script>

<style scoped lang="scss">
  @use 'sass:color';
  $t1: var(--portal-t1);
  $t2: var(--portal-t2);
  $t3: var(--portal-t3);
  $a: #667eea;

  .json-tree {
    font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    user-select: none;
    width: max-content;
    min-width: 100%;
  }
  .tree-node {
    position: relative;
    min-width: max-content;
  }
  .node-row {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 1px 8px 1px 0;
    border-radius: 3px;
    cursor: default;
    transition: background 0.1s;
    min-height: 24px;
    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    &.tree-highlight {
      background: rgba(255, 204, 0, 0.12);
      box-shadow: inset 3px 0 0 #ffc800;
    }
  }
  .node-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: none;
    border: none;
    color: $t3;
    cursor: pointer;
    flex-shrink: 0;
    svg {
      transition: transform 0.15s;
    }
    .rotated {
      transform: rotate(90deg);
    }
    &:hover {
      color: $t1;
    }
  }
  .node-toggle-placeholder {
    display: inline-block;
    width: 16px;
    flex-shrink: 0;
  }
  .node-key {
    color: #7ec699;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      text-decoration: underline;
    }
  }
  .node-colon {
    color: $t2;
    margin-right: 3px;
  }
  .node-value {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .node-string {
    color: #ce9178;
  }
  .node-number {
    color: #b5cea8;
  }
  .node-boolean {
    color: #569cd6;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .node-null {
    color: $t3;
    font-style: italic;
  }
  .node-quote {
    color: #ce9178;
    opacity: 0.7;
  }
  .node-bracket {
    color: $t2;
  }
  .node-count {
    font-size: 10px;
    color: $t3;
    background: rgba(255, 255, 255, 0.04);
    padding: 0 4px;
    border-radius: 3px;
    margin: 0 2px;
  }
  .node-comma {
    color: $t3;
  }
  .node-children {
    position: relative;
  }
  .node-edit-inline {
    display: inline-flex;
    align-items: center;
  }
  .node-edit-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #8a9ef0;
    border-radius: 3px;
    color: $t1;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    padding: 1px 4px;
    outline: none;
    width: 120px;
    min-width: 60px;
    &:focus {
      border-color: color.adjust($a, $lightness: 10%);
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
  }
  .node-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 4px;
    flex-shrink: 0;
  }
  .na-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    color: $t3;
    cursor: pointer;
    transition: all 0.12s;
    &:hover {
      background: rgba(102, 126, 234, 0.1);
      color: $a;
      border-color: rgba(102, 126, 234, 0.2);
    }
    &.na-delete {
      color: rgba(245, 108, 108, 0.5);
    }
    &.na-delete:hover {
      background: rgba(245, 108, 108, 0.12) !important;
      color: #f56c6c !important;
      border-color: rgba(245, 108, 108, 0.25) !important;
    }
  }
</style>
