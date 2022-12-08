import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import styles from './index.module.css'
import Logo from './logo'
import Menu from './menu'
import PreviewButton from './previewbutton'
import SchemaButton from './schemabutton'
import Auxiliary from './auxiliary'

class TopArea extends Component {

  render() {
    return <div className={styles.topContainer}>
      <div className={styles.left}>
        <Logo />
        <Menu />
      </div>
      <Auxiliary />
      <div className={styles.right}>
        <Tooltip title="查看文档">
          <QuestionCircleOutlined
            style={{ color: '#1890ff' }}
            onClick={() => window.open('https://wendyma111.github.io/lowcode-doc/')} 
          />
        </Tooltip>
        <SchemaButton />
        <PreviewButton />
      </div>
    </div>
  }
}

export default TopArea