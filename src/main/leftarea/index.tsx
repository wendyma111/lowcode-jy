import React, { useCallback, useState, useRef } from 'react'
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons'
import styles from './index.module.css'
import ComponentSidebar from './component_sidebar'
import PageManage from './page_manage'

export const content_width = 312

function toggle(contentDom: HTMLElement, type: 'pull' | 'push', callbackAfterAnimation: () => void) {
  let cancelId: number
  function callback() {
    const currentStyle = Number(contentDom.style.transform.match(/(-)?\d+/g)?.[0] ?? 0)
    let newStyle = type === 'pull' ? currentStyle + 15 : currentStyle - 15
    contentDom.style.transform = `translate(${newStyle}px)`
    if (type === 'pull' && newStyle >= 0 && cancelId) {
      cancelAnimationFrame(cancelId)
      callbackAfterAnimation()
      return
    }
    if (type === 'push' && newStyle <= -1 * content_width && cancelId) {
      cancelAnimationFrame(cancelId)
      callbackAfterAnimation()
      return
    }

    cancelId = requestAnimationFrame(callback)
  }
  cancelId = requestAnimationFrame(callback)
}

function LeftArea() {
  const [toggleState, resetToggleState] = useState<'open' | 'close'>('open') 
  const contentDom = useRef<HTMLElement>()
  const containerDom = useRef<HTMLElement>()

  const handleToggleOpen = useCallback(() => {
    if (contentDom.current) {
      if (toggleState === 'open') {
        toggle(
          contentDom.current,
          'push',
          () => {
            resetToggleState('close')
            if(containerDom.current) containerDom.current.style.width = '0px'
          }
        )
      } else {
        toggle(
          contentDom.current,
          'pull',
          () => {
            resetToggleState('open')
            if(containerDom.current) containerDom.current.style.width = '300px'
          }
        )
      }
    }
  }, [toggleState])

  return (
    <div className={styles.container} ref={ref => containerDom.current = ref as HTMLElement}>
      <div
        ref={(ref) => contentDom.current = ref as HTMLElement}
        className={styles.content}
        style={{ width: content_width }}
      >
        <PageManage />
        <div className={styles['library-title']}>组件库</div>
        <ComponentSidebar />
        <div className={styles.button} onClick={handleToggleOpen}>
          {toggleState === 'open' ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
        </div>
      </div>
    </div>
  )
}

export default LeftArea