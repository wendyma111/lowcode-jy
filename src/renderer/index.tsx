import NodeInstance from 'model/node';
import React, { PureComponent } from 'react'
import { SimulatorContent, PreviewContent } from './hoc/simulator'
import { getModel } from 'model'
import { toJS } from 'mobx';
import { inject, observer, Provider } from 'mobx-react'
import _ from 'lodash';
import LowcodeExecuteCtxFatory from 'designer/logic/lowcodeExecute'

interface IProps {
  documentModel: DocumentModel;
  componentMeta: ComponentMetaModel;
  mode: 'design' | 'preview'
}

class ErrorDisplay extends PureComponent {
  render() {
    return <>Some Error</>
  }
}

/**
 * 构造预览环境 低代码执行环境，确保 预览 & 画布中 低代码均执行在白名单内部
 */
const previewLowCodeExcute = (
  iframe: HTMLIFrameElement
) => {
  const factory = new LowcodeExecuteCtxFatory()
  factory._iframe = iframe

  return (code: string, $state: Record<any, any>, $api: Record<any, any>) => {
    const ctx = factory.generateCtx({
      $state: toJS($state),
      $api
    })

    return new Function(`
      return function(ctx) {
        with(ctx) {
          try {
            ${code}
          } catch(e){
            console.log('低代码执行失败', e)
          }
        }
      }
    `)()(ctx)
  }
}

class rendererFactory {
  static previewFactory = (iframe: HTMLIFrameElement, store: any) => {
    const { projectModel } = getModel()

    const lowcodeExecute = previewLowCodeExcute(iframe)

    const methods = Object.assign({}, projectModel.methods ?? {})
    _.values(methods).map((method) => {
      store.add$api(`custom.${method.key}`, lowcodeExecute('return ' + method.value, store.$state, store.$api))
    })
  
    const route: Record<string, any> = {}

    for(const [pageId, doc] of projectModel.documents) {
      
      @inject(({store}) => {
        return {
          $state: {
            global: store.$state.global,
            [pageId]: store.$state[pageId]
          },
          $api: store.$api
        }
      })
      @observer
      class Page extends React.Component<any> {

        excuteLifecycle(stage: 'componentDidMount' | 'componentDidUpdate' | 'componentWillUnmount') {
          const { $state, $api } = this.props

          const parsed_lifecycle = doc.lifecycle.replace(/export(\s+)default/, 'const lifecycle =')

          lowcodeExecute(`
            ${parsed_lifecycle};
            lifecycle.${stage}?.()
          `, $state, $api)
        }
  
        componentDidMount(): void {
          this.excuteLifecycle('componentDidMount')
        }
  
        componentDidUpdate(): void {
          this.excuteLifecycle('componentDidUpdate')
        }
  
        componentWillUnmount(): void {
          this.excuteLifecycle('componentWillUnmount')
        }

        renderContent(node: NodeInstance, props: Record<string, any>, children: NodeInstance[]) {
          const componentConstructor = node.getComponentMeta()?.constructor
          return React.createElement(
            componentConstructor,
            props,
            ...children.map(child => this.createElement(child))
          )
        }
  
        createElement(node: NodeInstance): React.ReactNode {
          const { $state, $api } = this.props

          return React.createElement(
            PreviewContent,
            {
              node,
              engine: this,
              key: node.id,
              $state,
              $api,
              lowcodeExecute,
            }
          )
        }
  
        render() {
          const { rootNode } = doc
          
          if (!rootNode) {
            return <ErrorDisplay />
          }
      
          return this.createElement(rootNode)
        }
      }
  
      route[pageId] = Page
    }

    const PreviewComp = (props: { pageId: string, navigate: (path: string) => void }) => {
      store.add$api('navigate', props.navigate)

      return (
        <Provider store={store}>
          {
            route[props?.pageId] ? React.createElement(route[props?.pageId], {}) : null
          }
        </Provider>
      )
    }
    PreviewComp.displayName = 'PreviewComp'
    return PreviewComp
  }

  static designFactory = () => {
    class Renderer extends PureComponent<IProps> {
      componentConstructor!: React.FunctionComponent | React.ComponentClass
      clear!: () => void

      constructor(props: IProps) {
        super(props)

        this.clear = props.documentModel.onRerender(() => this.forceUpdate())
      }

      componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (prevProps.documentModel !== this.props.documentModel) {
          this.clear?.()
          this.clear = this.props.documentModel.onRerender(() => this.forceUpdate())
        }
      }

      componentWillUnmount(): void {
        this.clear?.()
      }

      onGetRef(ref: React.ReactInstance, node: NodeInstance) {
        node.mountRef(ref)
      }

      renderContent(node: NodeInstance, nodeProps: Record<string, any>, children: NodeInstance[]) {
        const componentConstructor = node.getComponentMeta()?.constructor

        if (!componentConstructor) return null

        return React.createElement(
          componentConstructor, // 这里套memo的话 相当于生成了一个新组件，会导致子组件全部重新生成
          nodeProps,
          ...children.map(child => this.createElement(child))
        )
      }
      
      createElement(node: NodeInstance): React.ReactNode {
        // 弃用hoc模式，使用hoc 会导致生成新的组件，导致其内部的子组件全部重新渲染
        return React.createElement(
          // simulatorFactory(componentConstructor, 'design'),
          SimulatorContent,
          {
            node,
            engine: this,
            key: node.id,
            ref: (ref: React.ReactInstance) => {
              if (!ref) return
              this.onGetRef(ref as React.ReactInstance, node)
            }
          }
        )
      }

      render() {
        const { documentModel } = this.props
        const { rootNode } = documentModel

        if (!rootNode) {
          return <ErrorDisplay />
        }
    
        return this.createElement(rootNode)
      }
    }

    return Renderer
  }
}

export default rendererFactory