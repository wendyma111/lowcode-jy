import _ from 'lodash'
import { Node as AstNode, SourceLocation } from 'acorn'

export const rule_onlyOneExport = (node: AstNode & { body: any }) => {
  if (node.type === 'Program' && _.isArray(node.body)) {
    if (
      node.body.length > 1
      || node.body[0]?.type !== 'ExportDefaultDeclaration'
      || node.body[0]?.declaration?.type !== 'ObjectExpression'
    ) {
      const loc = node.loc as SourceLocation
      const { start, end } = loc 
      return {
        severity: 8,
        message: '只能export default一个对象',
        startColumn: start.column,
        endColumn: end.column,
        startLineNumber: start.line,
        endLineNumber: end.line,
      }
    }
  }
}

export const rule_onlyOneFunction = (node: AstNode & { body: any }) => {
  if (node.type === 'Program' && _.isArray(node.body)) {
    if (
      node.body.length > 1
      || node.body[0]?.type !== 'FunctionDeclaration'
    ) {
      const loc = node.loc as SourceLocation
      const { start, end } = loc 
      return {
        severity: 8,
        message: '仅支持导出一个函数，请勿修改模板代码',
        startColumn: start.column,
        endColumn: end.column,
        startLineNumber: start.line,
        endLineNumber: end.line,
      }
    }
  }
}

export const lifecycle_rules = [
  rule_onlyOneExport,
]

export const handler_rules = [
  rule_onlyOneFunction
]
