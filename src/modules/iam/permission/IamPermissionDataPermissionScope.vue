<template>
  <div class="permission-tabs-container">
    <el-tabs v-model="activeTab" type="border-card" closable editable @edit="handleTabsEdit">
      <el-tab-pane v-for="(item, index) in modelValue" :key="index" :label="item.functionName || `功能${index + 1}`" :name="index.toString()">
        <div class="permission-content">
          <div class="function-row">
            <el-form-item :prop="`dataPermissionMetaList.${index}.functionName`" :rules="functionNameRules(index)" label="功能名称" class="function-name">
              <el-input
                v-model="item.functionName"
                placeholder="请输入功能名称"
                @blur="validateField(`dataPermissionMetaList.${index}.functionName`)"
                :disabled="disabled"
              />
            </el-form-item>

            <el-form-item :prop="`dataPermissionMetaList.${index}.functionCode`" :rules="functionCodeRules(index)" label="功能编码" class="function-code">
              <el-input
                v-model="item.functionCode"
                placeholder="请输入功能编码"
                @blur="validateField(`dataPermissionMetaList.${index}.functionCode`)"
                :disabled="disabled"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="default" @click="handleAddCustomScope(index)" :disabled="disabled">添加范围</el-button>
            </el-form-item>
          </div>

          <!-- 范围选择区域 -->
          <div class="scope-selection-area">
            <div class="scope-checkbox-group">
              <el-checkbox-group v-model="item.selectedScopes" @change="handleScopeSelection(index)" :disabled="disabled">
                <el-checkbox v-for="scope in state.dataPermissionScopeTypes" :key="scope.code" :label="scope.code" :value="scope.code" border size="default">
                  {{ scope.message }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <!-- 权限范围列表 -->
          <el-form-item
            v-if="item.scopeList && item.scopeList.length > 0"
            label="权限范围"
            :prop="`dataPermissionMetaList.${index}.scopeList`"
            :rules="scopeListRules"
          >
            <div class="scope-list-container">
              <draggable v-model="item.scopeList" handle=".drag-handle" item-key="scopeCode" class="scope-list" :disabled="disabled">
                <template #item="{ element, index: scopeIndex }">
                  <div class="scope-item">
                    <el-icon class="drag-handle"><Menu /></el-icon>
                    <div class="scope-info">
                      <el-form-item
                        :prop="`dataPermissionMetaList.${index}.scopeList.${scopeIndex}.scopeName`"
                        :rules="scopeNameRules(index, scopeIndex, element)"
                        label-width="0"
                      >
                        <el-input
                          v-model="element.scopeName"
                          placeholder="范围名称"
                          @blur="validateField(`dataPermissionMetaList.${index}.scopeList.${scopeIndex}.scopeName`)"
                          :disabled="disabled || isPredefinedScope(element.scopeCode)"
                        />
                      </el-form-item>
                      <el-form-item
                        :prop="`dataPermissionMetaList.${index}.scopeList.${scopeIndex}.scopeCode`"
                        :rules="scopeCodeRules(index, scopeIndex, element)"
                        label-width="0"
                      >
                        <el-input
                          v-model="element.scopeCode"
                          placeholder="范围编码"
                          @blur="validateField(`dataPermissionMetaList.${index}.scopeList.${scopeIndex}.scopeCode`)"
                          :disabled="disabled || isPredefinedScope(element.scopeCode)"
                        />
                      </el-form-item>
                    </div>
                    <el-button type="danger" size="small" circle @click="handleRemoveScope(index, scopeIndex)" :disabled="disabled">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </template>
              </draggable>
            </div>
          </el-form-item>
          <div v-else class="empty-scope-tip">暂无权限范围，请添加</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { VueDraggable as Draggable } from 'vue-draggable-plus'
  import { Menu, Delete } from '@element-plus/icons-vue'
  import { ref, nextTick, reactive, watch } from 'vue'
  import { type TabPaneName, type FormInstance } from 'element-plus'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import type { DataPermissionMetaDto, DataPermissionMetaScopeDto } from '@/shared/types/CommonIam.type'

  const props = defineProps<{
    modelValue: DataPermissionMetaDto[]
    formRef?: FormInstance
    disabled?: boolean
  }>()

  const enumStore = useDictionaryEnumStore()
  const emit = defineEmits(['update:modelValue'])

  const activeTab = ref('0')
  const state = reactive({
    //枚举状态
    dataPermissionScopeTypes: []
  })

  // 判断是否是预定义的范围
  const isPredefinedScope = (scopeCode: string) => {
    return state.dataPermissionScopeTypes.some(scope => scope.code === scopeCode)
  }

  // 验证规则
  const scopeListRules = [
    {
      validator: (_, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('至少需要添加一个权限范围'))
        } else {
          callback()
        }
      },
      trigger: ['change', 'blur']
    }
  ]

  const functionNameRules = (index: number) => [
    { required: true, message: '请输入功能名称', trigger: ['blur', 'change'] },
    { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: ['blur', 'change'] },
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }

        const isDuplicate = props.modelValue.some((item, i) => i !== index && item.functionName === value)
        if (isDuplicate) {
          callback(new Error('功能名称不能重复'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]

  const functionCodeRules = (index: number) => [
    { required: true, message: '请输入功能编码', trigger: ['blur', 'change'] },
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }

        if (!/^[a-zA-Z0-9_:-]+$/.test(value)) {
          callback(new Error('功能编码只能包含字母、数字、下划线、冒号和减号'))
          return
        }

        const isDuplicate = props.modelValue.some((item, i) => i !== index && item.functionCode === value)
        if (isDuplicate) {
          callback(new Error('功能编码不能重复'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]

  const scopeNameRules = (tabIndex: number, scopeIndex: number, element: DataPermissionMetaScopeDto) => [
    { required: true, message: '请输入范围名称', trigger: ['blur', 'change'] },
    { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: ['blur', 'change'] },
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }

        // 如果是预定义的范围，不检查重复
        if (isPredefinedScope(element.scopeCode)) {
          callback()
          return
        }

        const currentScopes = props.modelValue[tabIndex].scopeList
        const isDuplicate = currentScopes.some((item, i) => i !== scopeIndex && item.scopeName === value)

        if (isDuplicate) {
          callback(new Error('范围名称不能重复'))
        } else {
          // 检查是否与预定义的范围名称冲突
          const isConflict = state.dataPermissionScopeTypes.some(scope => scope.message === value)
          if (isConflict) {
            callback(new Error('范围名称不能与预定义的范围相同'))
          } else {
            callback()
          }
        }
      },
      trigger: ['blur', 'change']
    }
  ]

  const scopeCodeRules = (tabIndex: number, scopeIndex: number, element: DataPermissionMetaScopeDto) => [
    { required: true, message: '请输入范围编码', trigger: ['blur', 'change'] },
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }

        if (!/^[a-zA-Z0-9_:-]+$/.test(value)) {
          callback(new Error('范围编码只能包含字母、数字、下划线、冒号和减号'))
          return
        }

        // 如果是预定义的范围，不检查重复
        if (isPredefinedScope(element.scopeCode)) {
          callback()
          return
        }

        const currentScopes = props.modelValue[tabIndex].scopeList
        const isDuplicate = currentScopes.some((item, i) => i !== scopeIndex && item.scopeCode === value)

        if (isDuplicate) {
          callback(new Error('范围编码不能重复'))
        } else {
          // 检查是否与预定义的范围编码冲突
          const isConflict = state.dataPermissionScopeTypes.some(scope => scope.code === value)
          if (isConflict) {
            callback(new Error('范围编码不能与预定义的范围相同'))
          } else {
            callback()
          }
        }
      },
      trigger: ['blur', 'change']
    }
  ]

  // 方法
  const validateField = (prop: string) => {
    if (!props.disabled) {
      props.formRef?.validateField(prop)
    }
  }

  const handleTabsEdit = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
    if (props.disabled) return

    if (action === 'add') {
      const newItem = {
        functionName: '',
        functionCode: '',
        scopeList: [],
        selectedScopes: []
      }
      const newValue = [...props.modelValue, newItem]
      emit('update:modelValue', newValue)
      activeTab.value = (newValue.length - 1).toString()

      nextTick(() => {
        const index = newValue.length - 1
        validateField(`dataPermissionMetaList.${index}.functionName`)
        validateField(`dataPermissionMetaList.${index}.functionCode`)
      })
    } else if (action === 'remove' && targetName !== undefined) {
      const index = parseInt(targetName.toString())
      if (!isNaN(index)) {
        const newValue = [...props.modelValue]
        newValue.splice(index, 1)
        emit('update:modelValue', newValue)
        if (newValue.length > 0) {
          activeTab.value = Math.min(index, newValue.length - 1).toString()
        } else {
          activeTab.value = '0'
        }
      }
    }
  }

  const handleScopeSelection = (tabIndex: number) => {
    if (props.disabled) return

    const currentTab = props.modelValue[tabIndex]
    if (!currentTab.scopeList) {
      currentTab.scopeList = []
    }

    // 保留自定义的范围
    const customScopes = currentTab.scopeList.filter(scope => !isPredefinedScope(scope.scopeCode))

    // 添加新选择的范围
    currentTab.selectedScopes.forEach(scopeCode => {
      if (!currentTab.scopeList.some(s => s.scopeCode === scopeCode)) {
        const scope = state.dataPermissionScopeTypes.find(s => s.code === scopeCode)
        if (scope) {
          currentTab.scopeList.push({
            scopeName: scope.message,
            scopeCode: scope.code
          })
        }
      }
    })

    // 合并自定义范围和选择的范围
    currentTab.scopeList = [
      ...customScopes,
      ...currentTab.scopeList.filter(scope => currentTab.selectedScopes.includes(scope.scopeCode) && isPredefinedScope(scope.scopeCode))
    ]

    validateField(`dataPermissionMetaList.${tabIndex}.scopeList`)
  }

  const handleAddCustomScope = (tabIndex: number) => {
    if (props.disabled) return

    const newValue = [...props.modelValue]
    if (!newValue[tabIndex].scopeList) {
      newValue[tabIndex].scopeList = []
    }
    newValue[tabIndex].scopeList.push({
      scopeName: '',
      scopeCode: ''
    })
    emit('update:modelValue', newValue)

    nextTick(() => {
      const container = document.querySelector('.scope-list-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
      const scopeIndex = newValue[tabIndex].scopeList.length - 1
      validateField(`dataPermissionMetaList.${tabIndex}.scopeList.${scopeIndex}.scopeName`)
      validateField(`dataPermissionMetaList.${tabIndex}.scopeList.${scopeIndex}.scopeCode`)
    })
  }

  const handleRemoveScope = (tabIndex: number, scopeIndex: number) => {
    if (props.disabled) return

    const newValue = [...props.modelValue]
    const scopeCode = newValue[tabIndex].scopeList[scopeIndex].scopeCode
    newValue[tabIndex].scopeList.splice(scopeIndex, 1)

    // 如果是预定义的范围，从selectedScopes中移除
    if (isPredefinedScope(scopeCode)) {
      const selectedIndex = newValue[tabIndex].selectedScopes.indexOf(scopeCode)
      if (selectedIndex >= 0) {
        newValue[tabIndex].selectedScopes.splice(selectedIndex, 1)
      }
    }

    emit('update:modelValue', newValue)
    validateField(`dataPermissionMetaList.${tabIndex}.scopeList`)
  }

  // 初始化selectedScopes
  const initSelectedScopes = () => {
    props.modelValue.forEach(tab => {
      if (tab.scopeList && tab.scopeList.length > 0) {
        tab.selectedScopes = tab.scopeList.filter(scope => isPredefinedScope(scope.scopeCode)).map(scope => scope.scopeCode)
      } else {
        tab.selectedScopes = []
      }
    })
  }

  watch(
    [() => props.modelValue, () => state.dataPermissionScopeTypes],
    async ([modelValue]) => {
      if (modelValue) {
        //状态
        state.dataPermissionScopeTypes = enumStore.getEnumDataSync('IamDataPermissionScopeTypeEnum')
        // 初始化时设置selectedScopes
        initSelectedScopes()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  /* 样式保持不变 */
  .permission-tabs-container {
    width: 100%;

    .permission-content {
      padding: 4px;
      border-radius: 4px;

      .function-row {
        display: flex;
        align-items: flex-start;
        gap: 4px;
        margin-bottom: 4px;

        .function-name,
        .function-code {
          flex: 1;
          min-width: 200px;
          margin-bottom: 0;
        }
      }

      .scope-selection-area {
        margin: 12px 0;
        padding: 4px;
        border-radius: 4px;

        .scope-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 4px;
          justify-content: center;
          align-items: center;
        }
      }

      .scope-list-container {
        width: 100%;
        margin-top: 4px;
        min-height: 100px;
        max-height: 160px;
        overflow-y: auto;
        padding-right: 4px;

        .scope-list {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .scope-item {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

            .scope-info {
              flex: 1;
              display: flex;
              gap: 12px;
              align-items: center;

              .el-form-item {
                flex: 1;
                margin-bottom: 0;

                .el-input {
                  width: 100%;
                  min-width: 200px;
                }
              }
            }

            .drag-handle {
              cursor: move;
            }
          }
        }
      }

      .empty-scope-tip {
        text-align: center;
        padding: 10px;
      }
    }

    :deep(.el-tabs__new-tab) {
      margin: 2px 0 2px 8px;
      border-radius: 4px;
      background-color: var(--el-color-primary);
      color: white;
      font-size: 16px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      // 悬停效果
      &:hover {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  }
</style>
