import React, { useRef, useState, useEffect, useMemo } from 'react'
import _ from 'lodash'
import { Collapse } from 'antd';
import { CloseOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import { observer } from 'mobx-react';
import NodeInstance from 'model/node'
import setters from 'designer/setter/common_setters'
import BindDataButton from 'designer/setter/binddata'
import BindDataModal from 'designer/logic/bindDataModal';
import CustomMethods, { builtInApis } from 'designer/logic/customMethods'
import { IMethodInfo } from 'designer/logic/customMethods/index.type'
import Empty from '../empty'

const { Panel } = Collapse

function AddEvent(props: { node: NodeInstance, nodeProps: Record<string, any> }) {
  const { node, nodeProps } = props
  const [open, toggleOpen] = useState(false)
  const [methodInfo, setMethodInfo] = useState<IMethodInfo | null>(null)

  const events = useMemo(() => {
    return _.values(node.getComponentMeta().settings).filter(setting => {
      return setting.type === "event"
    })
  }, [node])

  const addEvent = () => {
    toggleOpen(true)
    setMethodInfo(null)
  }

  const editEvent = (methodInfo: IMethodInfo) => {
    setMethodInfo(methodInfo)
    toggleOpen(true)
  }

  return <>
    <CustomMethods
      node={node}
      open={open}
      toggleOpen={toggleOpen}
      methodInfo={methodInfo as IMethodInfo}
    />
    {events.length ? (
      <>
        {events.map(({ settingName, label: eventLabel }) => {
          if (nodeProps[settingName]) {
            const { path: selectedPath, extra } = nodeProps[settingName]
            const builtInMethod = _.find(builtInApis, ({ path }) => selectedPath === path)
            let customMethod
            let label = '自定义事件'
            if (builtInMethod) {
              label = builtInMethod.label
            } else {
              const [, , methodName] = selectedPath.split('.')
              const { projectModel } = getModel()
              customMethod = projectModel.methods[methodName]
              label = customMethod.key
            }

            return (
              <div
                style={{ paddingBottom: 4, color: '#008ddf', display: 'flex', justifyContent: 'space-between' }}
                key={settingName}
              >
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => editEvent({ event: settingName, path: selectedPath, extra })}
                >
                  {eventLabel + ' - ' + label}
                </div>
                <CloseOutlined style={{ cursor: 'pointer' }} />
              </div>
            )
          } else {
            return null
          }
        })
        }
        <div style={{ color: '#008dff', cursor: 'pointer' }} onClick={addEvent}>添加事件 +</div>
      </>
    ) : '该组件暂无事件'}
  </>
}

function BindData(props: { node: NodeInstance, targetProp: string }) {
  const { node, targetProp } = props
  const [open, toggleOpen] = useState<boolean>(false)

  const handleClick = () => toggleOpen(open => !open)

  return (
    <>
      <BindDataModal
        node={node}
        targetProp={targetProp}
        open={open}
        toggleOpen={toggleOpen}
      />
      <div style={{ width: 30, textAlign: 'center' }}>
        <BindDataButton onClick={handleClick} />
      </div>
    </>
  )
}

function AttributeConfig() {
  const source = useRef([
    {
      key: 'base',
      header: '基础属性',
    },
    {
      key: 'event',
      header: '事件',
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
  }, [])

  const handleChangeProp = (prop: string, value: any) => {
    if (!currentEditNode) return
    currentEditNode.setPropValue(prop, value)
  }

  if (!currentEditNode) {
    return <Empty text="请先选择组件" />
  }

  const BaseConfig = _.map(currentEditNode.getComponentMeta().settings, (setting) => {
    return setters[setting.type] ? React.createElement(
      setters[setting.type],
      {
        key: setting.settingName,
        onChange: (v: any) => handleChangeProp(setting.settingName, v),
        label: setting.label,
        value: nodeProps[setting.settingName],
        extra: (
          <BindData node={currentEditNode} targetProp={setting.settingName} />
        )
      }
    ) : null
  })

  return (
    <>
      <Collapse
        defaultActiveKey={source.current.map(item => item.key)}
        bordered={false}
        expandIconPosition="end"
      >
        {
          source.current.map((item) => (
            <Panel style={{ background: '#fff' }} header={item.header} key={item.key}>
              {item.key === 'base' ? BaseConfig : null}
              {item.key === 'event' ? <AddEvent node={currentEditNode} nodeProps={nodeProps} /> : null}
            </Panel>
          ))
        }
      </Collapse>
    </>
  )
}

export default observer(AttributeConfig)