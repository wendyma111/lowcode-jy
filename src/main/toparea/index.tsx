import React, { Component } from 'react'
import styles from './index.module.css'
import Logo from './logo'
import Menu from './menu'
import PreviewButton from './previewbutton'
import SchemaButton from './schemabutton'
import Auxiliary from './auxiliary'

class TopArea extends Component {

  render() {
    return <div className={styles.topContainer}>
      <div className={styles.left}>
        <Logo />
        <Menu />
      </div>
      <Auxiliary />
      <div className={styles.right}>
        <SchemaButton />
        <PreviewButton />
      </div>
    </div>
  }
}

export default TopArea