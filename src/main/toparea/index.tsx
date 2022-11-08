import React, { Component } from 'react'
import styles from './index.module.css'
import Logo from './logo'

class TopArea extends Component {
  render() {
    return <div className={styles.topContainer}>
      <Logo />
    </div>
  }
}

export default TopArea