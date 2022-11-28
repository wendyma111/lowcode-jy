import React, { PureComponent } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import NodeInstance from 'model/node'
import { Tooltip } from 'antd'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import { observer } from 'mobx-react'
import styles from './index.module.css'
import { getDomByNodeId } from 'simulator/utils'

class GuideLine extends PureComponent {
  clearNodeChangeHandler!: () => void

  handleDelete() {
    const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode
    const node = currentEditNode as NodeInstance
    node.parent?.removeChild(node)
  }

  handleCopy() {
    const { projectModel } = getModel()
    const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode
    projectModel.clipboard = currentEditNode
  }

  render() {
    const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode
    const container = getDomByNodeId(currentEditNode?.id as string)

    return currentEditNode && container 
      ? createPortal(
          <div className={styles['simulator-content']}>
            <Tooltip placement="top" title="复制">
              <div onClick={() => this.handleCopy()} className={styles['simulator-action-copy']}>
                <CopyOutlined style={{ color: '#fff' }} />
              </div>
            </Tooltip>
            <Tooltip placement="top" title="删除">
              <div onClick={() => this.handleDelete()} className={styles['simulator-action-delete']}>
                <DeleteOutlined style={{ color: '#fff' }} />
              </div>
            </Tooltip> 
          </div>,
          container
        ) 
      : null
  }
}

export default observer(GuideLine)