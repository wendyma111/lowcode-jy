import React from 'react'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { ColorPicker } from '../../text/color'

function Background(props: IProps) {
  const { value = '#fff', onChange } = props

  const handleChange = (v: any) => {
    onChange?.('style.background', v)
  }

  return (
    <StyleSetterLayout
      label="背景颜色"
      content={
        <ColorPicker value={value} onChange={handleChange} />
      }
    />
  )
}

export default Background