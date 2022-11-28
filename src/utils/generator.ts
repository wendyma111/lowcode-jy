import { PAGE_LIFECYCLE_DEFAULT_VALUE } from 'constant'

export const generateKey = (prefix?: string, length?: number) => {
  let uuid = ''
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < (length || 8); i++) {
    uuid += hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  return prefix ? `${prefix}_${uuid}` : uuid
}

export const generateEmptyPageSchema: (name?: string) => IPage = (name?: string) => {
  const rootNodeId = generateKey('node')
  const emptyPageSchema = {
    name: name ?? '空页面',
    css: '',
    data: {},
    lifecycle: PAGE_LIFECYCLE_DEFAULT_VALUE, // @todo 待补充默认声明周期模板代码
    componentTree: {
      [rootNodeId]: {
        componentName: 'Container',
        parentId: null,
        props: {},
        children: []
      }
    }
  }
  return emptyPageSchema
}