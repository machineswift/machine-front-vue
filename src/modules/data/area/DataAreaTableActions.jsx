import { ElButton, ElPopconfirm } from 'element-plus'
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
    return () => (
      <div class="table-actions">
        <ElButton size="small" onClick={() => props.onDetail?.(props.rowData)} v-hasPermission={['SYSTEM:BASIC_DATA:AREA:DETAIL']}>
          详情
        </ElButton>

        <ElButton size="small" type="primary" onClick={() => props.onAdd?.(props.rowData)} v-hasPermission={['SYSTEM:BASIC_DATA:AREA:CREATE']}>
          新增
        </ElButton>

        <ElButton size="small" type="primary" onClick={() => props.onEdit?.(props.rowData)} v-hasPermission={['SYSTEM:BASIC_DATA:AREA:UPDATE']}>
          编辑
        </ElButton>

        <ElButton size="small" type="warning" onClick={() => props.onChangeParent?.(props.rowData)} v-hasPermission={['SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT']}>
          修改父节点
        </ElButton>

        <ElPopconfirm title="确定要删除此区域吗？" onConfirm={() => props.onDelete?.(props.rowData)}>
          {{
            reference: () => (
              <ElButton size="small" type="danger" v-hasPermission={['SYSTEM:BASIC_DATA:AREA:DELETE']}>
                删除
              </ElButton>
            )
          }}
        </ElPopconfirm>
      </div>
    )
  }
})