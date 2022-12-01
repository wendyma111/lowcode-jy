import _ from 'lodash'
import { EventEmitter } from 'events'
import { ReactInstance } from 'react'
import { getModel } from 'model'
import { findDOMNode } from 'react-dom'

const props_change_event = 'PropsChange'
const children_change_event = 'ChildrenChange'

class NodeInstance implements NodeModel<NodeInstance> {
  private _document: DocumentModel
  private _emitter = new EventEmitter()
  constructor(_document: DocumentModel, nodeId: NodeId, nodeSchema: INode) {
    // 该节点所属的页面
    this._document = _document
    this.load(nodeId, nodeSchema)
  }

  get preSibling(): NodeInstance | null {
    if (this.parent === null) {
      return null
    }
    const index = this.parent.children.findIndex(node => node.id === this.id)
    return this.parent.children[index - 1] ?? null
  }

  get nextSibling(): NodeInstance | null {
    if (this.parent === null) {
      return null
    }
    const index = this.parent.children.findIndex(node => node.id === this.id)
    return this.parent.children[index + 1] ?? null
  }

  get document() {
    return this._document
  }

  private _schema!: INode

  get schema() {
    return {
      ...this._schema,
      parentId: this.parent?.id ?? null,
      props: Object.assign({}, this._props),
      children: this._children?.map?.(item => item.id) ?? []
    }
  }

  ref!: ReactInstance & Partial<{ [key: symbol]: any }>
  treeRef!: ReactInstance & Partial<{ [key: symbol]: any }>

  mountRef(ref: ReactInstance) {
    if (!ref) return
    this.ref = ref as ReactInstance & Partial<{ [key: symbol]: any }>
    this.ref[Symbol.for('_NODE_ID_')] = this.id
    
    const mockPre = (findDOMNode(this.ref) as Element)?.querySelector?.(`[mock-pre-nodeid="${this.id}"]`)
    const mockNext = (findDOMNode(this.ref) as Element)?.querySelector?.(`[mock-next-nodeid="${this.id}"]`)
    this.__mock_pre_position = mockPre && mockPre.getBoundingClientRect()
    this.__mock_next_position = mockNext && mockNext.getBoundingClientRect()
  }

  mountTreeRef(ref: ReactInstance) {
    if (!ref) return
    this.treeRef = ref as ReactInstance & Partial<{ [key: symbol]: any }>
    this.treeRef[Symbol.for('_NODE_ID_')] = this.id

    const mockPre = (findDOMNode(this.treeRef) as Element)?.querySelector?.(`[mock-pre-nodeid="${this.id}"]`)
    const mockNext = (findDOMNode(this.treeRef) as Element)?.querySelector?.(`[mock-next-nodeid="${this.id}"]`)
    this.__mock_pre_tree_position = mockPre && mockPre.getBoundingClientRect()
    this.__mock_next_tree_position = mockNext && mockNext.getBoundingClientRect()
  }

  private __mock_pre_position!: { x: number, y: number } | null
  private __mock_next_position!: { x: number, y: number } | null

  private __mock_pre_tree_position!: { x: number, y: number } | null
  private __mock_next_tree_position!: { x: number, y: number } | null

  id!: NodeId
  
  private _children!: NodeInstance[]

  parent!: NodeInstance | null

  private _isContainer!: boolean

  get children() {
    return this._children
  }

  get isContainer() {
    return this._isContainer
  }

  get lastChild() {
    return this.children[this.children.length - 1]
  }

  get firstChild() {
    return this.children[0]
  }

  private load(nodeId: NodeId, nodeSchema: INode) {
    this.id = nodeId
    this._document.addNode(this)
    this._componentName = nodeSchema?.componentName as string
    this._schema = nodeSchema

    const defaultProps = {}
    const { settings = {} } = this.getComponentMeta() ?? {}
    for(let prop in settings) {
      _.set(defaultProps, settings[prop].settingName, settings[prop].value)
    }
    this._props = _.assign(defaultProps, nodeSchema.props ?? {})

    this.parent = nodeSchema.parentId === null 
      ? null
      : this?._document.getNodeById(nodeSchema.parentId)

    this._children = _.map(nodeSchema.children, (childNodeId) => {
      const childNodeSchema = this?._document?.componentTree?.[childNodeId]
      return this._document.createNode(childNodeId, childNodeSchema)
    })
    this._isContainer = !!this.getComponentMeta()?.isContainer
    // 虚拟根节点 & 容器节点 可以操作子节点
    if (this._isContainer || this.parent === null) {
      // appendChildBySchema仅用于粘贴组件
      this.appendChildBySchema = this._appendChildBySchema
      this.appendChild = this._appendChild
      this.insertBefore = this._insertBefore
      this.removeChild = this._removeChild
      this.insertAfter = this._insertAfter
    }
  }

  appendChildBySchema!: (nodeSchema: Record<string, INode>) => void;
  appendChild!: (newNode: NodeInstance) => void;
  insertBefore!: (newNode: NodeInstance, existingNode: NodeInstance) => void;
  removeChild!: (nodeChild: NodeInstance) => void;
  insertAfter!: (newNode: NodeInstance, existingNode: NodeInstance) => void;

  getComponentMeta(): ComponentMetaInfo {
    // this.schema.componentName
    const { componentMeta } = getModel()
    return componentMeta.getComponentInfoByName(this._componentName) as ComponentMetaInfo
  }

  private _props: Record<string, any> = {}

  private _componentName!: string

  getProps() {
    return _.cloneDeep(this._props)
  }

  setProps(props: Record<string, any>) {
    let newProps = _.assign({}, this._props)
    newProps = _.merge(newProps, props)
    this._props = newProps

    this._emitter.emit(props_change_event, props)

    this.document.recordSnapShot()
  }

  getPropValue(propName: string) {
    return _.get(this._props, `${propName}`)
  }

  setPropValue(propName: string, propValue: any) {
    const modifedProps = {}
    _.set(modifedProps, propName?.split?.('.'), propValue)

    _.set(this._props, propName?.split?.('.'), propValue)

    this._emitter.emit(props_change_event, modifedProps)

    this.document.recordSnapShot()
  }

  onPropChange(fn: (modifedProps: Record<string, any>) => void) {
    this._emitter.on(props_change_event, fn)

    return () => {
      this._emitter.off(props_change_event, fn)
    }
  }

  private _insertBefore(newNode: NodeInstance, existingNode: NodeInstance) {
    const index = this._children.findIndex(child => child.id === existingNode.id)
    
    if (index !== -1) {
      newNode.parent = this
      this._children.splice(index, 0, newNode)
      this.document.addNode(newNode)
      this._emitter.emit(children_change_event, [...this._children])

      this.document.recordSnapShot()
    }
  }

  private _insertAfter(newNode: NodeInstance, existingNode: NodeInstance) {
    const index = this._children.findIndex(child => child.id === existingNode.id)
    
    if (index !== -1) {
      newNode.parent = this
      this._children.splice(index + 1, 0, newNode)
      this.document.addNode(newNode)
      this._emitter.emit(children_change_event, [...this._children])

      this.document.recordSnapShot()
    }
  }

  // @todo 此处逻辑待修改 不应该往componentTree中塞数据
  private _appendChildBySchema(nodeSchema: Record<string, INode>) {
    const [rootNodeId, rootNodeSchema] = Object.entries(nodeSchema).filter(([_, nodeSchema]) => nodeSchema.parentId === null)[0]
    Object.assign(this.document.componentTree, nodeSchema)
    rootNodeSchema.parentId = this.id
    this.document.createNode(rootNodeId, rootNodeSchema)
    this.children.push(this.document.getNodeById(rootNodeId))
    this._emitter.emit(children_change_event, [...this._children])

    this.document.recordSnapShot()
  }

  private _appendChild(newNode: NodeInstance) {
    newNode.parent = this
    this._children.push(newNode)
    this.document.addNode(newNode)
    this._emitter.emit(children_change_event, [...this._children])

    this.document.recordSnapShot()
  }

  private _removeChild(nodeChild: NodeInstance) {
    const index = this._children.findIndex(child => child.id === nodeChild.id)
    if (index !== -1) {
      this._children.splice(index, 1)
      this._emitter.emit(children_change_event, [...this._children])
      // 移除该节点的所有后代节点
      _.forEach(this.descendant, (descendantNode) => this.document.removeNode(descendantNode.id))
      // 移除该节点
      this.document.removeNode(nodeChild.id)

      this.document.recordSnapShot()
    }
  }

  onChildrenChange(fn: (newChildren: Array<NodeInstance>) => void): () => void {
    this._emitter.on(children_change_event, fn)

    return () => {
      this._emitter.off(children_change_event, fn)
    }
  }

  get descendant() {
    let children = this.children
    if (!children?.length) return []
    const descendantList: Array<NodeInstance> = []
    descendantList.push(...children)
    children.forEach(child => {
      descendantList.push(...child.descendant)
    })
    return descendantList
  }
}

export default NodeInstance