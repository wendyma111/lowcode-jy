import _ from 'lodash'
import { generateKey, generateEmptyPageSchema } from 'utils/generator'
import { EventEmitter } from 'events'
import NodeInstance from '../node'
import { makeObservable, observable, action, toJS, runInAction } from 'mobx'
import { PAGE_LIFECYCLE_DEFAULT_VALUE } from 'constant'

const currentEditNode_change_event = 'currentEditNodeChange'

class Document implements DocumentModel {
  constructor(pageId?: string, pageSchema?: IPage) {
    const newPageId = pageId ?? generateKey('page')
    const newPageSchema = pageSchema ?? generateEmptyPageSchema()

    this.load(newPageId, newPageSchema)
    this.recordSnapShot()

    makeObservable(this, {
      data: observable,
      currentEditNode: observable.ref,
      snapShotData: observable.ref,
      snapShotIndex: observable,
      setData: action,
      deleteData: action,
      setCurrentEditNode: action,
      recordSnapShot: action
    })
  }

  name = ''

  data: Record<string, IData> = {}

  lifecycle: string = PAGE_LIFECYCLE_DEFAULT_VALUE

  methods: Record<string, IMethod> = {}

  snapShotData: IPage[] = []

  snapShotIndex = -1

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

  setCurrentEditNode(nodeId: NodeId | null) {
    if (nodeId === null) {
      return this.currentEditNode = null
    }
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

  rerender(schema: IPage) {
    this.nodes = new Map()
    this.setCurrentEditNode(null)
    this.load(this.id, schema)

    this._emitter.emit('rerender')
  }

  onRerender(fn: () => void) {
    this._emitter.on('rerender', fn)

    return () => this._emitter.off('rerender', fn)
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

  // 记录快照
  recordSnapShot = () => {
    const newSnapShotIndex = this.snapShotIndex + 1 > 10 ? 10 : this.snapShotIndex + 1 

    // 最多存储10次记录
    const newSnapShotData = [
      ...this.snapShotData.slice(
        this.snapShotIndex + 1 - 10 <= 0 ? 0 : this.snapShotIndex + 1 - 10,
        this.snapShotIndex + 1
      ),
      this.schema
    ]
    
    this.snapShotData = newSnapShotData as IPage[]
    this.snapShotIndex = newSnapShotIndex
  }
}

export default Document