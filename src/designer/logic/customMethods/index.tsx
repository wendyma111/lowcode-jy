import React, { useReducer, useMemo, useRef, useState, useEffect } from 'react'
import _ from 'lodash'
import { message, Modal, FormInstance } from 'antd'
import { IProps, IMethodInfo, IAction, IExtraNavigate, IExtraDispatch } from './index.type'
import styles from './index.module.css'
import EmptyPng from 'resource/empty.png'
import NavigateExtra from './navigateExtra'
import DispatchExtra from './dispatchExtra'
import CustomExtra from './customExtra'

export const builtInApis = {
  dispatch: {
    path: '$api.dispatch',
    label: '数据源修改'
  },
  navigate: {
    path: '$api.navigate',
    label: '页面跳转'
  }
}

type Reducer = (preState: IMethodInfo | null, action: IAction) => IMethodInfo | null

// @ts-ignore
const reducer: Reducer = function (preState, action) {
  switch (action.type) {
    case 'init': {
      return {
        ...action.payload
      }
    }
    case 'event': {
      return {
        ...preState,
        event: action.payload
      }
    }
    case 'extra': {
      return {
        ...preState,
        extra: action.payload
      }
    }
    case 'path': {
      return {
        ...preState,
        path: action.payload
      }
    }
    case 'clear': {
      return null;
    }
  }
}

function CustomMethods(props: IProps) {
  const extraForm = useRef<null | FormInstance<any>>(null)
  const { open, toggleOpen, methodInfo, node } = props
  const [eventInfo, eventInfoDispatch] = useReducer<Reducer>(reducer, methodInfo ?? null)
  const [custom, toggleCustom] = useState(false)

  useEffect(() => {
    eventInfoDispatch({ type: 'init', payload: methodInfo })
  }, [methodInfo])

  const closeModal = () => {
    toggleOpen(false)
  }

  useEffect(() => {
    if (eventInfo?.path) {
      if (_.find(builtInApis, (api) => api.path === eventInfo?.path)) {
        toggleCustom(false)
      } else {
        toggleCustom(true)
      }
    }
  }, [eventInfo?.path])

  useEffect(() => {
    if (custom) {
      eventInfoDispatch({ type: 'path', payload: null })
      extraForm.current = null
    }
  }, [custom])

  const events = useMemo(() => {
    return _.values(node.getComponentMeta().settings).filter(setting => {
      return setting.type === "event"
    })
  }, [node])

  const chooseEvent = (methodName: string) => {
    eventInfoDispatch({ type: 'event', payload: methodName })
  }

  const choosenStyle = { background: 'rgba(0,0,0,0.1)' }

  const handleSave = () => {
    if (extraForm.current) {
      extraForm.current
        .validateFields()
        .then((extra: IExtraNavigate | IExtraDispatch) => {
          const finalInfo = { ...eventInfo, extra }
          if (validateEventInfo(finalInfo)) {
            node.setPropValue((finalInfo as IMethodInfo).event as string, {
              type: 'JSFunction',
              path: finalInfo.path,
              extra
            })
          } else {
            message.warning('信息填写不完整')
          }
          closeModal()
        })
        .catch(() => {
          message.warning('信息填写不完整')
        })
    }

    if (validateEventInfo(eventInfo as IMethodInfo)) {
      node.setPropValue((eventInfo as IMethodInfo).event as string, {
        type: 'JSFunction',
        path: (eventInfo as IMethodInfo).path,
        extra: (eventInfo as IMethodInfo).extra
      })
      closeModal()
    } else {
      message.warning('信息填写不完整')
    }
  }

  const validateEventInfo = (eventInfo: IMethodInfo) => {
    const { event, path, extra } = eventInfo ?? {}
    return event && path && extra || event && path?.split?.('.')?.[1] === 'custom'
  }

  const chooseBuiltInMethod = (path: string) => {
    eventInfoDispatch({ type: 'path', payload: path })
  }

  const chooseCustomMethod = () => {
    toggleCustom(true)
  }

  return (
    <Modal
      centered
      open={open}
      onOk={handleSave}
      onCancel={closeModal}
      afterClose={() => eventInfoDispatch({ type: 'clear' })}
    >
      <div className={styles.container}>
        <div className={styles['list']}>
          <div className={styles['title']}>事件类型</div>
          {events.map((e) => {
            return (
              <div
                key={e.settingName}
                className={styles['item']}
                style={eventInfo?.event === e.settingName ? choosenStyle : {}}
                onClick={() => chooseEvent(e.settingName)}
              >
                {e.label}
              </div>
            )
          })}
        </div>
        <div className={styles['list']}>
          <div className={styles['title']}>事件方法</div>
          {eventInfo?.event ? (
            <>
              <div className={styles['builtin-api']}>
                {_.values(builtInApis).map(
                  (item) => (
                    <div
                      key={item.path}
                      style={eventInfo.path === item.path ? choosenStyle : {}}
                      className={styles['item']}
                      onClick={() => chooseBuiltInMethod(item.path)}
                    >
                      {item.label}
                    </div>
                  )
                )}
              </div>
              <div className={styles['custom-api']}>
                <div
                  style={custom ? choosenStyle : {}}
                  className={styles['item']}
                  onClick={chooseCustomMethod}
                >
                  自定义事件
                </div>
              </div>
            </>
          ) : (
            <div className={styles['empty-container']}>
              <img src={EmptyPng} style={{ width: 80 }} />
            </div>
          )}
        </div>
        <div className={styles.extra}>
          <div className={styles['title']}>事件详情</div>
          {
            (eventInfo?.event && (eventInfo?.path || custom)) ? (
              <>
                {eventInfo?.path === '$api.navigate' && <NavigateExtra ref={extraForm} extra={eventInfo?.extra as IExtraNavigate} />}
                {eventInfo?.path === '$api.dispatch' && <DispatchExtra ref={extraForm} extra={eventInfo?.extra as IExtraDispatch} />}
                {custom && <CustomExtra eventInfo={eventInfo} eventInfoDispatch={eventInfoDispatch} />}
              </>
            ) : (
              <div className={styles['empty-container']}>
                <img src={EmptyPng} style={{ width: 150 }} />
              </div>
            )
          }
        </div>
      </div>
    </Modal>
  )
}

export default CustomMethods