import React from 'react'
import _ from 'lodash'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { getModel } from 'model'

function Auxiliary() {
  const { projectModel } = getModel()
  const { snapShotData, snapShotIndex } = projectModel.currentDocument as DocumentModel ?? {}

  const undoDisable = _.isNil(snapShotData) || _.isNil(snapShotData) ||  snapShotIndex <= 0
  const redoDisable = _.isNil(snapShotData) || _.isNil(snapShotData) || snapShotIndex >= snapShotData.length - 1

  const undo = _.throttle(() => {  
    if (undoDisable) return

    runInAction(() => {
      (projectModel.currentDocument as DocumentModel).snapShotIndex = (snapShotIndex as number) - 1;
      (projectModel.currentDocument as DocumentModel).rerender(snapShotData[snapShotIndex - 1]);
    })
  }, 500)

  const redo = _.throttle(() => {
    if (redoDisable) return

    runInAction(() => {
      (projectModel.currentDocument as DocumentModel).snapShotIndex = (snapShotIndex as number) + 1;
      (projectModel.currentDocument as DocumentModel).rerender(snapShotData[snapShotIndex + 1]);
    })
  }, 500)

  const style = (disable: boolean) => {
    return disable
            ? { color: 'rgba(0,0,0,0.3)', cursor: 'not-allowed' }
            : { color: '#1890ff', cursor: 'pointer' }
  }

  return (
    <div>
      <UndoOutlined style={{ fontSize: 16, marginRight: 20, ...style(undoDisable)}} onClick={undo} />
      <RedoOutlined style={{ fontSize: 16, ...style(redoDisable)}} onClick={redo} />
    </div>
  )
}

export default observer(Auxiliary)