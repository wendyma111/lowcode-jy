import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './main';
import { initModel } from 'model'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PreviewComp from 'simulator/preview'
import _ from 'lodash';
import { Spin } from 'antd'

const self = window as any

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Spin size="large" tip="低代码环境加载中 请稍等..." />
  </div>
)

function loadScript(srcs: Record<string, string>) {
  // 由于组件中将react external处理 所以此处需将React挂载在全局上
  self.React = React

  const components = {}

  /**
   * 兼容本地进行组件调试
   */
  let debugComponentId:string = ''

  const search = self.location.search

  if (search) {
    const params: Record<string, string> = {}
    search.substring(1).split('&').forEach((str: string) => {
      const [key, val] = str.split('=')
      params[key] = val
    })

    debugComponentId = params.debugComponentId
  }

  if (debugComponentId) {
    srcs[`${debugComponentId}_component`] = `http://localhost:6001/${debugComponentId}.js`
    srcs[`${debugComponentId}_config`] = `http://localhost:6001/${debugComponentId}.config.js`
  }

  Promise.all(_.map(srcs, (src, key) => new Promise<void>((res, rej) => {
      const script = document.createElement('script')
      script.src = src

      document.body.appendChild(script)
      script.onload = () => {
        const [comp, type] = key.split('_')
        if (type === 'component') {
          _.set(components, `${comp}.${type}`, self[key].default)
        }
        if (type === 'config') {
          _.set(components, `${comp}.${type}`, self[key])
        }

        res()
      }
    }))
  ).then(() => {
      /**
       * 此处应有获取schema逻辑，但由于云端未接入，故暂时省略该段逻辑
       */
      initModel(components)

      const route = createBrowserRouter([
        {
          path: '/',
          element: <Main />
        },
        {
          path: '/preview/:pageId',
          element: <PreviewComp />
        }
      ])

      root.render(<>
        <RouterProvider router={route} />
      </>);
  })
}

loadScript({
  'Button_component': 'https://lowcode-material-1301685852.cos.ap-nanjing.myqcloud.com/Button.240884efa8454dedeafe.js',
  'Button_config': 'https://lowcode-material-1301685852.cos.ap-nanjing.myqcloud.com/Button.config.c7e89bee7b1c3bdfbf95.js'
})
