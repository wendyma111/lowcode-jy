import _ from 'lodash'
import { EventEmitter } from 'events';
import Document from 'model/document'
import NodeInstance from 'model/node';

const current_document_change_event = 'current_document_change_event'

class Project implements ProjectModel {
  constructor(schema: IProject) {
    this.load(schema)
  }

  mode: 'design' | 'preview' = 'design'

  name = 'LowCode Application'

  version = '1.0.0'

  clipboard: NodeInstance | null = null

  private _currentDocument: DocumentModel | null = null

  private _documents: Map<PageId, DocumentModel> = new Map()

  private _schema!: IProject

  private _emitter = new EventEmitter()

  get schema() {
    return this._schema
  }

  get currentDocument() {
    return this._currentDocument
  }

  get documents() {
    return this._documents
  }

  load(schema: IProject) {
    // 初始化基础数据
    this._schema = schema
    this.name = schema.name
    this.version = schema.version
    // 初始化所有页面模型
    _.entries(schema.pagesMap).forEach(([pageId, pageSchema]) => this.createDocument(pageId, pageSchema))
    this._currentDocument = this.getDocument(schema.currentPage)
  }

  createDocument(pageId?: string, pageSchema?: IPage) {
    // 兼容创建一个空页面的情况
    const documentInstance = pageId && pageSchema ? new Document(pageId, pageSchema) : new Document()

    this._documents.set(pageId ?? documentInstance.id, documentInstance)
    return documentInstance
  }

  removeDocument(pageId: string) {
    if (this._documents && this._documents?.has?.(pageId)) {
      this._documents.delete(pageId)
    }
  }

  changeCurrentDocument(pageId: string) {
    if (this._documents.has(pageId)) {
      const documentInstance = this._documents.get(pageId)
      this._emitter.emit(current_document_change_event, documentInstance)
    }
  }

  onCurrentDocumentChange(fn: (doc: DocumentModel) => void) {
    if (fn instanceof Function) {
      this._emitter.on(current_document_change_event, fn)
    }
    return () => {
      this._emitter.off(current_document_change_event, fn)
    }
  }

  getDocument(pageId: string) {
    if (this._documents?.has?.(pageId)) {
      return this._documents.get(pageId) as DocumentModel
    }
    return null
  }
}

export default Project