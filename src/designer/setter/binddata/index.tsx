import React from 'react'
import { Tooltip } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import styles from './index.module.css'

function BindDataButton(props: any) {
  return (
    <Tooltip placement="left" title="绑定数据">
      <LinkOutlined {...props} className={styles['bind-data']} />
    </Tooltip>
  )
}

export default BindDataButton