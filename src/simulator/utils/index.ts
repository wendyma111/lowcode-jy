import _ from 'lodash'
import NodeInstance from 'model/node'
import { generateKey } from 'utils/generator'

export function findNodeIdFromFiber(fiberNode: any) {
  let fiber = fiberNode

  // 查找到画布根节点时 退出向上查找
  while(!fiber?.className?.includes?.('simulator-canvas')) {
    if (!fiber) break
    const nodeId = fiber?.stateNode?.[Symbol.for('_NODE_ID_')]
    if (nodeId) return nodeId
    fiber = fiber.return
  }

  return null
}

export function addClassName(dom: Element, ...classNameList: string[]) {
  if (_.isNil(dom)) return

  const classArr = Array.from(dom.classList)
  const finalClassNameList = classNameList.filter(className => !classArr.includes(className))
  dom.classList.add(...finalClassNameList)
}

export function clearClassName(dom: Element, ...classNameList: string[]) {
  if (_.isNil(dom)) return
  
  const classArr = Array.from(dom.classList)
  const finalClassNameList = classNameList.filter(className => classArr.includes(className))
  dom.classList.remove(...finalClassNameList)
}

export function getDomByNodeId(nodeId: string, target?: HTMLElement) {
  const targetDom = target ?? (document.getElementById('simulator-canvas') as HTMLElement)
  return targetDom?.querySelector?.(`[data-nodeid="${nodeId}"]`)
}


export function getDomByNodeIdInTree(nodeId: string, target?: HTMLElement) {
  const targetDom = target ?? (document.getElementById('outline-tree') as HTMLElement)
  return targetDom?.querySelector?.(`[data-nodeid="${nodeId}"]`)
}


export function cloneNodeSchema(node: NodeInstance, parentId?: string): Record<string, INode> {
  const newNodeId = generateKey()
  const newSchema: Record<string, INode> = { [newNodeId]: Object.assign(node.schema, { parentId: parentId ?? null })}
  _.forEach(node.children, (childNode) => {
    const childNodeOldId = childNode.id
    const childSchema = cloneNodeSchema(childNode, newNodeId)
    const childNodeNewId = _.keys(childSchema)[0]
    const index = newSchema[newNodeId].children.findIndex(id => id === childNodeOldId)
    newSchema[newNodeId].children.splice(index, 1, childNodeNewId)
    Object.assign(newSchema, childSchema)
  })
  return newSchema
}