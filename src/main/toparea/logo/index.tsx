import React from 'react'
import styles from './index.module.css'
import { getModel } from 'model'

function Logo() {
  const { projectModel } = getModel()
  const { name } = projectModel
  
  return (
    <div className={styles.container}>
      {name}
    </div>
  )
}

export default Logo