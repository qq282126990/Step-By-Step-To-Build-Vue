const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p);

// config.js web 对应 path.resolve(__dirname, '../src/platforms/web') 找到了 Vue.js 源码的 web 目录
module.exports = {
    web: path.resolve(__dirname, '../src/platforms/web'),
    core: resolve('src/core')
}