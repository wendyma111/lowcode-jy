import NodeInstance from 'model/node';
import React, { PureComponent } from 'react'
import simulatorFactory from './hoc/simulator'

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

class Renderer extends PureComponent<IProps> {

  onGetRef(ref: React.ReactInstance, node: NodeInstance) {
    node.mountRef(ref)
  }

  createElement(node: NodeInstance): React.ReactNode {
    const componentConstructor = node.getComponentMeta().constructor
    return React.createElement(
      simulatorFactory(componentConstructor),
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

export default Renderer