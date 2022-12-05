import React, { useCallback } from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { ColorPicker } from '../../text/color'

function Background(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.background'
  const value = _.get(nodeProps, prop)

  const handleChange = (v: any) => {
    onChange?.(prop, v)
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