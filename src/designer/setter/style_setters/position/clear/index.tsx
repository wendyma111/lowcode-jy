import React from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Select } from 'antd'

function Clear(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.clear'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: any) => {
    onChange?.(prop, v)
  }

  return (
    <StyleSetterLayout
      label="清除"
      content={
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={handleChange}
          options={[
            {
              label: 'none',
              value: 'none'
            },
            {
              label: 'left',
              value: 'left'
            },
            {
              label: 'right',
              value: 'right'
            },
            {
              label: 'both',
              value: 'both'
            },
          ]}
        />
      }
    />
  )
}

export default Clear