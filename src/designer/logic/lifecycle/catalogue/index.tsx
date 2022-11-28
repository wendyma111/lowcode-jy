import React, { useState, useMemo, useContext, useRef, forwardRef } from 'react'
import _ from 'lodash'
import { runInAction } from 'mobx'
import { DownOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons'
import { Modal, Form, Input, FormInstance } from 'antd'
import { getModel } from 'model'
import { HANDLER_DEFAULT_VALUE } from 'constant'
import File from '../file'
import { FileContext } from '../index'
import styles from '../index.module.css'
import { ICatalogueInfo } from '../index.type'

const { confirm } = Modal

function Arrow(props: { open: boolean }) {
  const { open } = props
  return (
    <DownOutlined
      className={`${styles['down-icon']} name`}
      style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
    />
  )
}

const AddNewHandler = forwardRef((props, ref:any) => {
  const [form] = Form.useForm()
  ref.current = form

  return (
    <Form form={form}>
      <Form.Item
        name="key"
        label="方法标识"
        rules={[
          { required: true, message: '方法标识必填' },
          () => ({
            validator(_, value) {
              if (/^[A-Za-z_0-9]+$/.test(value)) {
                return Promise.resolve()
              }
              return Promise.reject('仅支持字母下划线数组')
            }
          })
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
})

function Catalogue(props: { catalogueInfo: ICatalogueInfo }) {
  const [open, toggleOpen] = useState(true)
  const addHandlerForm = useRef<FormInstance<any>>()
  const { currentChoosenFile } = useContext(FileContext)
  const { catalogueInfo } = props

  const paddingLeft = useMemo(() => {
    return (catalogueInfo.path.split('/').filter((item: string) => item).length - 1) * 8 + 20
  }, [catalogueInfo])

  const choosenCatelogue = useMemo(() => {
    if (!currentChoosenFile?.path) return false
    const pathList = catalogueInfo.path.split('/').filter((item: string) => item)
    const currentFilePathList = currentChoosenFile.path.split('/').filter((item: string) => item)
    const choosen = pathList.every((item: string, index: number) => {
      return currentFilePathList[index] === item
    })
    return choosen
  }, [catalogueInfo, currentChoosenFile])
  
  const handleAddHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    confirm({
      title: '添加自定义方法',
      icon: null,
      content: (<AddNewHandler ref={addHandlerForm} />),
      onOk() {
        if (addHandlerForm.current) {
          return addHandlerForm.current.validateFields().then(({ key }) => {
            runInAction(() => {
              const { projectModel } = getModel()
              projectModel.designer.logic.lifeCycleFiles = [
                ...projectModel.designer.logic.lifeCycleFiles,
                {
                  name: `${key}.ts`,
                  path: `/global/handlers/${key}.ts`,
                  type: 'file',
                  language: 'typescript',
                  value: HANDLER_DEFAULT_VALUE
                }
              ]
            })
          })
        }
      },
      onCancel() {},
    })
  } 

  return (
    <>
      <div
        className={styles['item-container']}
        style={{ paddingLeft }}
        onClick={() => toggleOpen(!open)}
      >
        <div>
          <FolderOutlined
            style={_.merge({ fontSize: 12, marginRight: 2 }, choosenCatelogue ? { color: '#0052d9' } : {})}
            className="name"
          />
          <span className="name" style={choosenCatelogue ? { color: '#0052d9' } : {}}>
            {catalogueInfo.name}
          </span>
          {catalogueInfo.name === 'handlers' && <PlusOutlined style={{ marginLeft: 10 }} onClick={handleAddHandler} />}
        </div>
        <Arrow open={open} />
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        {
          catalogueInfo.content.map((c) => {
            if (c.type === 'file') {
              return <File key={c.path} fileInfo={c} />
            }
            if (c.type === 'catalogue') {
              return <Catalogue key={c.path} catalogueInfo={c} />
            }
          })
        }
      </div>
    </>
  )
}

export default Catalogue
