/* @flow */

// 用来检测当前环境是否可以使用对象的 __proto__ 属性
// 我们知道，一个对象的 __proto__ 属性指向了它构造函数的原型
// 但这是一个在 ES2015 中才被标准化的属性，IE11 及更高版本才能够使用
export const hasProto = '__proto__' in {}

// 判断浏览器环境
export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isEdge = UA && UA.indexOf('edge/') > 0;
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// 检测devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

// 在 Firefox 中原生提供了 Object.prototype.watch 函数，
// 所以当运行在 Firefox 中时 nativeWatch 为原生提供的函数，在其他浏览器中 nativeWatch 为 undefined。
// 这个变量主要用于 Vue 处理 watch 选项时与其冲突
export const nativeWatch = ({}).watch