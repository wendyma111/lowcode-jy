import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { when } from 'mobx'
import { Popover } from 'antd'
import BindDataButton from 'designer/setter/binddata'
import BasicalLowCodeEditor from 'designer/logic/basicLowcodeEditor'
import baseStyle from 'designer/setter/base.module.css'
import { IProps } from 'designer/setter/base.type'
import { getModel } from 'model'
import styles from './index.module.css'

export const model_detail = {
  /**
   * 低代码模块唯一标识，以/开头
   */
  path: '/custom_style',
  /**
   * 低代码模块使用的编程语言
   */
  language: 'typescript',
  /**
   * ide中的显示值
   */
  value: `{
  // style样式对象
}`,
}

function CustomStyle(props: IProps) {
  const { nodeProps, onChange } = props
  const [open, toggleOpen] = useState(false)
  const [editorValue, changeEditorValue] = useState(nodeProps?.['__customStyle']?.value ?? model_detail.value)

  useEffect(() => {
    if (nodeProps['__customStyle']?.type === 'JSExpression' && nodeProps['__customStyle']?.value) {
      changeEditorValue(nodeProps['__customStyle'].value)
    } else {
      changeEditorValue(model_detail.value)
    }
  }, [nodeProps, nodeProps['__customStyle']])

  const content = (
    <BasicalLowCodeEditor
      width={300}
      height={300}
      path={model_detail.path}
      language={model_detail.language}
      theme="light"
      value={editorValue}
      onChange={changeEditorValue}
    />
  )

  const handleSave = () => {
    const { projectModel } = getModel()

    onChange('__customStyle', { type: 'JSExpression', value: editorValue })

    when(
      () => !!projectModel?.designer?.logic?.ctxDesignMode[projectModel?.currentDocument?.id as string],
      () => {
        const lowcodeExecute = projectModel?.designer?.logic?.ctxDesignMode[projectModel?.currentDocument?.id as string]
        if (_.isNil(lowcodeExecute)) return

        lowcodeExecute.autoExecute?.(
          `() => (${editorValue})`,
          'auto',
          (newValue) => {
            onChange('style', _.assign(nodeProps.style ?? {}, newValue))
          }
        )
      }
    )
  }

  return (
    <Popover
      title={(<div className={styles['space-between']}>
        <span>自定义样式编辑</span>
        <div>
          <span className={styles.save} onClick={handleSave}>保存</span>
          <span className={styles.cancel} onClick={() => toggleOpen(false)}>取消</span>
        </div>
      </div>)}
      open={open}
      content={content}
      placement='left'
    >
      <div className={baseStyle.container}>
      <div className={styles['space-between']}>
        <span>style</span>
        <BindDataButton onClick={() => toggleOpen(preOpen => !preOpen)} />
      </div>
    </div>
    </Popover>
  )
}

export default CustomStyle