import React, { Component, MouseEvent } from 'react'
import { findDOMNode } from 'react-dom'
import _ from 'lodash'
import Renderer from 'renderer'
import { getModel } from 'model'
import { findNodeIdFromFiber, addDetectClassName, clearDetectClassName } from './utils'
import styles from './index.module.css'
import { ContextMenu, GuideLine } from './tools'

class Simulator extends Component<null, { contextMenu_mouseEvent: React.MouseEvent | null }> {
  componentMeta!: ComponentMetaModel
  projectModel!: ProjectModel
  preDetectingDom!: Element

  constructor(props: any) {
    super(props)
    const { componentMeta, projectModel } = getModel()
    this.componentMeta = componentMeta
    this.projectModel = projectModel

    this.state = {
      contextMenu_mouseEvent: null
    }
  }

  handleChoose(e: MouseEvent) {
    const reactFiberKey = _.keys(e.target).find(item => item.startsWith('__reactFiber')) as string
    // @ts-ignore
    const fiberNode = e.target[reactFiberKey]
    const targetNodeId = findNodeIdFromFiber(fiberNode)
    if (this.projectModel.currentDocument && targetNodeId) {
      clearDetectClassName(this.preDetectingDom);
      (this.projectModel.currentDocument as DocumentModel).setCurrentEditNode(targetNodeId)
    }

    e.stopPropagation()
    return false
  }

  handleMouseOver(e: MouseEvent) {
    const reactFiberKey = _.keys(e.target).find(item => item.startsWith('__reactFiber')) as string
    // @ts-ignore
    const fiberNode = e.target[reactFiberKey]
    const targetNodeId = findNodeIdFromFiber(fiberNode)
    
    if (this.projectModel.currentDocument) {
      const nodeInstance = this.projectModel.currentDocument.getNodeById(targetNodeId)
      const dom = findDOMNode(nodeInstance?.ref)
      clearDetectClassName(this.preDetectingDom)
      if (dom) {
        this.preDetectingDom = dom as Element
        // hover到当前编辑组件时，不展示探测辅助线
        if (nodeInstance.id === this.projectModel?.currentDocument?.currentEditNode?.id) return
        addDetectClassName(this.preDetectingDom)
      }
    }
  }

  render () {
    return (
      <div
        // 右键事件委托
        onContextMenu={(e) => { 
          this.handleChoose(e);
          this.setState({ contextMenu_mouseEvent: e })
          e.preventDefault()
          e.stopPropagation()
        }}
        // 组件选中事件委托
        onClick={(e) => {
          this.handleChoose(e)
          this.setState({ contextMenu_mouseEvent: null })
          e.stopPropagation()
        }}
        // 鼠标悬停探测事件委托
        onMouseOver={(e) => this.handleMouseOver(e)}
        className={styles['simulator-canvas']}
      >
        <GuideLine />
        <ContextMenu mouseEvent={this.state.contextMenu_mouseEvent} />
        <Renderer 
          mode="preview"
          componentMeta={this.componentMeta}
          documentModel={this.projectModel.documents.get('pageId1') as DocumentModel}
        />
      </div>
    )
  }
}

export default Simulator