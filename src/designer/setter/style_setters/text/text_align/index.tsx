import React, { useCallback } from 'react'
import { Radio, RadioChangeEvent } from 'antd'
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined } from '@ant-design/icons'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import styles from './index.module.css'

function TextAlign(props: IProps) {
  const { value = 'left', onChange } = props

  const handleChange = useCallback((e: RadioChangeEvent) => {
    onChange?.('style.textAlign', e.target.value)
  }, [onChange])

  return (
    <StyleSetterLayout
      label="对齐"
      content={(
        <Radio.Group className={styles.group} value={value} onChange={handleChange}>
          <Radio.Button className={styles.item} value="left">
            <AlignLeftOutlined />
          </Radio.Button>
          <Radio.Button className={styles.item} value="center">
            <AlignCenterOutlined />
          </Radio.Button>
          <Radio.Button className={styles.item} value="right">
            <AlignRightOutlined />
          </Radio.Button>
        </Radio.Group>
      )}
    />
  )
}

export default TextAlign