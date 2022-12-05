import React, { useCallback, useEffect } from 'react'
import { isNil } from 'lodash'
import { 
  Dropdown, 
  Menu, 
  message, 
  Form, 
  Select, 
  Input, 
  InputNumber, 
  Switch,
  FormItemProps
} from 'antd'
import { getModel } from 'model'
import { EllipsisOutlined, CopyOutlined } from '@ant-design/icons'
import styles from './index.module.css'
import { IProps } from './index.type'

const dataTypeList = ['string', 'number', 'boolean', 'array', 'object']

function DataCard(props: IProps) {
  const { cardType, data, cardInfoDispatch, deleteVariable, addVariable, updateVariable } = props
  const { projectModel } = getModel()
  const [form] = Form.useForm()
  const fieldType = Form.useWatch('type', form);

  useEffect(() => {
    if (!fieldType) return
    const initialValue = getInitialValue(fieldType)
    form.setFieldValue('defaultValue', initialValue)
  }, [fieldType])

  useEffect(() => {
    if (cardType === 'add') {
      form.resetFields()
    }
    if (cardType === 'edit' && data) {
      form.setFieldsValue({
        key: data?.key,
        type: data?.type,
        defaultValue: data?.type === 'object' || data?.type === 'array' ? JSON.stringify(data?.defaultValue) : data?.defaultValue,
        desc: data?.desc,
        scope: data?.scope
      })
    }
  }, [cardType, data])

  const showValue = useCallback(() => {
    if (!data) return 'undefined'
    const { defaultValue: value, type } = data

    let displayValue = ''

    switch (type) {
      case 'string': {
        displayValue = `"${value}"`
        break
      }
      case 'boolean': {
        displayValue = String(value)
        break
      }
      case 'object': {
        displayValue = JSON.stringify(value)
        break
      }
      case 'array': {
        displayValue = JSON.stringify(value)
        break
      }
      default: {
        displayValue = value as string
        break
      }
    }
    return displayValue
  }, [data])

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.path ?? '')
    message.info('复制成功')
  }

  const onFinish = () => {
    form
      .validateFields()
      .then((value) => {
        const params: Partial<IData> = {}
        const { key, desc, defaultValue, type, scope } = value

        params.key = key
        params.desc = desc ?? ''
        params.defaultValue = type === 'object' || type === 'array' ? JSON.parse(defaultValue) : defaultValue
        params.type = type
        params.scope = scope
        params.path = `$state.${scope}.${key}`

        try {
          if(cardType === 'add') {
            addVariable({ [key]: params as IData })
          }
          if (cardType === 'edit') {
            updateVariable({ [key]: params as IData })
          }

          cardInfoDispatch({ type: 'cardType', payload: 'check' })
          cardInfoDispatch({ type: 'choosenData', payload: params })
        } catch(e) {
          console.log(e)
        }
      })
      .catch((errors) => {
        console.log('errors', errors)
      })
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
    const type = form.getFieldValue('type')
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

  const renderEditCard = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>{cardType === 'add' ? '添加变量' : data?.key}</span>
        <div>
            <span className={styles['link']} onClick={onFinish} style={{ marginRight: 10 }}>
              保存
            </span>
            <span className={styles['link']} onClick={() => data ? cardInfoDispatch({ type: 'cardType', payload: 'check' }) : cardInfoDispatch({ type: 'cardType', payload: 'empty' })}>
              取消
            </span>
        </div>
      </div>
      <div className={styles['show-content']}>
        <Form style={{ width: '100%' }} form={form} layout="vertical">
          <Form.Item
            name="key"
            label="变量标识"
            rules={[
              { required: true, message: `变量标识必选` },
              ({ getFieldValue }) => ({
                // 检查key唯一
                validator(_, value) {
                  if (cardType === 'edit' && value === data?.key) return Promise.resolve()
                  const scope = getFieldValue('scope')
                  if (getFieldValue('scope')) {
                    const datas = (scope === 'global' ? projectModel.data : projectModel.documents.get(scope)?.data) ?? {}
                    if (value in datas) {
                      return Promise.reject(new Error(`该标识在当前作用域 ${getScopeName(scope)} 中已存在`))
                    }
                  }
                  return Promise.resolve()
                }
              })
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="变量类型"
            rules={[{required: true, message: '变量类型必选'}]}
          >
            <Select>
              {dataTypeList.map((v) => (
                <Select.Option key={v} value={v}>{v}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => 
              dataTypeList.includes(getFieldValue('type')) ? (
                <Form.Item
                  name="defaultValue"
                  // initialValue={getInitialValue()}
                  // 输入值检验
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const type = getFieldValue('type')
                        if (type === 'array' || type === 'object') {
                          try {
                            if (type === 'array' && Array.isArray(JSON.parse(value))) {
                              return Promise.resolve()
                            }
                            if (type === 'object' && Object.prototype.toString.call(JSON.parse(value)) === '[object Object]') {
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
                  label="变量初始值"
                >
                  {renderInitialValue()}
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item
            name="scope"
            label="变量作用域"
            rules={[{ required: true, message: '变量作用域必选' }]}
            initialValue={projectModel.currentDocument?.id}
          >
            <Select>
              {
                ['global', ...Array.from(projectModel.documents.keys())].map((pageId) => {
                  return (
                    <Select.Option key={pageId} value={pageId}>
                      {getScopeName(pageId)}
                    </Select.Option>
                  )
                })
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="desc"
            label="变量描述"
          >
            <Input.TextArea autoSize />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
  
  const menu = (
    <Menu style={{ width: 80 }} items={[
      {
        key: 'edit',
        label: (
          <div
            style={{ color: '#000', fontSize: 12 }}
            onClick={() => cardInfoDispatch({ type: 'cardType', payload: 'edit' })}
          >
            编辑
          </div>
        )
      },
      {
        key: 'delete',
        label: (
          <div
            style={{ color: '#e34d59', fontSize: 12 }}
            onClick={() => {
              deleteVariable(data as IData)
              cardInfoDispatch({ type: 'choosenData', payload: null })
            }}
          >
            删除
          </div>
        )
      }
    ]} />
  )

  const getScopeName = (scope: string) => scope === 'global' ? '全局' : projectModel.documents.get(scope as string)?.name

  const renderShowCard = () => {
    return (
      <div className={styles['container']}>
        <div className={styles['header']}>
          <span>{data?.key}</span>
          <Dropdown overlay={menu} placement="bottomLeft">
            <a>
              <EllipsisOutlined style={{ color: '#000000' }} />
            </a>
          </Dropdown>
        </div>
        <div className={styles['show-content']}>
          <div className={styles['show-item']}>
            <div className="title">变量标识</div>
            <div className="content">{data?.key}</div>
          </div>
          <div className={styles['show-item']}>
            <div className="title">变量类型</div>
            <div className="content">{data?.type}</div>
          </div>
          <div className={styles['show-item']}>
            <div className="title">变量初始值</div>
            <div className="content">{showValue()}</div>
          </div>
          <div className={styles['show-item']}>
            <div className="title">变量作用域</div>
            <div className="content">{getScopeName(data?.scope as string)}</div>
          </div>
          <div className={styles['show-item']}>
            <div className="title">变量描述</div>
            <div className="content">{data?.desc ?? ''}</div>
          </div>
          <div className={styles['show-item']}>
            <div className="title">变量路径</div>
            <div className="content">
              {data?.path ?? ''}
              <CopyOutlined style={{ marginLeft: 6 }} onClick={handleCopy} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return cardType === 'add' || cardType === 'edit' ? renderEditCard() : renderShowCard()
}

export default DataCard