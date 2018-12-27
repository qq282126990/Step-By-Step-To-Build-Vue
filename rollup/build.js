const fs = require('fs'); // node 模块主要处理文件的读写、复制、s删除、重命名等操作
const path = require('path'); // 用于处理文件路径
const zlib = require('zlib');  // 用于gzip压缩
const rollup = require('rollup'); // 引入rollup.js
const uglify = require('uglify-js'); // 一个JavaScript解析器，缩小器，压缩器工具包

// 判断文件路径是否存在 dist 同步  如果路径存在，则返回 true，否则返回 false。
if (!fs.existsSync('dist')) {
  // 同步创建目录 返回 undefined。
  fs.mkdirSync('dist')
}

// 获取构建参数 从配置文件读取配置
let builds = require('./config').getAllBuilds();

// 通过命令行arg过滤构建
if (process.argv[2]) {
  // 分割构建
  const filters = process.argv[2].split(',');

  builds = builds.filter((b) => {
    // 检测数组中的元素是否满足指定条件
    return filters.some((f) => {
      return b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1
    });
  });
}
//默认过滤出weex构建
else {
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}
