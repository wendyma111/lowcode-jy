import React, { DragEvent, useEffect } from 'react'
import { getModel } from 'model'
import { Collapse } from 'antd';
import default_screenShot from 'resource/default_screenShot.png'
import { generateKey } from 'utils/generator';
import styles from './index.module.css'

const { Panel } = Collapse;

function Card(props: { content: ComponentMetaInfo }) {
  const { screenShot, label, componentName } = props?.content
  const { projectModel } = getModel()

  const handleDragStart = (e: DragEvent) => {
    const newNodeId = generateKey()
    const newNode = projectModel.currentDocument?.createNode(newNodeId, { componentName })
    projectModel.designer.dragon.handleDragStart(e, newNode)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={projectModel.designer.dragon.handleDragEnd}
      className={styles.component_container}
    >
      <img className={styles.image} src={screenShot || default_screenShot} />
      <span className={styles.title}>{label}</span>
    </div>
  )
}

function ComponentSidebar() {
  const { componentMeta: { categorys } } = getModel()

  return (
    <Collapse
      defaultActiveKey={[...categorys.keys()].map((_, index) => index)}
      bordered={false}
      expandIconPosition="end"
    >
      {[...categorys.keys()].map((category, index) => {
        const contents = (categorys.get(category) as Array<ComponentMetaInfo>)
        return (
          <Panel style={{ background: '#fff' }} key={index} header={category}>
            <div className={styles.category_container} key={index}>
              {
                contents.map((content, index) => {
                  return (
                    <Card key={index} content={content} />
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