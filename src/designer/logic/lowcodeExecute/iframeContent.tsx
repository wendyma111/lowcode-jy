/**
 * 用于执行低代码的iframe 内部逻辑
 *  1、接受parent的message
 *  2、解析code
 *  3、将解析后的结果回传给parent
 */
import { Component } from 'react'
import _ from 'lodash'

class IframeComp extends Component {
  componentDidMount() {
    window.addEventListener('message', (event) => {
      const { data: { type, id, data, hash } } = event

      switch (type) {
        case 'lowCode_eval': {

          // eslint-disable-next-line no-new-func
          try {
            const resolver = new Function(`
              return function(context) {
                with(context) {
                  try {
                    return (${data})()
                  } catch(e) {
                    console.log(e)
                  }
                }
              }
            `)

            const res = resolver()((window as Window & typeof globalThis & { ctx: any })?.ctx?.[id] ?? {})
            window.parent.postMessage({ type: 'feedback_result', id, hash, data: res })
          } catch (e) {
            window.parent.postMessage({ type: 'feedback_result', id, hash, data: null })
          }
          break
        }

        default: {
          break
        }
      }
    })
  }

  render() {
    return null
  }
}

export default IframeComp
