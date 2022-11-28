import React, { useState, useRef, useEffect } from 'react'
import _ from 'lodash'
import { autorun } from 'mobx'
import styles from './index.module.css'
import { Menu, MenuProps } from 'antd'
import OutlineTree from './outline_tree'
import StyleSetter from './style_config'
import AttributeConfig from './attribute_config'
import { getModel } from 'model'

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

  useEffect(() => {
    autorun(() => { 
      const { projectModel } = getModel()
      const { dragObject } = projectModel.designer.dragon

      if (!_.isNil(dragObject) && currentTab !== 'outline_tree') {
        setCurrentTab('outline_tree')
      }
    })
  }, [currentTab])

  const handleChangeTab: MenuProps['onClick'] = (e) => {
    setCurrentTab(e.key)
  }

  return (
    <div className={styles.container}>
      <Menu selectedKeys={[currentTab]} defaultSelectedKeys={['style']} mode="horizontal" items={items.current} onClick={handleChangeTab}/>
      {currentTab === 'outline_tree' && <OutlineTree />}
      {currentTab === 'style' && <StyleSetter />}
      {currentTab === 'attribute' && <AttributeConfig />}
    </div>
  )
}

export default RightArea