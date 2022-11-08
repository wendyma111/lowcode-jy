import React, { useState, useRef} from 'react'
import styles from './index.module.css'
import { Menu, MenuProps } from 'antd'

function RightArea() {
  const [currentTab, setCurrentTab] = useState<string>('style')
  const items = useRef([
    {
      label: '样式',
      key: 'style'
    },
    {
      label: '属性',
      key: 'attribute'
    },
    {
      label: '大纲树',
      key: 'outline_tree'
    }
  ])

  const handleChangeTab: MenuProps['onClick'] = (e) => {
    setCurrentTab(e.key)
  }

  return (
    <div className={styles.container}>
      <Menu mode="horizontal" items={items.current} onClick={handleChangeTab}/>
    </div>
  )
}

export default RightArea