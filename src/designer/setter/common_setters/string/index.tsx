import React, { useState, useEffect } from 'react'
import StyleSetterLayout from 'designer/setter/base'
import { Input } from 'antd'
import _ from 'lodash'
import styles from 'designer/setter/base.module.css'

function StringSetter(
  props: { label: string, value: any, onChange: (v: any) => void, extra: React.ReactElement | null }
) {
  const { label, value, onChange: originOnChange, extra } = props

  const [inputvalue, setInputvalue] = useState(value)

  const onChange = _.throttle((v: string) => {
    originOnChange(v)
  }, 300)

  useEffect(() => {
    if (value !== inputvalue && value?.type !== 'JSExpression') {
      setInputvalue(value)
    }
  }, [value])

  const handleChange = (e: any) => {
    setInputvalue(e.target.value)
    onChange(e.target.value)
  }

  return (
    <StyleSetterLayout
      label={label}
      content={
        <div style={{ display: 'flex' }}>
          {value?.type === 'JSExpression'
              ? (<div className={styles['expression-background']}>{value.value}</div>)
              : (<Input style={{ flex: 1 }} value={inputvalue} onChange={handleChange} />)
            }
          {extra ?? null}
        </div>
      }
    />
  )
}
 
export default StringSetter