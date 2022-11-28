import React, { useCallback, useContext } from 'react'
import _ from 'lodash'
import { Button, Modal } from 'antd'
import { runInAction } from 'mobx'
import { CloseOutlined, ExclamationOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { FileContext } from '../index'
import BaseEditor from '../../basicLowcodeEditor'
import { getModel } from 'model'
import { IMarker } from 'designer/logic/basicLowcodeEditor/index.type'
import { IFile } from '../index.type'
import styles from '../index.module.css'
import { lifecycle_rules, handler_rules } from './rules'

const { confirm } = Modal

function Editor() {
  const {
    choosenFiles,
    setChoosenFiles,
    currentChoosenFile,
    setCurrentChoosenFile,
  } = useContext(FileContext)

  const { projectModel } = getModel()
  const lifeCycleFiles = projectModel.designer.logic.lifeCycleFiles

  const handleSave = useCallback(() => {
    /**
     * 当前文件是否存在报错，如有报错，则进行提示并拦截保存操作
     */
    return new Promise((resolve, reject) => {
      const file = choosenFiles.find((item: { path: string }) => item.path === currentChoosenFile?.path)
      const markers = (file?.markers ?? [])
      if (markers.some((marker: IMarker) => marker.severity >= 8)) {
        Modal.warn({ title: '存在语法错误，请修正代码' })
        return reject(null)
      }

      const fileIndex = lifeCycleFiles.findIndex((item) => {
        return item.path === file.path
      })

      setChoosenFiles(choosenFiles.map((item: { path: string, value: string }) => {
        if (item.path === file.path) {
          return { ...item, value: file.value, changed: false }
        }
        return item
      }))

      if (lifeCycleFiles?.[fileIndex]?.value !== file?.value) {
        runInAction(() => {
          const newFiles = lifeCycleFiles.map((item) => {
            if (item?.path === file?.path) {
              return {
                ...item,
                value: file?.value,
              }
            } else {
              return item
            }
          })

          projectModel.designer.logic.lifeCycleFiles = newFiles
          resolve(newFiles)
        })
      }
    })
  }, [choosenFiles, currentChoosenFile?.path, lifeCycleFiles, setChoosenFiles])

  const handleCloseFile = useCallback((file: IFile & {changed: boolean}, e: React.MouseEvent) => {
    const closeFile = () => {
      const filteredChoosenFiles = choosenFiles.filter((item: { path: string }) => item?.path !== file.path)
      setChoosenFiles(filteredChoosenFiles)
      if (file?.path === currentChoosenFile?.path) {
        setCurrentChoosenFile(filteredChoosenFiles?.[filteredChoosenFiles?.length - 1] ?? null)
      }
    }
    /**
     * 判断文件是否存在未保存更改，如果存在则进行提示并拦截保存
     */
    if (file.changed) {
      const modal = confirm({
        icon: <ExclamationCircleOutlined />,
        content: '{{name}}文件存在未保存更改'.replace('{{name}}', file.name),
        onOk() {
          handleSave().then(closeFile).finally(() => {
            modal && modal.destroy()
          })
        },
        closable: true,
        okText: '保存',
        cancelText: '不保存',
        cancelButtonProps: { onClick: () => {
          closeFile()
          modal && modal.destroy()
        } },
      })
    } else {
      closeFile()
    }
    e.stopPropagation()
  }, [choosenFiles, currentChoosenFile?.path, handleSave, setChoosenFiles, setCurrentChoosenFile])

  const handleChooseFile = useCallback((file: IFile & {changed: boolean}) => {
    setCurrentChoosenFile(file)
  }, [setCurrentChoosenFile])

  const handleChangeContent = _.debounce((value) => {
    const file = _.find(lifeCycleFiles, (item) => {
      return item.path === currentChoosenFile.path
    })
    setChoosenFiles(choosenFiles.map((item: IFile & {changed: boolean}) => {
      if (item?.path === currentChoosenFile.path) {
        return { ...item, value, changed: file?.value !== value }
      }
      return item
    }))
  }, 500)

  const handleValidate = _.debounce((markers) => {
    setChoosenFiles(choosenFiles.map((item: IFile & {changed: boolean}) => {
      if (item?.path === currentChoosenFile.path) {
        return { ...item, markers }
      }
      return item
    }))
  }, 500)

  const rules = currentChoosenFile?.path?.includes?.('lifecycle') ? lifecycle_rules : handler_rules

  return (
    <div className={styles['edit-container']}>
      <div className={styles['tab-container']}>
      {
        choosenFiles.map((item: IFile & { changed: boolean }) => (
          <div
            key={item?.path}
            className={styles['tab-item']}
            onClick={() => handleChooseFile(item)}
            style={{ background: currentChoosenFile?.path === item?.path ? '#fff' : 'rgb(250, 250, 250)' }}
          >
            {item?.changed ? <ExclamationOutlined style={{ fontSize: 14, color: 'rgb(230, 162, 60)' }} /> : null}
            <span
              className="name"
              {...(currentChoosenFile?.path === item?.path ? { style: { color: 'rgba(0,82,217)' } } : { })}
            >
              {item?.name}
            </span>
            <CloseOutlined onClick={(e) => handleCloseFile(item, e)} className="close" />
          </div>
        ))
      }
      </div>
      {
        currentChoosenFile?.path ? (
          <div className={styles['ide-editor-container']}>
              <span className={styles['path']}>
                {currentChoosenFile.path}
              </span>
              <div style={{ flex: 1 }}>
                <BaseEditor
                  rules={rules}
                  width="100%"
                  height="100%"
                  path={currentChoosenFile?.path}
                  language={currentChoosenFile?.language}
                  theme="vs-dark"
                  value={currentChoosenFile?.value}
                  onChange={handleChangeContent}
                  onValidate={handleValidate}
                />
              </div>
              <div className={styles['button-container']}>
                <Button onClick={handleSave}>保存</Button>
              </div>
          </div>
        ) : (
          <div className={styles['empty-container']}>
            <span>请先选择文件</span>
          </div>
        )
      }
    </div>
  )
}

export default Editor


