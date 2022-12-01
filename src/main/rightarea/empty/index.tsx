import React from 'react'
import EmptyPng from 'resource/empty.png'
import styles from './index.module.css'

function Empty(props: { text: string }) {
  const { text } = props
  return (
    <div className={styles['container']}>
      <div className={styles['content-container']}>
        <img className={styles['img']} src={EmptyPng} />
        <span className={styles['text']}>{text}</span>
      </div>
    </div>
  )
}

export default Empty