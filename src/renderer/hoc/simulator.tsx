import React, { ClassType, PureComponent } from 'react'
import _, { isNil } from 'lodash'
import { when, IReactionDisposer, autorun } from 'mobx'
import { getModel } from 'model'
import styles from './simulator.module.css'
import NodeInstance from 'model/node'
import { IState, IProps } from './simulator.type'
import { builtInApis } from 'designer/logic/customMethods'
import { IPreviewPage } from '../index'

/**
 * 预览模式下 组件渲染
 * - 无需考虑 props、children更新情况
 */
export class PreviewContent extends PureComponent<IProps & IPreviewPage> {
    
  // 解析绑定变量的prop，预览模式在iframe中加载，故可以直接使用new Function
  parseProps(props: Record<string, any>) {
    const { $state, $api } = this.props
    const finalProps: Record<string, any> = {}
    for (const prop in props) {
      let value = props[prop]
      if (props[prop]?.type === 'JSExpression') {
        value = new Function('$state', '$api', 'return ' + props[prop].value)($state, $api)
      }
      if (props[prop]?.type === 'JSFunction') {
        const { path, extra } = props[prop]
        const selectedBuiltInApi = _.find(builtInApis, (api) => {
          return api.path === path
        })
        if (selectedBuiltInApi) {
          // @todo 内置事件
        } else {
          // 自定义事件
          value = _.get($api, path.replace('$api.', ''))
        }
      }
      finalProps[prop] = value
    }

    return finalProps
  }

  render() {
    const { node, engine } = this.props
    const children = node.children

    // 虚拟根节点渲染
    if (node === node.document.rootNode) {
      return children.map(child => engine.createElement(child))
    }

    return engine.renderContent(node, this.parseProps(node.getProps()), children)
  }
}

/**
 * 设计状态下 组件渲染
 * - 需要考虑 props、children更新情况
 * - 将props、children置为Wrapper组件内部的state，避免影响其他组件
 */
export class SimulatorContent extends PureComponent<IProps, IState> {
  node!: NodeInstance
  clearPropsChangeHandler!: () => void
  clearChildrenChangeHandler!: () => void
  // 低代码执行reaction清理函数集合
  disposeMap: Record<string, IReactionDisposer> = {}

  constructor(props: any) {
    super(props)
    const { node } = props
    this.node = node

    this.state = {
      compProps: this.parseProps(this.node.getProps()),
      children: this.node.children,
    }

    this.init()
  }

  componentDidUpdate(preProps: Readonly<IProps>) {
    if (this.props.node !== preProps.node) {
      this.node = this.props.node

      this.setState({
        children: this.node.children,
        compProps: this.parseProps(this.node.getProps()),
      })

      this.init()
    }
  }

  parseProps = (originProps: Record<string, any>) => {
    const { projectModel } = getModel()
    const finalProps: Record<string, any> = {}

    _.forEach(originProps ?? {}, (value, key) => {
      // 清理低代码执行监听
      this.disposeMap?.[key]?.()

      // @todo 重新梳理一下此处逻辑
      if (value?.type === 'JSExpression') {
        // ctxDesignMode为异步生成的，所以需要进行监听
        when(
          () => !!projectModel?.designer?.logic?.ctxDesignMode,
          () => {
            if (isNil(projectModel?.designer?.logic?.ctxDesignMode)) return
            this.disposeMap[key] = projectModel?.designer?.logic?.ctxDesignMode?.autoExecute?.(
              `() => ${value.value}`,
              'auto',
              (newValue) => {
                // finalProps[key] = [value]
                this.setState(({compProps}) => {
                  return {
                    compProps: {...compProps, [key]: newValue}
                  }
                })
              }
            )
          }
        )
      } else if (value?.type !== 'JSFunction') {
        // 设计模式将自定义事件过滤
        finalProps[key] = value
      }
    })

    return finalProps
  }

  init() {
    // 监听组件props改变
    this.clearPropsChangeHandler = this.node.onPropChange(() => {
      this.setState({
        compProps: this.parseProps(this.node.getProps())
      })
    })
    // 监听组件子节点改变
    this.clearChildrenChangeHandler = this.node.onChildrenChange((newChildren: Array<NodeInstance>) => {
      this.setState({
        children: newChildren
      })
    })
  }

  componentWillUnMount() {
    // 清理props改变监听
    this.clearPropsChangeHandler?.()
    // 清理children改变监听
    this.clearChildrenChangeHandler?.()
    // 清理低代码执行监听
    _.forEach(this.disposeMap ?? {}, dispose => dispose())
  }

  render() { 
    const { projectModel } = getModel()
    const { compProps, children } = this.state 
    const { engine, node } = this.props

    // 虚拟根节点渲染
    if (node === node.document.rootNode) {
      return children.map(child => engine.createElement(child))
    }

    return (
      <div
        data-nodeid={this.node.id}
        className={styles['simulator-container']}
        draggable
        onDragStart={(e) => projectModel.designer.dragon.handleDragStart(e, this.node)}
        onDragEnd={projectModel.designer.dragon.handleDragEnd}
      >
        <div className={styles['drag-mock-placeholder']} mock-pre-nodeid={this.node.id} />
        {engine.renderContent(node, compProps, children)}
        <div className={styles['drag-mock-placeholder']} mock-next-nodeid={this.node.id} />
      </div>
    )
  }
}