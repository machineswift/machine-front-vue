import { ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElTooltip, ElIcon } from 'element-plus'
import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
import { defineComponent, h } from 'vue'
import { hasPermission } from '@/modules/common/utils/Permission.util'

export default defineComponent({
  name: 'TableActions',
  props: {
    rowData: {
      type: Object,
      required: true
    },
    onDetail: Function,
    onAdd: Function,
    onEdit: Function,
    onChangeParent: Function,
    onDelete: Function,
    onDeleteConfirm: Function
  },
  setup(props) {
    // 检查是否为虚拟节点
    const isVirtualNode = (row) => {
      return row.code?.includes('ORGANIZATION_VIRTUAL_NODE')
    }

    return () => {
      if (isVirtualNode(props.rowData)) {
        return (
          <ElTooltip content="虚拟节点不可操作" placement="top">
            <div class="table-actions">
              <ElButton size="small" disabled>详情</ElButton>
              <ElButton size="small" type="primary" disabled>编辑</ElButton>
              <ElDropdown trigger="click" placement="bottom-end" disabled>
                {{
                  default: () => (
                    <ElButton size="small" type="info" disabled>
                      更多
                      <ElIcon class="el-icon--right">
                        <ArrowDown />
                      </ElIcon>
                    </ElButton>
                  ),
                  dropdown: () => (
                    <ElDropdownMenu>
                      <ElDropdownItem disabled>
                        <ElIcon><Plus /></ElIcon>
                        <span>新增</span>
                      </ElDropdownItem>
                      <ElDropdownItem disabled>
                        <ElIcon><Connection /></ElIcon>
                        <span>修改父节点</span>
                      </ElDropdownItem>
                      <ElDropdownItem disabled divided>
                        <ElIcon><Delete /></ElIcon>
                        <span>删除</span>
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  )
                }}
              </ElDropdown>
            </div>
          </ElTooltip>
        )
      }

      const handleCommand = (command) => {
        const commandMap = {
          add: () => props.onAdd?.(props.rowData),
          changeParent: () => props.onChangeParent?.(props.rowData),
          delete: () => props.onDeleteConfirm?.(props.rowData)
        }
        commandMap[command]?.()
      }

      return (
        <div class="table-actions">
          {h(ElButton, {
            size: 'small',
            disabled: !hasPermission(['SYSTEM:AUTH:ORGANIZATION:DETAIL']),
            onClick: () => props.onDetail?.(props.rowData),
            directives: [
              {
                name: 'hasPermission',
                value: ['SYSTEM:AUTH:ORGANIZATION:DETAIL']
              }
            ]
          }, () => '详情')}

          {h(ElButton, {
            size: 'small',
            type: 'primary',
            disabled: !hasPermission(['SYSTEM:AUTH:ORGANIZATION:UPDATE']),
            onClick: () => props.onEdit?.(props.rowData),
            directives: [
              {
                name: 'hasPermission',
                value: ['SYSTEM:AUTH:ORGANIZATION:UPDATE']
              }
            ]
          }, () => '编辑')}

          <ElDropdown trigger="click" onCommand={handleCommand} placement="bottom-end">
            {{
              default: () => (
                <ElButton size="small" type="info">
                  更多
                  <ElIcon class="el-icon--right">
                    <ArrowDown />
                  </ElIcon>
                </ElButton>
              ),
              dropdown: () => (
                <ElDropdownMenu>
                  {h(ElDropdownItem, {
                    command: 'add',
                    disabled: !hasPermission(['SYSTEM:AUTH:ORGANIZATION:CREATE']),
                    directives: [
                      {
                        name: 'hasPermission',
                        value: ['SYSTEM:AUTH:ORGANIZATION:CREATE']
                      }
                    ]
                  }, () => [
                    h(ElIcon, null, () => h(Plus)),
                    h('span', null, '新增')
                  ])}
                  {h(ElDropdownItem, {
                    command: 'changeParent',
                    disabled: !hasPermission(['SYSTEM:AUTH:ORGANIZATION:UPDATE_PARENT']),
                    directives: [
                      {
                        name: 'hasPermission',
                        value: ['SYSTEM:AUTH:ORGANIZATION:UPDATE_PARENT']
                      }
                    ]
                  }, () => [
                    h(ElIcon, null, () => h(Connection)),
                    h('span', null, '修改父节点')
                  ])}
                  {h(ElDropdownItem, {
                    command: 'delete',
                    divided: true,
                    disabled: !hasPermission(['SYSTEM:AUTH:ORGANIZATION:DELETE']),
                    directives: [
                      {
                        name: 'hasPermission',
                        value: ['SYSTEM:AUTH:ORGANIZATION:DELETE']
                      }
                    ]
                  }, () => [
                    h(ElIcon, null, () => h(Delete)),
                    h('span', null, '删除')
                  ])}
                </ElDropdownMenu>
              )
            }}
          </ElDropdown>
        </div>
      )
    }
  }
})