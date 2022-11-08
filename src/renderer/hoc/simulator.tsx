import React, { ClassType, PureComponent } from 'react'
import { getModel } from 'model'
import styles from './simulator.module.css'
import NodeInstance from 'model/node'
import { IState, IProps } from './simulator.type'

function simulatorHocFactory(WrappedComp: ClassType<any, any, any>) {
  const { projectModel } = getModel()
  
  /**
   * 预览模式下 组件渲染
   * - 无需考虑 props、children更新情况
   */
  class PreviewContent extends PureComponent<IProps> {
    render() {
      const { node, engine } = this.props
      const children = node.children

      return React.createElement(
        React.memo(WrappedComp), 
        node.getProps(),
        ...children.map(child => engine.createElement(child))
      )
    }
  }

  /**
   * 设计状态下 组件渲染
   * - 需要考虑 props、children更新情况
   * - 将props、children置为Wrapper组件内部的state，避免影响其他组件
   */
  class SimulatorContent extends PureComponent<IProps, IState> {
    node!: NodeInstance
    clearPropsChangeHandler!: () => void
    clearChildrenChangeHandler!: () => void

    constructor(props: any) {
      super(props)
      const { node } = props
      this.node = node

      this.state = {
        compProps: this.node.getProps(),
        ifActive: false,
        children: this.node.children,
      }

      this.init()
    }

    init() {
      // 监听组件props改变
      this.clearPropsChangeHandler = this.node.onPropChange((modifiedProps) => {
        this.setState({
          compProps: { ...this.state.compProps, ...modifiedProps }
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
      this.clearPropsChangeHandler?.()
      this.clearChildrenChangeHandler?.()
    }

    render() {  
      const { compProps, children } = this.state 
      const { engine } = this.props
      return (
        <div data-nodeid={this.node.id} className={styles['simulator-container']}>
          {
            React.createElement(
              React.memo(WrappedComp),
              compProps,
              ...children.map(child => engine.createElement(child))
            )
          }
        </div>
      )
    }
  }

  return projectModel.mode === 'preview' ? PreviewContent : SimulatorContent
}

export default simulatorHocFactory