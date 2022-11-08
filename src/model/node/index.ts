import _ from 'lodash'
import { EventEmitter } from 'events'
import { ReactInstance } from 'react'
import { findDOMNode } from 'react-dom'
import { getModel } from 'model'

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

  get document() {
    return this._document
  }

  private _schema!: INode

  get schema() {
    return {
      ...this._schema,
      parentId: this._parent?.id ?? null,
      props: this._props,
      children: this._children.map(item => item.id)
    }
  }

  ref!: ReactInstance & Partial<{ [key: symbol]: any }>

  mountRef(ref: ReactInstance) {
    this.ref = ref as ReactInstance & Partial<{ [key: symbol]: any }>
    this.ref[Symbol.for('_NODE_ID_')] = this.id
  }

  id!: NodeId
  
  private _children!: NodeInstance[]

  private _parent!: NodeInstance | null

  private _isContainer!: boolean

  get children() {
    return this._children
  }

  get parent() {
    return this._parent
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
    this._componentName = nodeSchema.componentName
    this._schema = nodeSchema
    this._props = nodeSchema.props
    this._parent = nodeSchema.parentId === null 
      ? null 
      : this?._document.getNodeById(nodeSchema.parentId)

    this._children = _.map(nodeSchema.children, (childNodeId) => {
      const childNodeSchema = this?._document?.componentTree?.[childNodeId]
      return this._document.createNode(childNodeId, childNodeSchema)
    })
    this._isContainer = !!this.getComponentMeta().isContainer
    if (this._isContainer) {
      this.appendChild = this._appendChild
      this.insertBefore = this._insertBefore
      this.removeChild = this._removeChild
    }
  }

  appendChild!: (nodeSchema: Record<string, INode>) => void;
  insertBefore!: (newNode: NodeInstance, existingNode: NodeInstance) => void;
  removeChild!: (nodeChild: NodeInstance) => void;

  getComponentMeta(): ComponentMetaInfo {
    // this.schema.componentName
    const { componentMeta } = getModel()
    return componentMeta.getComponentInfoByName(this._componentName) as ComponentMetaInfo
  }

  private _props: Record<string, any> = {}

  private _componentName!: string

  getProps() {
    return this._props
  }

  setProps(props: Record<string, any>) {
    _.forEach(props, (propValue, propName) => {
      _.set(this._props, propName, propValue)
    })
    this._emitter.emit(props_change_event, props)
  }

  getPropValue(propName: string) {
    return _.get(this._props, `${propName}`)
  }

  setPropValue(propName: string, propValue: any) {
    _.set(this._props, propName, propValue)
    this._emitter.emit(props_change_event, { [propName]: propValue })
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
      this._children.splice(index, 0, newNode)
      this.document.addNode(newNode)
      this._emitter.emit(children_change_event, [...this._children])
    }
  }

  private _appendChild(nodeSchema: Record<string, INode>) {
    const [rootNodeId, rootNodeSchema] = Object.entries(nodeSchema).filter(([_, nodeSchema]) => nodeSchema.parentId === null)[0]
    Object.assign(this.document.componentTree, nodeSchema)
    rootNodeSchema.parentId = this.id
    this.document.createNode(rootNodeId, rootNodeSchema)
    this.children.push(this.document.getNodeById(rootNodeId))
    this._emitter.emit(children_change_event, [...this._children])
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