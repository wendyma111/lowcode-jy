import React from 'react'
import _ from 'lodash'
import { InputNumber } from 'antd'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'

function LineHeight(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.lineHeight'
  const value = parseInt(_.get(nodeProps, prop))

  const handleChange = (v: any) => {
    onChange?.(prop, `${v}px`)
  }

  return <StyleSetterLayout 
    label="行高"
    content={
      <InputNumber 
        style={{ width: '100%' }}
        value={value}
        onChange={handleChange}
        addonAfter="px"
      />
    }
  />
}

export default LineHeight