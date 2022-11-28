import React from 'react'
import styles from './index.module.css'
import EmptyPng from 'resource/empty.png'

function Empty(props: any) {
  const { setCardType } = props

  return (
    <div className={styles['container']}>
      <img className={styles['empty-img']} src={EmptyPng} />
      <span className={styles['link']} onClick={() => setCardType('add')}>添加变量</span>
    </div>
  )
}

export default Empty