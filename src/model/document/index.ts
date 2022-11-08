import _ from 'lodash'
import { generateKey, generateEmptyPageSchema } from 'utils/generator'
import { EventEmitter } from 'events'
import NodeInstance from '../node'

const currentEditNode_change_event = 'currentEditNodeChange'

class Document implements DocumentModel {
  constructor(pageId?: string, pageSchema?: IPage) {
    const newPageId = pageId ?? generateKey('page')
    const newPageSchema = pageSchema ?? generateEmptyPageSchema()

    this.load(newPageId, newPageSchema)
  }

  private _emitter = new EventEmitter()
  private _schema!: IPage

  componentTree!: Record<string, INode>

  get schema() {
    return this._schema
  }

  id!: PageId

  private _nodes: Map<NodeId, NodeInstance> = new Map()

  private _rootNode!: NodeInstance

  private _currentEditNode: NodeInstance | null = null

  get rootNode() {
    return this._rootNode
  }

  get nodes() {
    return this._nodes
  }

  get currentEditNode() {
    return this._currentEditNode
  }

  setCurrentEditNode(nodeId: NodeId) {
    this._currentEditNode = this.getNodeById(nodeId)
    this._emitter.emit(currentEditNode_change_event, this._currentEditNode)
  }

  onCurrentEditNodeChange(fn: (currentEditNode: NodeInstance) => void): () => void {
    this._emitter.on(currentEditNode_change_event, fn)
    return () => this._emitter.off(currentEditNode_change_event, fn)
  }

  load(newPageId: PageId, newPageSchema: IPage) {
    this._schema = newPageSchema
    this.id = newPageId
    this.componentTree = newPageSchema.componentTree

    _.forIn(this.componentTree, (nodeSchema, nodeId) => {
      if (nodeSchema.parentId === null) {
        this._rootNode = this.createNode(nodeId, nodeSchema) as NodeInstance
        return
      }
    })
  }

  createNode(nodeId: NodeId, nodeSchema: INode) {
    if (!this._nodes.has(nodeId)) {
      const node: NodeInstance = new NodeInstance(this, nodeId, nodeSchema)
      return node
    }
  }

  addNode(node: NodeInstance) {
    if (!this._nodes.has(node.id)) {
      this._nodes.set(node.id, node)
    }
  }

  getNodeById(nodeId: NodeId) {
    return this._nodes.get(nodeId) ?? null
  }

  getNodeByComponentName(componentName: string) {
    const nodeList = []
    for(const node of this._nodes.values()) {
      if (node.getComponentMeta().componentName === componentName) {
        nodeList.push(node)
      }
    }
    return nodeList
  }

  removeNode(node: NodeInstance) {
    if (!this._nodes.has(node.id)) {
      this._nodes.delete(node.id)
    }
  }
}

export default Document