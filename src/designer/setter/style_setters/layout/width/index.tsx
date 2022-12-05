import React from 'react'
import _ from 'lodash'
import { InputNumber } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'

function Width(props: IProps) {
  const { nodeProps, onChange } = props

  const width = _.get(nodeProps, 'style.width')

  const handleChange = (v: any) => {
    onChange?.('style.width', v)
  }

  return (
    <StyleSetterLayout
      label="宽度"
      content={
        <InputNumber
          addonAfter="px"
          style={{ width: '100%' }}
          value={width}
          onChange={handleChange}
        />
      }
    />
  )
}

export default Width