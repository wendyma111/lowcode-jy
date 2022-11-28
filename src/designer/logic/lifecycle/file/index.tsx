import React, { useMemo, useContext } from 'react'
import { runInAction } from 'mobx'
import { FileTextOutlined, DeleteOutlined } from '@ant-design/icons'
import { getModel } from 'model'
import { FileContext } from '../index'
import styles from '../index.module.css'

function File(props: any) {
  const { choosenFiles, setChoosenFiles, currentChoosenFile, setCurrentChoosenFile } = useContext(FileContext)
  const { fileInfo } = props

  const paddingLeft = useMemo(() => {
    return (fileInfo.path.split('/').filter((item: string) => item).length - 1) * 8 + 20
  }, [fileInfo])

  const handleClick = () => {
    const fileIndex = choosenFiles.findIndex((item: any) => item?.path === fileInfo?.path)
    if (fileIndex === -1) {
      setChoosenFiles([...choosenFiles, fileInfo])
    }
    setCurrentChoosenFile(fileInfo)
  }

  const deleteHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    runInAction(() => {
      const { projectModel } = getModel()
      const lifeCycleFiles = projectModel.designer.logic.lifeCycleFiles
      projectModel.designer.logic.lifeCycleFiles = lifeCycleFiles.filter(file => {
        return file.path !== fileInfo.path
      })
    })
  }

  return (
    <div
      className={styles['item-container']}
      style={{
        paddingLeft,
        paddingRight: 20,
        background: currentChoosenFile?.path === fileInfo.path ? '#d3e2fb' : '#fafafa'
      }}
      onClick={handleClick}
    >
        <div>
          <FileTextOutlined className={`name ${styles['filetext-icon']}`} />
          <span
            className="name"
            {...(currentChoosenFile?.path === fileInfo.path ? { style: { color: '#0052d9' } } : {})}
          >
            {fileInfo.name}
          </span>
        </div>
        {fileInfo.path.startsWith('/global/handlers/') && <DeleteOutlined onClick={deleteHandler} />}
    </div>
  )
}

export default File