import React from 'react'
import { Select } from 'antd'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'

function FontWeight(props: IProps) {
  const { value = 400, onChange } = props

  const handleChange = (v: number) => {
    onChange?.('style.fontWeight', v)
  }

  return (
    <StyleSetterLayout
      label="字重"
      content={
        <Select
          style={{ width: '100%' }}
          value={value}
          onChange={handleChange}
          options={[
            {
              value: 100,
              label: '100 Thin'
            },
            {
              value: 200,
              label: '200 Extra Light'
            },
            {
              value: 300,
              label: '300 Light'
            },
            {
              value: 400,
              label: '400 Normal'
            },
            {
              value: 500,
              label: '500 Medium'
            },
            {
              value: 600,
              label: '600 Semi Bold'
            },
            {
              value: 700,
              label: '700 Bold'
            },
          ]}
        />
      }
    />
  )
}

export default FontWeight