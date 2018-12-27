/* @flow */

// 判断浏览器环境
export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isEdge = UA && UA.indexOf('edge/') > 0;
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// 检测devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__
