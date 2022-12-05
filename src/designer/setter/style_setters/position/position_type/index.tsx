import React from 'react'
import _ from 'lodash'
import { IProps } from 'designer/setter/base.type'
import StyleSetterLayout from 'designer/setter/base'
import { Select, InputNumber } from 'antd'

function PositonType(props: IProps) {
  const { nodeProps, onChange } = props
  const prop = 'style.position'
  const leftProp = 'style.left'
  const topProp = 'style.top'

  const value = _.get(nodeProps, prop)
  const leftValue =  _.get(nodeProps, leftProp)
  const topValue =  _.get(nodeProps, topProp)

  const handleChange = (v: string) => {
    onChange?.(prop, v)
  }

  const handeChangeLeft = (v: any) => {
    onChange?.(leftProp, v)
  }

  const handeChangeTop = (v: any) => {
    onChange?.(topProp, v)
  }

  return (
    <>
      <StyleSetterLayout
        label="定位"
        content={
          <Select
            onChange={handleChange} 
            style={{ width: '100%' }}
            value={value}
            options={[
              {
                label: 'static',
                value: 'static'
              },
              {
                label: 'relative',
                value: 'relative'
              },
              {
                label: 'absolute',
                value: 'absolute'
              },
              {
                label: 'fixed',
                value: 'fixed'
              },
              {
                label: 'sticky',
                value: 'sticky'
              },
            ]}
          />}
      />
      {value === 'absolute' && <StyleSetterLayout
        label="top"
        content={
          <InputNumber
            addonAfter="px"
            style={{ width: '100%' }}
            value={leftValue}
            onChange={handeChangeLeft}
          />
        }
      />
      }
      {value === 'absolute' &&  <StyleSetterLayout
        label="left"
        content={
          <InputNumber
            addonAfter="px"
            style={{ width: '100%' }}
            value={topValue}
            onChange={handeChangeTop}
          />
        }
      />}
    </>
    
  )
}

export default PositonType