import React, { useState, useCallback } from 'react'
import { UnorderedListOutlined } from '@ant-design/icons'
import { Dropdown, Menu as OriginMenu, Modal, Button } from 'antd'
import styles from './index.module.css'
import VariableContent from 'designer/logic/variableContent'
import Lifecycle from 'designer/logic/lifecycle'

function Menu() {
  const [variableVisible, setVariableVisible] = useState(false)
  const [lowcodeVisible, setLowcodeVisible] = useState(false)

  return (
    <>
      {/* 自定义变量 */}
      <Modal
        centered
        style={{ width: 950 }}
        title="变量" 
        open={variableVisible}
        onCancel={() => setVariableVisible(false)}
        onOk={() => setVariableVisible(false)}
      >
        <VariableContent />
      </Modal>
      {/* 低代码模块 */}
      <Lifecycle
        isModalVisible={lowcodeVisible}
        closeModal={() => setLowcodeVisible(false)}
      />
      <Button type="link" onClick={() => setVariableVisible(true)}>变量</Button>
      <Button type="link" onClick={() => setLowcodeVisible(true)}>低代码</Button>
    </>
  )
}

export default Menu