interface IProject {
  name: string;
  version: string;
  data: Record<string, IData>;
  componentsMap: Record<string, Component>;
  pagesMap: Record<string, IPage>;
  methods: Record<string, IMethod>;
}

interface IPage {
  name: string;
  componentTree: Record<string, INode>;
  data: Record<string, IData>;
  lifecycle: string;
}

interface IMethod {
  /**
   * 自定义方法标识
   */
  key: string;
  /**
   * 自定义方法code
   */
  value: string;
  /**
   * 自定义方法路径
   */
  path: string;
}

type PageId = string

interface IData {
  /**
   * 变量key，作用域内唯一
   */
  key: string;
  /**
   * 变量类型
   */
  type: 'string' | 'boolean' | 'object' | 'array' | 'number';
  /**
   * 变量作用域
   */
  scope: 'global' | PageId;
  /**
   * 变量描述
   */
  desc: string;
  /**
   * 变量初始值
   */
  defaultValue: string | boolean | Record<string, any> | Array<any> | undefined | number;
  /**
   * 变量路径 例：$state.global.xxx
   */
  path: string;
}

interface INode {
  componentName?: string;
  parentId: string | null;
  props?: Record<string, any>;
  children: Array<string>;
}

interface Component {
  componentName: string;
  label: string;
  screenShot: string;
  category: string;
  priority: number;
  npmInfo: INpmInfo;
  settings: Record<string, ISetting>;
  isContainer: Boolean;
}

interface INpmInfo {
  npm: string;
  version: string
}

interface ISetting {
  settingName: string;
  label: string;
  type: string;
  value: any
}