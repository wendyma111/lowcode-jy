import React, { useEffect, forwardRef } from 'react'
import { Select, Form } from 'antd'
import { getModel } from 'model'
import { IExtraNavigate } from '../index.type'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select

function NavigateExtra(
  props: { extra?: IExtraNavigate },
  ref: any
) {
  const [form] = Form.useForm()
  ref.current = form
  const { extra } = props
  const { projectModel } = getModel()

  useEffect(() => {
    extra && form.setFieldValue('targetPageId', extra.targetPageId)
  }, [extra])

  return  (
    <Form {...layout} form={form}>
      <Form.Item label="目标页面" name="targetPageId" rules={[{ required: true, message: '目标页面必填' }]}>
        <Select>
          {Array.from(projectModel.documents.values()).map(doc => {
            return (
              <Option key={doc.id} value={doc.id}>{doc.name}</Option>
            )
          })}
        </Select>
      </Form.Item>
    </Form>
  )
}

export default forwardRef(NavigateExtra)