export const PAGE_LIFECYCLE_DEFAULT_VALUE = `export default {
  componentDidMount(){}
}
`
export const HANDLER_DEFAULT_VALUE = 'function handler(e){\n  // 请在函数内编写代码  \n}'

export const EMPTY_SCHEMA: IProject = {
  name: '未命名应用',
  version: '0.0.0',
  componentsMap: {},
  data: {},
  methods: {},
  pagesMap: {
    'pageId1': {
      name: '页面一',
      data: {},
      lifecycle: PAGE_LIFECYCLE_DEFAULT_VALUE,
      componentTree: {
        // 虚拟根节点
        'root': {
          parentId: null,
          children: []
        },
      }
    },
  }
}