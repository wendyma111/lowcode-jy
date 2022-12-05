const fs = require('fs-extra')
const path = require('path')
const child_process = require('child_process')

// 执行打包
child_process.execSync(
  `node ${path.resolve(__dirname, './build.js')}`,
  { encoding: 'utf-8' },
  (err, stdout) => {
    if (err) {
      console.log(err.stack)
      console.log('Error code: ', err.code)
      console.log('Signal received ', err.signal)
      process.exit()
    }
  
    console.log(stdout)
  }
)

// 将打包后的文件复制到docs
fs.copySync(path.resolve(__dirname, '../build'), path.resolve(__dirname, '../docs'))

console.log('打包后文件已复制到docs文件夹下')