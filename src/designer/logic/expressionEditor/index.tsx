import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { IMarker } from 'designer/logic/basicLowcodeEditor/index.type'
import { InfoCircleOutlined } from '@ant-design/icons'
import BaseEditor from 'designer/logic/basicLowcodeEditor'
import styles from './index.module.css'
import rules from './rules'
import { IProps } from './index.type'
import lowcodeInstruction from '../lowcodeInstruction'

export const model_detail = {
  /**
   * 低代码模块唯一标识，以/开头
   */
  path: '/bind_data',
  /**
   * 低代码模块使用的编程语言
   */
  language: 'typescript',
  /**
   * ide中的显示值
   */
  value: '// 此处编写代码 如: $state.global.xxx',
}

function ExpressionEditor(props: IProps) {
  const { markerRef, setPath, path } = props
  const [markers, setMarkers] = useState<IMarker[]>([])
  const [editorValue, setEditorValue] = useState(path ?? model_detail.value)

  const handleChange = _.throttle((v: string) => {
    setEditorValue(v)
    setPath(v)
  }, 300)

  useEffect(() => {
    markerRef.current = markers
  }, [markers])

  useEffect(() => {
    return () => {
      markerRef.current = []
    }
  }, [])

  const onValidate = (mark: IMarker[]) => {
    setMarkers(mark)
  }

  const openInstruction = () => {
    lowcodeInstruction()
  }

  return (
    <div className={styles.container}>
      <div className={styles.comment}>
        <InfoCircleOutlined style={{ marginTop: 5, color: '#7e0dcc' }} />
        <div className={styles['comment-info']}>
          <div>低代码使用手册</div>
          <div>全局变量：可通过$state.[变量作用域].[变量标识]访问数据源，例如：$state.global.text</div>
          <div>
            全局方法：可使用内置方法 / 自定义方法, 内置方法 - $api.dispatch(变量路径，目标值)、$api.navigate(页面id)，自定义方法 - $api.custom.[方法标识]
          </div>
          <div style={{ color: '#1890ff', cursor: 'pointer' }} onClick={openInstruction}>点击查看更多帮助</div>
        </div>
      </div>
      <BaseEditor
        width="100%"
        height="100%"
        theme="vs-dark"
        path={model_detail.path}
        defaultLanguage={model_detail.language}
        value={editorValue}
        onChange={handleChange as any}
        onValidate={onValidate}
        rules={rules}
      />
    </div>
  )
}

export default ExpressionEditor
