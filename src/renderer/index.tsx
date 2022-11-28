import NodeInstance from 'model/node';
import React, { PureComponent } from 'react'
import { SimulatorContent, PreviewContent } from './hoc/simulator'
import { getModel } from 'model'
import { toJS, observable, action } from 'mobx';
import { inject, observer, Provider } from 'mobx-react'
import _ from 'lodash';

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

export interface IPreviewPage {
  $state: any;
  $api: any
}

class rendererFactory {
  static previewFactory = () => {
    const { projectModel } = getModel()
    
    // 生成store
    const storeData: Record<string, any> = {}
    storeData['global'] = _.mapValues(toJS(projectModel.data), (value) => {
      return value.defaultValue
    })
    for (const [key, doc] of projectModel.documents) {
      storeData[key] = _.mapValues(toJS(doc.data), (value) => {
        return value.defaultValue
      })
    }
  
    const $state = observable(storeData)
    const $api = {
      dispatch: action((path: string, value: any) => {
        try {
          _.set($state, path, value)
        } catch(e) {
          console.error(`dispatch调用报错 ${e}`)
        }
      })
    }

    const methods = Object.assign({}, projectModel.methods ?? {})
    _.values(methods).map((method) => {
      _.set($api, `custom.${method.key}`, new Function('$state', '$api', 'return ' + method.value)($state, $api))
    })
  
    const route: Record<string, any> = {}

    for(const [pageId, doc] of projectModel.documents) {
      
      @inject(({store, navigate}) => ({ 
        $state: {
          global: store.$state.global,
          [pageId]: store.$state[pageId]
        },
        $api: { ...store.$api, navigate }
      }))
      @observer
      class Page extends React.Component<IPreviewPage> {

        excuteLifecycle(stage: 'componentDidMount' | 'componentDidUpdate' | 'componentWillUnmount') {
          const { $state, $api } = this.props
          const parsed_lifecycle = doc.lifecycle.replace(/export(\s+)default/, 'const lifecycle =')
          new Function('$state', '$api', `
            ${parsed_lifecycle}
            lifecycle.${stage}()
          `)($state, $api)
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

    return (props: { pageId: string, navigate: (path: string) => void }) => (
      <Provider store={{ $state, $api }}>
        {React.createElement(route[props?.pageId], { navigate: props.navigate  })}
      </Provider>
    )
  }

  static designFactory = () => {
    class Renderer extends PureComponent<IProps> {
      componentConstructor!: React.FunctionComponent | React.ComponentClass

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
          // @ts-ignore
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