import React from 'react'
import _ from 'lodash'
import { PicLeftOutlined, PicRightOutlined, CloseOutlined } from '@ant-design/icons'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Radio, Tooltip } from 'antd'
import styles from './index.module.css'

function Float(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.float'

  const value = _.get(nodeProps, prop)

  const handleChange = (v: any) => {
    onChange?.(prop, v?.target?.value)
  }

  return (
    <StyleSetterLayout
      label="浮动方向"
      content={
        <Radio.Group
          onChange={handleChange}
          value={value}
          className={styles.group}
        >
          <Radio.Button value="none" className={styles.item}>
            <Tooltip
              placement='top'
              color='#fff'
              title={<span style={{color: 'rgba(0,0,0,0.6)'}}>none</span>}
            >
              <CloseOutlined style={value === 'none' ? { color: '#1890ff' } : {}} />
            </Tooltip>
          </Radio.Button>
          <Radio.Button value="left" className={styles.item}>
            <Tooltip
              placement='top'
              color='#fff'
              title={<span style={{color: 'rgba(0,0,0,0.6)'}}>left</span>}
            >
              <PicLeftOutlined style={value === 'left' ? { color: '#1890ff' } : {}} />
            </Tooltip>
          </Radio.Button>
          <Radio.Button value="right" className={styles.item}>
            <Tooltip
              placement='top'
              color='#fff'
              title={<span style={{color: 'rgba(0,0,0,0.6)'}}>right</span>}
            >
              <PicRightOutlined style={value === 'right' ? { color: '#1890ff' } : {}} />
            </Tooltip>
          </Radio.Button>
        </Radio.Group>
      }
    />
  )
}

export default Float