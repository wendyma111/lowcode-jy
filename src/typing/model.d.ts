type PageId = string
type NodeId = string

interface ProjectModel {
  /**
   * 预览态 or 设计态
   */
  mode: 'design' | 'preview'
  /**
   * 应用名称
   */
  name: string;
  /**
   * 当前编辑页面
   */
  currentDocument: DocumentModel | null;
  /**
   * 全量页面
   */
  documents: Map<PageId, DocumentModel>;
  /**
   * 应用版本
   */
  version: string;
  /**
   * 应用对应schema json
   */
  schema: IProject;
  /**
   * 剪切板，考虑到跨页面复制，所以设置为全局属性
   */
  clipboard: NodeInstance | null;
  /**
   * 全局域下自定义方法
   */
  methods: Record<string, IMethod>

  /**
   * 应用模型初始化方法
   */
  load: (schema: IProject) => void;
  /**
   * 创建页面模型，入参：页面id、页面描述schema
   */
  createDocument: (pageId?: string, schema?: IPage) => DocumentModal
  /**
   * 移除页面，入参：页面id
   */
  removeDocument: (pageId: string) => void;
  /**
   * 修改当前编辑页面，入参：页面id
   */
  changeCurrentDocument: (pageId: string) => void;
  /**
   * 监听当前编辑页面的修改，入参：页面id
   */
  onCurrentDocumentChange: (fn: (doc: DocumentModel) => void) => () => void;
  /**
   * 根据页面id获取对应的页面模型，入参：页面id
   */
  getDocument: (pageId: string) => DocumentModel | null;
}


interface DocumentModel {
  /**
   * 页面schema
   */
  schema: IPage
  /**
   * 页面名称
   */
  name: string
  /**
   * 页面id
   */
  id: string;
  /**
   * 页面根节点
   */
  rootNode: NodeModel;
  /**
   * 当前编辑的节点
   */
  currentEditNode: NodeModel | null;
  /**
   * 该页面下全量节点
   */
  nodes: Map<NodeId, NodeModel>;
  /**
   * 页面组件树
   */
  componentTree: Record<string, INode>;
  /**
   * 页面域下变量
   */
  data: Record<string, IData>
  /**
   * 页面生命周期
   */
  lifecycle: string;
  /**
   * 页面域下自定义方法
   */
  methods: Record<string, IMethod>
  /**
   * 快照数组
   */
  snapShotData: IPage[]
  /**
   * 快照索引
   */
  snapShotIndex: number

  /**
   * 页面模型初始化
   */
  load: (pageId: string, pageSchema: IPage) => void;
  /**
   * 根据nodeId获取对应的节点
   */
  getNodeById: (nodeId: string) => NodeModel | null;
  /**
   * 根据componentName获取相应的全量节点
   */
  getNodeByComponentName: (componentName: string) => Array<NodeModel>;
  /**
   * 根据节点schema创建节点 / 创建空节点
   */
  createNode: (nodeId: string, nodeSchema: Partial<INode>) => NodeModal;
  /**
   * 移除节点
   */
  removeNode: (node: NodeInstance) => void;
  /**
   * 添加节点
   */
  addNode: (node: NodeInstance) => void;
  /**
   * 修改当前编辑的节点
   */
  setCurrentEditNode: (nodeId: NodeId) => void;
  /**
   * 监听当前修改节点的改变
   */
  onCurrentEditNodeChange: (fn: (currentEditNode: NodeInstance) => void) => () => void
  /**
   * 记录快照
   */
  recordSnapShot: () => void;
  /**
   * 触发重新渲染
   */
  rerender: (schema: IPage) => void;
  /**
   * 监听重新渲染
   */
  onRerender: (fn: () => void) => () => void;
}

interface NodeModel<T> {
  /**
   * 节点在画布中对应的实例
   */
  ref: React.ReactInstance;
  /**
   * 节点id
   */
  id: NodeId;
  /**
   * 第一个子节点
   */
  lastChild: T;
  /**
   * 最后一个子节点
   */
  firstChild: T;
  /**
   * 子节点数组
   */
  children: Array<T>;
  /**
   * 父节点, 根节点的parent为null
   */
  parent: T | null;
  /**
   * 该节点是否为容器
   */
  isContainer: boolean;
  /**
   * 当前节点所在的页面模型
   */
  document: DocumentModel
  /**
   * 当前节点的所有后代节点
   */
  descendant: Array<NodeInstance>

  /**
   * 同 DOM.insertBefore，仅isContainer === true时存在
   */
  insertBefore: (newNode: T, existingNode: T) => void;
  /**
   * 在existingNode节点之后插入newNode，仅isContainer === true时存在
   */
  insertAfter: (newNode: T, existingNode: T) => void;
  /**
   * 通过schema触发appendChild，同 DOM.appendChild，仅isContainer === true时存在
   */
  appendChildBySchema: (nodeSchema: Record<string, INode>) => void;
  /**
   * 通过node节点触发appendChild，同 DOM.appendChild，仅isContainer === true时存在
   */
  appendChild: (newNode: NodeInstance) => void;
  /**
   * 同 DOM.removeChild，仅isContainer === true时存在
   */
  removeChild: (nodeChild: T) => void;

  /**
   * 获取该节点的全量属性
   */
  getProps: () => Record<string, any>;
  /**
   * 批量配置节点属性
   */
  setProps: (props: Record<string, any>) => void;
  /**
   * 获取指定节点的值
   */
  getPropValue: (propName: string) => any;
  /**
   * 设置指定节点的值
   */
  setPropValue: (propName: string, propValue: any) => void;
  /**
   * 监听节点属性改变
   */
  onPropChange: (fn: (modifedProps: Record<string, any>) => void) => () => void;
  /**
   * 获取节点对应的组件信息
   */
  getComponentMeta: () => Component
  /**
   * 监听节点的子节点改变
   */
  onChildrenChange: (fn: (newChildren: Array<NodeInstance>) => void) => () => void;
}

interface ComponentMetaInfo extends Component { 
  constructor: FunctionComponent | ComponentClass
} 

interface ComponentMetaModel {
  /**
   * 全量组件集合
   */
  components: Map<string, Partial<ComponentMetaInfo>>

  /**
   * 通过componentName获取组件信息
   */
  getComponentInfoByName: (componentName: string) => Partial<ComponentMetaInfo> | null
}