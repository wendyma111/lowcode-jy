import React from 'react'
import { InputNumber } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from 'designer/setter/base.type'

function FontSize(props: IProps) {
  const { value = 16, onChange } = props

  const handleChange = (v: any) => {
    onChange?.('style.fontSize', v)
  }
  
  return (
    <StyleSetterLayout label="字体大小" content={<InputNumber value={value} onChange={handleChange} addonAfter={'px'} />} />
  )
}

export default FontSize