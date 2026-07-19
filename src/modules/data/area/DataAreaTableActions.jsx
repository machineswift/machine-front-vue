import { ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
import { defineComponent, h } from 'vue'
import { hasPermission } from '@/shared/utils/Permission.util'

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
    const handleCommand = (command) => {
      const commandMap = {
        add: () => props.onAdd?.(props.rowData),
        changeParent: () => props.onChangeParent?.(props.rowData),
        delete: () => props.onDeleteConfirm?.(props.rowData)
      }
      commandMap[command]?.()
    }

    return () => (
      <div class="table-actions">
        {h(ElButton, {
          size: 'small',
          disabled: !hasPermission(['SYSTEM:BASIC_DATA:AREA:DETAIL']),
          onClick: () => props.onDetail?.(props.rowData),
          directives: [
            {
              name: 'hasPermission',
              value: ['SYSTEM:BASIC_DATA:AREA:DETAIL']
            }
          ]
        }, () => '详情')}

        {h(ElButton, {
          size: 'small',
          type: 'primary',
          disabled: !hasPermission(['SYSTEM:BASIC_DATA:AREA:UPDATE']),
          onClick: () => props.onEdit?.(props.rowData),
          directives: [
            {
              name: 'hasPermission',
              value: ['SYSTEM:BASIC_DATA:AREA:UPDATE']
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
                  disabled: !hasPermission(['SYSTEM:BASIC_DATA:AREA:CREATE']),
                  directives: [
                    {
                      name: 'hasPermission',
                      value: ['SYSTEM:BASIC_DATA:AREA:CREATE']
                    }
                  ]
                }, () => [
                  h(ElIcon, null, () => h(Plus)),
                  h('span', null, '新增')
                ])}
                {h(ElDropdownItem, {
                  command: 'changeParent',
                  disabled: !hasPermission(['SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT']),
                  directives: [
                    {
                      name: 'hasPermission',
                      value: ['SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT']
                    }
                  ]
                }, () => [
                  h(ElIcon, null, () => h(Connection)),
                  h('span', null, '修改父节点')
                ])}
                {h(ElDropdownItem, {
                  command: 'delete',
                  divided: true,
                  disabled: !hasPermission(['SYSTEM:BASIC_DATA:AREA:DELETE']),
                  directives: [
                    {
                      name: 'hasPermission',
                      value: ['SYSTEM:BASIC_DATA:AREA:DELETE']
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
})