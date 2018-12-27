// 原型被包装(添加属性和方法)后的 Vue 导入
import { initGlobalAPI } from './global-api/index'

// 从 Vue 的出生文件导入 Vue 
import Vue from './instance/index';

// 将 Vue 构造函数作为参数，传递给 initGlobalAPI 方法 添加全局API
initGlobalAPI(Vue);

// Vue.version 存储了当前 Vue 的版本号
Vue.version = '__VERSION__';

export default Vue;
