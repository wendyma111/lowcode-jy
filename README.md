# 低代码平台 lowcode-jy  
[live demo](https://wendyma111.github.io/lowcode-jy/)

## 启动
```js
yarn start
```

## 文档中心
[链接](https://wendyma111.github.io/lowcode-doc/)

## 相关基建
* [入料模块github](https://github.com/wendyma111/lowcode-jy-utils/tree/feature/lowcode/packages/lc-cli)
* [出码模块github](https://github.com/wendyma111/lowcode-jy-utils/tree/feature/lowcode/packages/codegen)

## 目录结构
```js
src
├── constant  // 常量
├── designer
│   ├── dragon  // 拖拽模块
│   ├── logic   // 逻辑模块
│   │   ├── astCheck  // ast语法树检查
│   │   ├── basicLowcodeEditor  // 基础ide
│   │   ├── lifecycle   // 生命周期
│   │   ├── lowcodeExecute  // 设计态 - 低代码执行器
│   │   └── variableContent  // 变量中心
│   └── setter  // 配置项组件
├── main  // 主入口文件
├── model   // 编排模型
│   ├── component   // 组件模型
│   ├── document    // 文档模型
│   ├── node        // 节点模型
│   └── project     // 项目模型
├── renderer   // 渲染模块
├── simulator  // 交互模块
│   ├── preview   // 预览
│   ├── tools
│   │   ├── contextmenu   // 右键菜单
│   │   ├── guideline     // 选中框
```