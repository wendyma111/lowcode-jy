import React from 'react'
import styles from './index.module.css'
import { getModel } from 'model'
import Simulator from 'simulator'

function CenterArea() {
  return (
    <div className={styles.container}>
      <Simulator />
    </div>
  )
}

export default CenterArea