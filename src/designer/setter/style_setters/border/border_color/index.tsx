import React from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { ColorPicker } from '../../text/color'

function BorderColor(props: IProps) {
  const { onChange, nodeProps } = props
  const prop = 'style.borderColor'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: string) => {
    onChange?.(prop, v)
  }

  return (
    <StyleSetterLayout label="边框颜色" content={<ColorPicker value={value} onChange={handleChange} />} />
  )
}

export default BorderColor