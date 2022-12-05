import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Modal, Tooltip, message, Button, Tabs } from 'antd'
import { ExclamationCircleOutlined, CopyOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import VariableContent from '../variableContent'
import { IProps } from './index.type'
import styles from './index.module.css'
import ExpressionEditor from '../expressionEditor'
import { IMarker } from 'designer/logic/basicLowcodeEditor/index.type'

function BindDataModal(props: IProps) {
  const { open, toggleOpen, node, targetProp } = props
  const currentPropValue = node.getPropValue(targetProp)
  const [path, setPath] = useState<string | null>(null)
  const dataType = useRef<'variable' | 'lowcode' | null>(null)
  const expressionRef = useRef<IMarker[]>([])

  useEffect(() => {
    if (currentPropValue?.type === 'JSExpression' && open) {
      setPath(currentPropValue.value)
    }
  }, [currentPropValue, open])

  const handleCopy = () => {
    navigator.clipboard.writeText(path as string)
    message.info('复制成功')
  }

  const closeModal = useCallback(() => toggleOpen(false), [])

  const onSave = () => {
    const { targetProp } = props

    if (dataType.current === 'variable') {
      if (typeof path === 'string') {
        const [,scope,key] = path.split('.')
        const dataInfo = scope === 'global' 
          ? getModel().projectModel.data[key]
          : getModel().projectModel.getDocument(scope)?.data?.[key]

        // 绑定数据类型校验
        if (dataInfo?.type !== node.getComponentMeta().settings[targetProp]?.type) {
          Modal.confirm({
            title: '警告',
            icon: <ExclamationCircleOutlined />,
            content: '绑定数据类型与组件属性类型不一致，无法进行绑定',
            okText: '确认',
            cancelText: '取消',
          });
        } else {
          node.setPropValue(targetProp, { type: 'JSExpression', value: path })
          closeModal()
        }
      } else {
        closeModal()
      }
    }

    if (dataType.current === 'lowcode') {
      if (expressionRef.current.length == 0) {
        node.setPropValue(targetProp, { type: 'JSExpression', value: path })
      }
    }

    closeModal()
  }

  const unbind = () => {
    node.setPropValue(targetProp, node.getComponentMeta()?.settings?.[targetProp]?.value)
    closeModal()
  }

  const footer = (
    <div className={styles['footer-container']}>
      <a className={styles['unbind-link']} onClick={unbind}>解除绑定</a>
      <div className={styles['row']}>
        {path ? (
          <div className={styles['row']} style={{ marginRight: 10 }}>
            <span style={{ fontSize: 12 }}>当前绑定：</span>
            <Tooltip title={path}>
              <div className={styles['current-selected']}>{path}</div>
            </Tooltip>
            <CopyOutlined style={{ marginLeft: 6 }} onClick={handleCopy} />
          </div>
        ) : null}
        <Button onClick={closeModal}>取消</Button>
        <Button type="primary" onClick={onSave}>
          确认
        </Button>
      </div>
    </div>
  )

  const setVariablePath = useCallback((v: string) => {
    setPath(v); 
    dataType.current = 'variable' 
  }, [setPath])

  const setLowcodePath = useCallback((v: string) => { 
    setPath(v);
    dataType.current = 'lowcode'
  }, [setPath])

  return (
    <Modal
      destroyOnClose
      footer={footer}
      width={980}
      onCancel={closeModal}
      centered
      title="绑定变量"
      open={open}
      afterClose={() => {
        setPath(null)
        dataType.current = null
      }}
    >
      <Tabs
        defaultActiveKey="variable"
        items={[
          {
            label: '变量',
            key: 'variable',
            children: <VariableContent setPath={setVariablePath} />
          },
          {
            label: '表达式',
            key: 'expression',
            children: (
              <ExpressionEditor
                path={path}
                setPath={setLowcodePath}
                markerRef={expressionRef}
              />
            )
          }
        ]}
      />
    </Modal>
  )
}

export default BindDataModal