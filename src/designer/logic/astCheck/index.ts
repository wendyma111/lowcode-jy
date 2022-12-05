/**
 * 低代码模块 - 语法检查
 * 
 * 基本概念：
 *  ast节点：ast树中最小的语法单元
 *  marker：对应monaco中的marker概念，即通过公共/自定义检查规则 检查出的语法错误
 */
import { EventEmitter } from 'events'
import { Node as AstNode } from 'acorn'
import _ from 'lodash'
import * as ts from 'typescript'
import { parse } from 'acorn'
import commonRules from './commonRules'
import { AstCheckType } from './index.type'
import { IMarker } from '../basicLowcodeEditor/index.type'

const ast_event = new EventEmitter()

class AstCheck extends AstCheckType {
  constructor(rules: (node: AstNode) => IMarker | void) {
    super()
    // 语法规则
    this.rules = (commonRules as Array<(node: AstNode) => IMarker | void>).concat(rules)
  }

  subscribeMarks = (handler: (mark: Array<Partial<IMarker>>) => void) => {
    ast_event.on('marks', _.debounce((mark) => {
      handler(mark)
    }, 500))
  }

  emitMarks = (mark: Array<Partial<IMarker>>) => {
    ast_event.emit('marks', mark)
  }

  parse = _.debounce((code) => {
    // 负责存入遍历ast树生成的所有marker
    this.marks = []
    this.code = code
    try {
      // 将ts转为js 便于ast解析
      const codeJs = ts.transpile(code, { target: ts.ScriptTarget.ES2020 })
      const ast = parse(
        codeJs,
        {
          ecmaVersion: 8,
          sourceType: 'module',
          locations: true,
        })
      // 遍历ast树 并进行语法检查
      this.visitNode(ast)
      if (this.marks.length > 0) {
        this.emitMarks(this.marks.filter((item) => !_.isNil(item)))
      }
    } catch (e) {
      console.log(e)
    }
  }, 500)

  // 对语法节点进行自定义rule&公共rule检查
  generateMarks = (node: AstNode) => {
    _.forEach(this.rules, (rule) => {
      const markRes = rule(node)
      if (markRes) {
        this.marks = this.marks.concat(_.isArray(markRes) ? markRes : [markRes])
      }
    })
  }

  // 遍历ast节点
  visitNode = (node: any) => {
    const valueType = Object.prototype.toString.call(node)
    if (valueType === '[object Object]' || valueType === '[object Array]') {
      node.type && this.generateMarks(node)
      _.forEach(node, (value) => {
        this.visitNode(value)
      })
    }
  }
}

export default AstCheck
