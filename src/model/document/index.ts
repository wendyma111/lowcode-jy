import _ from 'lodash'
import { generateKey, generateEmptyPageSchema } from 'utils/generator'
import { EventEmitter } from 'events'
import NodeInstance from '../node'
import { makeObservable, observable, action, toJS, autorun } from 'mobx'
import { PAGE_LIFECYCLE_DEFAULT_VALUE } from 'constant'

const currentEditNode_change_event = 'currentEditNodeChange'

class Document implements DocumentModel {
  constructor(pageId?: string, pageSchema?: IPage) {
    const newPageId = pageId ?? generateKey('page')
    const newPageSchema = pageSchema ?? generateEmptyPageSchema()

    this.load(newPageId, newPageSchema)

    makeObservable(this, {
      data: observable,
      currentEditNode: observable.ref,
      setData: action,
      deleteData: action,
      setCurrentEditNode: action
    })
  }

  name: string = ''

  data: Record<string, IData> = {}

  lifecycle: string = PAGE_LIFECYCLE_DEFAULT_VALUE

  methods: Record<string, IMethod> = {}

  setData = (data: Record<string, IData>) => {
    Object.assign(this.data, data)
  }

  deleteData = (data: IData) => {
    delete this.data[data.key]
  }

  private _emitter = new EventEmitter()

  componentTree!: Record<string, INode>

  get schema() {
    const newComponentTree: Record<string, any> = {}

    for(const [id, node] of this.nodes) {
      newComponentTree[id] = node.schema
    }

    return {
      name: this.name,
      data: toJS(this.data),
      componentTree: newComponentTree,
      lifecycle: this.lifecycle
    }
  }

  id!: PageId

  nodes: Map<NodeId, NodeInstance> = new Map()

  private _rootNode!: NodeInstance

  currentEditNode: NodeInstance | null = null

  get rootNode() {
    return this._rootNode
  }

  setCurrentEditNode(nodeId: NodeId) {
    this.currentEditNode = this.getNodeById(nodeId)
    this._emitter.emit(currentEditNode_change_event, this.currentEditNode)
  }

  onCurrentEditNodeChange(fn: (currentEditNode: NodeInstance) => void): () => void {
    this._emitter.on(currentEditNode_change_event, fn)
    return () => this._emitter.off(currentEditNode_change_event, fn)
  }

  load(newPageId: PageId, newPageSchema: IPage) {
    this.name = newPageSchema.name
    this.setData(newPageSchema.data)
    this.id = newPageId
    this.componentTree = newPageSchema.componentTree
    this.lifecycle = newPageSchema.lifecycle ?? PAGE_LIFECYCLE_DEFAULT_VALUE

    _.forIn(this.componentTree, (nodeSchema, nodeId) => {
      if (nodeSchema.parentId === null) {
        this._rootNode = this.createNode(nodeId, nodeSchema) as NodeInstance
        return
      }
    })
  }

  createNode(nodeId: NodeId, nodeSchema: Partial<INode>) {
    const defaultSchema = {
      parentId: null,
      children: []
    }

    if (!this.nodes.has(nodeId)) {
      const node: NodeInstance = new NodeInstance(this, nodeId, _.merge({}, defaultSchema, nodeSchema) as INode)
      return node
    }
  }

  addNode(node: NodeInstance) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node)
    }
  }

  getNodeById(nodeId: NodeId) {
    return this.nodes.get(nodeId) ?? null
  }

  getNodeByComponentName(componentName: string) {
    const nodeList = []
    for(const node of this.nodes.values()) {
      if (node.getComponentMeta().componentName === componentName) {
        nodeList.push(node)
      }
    }
    return nodeList
  }

  removeNode(node: NodeInstance) {
    if (!this.nodes.has(node.id)) {
      this.nodes.delete(node.id)
    }
  }
}

export default Document