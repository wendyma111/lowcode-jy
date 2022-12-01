import React, { useEffect, useRef, useState } from 'react'
import { Collapse } from 'antd';
import styleSetters from 'designer/setter/style_setters'
import { getModel } from 'model'
import NodeInstance from 'model/node'
import { observer } from 'mobx-react';
import Empty from '../empty'

const { Panel } = Collapse

function StyleSetter() {
  const source = useRef([
    {
      header: '布局',
      key: 0,
      content: styleSetters.layout
    },
    {
      header: '定位',
      key: 1,
      content: styleSetters.position
    },
    {
      header: '文字',
      key: 2,
      content: styleSetters.text
    },
    {
      header: '背景',
      key: 3,
      content: styleSetters.background
    },
    {
      header: '边框',
      key: 4,
      content: styleSetters.border
    },
    {
      header: '自定义',
      key: 5,
      content: styleSetters.custom
    }
  ])

  const currentEditNode: NodeInstance = getModel().projectModel.currentDocument?.currentEditNode
  const [nodeProps, setNodeProps] = useState(currentEditNode?.getProps?.() ?? {})
  
  useEffect(() => {
    if (currentEditNode) {
      const clear = currentEditNode.onPropChange(() => {
        setNodeProps(currentEditNode.getProps())
      })

      return clear
    }
  }, [currentEditNode])

  const handleChangeProp = (prop: string, value: any) => {
    if (!currentEditNode) return
    currentEditNode.setPropValue(prop, value)
  }

  if (!currentEditNode) {
    return <Empty text="请先选择组件" />
  }

  return (
    <Collapse defaultActiveKey={source.current.map(item => item.key)} bordered={false} expandIconPosition="end">
      {
        source.current.map((item) => (
          <Panel style={{ background: '#fff' }} header={item.header} key={item.key}>
            {
              item.content?.length 
                ? item.content.map(
                  (el, index) => React.createElement(el, { key: index, onChange: handleChangeProp, nodeProps })
                )
                : null
            }
          </Panel>
        ))
      }
    </Collapse>
  )
}

export default observer(StyleSetter)