import React from 'react'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Select } from 'antd'

function BorderStyle(props: IProps) {
  const { value = 'solid', onChange } = props

  const handleChange = (v: string) => {
    onChange?.('style.borderStyle', v)
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