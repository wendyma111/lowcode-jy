import React, { PureComponent } from 'react'
import { createPortal } from 'react-dom'
import NodeInstance from 'model/node'
import { Tooltip } from 'antd'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import styles from './index.module.css'
import { getDomByNodeId } from 'simulator/utils'

class GuideLine extends PureComponent<{}, { currentEditNode: NodeInstance | null }> {
  clearNodeChangeHandler!: () => void

  constructor(props: {}) {
    super(props)

    this.state = {
      currentEditNode: null
    }

    this.init()
  }

  init() {
    const { projectModel } = getModel()
    this.clearNodeChangeHandler = (projectModel.currentDocument as DocumentModel).onCurrentEditNodeChange(
      (currentEditNode: NodeInstance) => {
        this.setState({
          currentEditNode
        })
      }
    )
  }

  componentWillUnmount(): void {
    this.clearNodeChangeHandler?.()
  }

  handleDelete() {
    const { currentEditNode } = this.state
    const node = currentEditNode as NodeInstance
    node.parent?.removeChild(node)
  }

  handleCopy() {
    const { projectModel } = getModel()
    const { currentEditNode } = this.state
    projectModel.clipboard = currentEditNode
  }

  render() {
    const { currentEditNode } = this.state
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

export default GuideLine