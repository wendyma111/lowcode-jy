import React from 'react'
import { Modal } from 'antd'

const { confirm } = Modal

function lowcodeInstruction() {
  confirm({
    icon: null,
    title: '低代码模块使用指南',
    content: (
      <div>
        <div>
          <div style={{ fontSize: 16 }}>全局变量：可通过$state.[变量作用域].[变量标识]访问数据源，例如：$state.global.text</div>
          <div style={{ paddingLeft: 10, color: 'rgba(0,0,0,0.7)' }}>请注意：组件仅支持绑定其所属页面 及 全局作用域下的变量</div>
        </div>
        <br />
        <div>
          <div style={{ fontSize: 16 }}>全局方法：在低代码模块可通过$api访问全局方法，包括内置方法 及自定义方法</div>
          <div style={{ paddingLeft: 10 }}>
            内置方法：
            <ul>
              <li>$api.dispatch(变量路径，目标值)：改变全局变量并触发绑定了相应变量的组件重新渲染</li>
              <li>$api.navigate(页面id)：页面跳转</li>
            </ul>
          </div>
          <div style={{ paddingLeft: 10 }}>自定义方法：可通过 $api.custom.[方法标识] 在低代码模块中访问自定义方法，如：$api.custom.setData()</div>
        </div>
      </div>
    ),
    okText: '取消',
    cancelText: '确定',
  })
}

export default lowcodeInstruction
