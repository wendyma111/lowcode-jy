import React from 'react'
import { InputNumber } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'

function Width(props: IProps) {
  const { value = 'auto', onChange } = props

  const handleChange = (v: any) => {
    onChange?.('style.width', v)
  }

  return (
    <StyleSetterLayout
      label="宽度"
      content={
        <InputNumber addonAfter="px" style={{ width: '100%' }} value={value} onChange={handleChange} />
      }
    />
  )
}

export default Width