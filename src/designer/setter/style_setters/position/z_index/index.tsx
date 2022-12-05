import React from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { InputNumber } from 'antd'

function ZIndex(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.zIndex'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: any) => {
    onChange?.(prop, v)
  }

  return (
    <StyleSetterLayout 
      label="层叠顺序"
      content={
        <InputNumber
          style={{ width: '100%' }}
          onChange={handleChange}
          value={value}
        />
      }
    />
  )
}

export default ZIndex