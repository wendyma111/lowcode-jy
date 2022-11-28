import React, { forwardRef, useRef } from 'react'
import { Select, Modal, Form, Input, FormInstance } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import { observer } from 'mobx-react'
import styles from './index.module.css'

const AddNewPage = forwardRef((props, ref: any) => {
  const [form] = Form.useForm()
  ref.current = form

  return (
    <Form form={form}>
      <Form.Item
        name="name"
        label="页面名称"
        rules={[
          { required: true, message: '页面名称必填' }
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
})

function PageManage() {
  const { projectModel } = getModel()
  const addPageForm = useRef<FormInstance<any>>()

  const addPage = () => {
    Modal.confirm({
      title: '添加页面',
      content: <AddNewPage ref={addPageForm} />,
      icon: null,
      onOk: () => {
        if (addPageForm.current) {
          return addPageForm.current.validateFields().then((res) => {
            getModel().projectModel.addNewDocument(res?.name ?? '未命名页面')
          })
        }
      }
    })
  }

  const setCurrentDocument = (id: PageId) => {
    projectModel.setCurrentDocument(projectModel.getDocument(id))
  }

  return (
    <div className={styles['container']}>
      <div>
        <span>页面：</span>
        <Select
          style={{ width: 100 }}
          bordered={false}
          onChange={setCurrentDocument}
          value={projectModel.currentDocument?.id}
          options={
            Array.from(projectModel.documents.keys()).map((id) => {
              return {
                value: id,
                label: <div>{projectModel.getDocument(id)?.name ?? '未命名页面'}</div>
              }
            })
          }
        />
      </div>
      <div>
        <PlusOutlined onClick={addPage} />
      </div>
    </div>
  )
}

export default observer(PageManage)