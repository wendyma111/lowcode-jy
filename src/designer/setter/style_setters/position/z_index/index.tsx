import React from 'react'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { InputNumber } from 'antd'

function ZIndex(props: IProps) {
  const { value = 0, onChange } = props

  const handleChange = (v: any) => {
    onChange?.('style.zIndex', v)
  }

  return (
    <StyleSetterLayout 
      label="层叠顺序"
      content={<InputNumber style={{ width: '100%' }} onChange={handleChange} value={value}/>}
    />
  )
}

export default ZIndex