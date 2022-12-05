import React from 'react'
import _ from 'lodash'
import { InputNumber } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from 'designer/setter/base.type'

function FontSize(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.fontSize'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: any) => {
    onChange?.(prop, v)
  }
  
  return (
    <StyleSetterLayout label="字体大小" content={<InputNumber value={value} onChange={handleChange} addonAfter={'px'} />} />
  )
}

export default FontSize