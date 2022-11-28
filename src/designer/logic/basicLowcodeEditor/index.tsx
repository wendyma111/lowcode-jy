/**
 * 基础低代码模块组件，平台上所有ide继承自该组件
 * 1、统一加载ts定义
 * 2、统一处理代码检查
 */
import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Tooltip } from 'antd'
import Editor, { Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import AstCheck from '../astCheck'
import { AstCheckType } from '../astCheck/index.type'
import { IProps, IMarker, IEditor, IModel } from './index.type'
import styles from './index.module.css'

function BasicalLowCodeEditor(props: IProps) {
  const { rules = [], width, height } = props
  const astCheckRef = useRef<AstCheckType>()
  const monacoRef = useRef<Monaco | null>(null)
  const modelRef = useRef<IModel>()
  const editorRef = useRef<IEditor>()
  const customMarkersRef = useRef<Array<Partial<IMarker>>>([])

  useEffect(() => {
    if (astCheckRef.current) return

    astCheckRef.current = new AstCheck(rules)
    astCheckRef.current.subscribeMarks((markers) => {
      if (!markers || !markers?.length) return
      customMarkersRef.current = markers

      if (modelRef.current && monacoRef.current) {
        const _languageId = modelRef.current.getLanguageId()
        monacoRef.current.editor.setModelMarkers(
          modelRef.current,
          _languageId,
          customMarkersRef.current as IMarker[]
        )
      }
    })
  }, [rules])

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco
    monacoRef.current.languages.typescript.typescriptDefaults.addExtraLib(`
      declare const $state:any;
      declare const $api:any;
    `)
  }

  const handleChange = (value: string | undefined, e: monaco.editor.IModelContentChangedEvent,) => {
    astCheckRef.current && astCheckRef.current.parse(value as string)
    props.onChange && props.onChange(value, e)
  }

  const handleValidate = (markers: IMarker[]) => {
    props.onValidate && props.onValidate(markers)
  }

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const { path } = props
    const models = monaco.editor.getModels()
    const targetModel = _.find(models, (item) => { return item.uri.path === path })
    modelRef.current = targetModel
    editorRef.current = editor
    props.onMount && props.onMount(editor, monaco)
  }

  const handleCheckInstruction = () => {
    // @todo 打开低代码介绍
  }

  return (
    <div className={styles.container} style={{ width, height }}>
      <div className={styles.mention} style={{ background: props.theme === 'light' ? '#fff' : 'rgba(0,0,0,.85)'}}>
        <Tooltip placement="top" title="低代码编辑器介绍">
          <ExclamationCircleFilled
            className={styles.icon}
            style={{ color: props.theme === 'light' ? '#000' : '#fff' }}
            onClick={handleCheckInstruction}
          />
        </Tooltip>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          {...props}
          theme={props.theme ?? 'vs-dark'}
          height="100%"
          beforeMount={handleEditorWillMount}
          onChange={handleChange}
          onValidate={handleValidate}
          onMount={handleMount}
        />
      </div>
    </div>
  )
}

export default BasicalLowCodeEditor