import React from 'react'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Select } from 'antd'

function PositonType(props: IProps) {
  const { value = 'static', onChange } = props
  
  const handleChange = (v: string) => {
    onChange?.('style.positon', v)
  }

  return (
    <StyleSetterLayout
      label="定位"
      content={
        <Select
          onChange={handleChange} 
          style={{ width: '100%' }}
          value={value}
          options={[
            {
              label: 'static',
              value: 'static'
            },
            {
              label: 'relative',
              value: 'relative'
            },
            {
              label: 'absolute',
              value: 'absolute'
            },
            {
              label: 'fixed',
              value: 'fixed'
            },
            {
              label: 'sticky',
              value: 'sticky'
            },
          ]}
        />}
    />
  )
}

export default PositonType