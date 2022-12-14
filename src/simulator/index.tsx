import React, { Component, DragEvent, MouseEvent } from 'react'
import { findDOMNode } from 'react-dom'
import _, { isNil } from 'lodash'
import rendererFactory from 'renderer'
import { getModel } from 'model'
import { findNodeIdFromFiber, addClassName, clearClassName } from './utils'
import styles from './index.module.css'
import { ContextMenu, GuideLine } from './tools'
import Project from 'model/project'

const Renderer = rendererFactory.designFactory()

class Simulator extends Component<Record<string, never>, { contextMenu_mouseEvent: React.MouseEvent | null, currentDocument: DocumentModel }> {
  componentMeta!: ComponentMetaModel
  projectModel!: Project
  preDetectingDom!: Element
  detectingClassName = '_detecting'

  clear!: () => void

  constructor(props: any) {
    super(props)
    const { componentMeta, projectModel } = getModel()
    this.componentMeta = componentMeta
    this.projectModel = projectModel

    this.state = {
      contextMenu_mouseEvent: null,
      currentDocument: projectModel.currentDocument as DocumentModel
    }

    this.clear = projectModel.onCurrentDocumentChange((doc) => {
      this.setState({
        currentDocument: doc
      })
    })
  }

  handleChoose(e: MouseEvent) {
    const reactFiberKey = _.keys(e.target).find(item => item.startsWith('__reactFiber')) as string
    const fiberNode = (e.target as any)[reactFiberKey]
    const targetNodeId = findNodeIdFromFiber(fiberNode)
    if (this.state.currentDocument && targetNodeId) {
      clearClassName(this.preDetectingDom, this.detectingClassName);
      (this.state.currentDocument as DocumentModel).setCurrentEditNode(targetNodeId)
    }

    e.stopPropagation()
    return false
  }

  handleMouseOver(e: MouseEvent) {
    clearClassName(this.preDetectingDom, this.detectingClassName)

    const reactFiberKey = _.keys(e.target).find(item => item.startsWith('__reactFiber')) as string
    const fiberNode = (e.target as any)[reactFiberKey]
    const targetNodeId = findNodeIdFromFiber(fiberNode)
    
    if (this.state.currentDocument) {
      const nodeInstance = this.state.currentDocument.getNodeById(targetNodeId)
      const dom = findDOMNode(nodeInstance?.ref)
      if (dom) {
        this.preDetectingDom = dom as Element
        // hover???????????????????????????????????????????????????
        if (nodeInstance.id === this.state.currentDocument?.currentEditNode?.id) return
        addClassName(this.preDetectingDom, this.detectingClassName)
      }
    }
  }

  componentWillUnmount() {
    this.clear?.()
  }

  render () {
    return (
      <div
        ref={ref => ref && this.projectModel.designer.dragon.addSensor(ref)}
        // ??????????????????
        onContextMenu={(e) => { 
          this.handleChoose(e);
          this.setState({ contextMenu_mouseEvent: e })
          e.preventDefault()
          e.stopPropagation()
        }}
        // ????????????????????????
        onClick={(e) => {
          this.handleChoose(e)
          this.setState({ contextMenu_mouseEvent: null })
          e.stopPropagation()
        }}
        // ??????????????????????????????
        onMouseOver={(e) => this.handleMouseOver(e)}
        className={styles['simulator-canvas']}
        id='simulator-canvas'
      >
        <GuideLine />
        <ContextMenu mouseEvent={this.state.contextMenu_mouseEvent} />
        <Renderer
          mode="design"
          componentMeta={this.componentMeta}
          documentModel={this.state.currentDocument as DocumentModel}
        />
      </div>
    )
  }
}

export default Simulator