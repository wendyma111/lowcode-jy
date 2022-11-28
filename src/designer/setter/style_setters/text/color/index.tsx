import React, { useCallback, useEffect, useState } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { Input, Popover } from 'antd'
import _ from 'lodash'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'
import styles from './index.module.css'

export function ColorPicker(props: { value: string, onChange: (v: string) => void }) {
  const { value = '#fff', onChange } = props
  const [color, setColor] = useState(value.replace('#', ''))
  const hexReg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  const changeColorByPicker = useCallback((color: ColorResult) => {
    onChange?.(color.hex)
    setColor(color.hex.replace('#', ''))
  }, [])

  const changeColorByInput = useCallback((e: { target: { value: string } }) => {
    setColor(e.target.value)
    if (hexReg.test(e.target.value)) {
      onChange?.(`#${e.target.value}`)
    }
  }, [])
  return (
    <div className={styles['color-container']}>
      <Popover
        trigger="click"
        content={<SketchPicker color={value} onChangeComplete={changeColorByPicker} />}
      >
        <div className={styles['color-block']} style={{ background: value }} />
      </Popover>
      <Input
        className={styles['color-input']}
        value={color}
        maxLength={6} 
        prefix="#"
        onChange={changeColorByInput}
      />
    </div>
  )
}
 
function ColorSetter(props: IProps) {
  const { nodeProps, onChange } = props
  const value = _.get(nodeProps, 'style.color')
  
  const handleChange = (v: string) => {
    onChange?.('style.color', v)
  }

  return (
    <StyleSetterLayout
      label="文字颜色"
      content={<ColorPicker value={value} onChange={handleChange} />}
    />
  )
}

export default ColorSetter