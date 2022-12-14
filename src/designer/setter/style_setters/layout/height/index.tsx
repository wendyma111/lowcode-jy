import React from 'react'
import _ from 'lodash'
import { InputNumber } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'

function Height(props: IProps) {
  const { nodeProps, onChange } = props
  const value = _.get(nodeProps, 'style.height')
  const handleChange = (v: any) => {
    onChange?.('style.height', v)
  }

  return (
    <StyleSetterLayout
      label="高度"
      content={
        <InputNumber
          addonAfter="px"
          style={{ width: '100%' }}
          value={value}
          onChange={handleChange}
        />
      }
    />
  )
}

export default Height