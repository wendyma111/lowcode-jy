import React, { forwardRef, useRef } from 'react'
import _ from 'lodash'
import { Select, Modal, Form, Input, FormInstance, message, Tooltip } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
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

AddNewPage.displayName = 'AddNewPage'

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

  const deleteDocument = (id: PageId) => {
    const keys = Array.from(projectModel.documents.keys())
    const index = _.findIndex(
      keys,
      (item: PageId) => id === item
    )
    id && projectModel.removeDocument(id)
    projectModel.setCurrentDocument(projectModel.getDocument(index >= keys.length - 1 ? keys[0] : keys[index + 1]))
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id as string)
    message.info('复制成功')
  }

  return (
    <div className={styles['container']}>
      <div>
        <span>页面：</span>
        <Select
          style={{ width: 180 }}
          bordered={false}
          onChange={setCurrentDocument}
          value={projectModel.currentDocument?.id}
          options={
            Array.from(projectModel.documents.keys()).map((id) => {
              return {
                value: id,
                label: (
                  <div className={styles['label-container']}>
                    <div>
                      {projectModel.getDocument(id)?.name ?? '未命名页面'}

                    </div>
                    <div>
                      <Tooltip title="复制页面id" placement='top'>
                        <CopyOutlined style={{ marginRight: 4, color: '#1890ff' }} onClick={(e) => { e.stopPropagation(); handleCopy(id) }} />
                      </Tooltip>
                      {Array.from(projectModel.documents.keys()).length > 1
                        ? <Tooltip title="删除页面" placement='top'>
                          <DeleteOutlined
                            style={{ color: '#1890ff' }}
                            onClick={(e) => { e.stopPropagation(); deleteDocument(id) }}
                          />
                        </Tooltip>
                        : null
                      }
                    </div>
                  </div>
                )
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