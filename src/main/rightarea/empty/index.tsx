import React from 'react'
import EmptyPng from 'resource/empty.png'
import styles from './index.module.css'

function Empty() {
  return (
    <div className={styles['container']}>
      <div className={styles['content-container']}>
        <img className={styles['img']} src={EmptyPng} />
        <span className={styles['text']}>请先选择组件</span>
      </div>
    </div>
  )
}

export default Empty