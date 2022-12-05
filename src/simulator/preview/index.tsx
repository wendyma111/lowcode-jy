import React, { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useState, useRef } from 'react'
import rendererFactory from 'renderer'
import _ from 'lodash'
import { toJS, observable, runInAction, makeObservable } from 'mobx';
import { useNavigate, useParams } from 'react-router-dom'
import { createRoot } from 'react-dom/client';
import { clone } from 'designer/logic/lowcodeExecute/utils'
import { getModel } from 'model'
import styles from './index.module.css'

export function SuspensionButton(
  props: { setIframe: MutableRefObject<Dispatch<SetStateAction<HTMLIFrameElement | null>>> }
) {
  const [x, setX] = useState(25)
  const [y, setY] = useState(50)
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>()
  props.setIframe.current = setIframe as Dispatch<SetStateAction<HTMLIFrameElement | null>>

  const initialPosition = useRef<{x: number; y: number}>({ x, y })
  const gobackToEditor = useNavigate()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    iframe && iframe.contentDocument?.addEventListener('mousemove', handleMouseMove)
    iframe && iframe.contentDocument?.addEventListener('mouseup', handleMouseUp)

    initialPosition.current.x = e.clientX
    initialPosition.current.y = e.clientY
  }, [iframe])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    iframe && iframe.contentDocument?.removeEventListener('mousemove', handleMouseMove)
    iframe && iframe.contentDocument?.removeEventListener('mouseup', handleMouseUp)

    if (Math.abs(e.clientX - initialPosition.current.x) < 10 && Math.abs(e.clientY - initialPosition.current.y) < 10) {
      gobackToEditor(`/${window.location.search}`)
    }
  }, [iframe])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setX(e.clientX)
    setY(e.clientY)
  }, [])

  useEffect(() => {
    return () => {
      iframe && iframe.contentDocument?.removeEventListener('mousemove', handleMouseMove)
      iframe && iframe.contentDocument?.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div
      style={{ transform: `translate(${x - 25}px, ${y - 25}px)` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp as any}
      className={styles['suspension-container']}
    >
      返回
    </div>
  )
}

function Preview() {
  const params = useParams()
  const storeRef = useRef<any>(null)
  const originNavigate = useNavigate()
  const setIframe = useRef<Dispatch<SetStateAction<HTMLIFrameElement | null>>>()

  const navigate = useCallback((path: string) => {
    originNavigate(`/preview/${path}`)
  }, [])

  const mountPreview = (ref: HTMLIFrameElement | null) => {
    /**
     * 在iframe中渲染返回按钮
     */
    setIframe.current?.(ref)

    /**
     * 生成store
     */
    if (!storeRef.current && ref) {
      const { projectModel } = getModel()
      class Store {
        constructor() {
          makeObservable(this, {
            $state: observable.ref,
          })
        }

        $state = clone(
          projectModel.designer.logic.$state,
          (ref as HTMLIFrameElement).contentWindow
        )

        $api = {
          dispatch: (path: string, value: any) => {
            runInAction(() => {
              try {
                /**
                 * 由于低代码模块统一使用代码字符串，mobx无法确定依赖关系
                 * 故调用dispatch时改变$state引用，使应用整体重新渲染
                 */
                this.$state = _.assign({}, _.set(this.$state, path, value))
              } catch(e) {
                console.error(`dispatch调用报错 ${e}`)
              }
            })
          }
        }

        add$api(path: string, value: any) {
          _.set(this.$api, path, value)
        }
      }

      storeRef.current = new Store()
    }

    if (ref) {
      console.clear()
      console.log('%c ---------- 预览模式开启 ----------', 'background: green;color: #fff')
      
      const preRoot = ref.contentDocument?.getElementById('root')
      if (preRoot) {
        preRoot?.parentNode?.removeChild?.(preRoot)
      }

      const root = ref.contentDocument?.createElement('div') as HTMLDivElement
      root.id = 'root'
      ref.contentDocument?.body.appendChild(root as HTMLDivElement)

      const reactRoot = createRoot(root as HTMLDivElement)
      const Preview = rendererFactory.previewFactory(ref as HTMLIFrameElement, storeRef.current)
      reactRoot.render(React.createElement(Preview, { navigate, pageId: params.pageId as string }))
    } else {
      console.clear()
      console.log('%c ---------- 预览模式关闭 ----------', 'background: yellow;color: #000')
    }
  }

  return (
    <>
      <SuspensionButton setIframe={setIframe as MutableRefObject<Dispatch<SetStateAction<HTMLIFrameElement | null>>>} />
      <iframe
        className={styles.iframe}
        id="preview-iframe"
        sandbox='allow-same-origin allow-scripts'
        ref={mountPreview}
      />
    </>
  )
}

export default Preview