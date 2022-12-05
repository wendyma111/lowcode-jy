/**
 * 所有低代码模块通用的语法检查规则
 *  1、禁止写死url
 *  2、禁止调用import
 */
import _ from 'lodash'
import { Node as AstNode, SourceLocation } from 'acorn'

/**
 * 规则：禁止写死url，可能会导致跨域问题
 * @param node ast节点
 */
const rule_urlForbidden = (node: any) => {
  if (node?.type === 'Literal') {
    if (typeof node?.value === 'string' && (node?.value.startsWith('http://') || node?.value.startsWith('https://'))) {
      const loc = node.loc as SourceLocation
      const { start, end } = loc
      return {
        severity: 8,
        message: '禁止写死url，可能会导致跨域问题',
        startColumn: start.column,
        endColumn: end.column,
        startLineNumber: start.line,
        endLineNumber: end.line,
      }
    }
  }
}

/**
 * 规则：禁止使用import
 * @param node ast节点
 */
const rule_importForbidden = (node: AstNode) => {
  if (_.isFunction(node?.type?.startsWith) && node?.type?.startsWith('Import')) {
    const loc = node.loc as SourceLocation
    const { start, end } = loc
    return {
      source: 'ESlint',
      code: '111',
      severity: 8,
      message: '禁止使用import',
      startColumn: start.column,
      endColumn: end.column,
      startLineNumber: start.line,
      endLineNumber: end.line,
    }
  }
}

export default [
  rule_urlForbidden,
  rule_importForbidden,
]
