import React, { Component, PureComponent, MouseEvent } from 'react'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import NodeInstance from 'model/node'
import _ from 'lodash'
import { IOutlineTreeState, IOutlineItemProps, IOutlineItemState } from './index.type'
import styles from './index.module.css'
import { observer } from 'mobx-react'

class OutlineTree extends Component<any, IOutlineTreeState> {
  clearCurrentDocumentChange: () => void
  clearRerender!: () => void

  constructor(props: any) {
    super(props)
    const { projectModel } = getModel()
    this.state = {
      currentDocument: projectModel.currentDocument,
    }
    this.clearCurrentDocumentChange = projectModel.onCurrentDocumentChange(doc => {
      this.clearRerender?.()
      this.clearRerender = doc.onRerender(() => this.forceUpdate())
      this.setState({
        currentDocument: doc
      })
    })
    if (projectModel.currentDocument) {
      this.clearRerender = projectModel.currentDocument.onRerender(() => this.forceUpdate())
    }
  }

  componentWillUnMount() {
    this.clearCurrentDocumentChange?.()
    this.clearRerender?.()
  }

  createElement(node: NodeInstance): React.ReactElement {
    return React.createElement(OutlineItemWithObx, {
      key: node.id,
      engine: this,
      node,
      ref: (ref) => node.mountTreeRef(ref as OutlineItem),
    })
  }

  render() {
    const { projectModel } = getModel()
    const { currentDocument } = this.state
    const { rootNode } = currentDocument as DocumentModel

    return (
      <div
        id="outline-tree"
        className={styles['tree-container']}
        ref={ref => ref && projectModel.designer.dragon.addSensor(ref as HTMLElement)}
      >
        {this.createElement(rootNode)}
      </div>
    )
  }
}

class OutlineItem extends PureComponent<IOutlineItemProps, IOutlineItemState> {
  clearChildrenChange!: () => void

  constructor(props: IOutlineItemProps) {
    super(props)
    this.state = {
      folded: false,
      children: props.node.children
    }
    this.clearChildrenChange = props.node.onChildrenChange((newChildren) => {
      this.setState({
        children: newChildren
      })
    })
  }

  componentDidUpdate(preProps: Readonly<IOutlineItemProps>) {
    if (this.props.node !== preProps.node) {
      this.clearChildrenChange?.()
      this.setState({
        children: this.props.node.children
      })
      this.clearChildrenChange = this.props.node.onChildrenChange((newChildren) => {
        this.setState({
          children: newChildren
        })
      })
    }
  }

  componentWillUnmount(): void {
    this.clearChildrenChange?.()
  }

  get label() {
    const { node } = this.props
    return node.parent === null ? 'root' : node.getComponentMeta()?.label
  }

  handleFold = (e: MouseEvent) => {
    e.stopPropagation()
    this.setState(({ folded: prefolded }) => ({
      folded: !prefolded
    }))
  }

  handleChoose = () => {
    const { node } = this.props
    const { projectModel } = getModel()
    const currentDocument = projectModel.currentDocument as DocumentModel
    currentDocument.setCurrentEditNode(node.id)
  }

  render() {
    const { node, engine } = this.props

    const { projectModel } = getModel()
    const { designer, currentDocument } = projectModel
    const { folded, children } = this.state
    const marginLeft = { marginLeft: 12 }
    const currentEditNode = currentDocument?.currentEditNode

    const chooseStyle = currentEditNode === node ? { color: '#1890ff' } : {}

    // 虚拟根节点渲染
    if (node === node.document.rootNode) {
      return children.map((child: NodeInstance) => engine.createElement(child))
    }

    return <div data-nodeid={node.id}>
      <div className={styles['drag-mock-placeholder']} mock-pre-nodeid={node.id} />
      {node.isContainer ? (
        <div style={marginLeft}>
          <div
            className={styles.item}
            draggable
            onDragStart={(e) => designer.dragon.handleDragStart(e, node)}
            onDragEnd={designer.dragon.handleDragEnd}
          >
            <div onClick={this.handleFold} className={styles['icon-container']}>
              {folded
                ? <RightOutlined className={styles.icon} />
                : <DownOutlined className={styles.icon} />
              }
            </div>
            <span style={chooseStyle} className={styles.label} onClick={this.handleChoose}>
              {this.label}
            </span>
          </div>
          <div
            className={styles['child-container']}
            style={{ display: folded ? 'none' : 'block' }}
          >
            {children.map(child => engine.createElement(child))}
          </div>
        </div>
      ) : (
        <div
          className={styles.item}
          style={marginLeft}
          draggable
          onDragStart={(e) => designer.dragon.handleDragStart(e, node)}
          onDragEnd={designer.dragon.handleDragEnd}
        >
          <span style={chooseStyle} className={styles.label} onClick={this.handleChoose}>
            {this.label ?? '未命名组件'}
          </span>
        </div>
      )}
      <div className={styles['drag-mock-placeholder']} mock-next-nodeid={node.id} />
    </div>
  }
}

const OutlineItemWithObx = observer(OutlineItem)

export default OutlineTree