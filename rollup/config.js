const path = require('path'); // 用于处理文件路径
const buble = require('rollup-plugin-buble'); // 用buble转换ES2015
const alias = require('rollup-plugin-alias'); // 打包时文件别名的设置
// 将CommonJS模块转换为ES6 
//将此插件与rollup-plugin-node-resolve一起使用，以便您可以将CommonJS依赖关系包含在中node_modules。
const cjs = require('rollup-plugin-commonjs');
// 将CommonJS依赖关系包含在中node_modules
const node = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace'); // 在捆绑文件时替换文件中的字符串。
const flow = require('rollup-plugin-flow-no-whitespace')； // 插件用来去掉flow使用的类型检查代码
const version = process.env.VERSION || require('../package.json').version
