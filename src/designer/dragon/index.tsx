/**
 * 拖拽模块
 * - 被拖拽元素
 *    记录被拖拽节点
 *    渲染拖拽悬浮样式
 * - 可放置区域
 *    监听拖拽动作，获取插入节点
 *    渲染拖拽激活态 & 辅助元素
 */
import { observable, action, makeObservable, autorun } from 'mobx'
import _ from 'lodash'
import NodeInstance from 'model/node'
import { DragEvent } from 'react'
import { addClassName, findNodeIdFromFiber, clearClassName } from 'simulator/utils'
import { getModel } from 'model'
import { findDOMNode } from 'react-dom'
import { getDomByNodeId } from 'simulator/utils'

class Dragon {
  dragObject: NodeInstance | null = null

  dragImage!: HTMLDivElement

  parent: NodeInstance | null = null

  targetNode: NodeInstance | null = null

  insertType: 'before' | 'after' | 'last' = 'after'

  _setParent(node: NodeInstance | null) {
    this.parent = node
  }

  _setTargetNode(node: NodeInstance | null) {
    this.targetNode = node
  }

  _setInsertType(type: 'before' | 'after' | 'last') {
    this.insertType = type
  }

  resetDraggingData() {
    this._setParent(null)
    this._setTargetNode(null)
    this._setInsertType('after')
  }

  constructor() {
    // 渲染被拖拽元素
    const dragImage = document.createElement('div')
    dragImage.id = 'drag-image'

    document.body.appendChild(dragImage)
    this.dragImage = dragImage

    makeObservable(this, {
      dragObject: observable.ref,
      _setDragObject: action,
      _setParent: action,
      _setTargetNode:action,
      _setInsertType: action,
      parent: observable.ref,
      targetNode: observable.ref,
      insertType: observable,
      sensors: observable,
      addSensor: action
    })

    // 被拖拽元素 置灰
    autorun(() => {
      if (!_.keys(this.sensors ?? {}).length) return

      const hasDragObject = !_.isNil(this.dragObject)

      const draggedDoms = document.getElementsByClassName('drag-object-disable')
      if (Array.from(draggedDoms).length) {
        _.forEach(Array.from(draggedDoms), (dom) => {
          clearClassName(dom, 'drag-object-disable')
        })
      }

      if (hasDragObject) {
        const { projectModel } = getModel()
        if (projectModel.currentDocument?.getNodeById((this.dragObject as NodeInstance).id)) {
          _.forEach(this.sensors, ({ el }) => {
            const draggedDom = getDomByNodeId((this.dragObject as NodeInstance).id, el)
            addClassName(draggedDom as Element, 'drag-object-disable')
          })
        }
      }
    })

    // 渲染激活态
    autorun(() => {
      if (!_.keys(this.sensors ?? {}).length) return
      const hasParent = !_.isNil(this.parent)
      const hasDragObject = !_.isNil(this.dragObject)

      const activeDoms = document.getElementsByClassName('drag-active-container')
      if (Array.from(activeDoms).length) {
        _.forEach(Array.from(activeDoms), (dom) => {
          clearClassName(dom, 'drag-active-container')
        })
      }

      if (hasParent && hasDragObject) {
        this.sensors.forEach(({ el }) => {
          const parentDom = getDomByNodeId((this.parent as NodeInstance).id, el)
          addClassName(parentDom as Element, 'drag-active-container')
        })
      }
    })

    // 插入辅助线
    autorun(() => {
      if (!_.keys(this.sensors ?? {}).length) return

      const hasInsertType = !_.isNil(this.insertType)
      const hasParent = !_.isNil(this.parent)
      const hasDragObject = !_.isNil(this.dragObject)

      // 移除辅助线
      if (!hasDragObject) {
        const temp = document.getElementsByClassName('drag-placeholder')
        if (Array.from(temp).length) {
          _.forEach(Array.from(temp), (tempItem) => {
            (tempItem.parentNode as HTMLElement).removeChild(tempItem)
          })
        }
      }

      // 绘制辅助线
      if (hasInsertType && hasParent && hasDragObject) {

        _.forEach(this.sensors, ({ el, placeholder }) => {
          const targetDom = getDomByNodeId((this.targetNode as NodeInstance)?.id, el)
          placeholder.innerHTML = (this.dragObject as NodeInstance).getComponentMeta().componentName

          if (this.parent && this.insertType === 'last') {
            const parentDom = getDomByNodeId((this.parent as NodeInstance).id, el)
            if (parentDom?.childNodes.length === 3) {
              // 画布节点插入
              parentDom?.childNodes[1]?.appendChild(placeholder)
            } else {
              // 组件树节点插入
              parentDom?.childNodes[0]?.childNodes[1]?.appendChild(placeholder)
            }           
          }

          if (!targetDom) {
            return
          }

          switch(this.insertType) {
            case 'before': {
              targetDom?.parentNode?.insertBefore(placeholder, targetDom)
              break
            }
            case 'after': {
              if(this.targetNode === this.parent?.lastChild) {
                targetDom?.parentNode?.appendChild(placeholder)
                break
              }

              const nextDom = getDomByNodeId(((this.targetNode as NodeInstance).nextSibling as NodeInstance)?.id, el)
              nextDom?.parentNode?.insertBefore(placeholder, nextDom)
              break
            }
            default: break
          }
        })
      }
    })
  }

  _setDragObject(node: NodeInstance | null) {
    this.dragObject = node
  }

  handleDragStart = (e: DragEvent, node: NodeInstance) => {
    e.stopPropagation()
    if (!node) return

    this.dragImage.innerHTML = node.getComponentMeta().componentName
    e.dataTransfer.setDragImage(this.dragImage, -10, -10)
    this._setDragObject(node)
  }

  handleDragEnd = (e: DragEvent) => {
    e.stopPropagation()
    this._setDragObject(null)
    this.resetDraggingData()
  }

  private _dragover = _.throttle((e) => {
    const { projectModel } = getModel()
    if (!this.dragObject) return

    const reactFiberKey = _.keys(e.target).find(item => item.startsWith('__reactFiber')) as string
    // @ts-ignore
    const fiberNode = e.target[reactFiberKey]
    let targetNodeId = findNodeIdFromFiber(fiberNode)
    let targetNode = projectModel.currentDocument?.getNodeById(targetNodeId)
    const ifInCanvas = (e.path ?? []).includes(document.getElementById('simulator-canvas'))

    if (!targetNodeId || !targetNode) {
      // 当找不到targetNode时 默认是移动到虚拟根节点上
      if (e.target.id === 'simulator-canvas' || e.target.id === 'outline-tree') {
        targetNode = projectModel.currentDocument?.rootNode
        targetNodeId = targetNode.id
      } else {
        return
      } 
    }

    const targetContainer = targetNode.isContainer || targetNode === targetNode.document.rootNode ? targetNode : targetNode.parent
    this._setParent(targetContainer)

    if (targetContainer.children.length === 0) {
      this._setInsertType('last')
      return
    }

    let placeTargetNodeId = null
    let placeType: 'before' | 'after' = 'after'
    const { clientX, clientY } = e

    // 当目标节点是容器时，查找其距离最近的子节点 并判断是应该在前插入还是在后插入
    if (targetNode === targetContainer) {
      let mindistance = Infinity
      let index = targetContainer.children.length - 1
      while(index >= 0) {
        const child = targetContainer.children[index]
        const nodeid = child.id

        const { x: preX, y: preY } = ifInCanvas ? child.__mock_pre_position : child.__mock_pre_tree_position
        const { x: nextX, y: nextY } = ifInCanvas ? child.__mock_next_position : child.__mock_next_tree_position

        let predistance = Math.abs((clientX - preX) * (clientY - preY))
        let nextdistance = Math.abs((clientX - nextX) * (clientY - nextY))

        if (nextdistance <= predistance) {
          if (nextdistance < mindistance) {
            placeType = 'after'
            mindistance = nextdistance
            placeTargetNodeId = nodeid
          }
        } else {
          if (predistance < mindistance) {
            placeType = 'before'
            mindistance = predistance
            placeTargetNodeId = nodeid
          }
        }

        index--
      }
    } else {
      // 当目标节点非容器时，判断应在目标节点的前方插入还是后方插入
      const { x: preX, y: preY } = ifInCanvas ? targetNode.__mock_pre_position : targetNode.__mock_pre_tree_position
      const { x: nextX, y: nextY } = ifInCanvas ? targetNode.__mock_next_position : targetNode.__mock_next_tree_position

      let nextdistance = Math.abs((clientX - preX) * (clientY - preY))
      let predistance = Math.abs((clientX - nextX) * (clientY - nextY))
      placeTargetNodeId = targetNode.id

      if (nextdistance <= predistance) {
        placeType = 'after'
      } else {
        placeType = 'before'
      }
    }

    this._setInsertType(placeType)
    this._setTargetNode(projectModel.currentDocument?.getNodeById(placeTargetNodeId))
  }, 300, { leading: true, trailing: false })

  handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    this._dragover(e)
  }

  handleDrop = _.throttle((e: DragEvent) => {
    e.preventDefault()

    if (!this.dragObject) return

    if (getModel().projectModel.currentDocument?.getNodeById(this.dragObject.id)) {
      this.dragObject.parent?.removeChild(this.dragObject)
    }

    if (this.parent && this.insertType === 'last') {
      this.parent.appendChild(this.dragObject)
    } else {
      if (this.parent && this.targetNode) {
        switch(this.insertType) {
          case 'after': {
            this.parent.insertAfter(this.dragObject, this.targetNode)
            break
          }
          case 'before': {
            this.parent.insertBefore(this.dragObject, this.targetNode)
            break
          }
          default: this.parent.insertAfter(this.dragObject, this.targetNode)
        }
      }
    }

    // 拖拽完成 清空拖拽对象 及 拖拽数据
    this._setDragObject(null)
    this.resetDraggingData()
  }, 300, { leading: true, trailing: false })

  // el： 目标放置区域；placeholder：拖拽占位元素
  sensors: Array<{ el: HTMLElement, placeholder: HTMLElement }> = []

  // 注册拖拽放置区
  addSensor(el: HTMLElement) {
    const index = this.sensors.findIndex(sensor => sensor.el.id === el.id)
    if (index !== -1) {
      this.sensors[index].el = el
      return
    }
    // 辅助线节点
    const placeholder = document.createElement('div')
    placeholder.className = 'drag-placeholder'

    this.sensors.push({ el, placeholder })
    // @ts-ignore
    el.addEventListener('dragover', this.handleDragOver, true)
    // @ts-ignore
    el.addEventListener('drop', this.handleDrop, true)
  }
}

export default Dragon