import React from 'react'
import styles from './base.module.css'

function StyleSetterLayout(props: { label: string; content: React.ReactNode }) {
  const { label, content } = props
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.content}>{content}</div>
    </div>
  )
}

export default StyleSetterLayout