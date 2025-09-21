import { ElButton, ElPopconfirm, ElTooltip } from 'element-plus'
import { defineComponent } from 'vue'

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
    onDelete: Function
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
            <div class="disabled-actions">
              <ElButton size="small" disabled>详情</ElButton>
              <ElButton size="small" type="primary" disabled>新增</ElButton>
              <ElButton size="small" type="primary" disabled>编辑</ElButton>
              <ElButton size="small" type="warning" disabled>修改父节点</ElButton>
              <ElButton size="small" type="danger" disabled>删除</ElButton>
            </div>
          </ElTooltip>
        )
      }

      return (
        <div class="table-actions">
          <ElButton size="small" onClick={() => props.onDetail?.(props.rowData)} v-hasPermission={['SYSTEM:AUTH:ORGANIZATION:DETAIL']}>
            详情
          </ElButton>

          <ElButton size="small" type="primary" onClick={() => props.onAdd?.(props.rowData)} v-hasPermission={['SYSTEM:AUTH:ORGANIZATION:CREATE']}>
            新增
          </ElButton>

          <ElButton size="small" type="primary" onClick={() => props.onEdit?.(props.rowData)} v-hasPermission={['SYSTEM:AUTH:ORGANIZATION:UPDATE']}>
            编辑
          </ElButton>

          <ElButton size="small" type="warning" onClick={() => props.onChangeParent?.(props.rowData)} v-hasPermission={['SYSTEM:AUTH:ORGANIZATION:UPDATE_PARENT']}>
            修改父节点
          </ElButton>

          <ElPopconfirm title="确定要删除此组织吗？" onConfirm={() => props.onDelete?.(props.rowData)}>
            {{
              reference: () => (
                <ElButton size="small" type="danger" v-hasPermission={['SYSTEM:AUTH:ORGANIZATION:DELETE']}>
                  删除
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  }
})