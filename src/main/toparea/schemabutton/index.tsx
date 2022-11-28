import React, { useState } from 'react'
import _ from 'lodash'
import { Button, Drawer, message, Tooltip } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import BasicalLowCodeEditor from 'designer/logic/basicLowcodeEditor'
import { getModel } from 'model'

function SchemaButton() {
  const { projectModel } = getModel()
  const [open, setOpen] = useState<boolean>()

  const onClose = () => setOpen(false)

  const onOpen = () => setOpen(true)

  const schema = JSON.stringify(projectModel.schema, null, '\t')

  const handleCopy = () => {
    navigator.clipboard.writeText(schema as string)
    message.info('复制成功')
  }

  const forbidChange = _.throttle(() => {
    message.warning('禁止修改schema')
  }, 3000)

  return (
    <>
      <Button type="link" onClick={onOpen}>查看schema</Button>
      <Drawer
        title={(
          <div>
            <span style={{ marginRight: 10 }}>Schema</span>
            <Tooltip placement="bottom" title='点击复制'>
              <CopyOutlined onClick={handleCopy} />
            </Tooltip>
          </div>
        )}
        placement="right"
        onClose={onClose}
        open={open}
        width={650}
      >
        <BasicalLowCodeEditor
          width={'100%'}
          height={'100%'}
          theme="light"
          value={schema}
          language="json"
          path="/schema"
          onChange={forbidChange}
        />
      </Drawer>
    </>
  )
}

export default SchemaButton