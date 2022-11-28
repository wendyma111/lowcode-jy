import React, { useEffect, useState } from 'react'
import StyleSetterLayout from 'designer/setter/base'
import { InputNumber } from 'antd'
import styles from 'designer/setter/base.module.css'
import _ from 'lodash'

function NumberSetter(
  props: { label: string, value: any, onChange: (v: any) => void, extra: React.ReactElement | null }
) {
  const { label, value, onChange: originOnChange, extra } = props
  const [inputvalue, setInputvalue] = useState(value)

  useEffect(() => {
    if (value !== inputvalue && value?.type !== 'JSExpression') {
      setInputvalue(value)
    }
  }, [value])

  const onChange = _.throttle((v: number) => {
    originOnChange(v)
  }, 300)

  const handleChange = (v: number | null) => {
    if (v === null) return
    setInputvalue(v)
    onChange(v)
  }

  return (
    <StyleSetterLayout
      label={label}
      content={(
        <div style={{display: 'flex'}}>
          <div style={{ flex: 1 }}>
            {value?.type === 'JSExpression'
              ? (<div className={styles['expression-background']}>{value.value}</div>)
              : (<InputNumber style={{ width: '100%' }} value={inputvalue} onChange={handleChange} />)
            }
          </div> 
          {extra ?? null}
        </div>
      )}
    />
  )
}
 
export default NumberSetter