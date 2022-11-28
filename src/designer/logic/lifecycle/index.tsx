import React, { useState, useMemo, useCallback } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Modal, Tabs } from 'antd'
import { FolderOutlined, CloseOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import Catalogue from './catalogue'
import styles from './index.module.css'
import { IFile, IProps, IChoosenFile } from './index.type'
import Editor from './editor'

export const FileContext = React.createContext<any>({})

function transformArrToTree(catalogues: any, fileList: Array<IFile & { pathList: string[] }>) {
  _.forEach(catalogues, (catalogue) => {
    if (catalogue.type === 'file') return
    const filteredFileList = fileList.filter((item) => {
      if (item.pathList.length - catalogue.pathList.length === 1) {
        const flag = catalogue.pathList.every((p: string, index: number) => {
          return item.pathList[index] === p
        })
        return flag
      }
      return false
    })
    catalogue.content = transformArrToTree(filteredFileList, fileList)
  })
  return catalogues
}

function LifeCycle(props: IProps) {
  const { projectModel } = getModel()
  
  const { isModalVisible, closeModal } = props

  // 已选文件，即当前在tab栏上展示的文件
  const [choosenFiles, setChoosenFiles] = useState<IChoosenFile[]>([])
  // 当前编辑的文件
  const [currentChoosenFile, setCurrentChoosenFile] = useState(null)
  
  const { lifeCycleFiles } = projectModel.designer.logic

  const info = useMemo(() => {
    const lifeCycleFiles_pathList: Array<IFile & { pathList: string[] }> = lifeCycleFiles.map(
      (item) => ({ ...item, pathList: item.path.split('/').filter((i) => i) })
    )
    const rootInfo = lifeCycleFiles_pathList.filter((item) => item.pathList.length === 1)
    return transformArrToTree(rootInfo, lifeCycleFiles_pathList)
  }, [lifeCycleFiles])

  const handleClose = useCallback(() => {
    const notSavedFiles = choosenFiles.filter((item) => item.changed)

    // 检查是否存在更改未保存的页面
    if (notSavedFiles.length > 0) {
      const modal = Modal.confirm({
        content: '当前存在更改未保存的文件，关闭后更改将丢失，请确认是否要关闭',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          setCurrentChoosenFile(null)
          setChoosenFiles([])
          modal.destroy()
          closeModal()
        },
      })
    } else {
      setCurrentChoosenFile(null)
      setChoosenFiles([])
      closeModal()
    }
  }, [isModalVisible, closeModal])

  return (
    <Modal
      centered
      open={isModalVisible}
      onCancel={handleClose}
      footer={null}
      width={'fit-content'}
      closeIcon={<CloseOutlined className={styles['close-icon']} />}
    >
      <div style={{ paddingTop: 20 }}>
        <FileContext.Provider
          value={{ choosenFiles, setChoosenFiles, currentChoosenFile, setCurrentChoosenFile }}
        >
          <Tabs
            tabPosition="left"
            defaultActiveKey="fileSystem"
            items={[
              {
                label: (<FolderOutlined className={styles['folder-icon']} />),
                key: 'fileSystem',
                children: (
                  <div className={styles['container']}>
                    <div className={styles['sidebar-container']}>
                      {
                        info.map((item: any) => (<Catalogue key={item.path} catalogueInfo={item} />))
                      }
                    </div>
                    <Editor />
                  </div>
                )
              }
            ]}
          >
          </Tabs>
        </FileContext.Provider>
      </div>
    </Modal>
  )
}

export default observer(LifeCycle)