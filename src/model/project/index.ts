import _ from 'lodash'
import { EventEmitter } from 'events';
import Document from 'model/document'
import NodeInstance from 'model/node';
import Designer from 'designer';
import { observable, makeObservable, action, runInAction, toJS, autorun } from 'mobx'
import { generateKey, generateEmptyPageSchema } from 'utils/generator'

const current_document_change_event = 'current_document_change_event'

class Project implements ProjectModel {
  constructor(schema: IProject) {
    this.load(schema)
    this.designer = new Designer(this)

    makeObservable(this, {
      data: observable,
      documents: observable.ref,
      currentDocument: observable.ref,
      setData: action,
      setDocument: action,
      deleteDocument: action,
      deleteData: action,
      setCurrentDocument: action,
    })
  }

  setDocument = (pageId: PageId, documentInstance: Document) => {
    runInAction(() => {
      this.documents = new Map(this.documents.set(pageId, documentInstance))
    })

    // 重新生成生命周期文件
    this?.designer?.logic?.initLifecycle?.(this)
  }

  deleteDocument = (pageId: PageId) => {
    // 删除doc
    runInAction(() => {
      const doc = new Map(this.documents)
      doc.delete(pageId)
      this.documents = doc
    })

    // 删除相应的低代码执行期
    this.designer.logic._deleteCtxDesignMode(pageId)

    // 重新生成生命周期文件
    this?.designer?.logic?.initLifecycle?.(this)
  }

  methods: Record<string, IMethod> = {}

  data: Record<string, IData> = {}

  setData = (data: Record<string, IData>) => {
    Object.assign(this.data, data)
  }

  deleteData = (data: IData) => {
    delete this.data[data.key]
  }

  designer: Designer

  mode: 'design' | 'preview' = 'design'

  name = 'LowCode Application'

  version = '1.0.0'

  clipboard: NodeInstance | null = null

  currentDocument: DocumentModel | null = null

  documents: Map<PageId, DocumentModel> = new Map()

  private _schema!: IProject

  private _emitter = new EventEmitter()

  get schema() {
    const pagesMap: Record<string, any> = {}

    for (const [id, doc] of this.documents) {
      pagesMap[id] = doc.schema
    }

    return {
      name: this._schema.name,
      version: this._schema.version,
      componentsMap: this._schema.componentsMap,
      data: toJS(this.data),
      methods: this.methods,
      pagesMap,
    }
  }

  load(schema: IProject) {
    // 初始化基础数据
    this.data = schema.data
    this._schema = schema
    this.name = schema.name
    this.version = schema.version
    this.methods = schema.methods ?? {}

    // 初始化所有页面模型
    _.entries(schema.pagesMap).forEach(([pageId, pageSchema]) => this.createDocument(pageId, pageSchema))
    this.setCurrentDocument(this.getDocument(_.keys(schema.pagesMap)[0]))
  }

  setCurrentDocument(doc: DocumentModel | null) {
    this.currentDocument = doc
    this._emitter.emit(current_document_change_event, doc)
  }

  createDocument(pageId?: string, pageSchema?: IPage) {
    // 兼容创建一个空页面的情况
    const documentInstance = pageId && pageSchema ? new Document(pageId, pageSchema) : new Document()

    this.setDocument(pageId ?? documentInstance.id, documentInstance)
    return documentInstance
  }

  addNewDocument(pageName: string) {
    const newPageId = generateKey('page')
    const emptyPageSchema = generateEmptyPageSchema(pageName)
    const newDocument = this.createDocument(newPageId, emptyPageSchema)

    this.setCurrentDocument(newDocument)
  }

  removeDocument(pageId: string) {
    if (this.documents && this.documents?.has?.(pageId)) {
      this.deleteDocument(pageId)
    }
  }

  changeCurrentDocument(pageId: string) {
    if (this.documents.has(pageId)) {
      const documentInstance = this.documents.get(pageId)
      this.setCurrentDocument(documentInstance as DocumentModel)
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
    if (this.documents?.has?.(pageId)) {
      return this.documents.get(pageId) as DocumentModel
    }
    return null
  }
}

export default Project