import React from 'react'
import { Select } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'

function Display(props: IProps) {
  const { value = 'block', onChange } = props

  const handleChange = (v: string) => {
    onChange?.('style.display', v)
  }

  return (
    <StyleSetterLayout
      label="布局模式"
      content={
        <Select
          value={value}
          onChange={handleChange}
          style={{ width: '100%' }}
          options={[
            {
              label: 'inline',
              value: 'inline'
            },
            {
              label: 'inline-block',
              value: 'inline-block'
            },
            {
              label: 'block',
              value: 'block'
            },
            {
              label: 'flex',
              value: 'flex'
            },
            {
              label: 'none',
              value: 'none'
            },
          ]}
        />
      }
    />
  )
}

export default Display