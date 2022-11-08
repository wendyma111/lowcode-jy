import NodeInstance from 'model/node'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getModel } from 'model'
import styles from './index.module.css'
import { getDomByNodeId, cloneNodeSchema } from 'simulator/utils'

function MenuContent(props: { node: NodeInstance; position: { left: number; top: number } }) {
  const { node, position } = props
  const { projectModel } = getModel()

  const handleDelete = useCallback(() => {
    node.parent?.removeChild(node)
  }, [node])

  const handleCopy = useCallback(() => {
    projectModel.clipboard = node
  }, [node])

  const handlePaste = useCallback(() => {
    if (!projectModel.clipboard) return

    const newSchema = cloneNodeSchema(projectModel.clipboard)
    node.appendChild(newSchema)
  }, [])

  const operations = useRef([
    {
      label: '删除',
      clickHandler: handleDelete
    },
    {
      label: '复制',
      clickHandler: handleCopy
    },
    {
      label: '粘贴',
      disable: () => { return !props.node.isContainer || !projectModel.clipboard },
      clickHandler: handlePaste
    }
  ])

  return (
    <div style={{ left: position.left, top: position.top }} className={styles.menucontainer}>
      {operations.current.map((item, index) => (
        <div 
          key={index}
          style={item.disable && item.disable?.() ? { color: 'rgb(206, 206, 206)', cursor: 'not-allowed', background: '#fff' } : {}} 
          className={styles.menuitem}
          onClick={item.clickHandler}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

function ContextMenu(props: { mouseEvent: React.MouseEvent | null }) {
  const { mouseEvent } = props
  const [dom, setDom] = useState<null | Element>(null)
  const [position, setPosition] = useState<{left: number, top: number} | null>(null)
  const [currentNode, setCurrentNode] = useState<null | NodeInstance>(null)
  
  useEffect(() => {
    const { projectModel } = getModel()
    const clear = projectModel.currentDocument?.onCurrentEditNodeChange((node) => {
      setCurrentNode(node)
      setDom(getDomByNodeId(node?.id))
    })
    return clear
  }, [])

  useEffect(() => {
    if (!mouseEvent || !dom) return
    const rect = dom?.getBoundingClientRect() as DOMRect
    setPosition({
      left: mouseEvent.clientX - rect?.x + 5,
      top: mouseEvent.clientY - rect?.y + 5,
    })

    return () => setPosition(null)
  }, [mouseEvent])

  return mouseEvent && dom && currentNode && position 
          ? createPortal(<MenuContent position={position} node={currentNode as NodeInstance} />, dom)
          : null
}

export default React.memo(ContextMenu)