import React, { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useState, useRef } from 'react'
import rendererFactory from 'renderer'
import { useNavigate, useParams } from 'react-router-dom'
import { createRoot } from 'react-dom/client';
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
      gobackToEditor('/')
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
      // @ts-ignore
      onMouseUp={handleMouseUp}
      className={styles['suspension-container']}
    >
      返回
    </div>
  )
}

function Preview() {
  const params = useParams()
  const originNavigate = useNavigate()
  const setIframe = useRef<Dispatch<SetStateAction<HTMLIFrameElement | null>>>()

  const navigate = useCallback((path: string) => {
    originNavigate(`/preview/${path}`)
  }, [])

  const mountPreview = (ref: HTMLIFrameElement | null) => {
    setIframe.current?.(ref)
    
    if (ref) {
      console.clear()
      console.log('%c ---------- 预览模式开启 ----------', 'background: green;color: #fff')
      
      const root = ref.contentDocument?.createElement('div')
      ref.contentDocument?.body.appendChild(root as HTMLDivElement)
      const reactRoot = createRoot(root as HTMLDivElement)
      const Preview = rendererFactory.previewFactory()
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