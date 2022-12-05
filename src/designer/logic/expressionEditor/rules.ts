import _ from 'lodash'
import { Node as AstNode, SourceLocation } from 'acorn'

/**
 * 规则：绑定数据模块禁止调用$api
 * @param node ast节点
 */
const rule_binData_$api = (node: any) => {
  switch (node.type) {
    case 'CallExpression': {
      const name = node?.callee?.object?.name
      if (name === '$api') {
        const { loc } = node
        const { start, end } = loc as SourceLocation
        return {
          severity: 8,
          message: '绑定数据模块禁止调用$api',
          startColumn: start.column,
          endColumn: end.column,
          startLineNumber: start.line,
          endLineNumber: end.line,
        }
      }
      break
    }
    case 'MemberExpression': {
      const name = node?.object?.name
      if (name === '$api') {
        const { loc: { start, end } } = node
        return {
          severity: 8,
          message: '绑定数据模块禁止调用$api',
          startColumn: start.column,
          endColumn: end.column,
          startLineNumber: start.line,
          endLineNumber: end.line,
        }
      }
      break
    }
    default: {
      break
    }
  }
}

/**
 * 规则：每个低代码模块只能向外暴露一个函数体，用户仅可在函数体内自定义代码
 * @param node ast节点
 */
const rule_onlyOneFunc = (node: any) => {
  if (node.type === 'Program') {
    const { body } = node
    const onlyOneFunc = body?.length === 1 &&
      body?.[0]?.type === 'FunctionDeclaration'
    if (!onlyOneFunc) {
      // 代码块为空
      if (body.length === 0) {
        return {
          severity: 8,
          message: '代码块中必须暴露一个函数体',
          startColumn: 0,
          endColumn: 0,
          startLineNumber: 0,
          endLineNumber: 0,
        }
      } else {
        let funcNum = 0
        const markers: any[] = []
        _.forEach(body, (bodyNode: any) => {
          const { loc } = bodyNode
          const { start, end } = loc as SourceLocation
          funcNum = node.type === 'FunctionDeclaration' ? funcNum + 1 : funcNum
          if (funcNum > 1 || node.type !== 'FunctionDeclaration') {
            markers.push({
              source: 'ESlint',
              severity: 8,
              message: '代码块中只能暴露一个函数体',
              startColumn: start.column,
              endColumn: end.column,
              startLineNumber: start.line,
              endLineNumber: end.line,
            })
          }
        })
        return markers
      }
    }
  }
}

/**
 * 规则：禁止使用export
 * @param node ast节点
 */
const rule_exportForbidden = (node: any) => {
  if (_.isFunction(node?.type?.startsWith) && node.type.startsWith('Export')) {
    const { loc: { start, end } } = node
    return {
      severity: 8,
      message: '禁止使用export',
      startColumn: start.column,
      endColumn: end.column,
      startLineNumber: start.line,
      endLineNumber: end.line,
    }
  }
}

/**
 * 规则：最外层的主函数体必须有返回值
 * @param node ast节点
 */
const rule_return = (node: any) => {
  if (node?.type === 'Program') {
    return node.body.map((item: any) => {
      if (item.type === 'FunctionDeclaration' && _.isArray(item?.body?.body)) {
        if (item?.body?.body.findIndex((bodyItem: any) => bodyItem?.type === 'ReturnStatement') === -1) {
          const { loc: { start, end } } = item
          return {
            severity: 8,
            message: '函数体中必须有返回值',
            startColumn: start.column,
            endColumn: end.column,
            startLineNumber: start.line,
            endLineNumber: end.line,
          }
        }
      }
    })
  }
}

export default [
  rule_binData_$api,
  // rule_onlyOneFunc,
  rule_exportForbidden,
  // rule_return,
]
