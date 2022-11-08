import React, { useEffect } from 'react'
import { getModel } from 'model'
import { Collapse } from 'antd';
import default_screenShot from 'resource/default_screenShot.png'
import styles from './index.module.css'

const { Panel } = Collapse;

function Card(props: { screenShot: string; title: string }) {
  const { screenShot, title } = props

  return (
    <div className={styles.component_container}>
      <img className={styles.image} src={screenShot || default_screenShot} />
      <span className={styles.title}>{title}</span>
    </div>
  )
}

function ComponentSidebar() {
  const { componentMeta: { categorys } } = getModel()

  return (
    <Collapse bordered={false} expandIconPosition="end">
      {[...categorys.keys()].map((category, index) => {
        const contents = (categorys.get(category) as Array<ComponentMetaInfo>)
        return (
          <Panel style={{ background: '#fff' }} key={index} header={category}>
            <div className={styles.category_container} key={index}>
              {
                contents.map((content, index) => {
                  return (
                    <Card key={index} screenShot={content?.screenShot} title={content?.label} />
                  )
                })
              }
            </div>
          </Panel>
        )
      })}
    </Collapse>
  )
}

export default ComponentSidebar