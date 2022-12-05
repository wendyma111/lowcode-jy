import React from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Select } from 'antd'

function BorderStyle(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.borderStyle'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: string) => {
    onChange?.(prop, v)
  }

  return (<StyleSetterLayout label="边框样式" content={
    <Select
      style={{ width: '100%' }}
      value={value}
      onChange={handleChange}
      options={[
        {
          value: 'solid',
          label: 'solid'
        },
        {
          value: 'dashed',
          label: 'dashed'
        },
        {
          value: 'dotted',
          label: 'dotted'
        }
      ]}
    />
  } />)
}

export default BorderStyle