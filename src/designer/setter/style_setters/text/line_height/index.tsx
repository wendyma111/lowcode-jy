import React from 'react'
import { InputNumber } from 'antd'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'

function LineHeight(props: IProps) {
  const { value = 22, onChange } = props

  const handleChange = (v: any) => {
    onChange?.('style.lineHeight', v)
  }

  return <StyleSetterLayout 
    label="行高"
    content={<InputNumber style={{ width: '100%' }} value={value} onChange={handleChange} addonAfter="px" />}
  />
}

export default LineHeight