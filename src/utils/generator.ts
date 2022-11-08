export const generateKey = (prefix?: string, length?: number) => {
  let uuid = ''
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < (length || 8); i++) {
    uuid += hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  return prefix ? `${prefix}_${uuid}` : uuid
}

export const generateEmptyPageSchema = () => {
  const rootNodeId = generateKey('node')
  const emptyPageSchema = {
    name: '空页面',
    css: '',
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