import React, { useState, useRef } from 'react'
import _ from 'lodash'
import { Radio, Select, RadioChangeEvent, Form, Input, Button, message } from 'antd'
import { getModel } from 'model'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import BaseEditor from 'designer/logic/basicLowcodeEditor'
import styles from './index.module.css'
import { runInAction } from 'mobx'
import { IMethodInfo, IAction } from '../index.type'
import { HANDLER_DEFAULT_VALUE } from 'constant'

function CustomExtra(props: { eventInfo: IMethodInfo, eventInfoDispatch: React.Dispatch<IAction> }) {
  const [form] = Form.useForm()
  const markers = useRef<monaco.editor.IMarker[]>([])
  const { eventInfoDispatch, eventInfo } = props
  const [methodType, setMethodType] = useState<'exsiting' | 'new'>('exsiting')
  const { projectModel } = getModel()

  const handleChangePath = (v: string) => {
    eventInfoDispatch({ type: 'path', payload: v })
  }

  const handleSaveNewMethod = () => {
    form.validateFields().then(res => {

      runInAction(() => {
        projectModel.designer.logic.lifeCycleFiles = [
          ...projectModel.designer.logic.lifeCycleFiles,
          {
            name: `${res.key}.ts`,
            path: `/global/handlers/${res.key}.ts`,
            type: 'file',
            language: 'typescript',
            value: res.value,
          }
        ]
      })
      message.success('自定义方法添加成功')
      setMethodType('exsiting')
    })
  }

  const handleValidate = (m: monaco.editor.IMarker[]) => {
    markers.current = m.filter(item => item.severity >= 8)
  }

  return (
    <div className={styles['container']}>
      <Radio.Group
        value={methodType}
        onChange={(e: RadioChangeEvent) => setMethodType(e.target.value)}
      >
        <Radio value='exsiting'>已有方法</Radio>
        <Radio value='new'>新增方法</Radio>
      </Radio.Group>
      <div className={styles['content-container']}>
        {methodType === 'exsiting' && (
          <div className={styles['item-container']}>
            <div className={styles['item-label']}>已有方法：</div>
            <div className={styles['item-content']}>
              {_.values(projectModel.methods)?.length ? (
                <Select
                  style={{ width: '100%' }}
                  value={eventInfo?.path}
                  onChange={handleChangePath}
                >
                  {_.values(projectModel.methods).map((method) => {
                    return (
                      <Select.Option
                        key={method.key}
                        value={method.path ?? `$api.custom.${method.key}`}
                      >
                        {method.key}
                      </Select.Option>
                    )
                  })}
                </Select>
              ) : '暂无已有方法'}
            </div>
          </div>
        )}
        {methodType === 'new' && (
          <>
            <Form form={form}>
              <Form.Item
                rules={[{required: true, message:'方法标识必填'}]}
                name="key"
                label="方法标识"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="value"
                initialValue={HANDLER_DEFAULT_VALUE}
                rules={[
                  () => ({
                    validator() {
                     if (markers.current.length > 0) {
                      return Promise.reject('存在语法错误')
                     }
                     return Promise.resolve()
                    }
                  })
                ]}
              >
                <BaseEditor
                  height={200}
                  width={"100%"}
                  path="/customEvent"
                  language='typescript'
                  onValidate={handleValidate}
                />
              </Form.Item>
            </Form>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" onClick={handleSaveNewMethod}>保存</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CustomExtra