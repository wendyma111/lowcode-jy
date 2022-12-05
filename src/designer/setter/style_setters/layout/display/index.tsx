import React from 'react'
import _ from 'lodash'
import { Select } from 'antd'
import StyleSetterLayout from 'designer/setter/base'
import { IProps } from '../../../base.type'

function Display(props: IProps) {
  const { nodeProps, onChange } = props
  const value = _.get(nodeProps, 'style.display')

  const flexDirection = 'style.flexDirection'
  const justifyContent = 'style.justifyContent'
  const alignItems = 'style.alignItems'

  const flexDirection_value = _.get(nodeProps, flexDirection)
  const justifyContent_value = _.get(nodeProps, justifyContent)
  const alignItems_value = _.get(nodeProps, alignItems)

  const handleChange = (v: string) => {
    onChange?.('style.display', v)
  }

  const handleChangeFlexDirection = (v: string) => {
    onChange?.(flexDirection, v)
  }

  const handleChangeJustifyContent = (v: string) => {
    onChange?.(justifyContent, v)
  }

  const handleChangeAlignItems = (v: string) => {
    onChange?.(alignItems, v)
  }

  return (
    <>
      <StyleSetterLayout
        label="布局模式"
        content={
          <Select
            value={value}
            onChange={handleChange}
            style={{ width: '100%' }}
            options={[
              {
                label: 'inline',
                value: 'inline'
              },
              {
                label: 'inline-block',
                value: 'inline-block'
              },
              {
                label: 'block',
                value: 'block'
              },
              {
                label: 'flex',
                value: 'flex'
              },
              {
                label: 'none',
                value: 'none'
              },
            ]}
          />
        }
      />
      {value === 'flex' && <StyleSetterLayout
        label="主轴方向"
        content={
          <Select
            value={flexDirection_value}
            onChange={handleChangeFlexDirection}
            style={{ width: '100%' }}
            options={[
              {
                label: 'row',
                value: 'row'
              },
              {
                label: 'row-reverse',
                value: 'row-reverse'
              },
              {
                label: 'column',
                value: 'column'
              },
              {
                label: 'column-reverse',
                value: 'column-reverse'
              }
            ]}
          />
        }
      />
      }
      {value === 'flex' && <StyleSetterLayout
        label="主轴分布"
        content={
          <Select
            value={justifyContent_value}
            onChange={handleChangeJustifyContent}
            style={{ width: '100%' }}
            options={[
              {
                label: 'flex-start',
                value: 'flex-start'
              },
              {
                label: 'flex-end',
                value: 'flex-end'
              },
              {
                label: 'center',
                value: 'center'
              },
              {
                label: 'space-between',
                value: 'space-between'
              },
              {
                label: 'space-around',
                value: 'space-around'
              }
            ]}
          />
        }
      />
      }
      {value === 'flex' && <StyleSetterLayout
        label="侧轴分布"
        content={
          <Select
            value={alignItems_value}
            onChange={handleChangeAlignItems}
            style={{ width: '100%' }}
            options={[
              {
                label: 'stretch',
                value: 'stretch'
              },
              {
                label: 'center',
                value: 'center'
              },
              {
                label: 'flex-start',
                value: 'flex-start'
              },
              {
                label: 'flex-end',
                value: 'flex-end'
              }
            ]}
          />
        }
      />
      }
    </>
  )
}

export default Display