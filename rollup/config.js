const path = require('path'); // 用于处理文件路径
const buble = require('rollup-plugin-buble'); // 用buble转换ES2015
const alias = require('rollup-plugin-alias'); // 打包时文件别名的设置
// 将CommonJS模块转换为ES6 
//将此插件与rollup-plugin-node-resolve一起使用，以便您可以将CommonJS依赖关系包含在中node_modules。
const cjs = require('rollup-plugin-commonjs');
// 将CommonJS依赖关系包含在中node_modules
const node = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace'); // 在捆绑文件时替换文件中的字符串。
const flow = require('rollup-plugin-flow-no-whitespace');  // 插件用来去掉flow使用的类型检查代码
const version = process.env.VERSION || require('../package.json').version; // 版本号


const aliases = require('./alias');

// resolve 函數 传入参数 p 通过 / 分割成数组,
// 然后取数组的第一个元素设置为base
// {p} web-full-dev
// {base} web
// base 并不是实际的路径，真实的路径借助了别名的配置 const aliases
// web 对应 path.resolve(__dirname, '../src/platforms/web') 找到了 Vue.js 源码的 web 目录
// 然后通过 path.resolve(aliases[base], p.slice(base.length + 1)) 找到最终路径  web 目录下的 entry-runtime-with-compiler.js
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

/**
 * {entry}  表示構建入口的js 文件地址
 * {dest} 表示構建后的js 文件地址
 * {format} 屬性構建的格式
 * {umd} 表示构建出来的文件遵循 UMD 规范。 https://github.com/umdjs/umd
 */
const builds = {
  //运行时+编译器开发构建（浏览器）
  'web-full-dev': {
    // 表示構建入口的js 文件地址
    entry: resolve('web/entry-runtime-with-compiler.js'),
    // 表示構建后的js 文件地址
    dest: resolve('dist/vue.js'),
    // 屬性構建的格式
    format: 'umd',
    // 構建方式
    env: 'development',
    alias: {
      he: './entity-decoder'
    }
  }
}


function genConfig(name) {
  // 参数name 对应的打包配置项
  const opts = builds[name];

  // 公共配置
  const config = {
    // 入口地址
    input: opts.entry,
    // 插件相关配置
    plugins: [
      replace({
        __VERSION__: version
      }),
      flow(),
      buble(),
      // 解析最终路径 
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),  
    // 输出地址
    output: {
      file: opts.dest,
      format: opts.format,
      name: 'Vue'
    }
  }

  // 判断如果有构建方式就把构建方式写入 config 公共配置构建模式
  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }));
  }

  // 监听配置文件变化
  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config;
}


// 根据 package.json中 指定的process.env.TARGET 经行不同的打包配置
if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
