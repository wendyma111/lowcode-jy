import React, { forwardRef, useEffect, useRef } from 'react'
import _, { isNil } from 'lodash'
import { Form, Select, Switch, InputNumber, Input } from 'antd'
import { getModel } from 'model'
import { IExtraDispatch } from '../index.type'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function DispatchExtra(props: { extra: IExtraDispatch }, ref: any) {
  const { extra } = props
  const [form] = Form.useForm()
  const { projectModel } = getModel()
  ref.current = form

  const variables = projectModel.designer.logic.getAllVariable()

  useEffect(() => {
    form.setFieldValue('variablePath', extra?.variablePath)
    form.setFieldValue('value', extra?.value)
  }, [extra])

  const handleChangeVariablePath = (v: string) => {
    if (!v) return
    const { type } = projectModel.designer.logic.getVaribleByPath(v) ?? {}
    if (!type) return
    const initialValue = getInitialValue(type)
    form.setFieldValue('value', initialValue)
  }

  const getInitialValue = (type: string) => {
    let initialValue
    switch (type) {
      case 'string': {
        initialValue = ''
        break
      }
      case 'number': {
        initialValue = 0
        break
      }
      case 'boolean': {
        initialValue = false
        break
      }
      case 'object': {
        initialValue = '{}'
        break
      }
      case 'array': {
        initialValue = '[]'
        break
      }
    }
    return initialValue
  }

  const renderInitialValue = () => {
    const { type } = projectModel.designer.logic.getVaribleByPath(form.getFieldValue('variablePath')) ?? {}
    let InitialValueInput = null
    switch (type) {
      case 'string': {
        InitialValueInput = <Input />
        break
      }
      case 'number': {
        InitialValueInput = <InputNumber style={{ width: '100%' }} />
        break
      }
      case 'boolean': {
        InitialValueInput = <Switch />
        break
      }
      case 'object': {
        InitialValueInput = <Input.TextArea autoSize />
        break
      }
      case 'array': {
        InitialValueInput = <Input.TextArea autoSize />
        break
      }
      default:
        break
    }

    return InitialValueInput
  }

  return (
    <Form {...layout} form={form}>
      <Form.Item
        label="目标变量"
        name="variablePath"
        rules={[{ required: true, message: '目标变量必填' }]}
      >
        <Select onChange={handleChangeVariablePath}>
          {_.keys(variables).map((scope) => {
            return (
              <Select.OptGroup
                key={scope}
                label={scope === 'global' ? '全局' : projectModel.getDocument(scope)?.name}
              >
                {
                  _.values(variables[scope]).map((data) => {
                    return (
                      <Select.Option
                        key={data.path ?? `$state.${data.scope}.${data.key}`}
                        value={data.path ?? `$state.${data.scope}.${data.key}`}
                      >
                        {data.key}
                      </Select.Option>
                    )
                  })
                }
              </Select.OptGroup>
            )
          })
          }
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.variablePath !== currentValues.variablePath}
      >
        {({ getFieldValue }) => (
          getFieldValue('variablePath') 
            ? <Form.Item
                label="变量值"
                name="value" 
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const path = getFieldValue('variablePath')
                      const variable = projectModel.designer.logic.getVaribleByPath(path)
                      if (variable?.type === 'array' || variable?.type === 'object') {
                        try {
                          if (variable?.type === 'array' && Array.isArray(JSON.parse(value))) {
                            return Promise.resolve()
                          }
                          if (variable?.type === 'object' && Object.prototype.toString.call(JSON.parse(value)) === '[object Object]') {
                            return Promise.resolve()
                          }
                          return Promise.reject('请输入相应格式的json字符')
                        } catch(e) {
                          return Promise.reject('请输入json格式字符')
                        }
                      }
                      if (!isNil(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject('变量值必填')
                    }
                  })
                ]}
              >
                {renderInitialValue()}
              </Form.Item>
            : null
        )}
      </Form.Item>
    </Form>
  )
}

export default forwardRef(DispatchExtra)