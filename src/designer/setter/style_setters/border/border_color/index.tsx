import React from 'react'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { ColorPicker } from '../../text/color'

function BorderColor(props: IProps) {
  const { onChange, value } = props
  const prop = 'style.border-color'

  const handleChange = (v: string) => {
    onChange?.(prop, v)
  }

  return (
    <StyleSetterLayout label="边框颜色" content={<ColorPicker value={value} onChange={handleChange} />} />
  )
}

export default BorderColor