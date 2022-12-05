import React from 'react'
import _ from 'lodash'
import { Slider, InputNumber, Row, Col } from 'antd'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import styles from './index.module.css'

function BorderRadius(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.borderRadius'
  const value = _.get(nodeProps, prop)
  const handleChange = (v: any) => {
    onChange?.(prop, v)
  }

  return (
    <StyleSetterLayout label="圆角" content={(
      <div className={styles.container}>
        <div className={styles.slider}>
          <Slider min={0} max={40} value={value} onChange={handleChange} />
        </div>
        <div className={styles.input}>
          <InputNumber style={{ width: '100%' }} min={0} value={value} onChange={handleChange} />
        </div> 
      </div>
    )} />
  )
}

export default BorderRadius