import React, { Component, useEffect, useState } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import NodeInstance from 'model/node'
import { Tooltip } from 'antd'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import { observer } from 'mobx-react'
import styles from './index.module.css'
import { getDomByNodeId } from 'simulator/utils'

function GuideLine() {
  const [nodeId, setNodeId] = useState<null | string>(null)
  const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode

  const handleDelete = () => {
    const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode
    const node = currentEditNode as NodeInstance
    node.parent?.removeChild(node)
  }

  const handleCopy = () => {
    const { projectModel } = getModel()
    const currentEditNode = getModel().projectModel.currentDocument?.currentEditNode
    projectModel.clipboard = currentEditNode
  }

  useEffect(() => {
    if (currentEditNode === null) {
      setNodeId(null)
      return
    }
    if (currentEditNode.id && currentEditNode.id !== nodeId) {
      setNodeId(currentEditNode.id)
    }
  }, [currentEditNode])

  const container = getDomByNodeId(nodeId as string)

  return container
    ? createPortal(
      <div className={styles['simulator-content']}>
        <Tooltip placement="top" title="复制">
          <div
            onClick={handleCopy}
            className={styles['simulator-action-copy']}
          >
            <CopyOutlined style={{ color: '#fff' }} />
          </div>
        </Tooltip>
        <Tooltip placement="top" title="删除">
          <div
            onClick={handleDelete}
            className={styles['simulator-action-delete']}
          >
            <DeleteOutlined style={{ color: '#fff' }} />
          </div>
        </Tooltip>
      </div>,
      container
    )
    : null
}

export default observer(GuideLine)