/* @flow */

//  是一个对象，包含 Vue 的全局配置
import config from '../config';
// 选项/资源
import { ASSET_TYPES } from '../../shared/constants';
import builtInComponents from '../components/index';
import { initUse } from './use';
import { initMixin } from './mixin';
import { initExtend } from './extend';
import { initAssetRegisters } from './assets';
import { set, del } from '../observer/index'

import {
      extend
} from '../util/index';

export function initGlobalAPI (Vue: GlobalAPI) {
      // 设置config
      const configDef = {};

      configDef.get = () => config;

      // 只读属性 configDef 不允许修改
      if (process.env.NODE_ENV !== 'production') {
            configDef.set = () => {
                  console.warn('不要替换Vue.config对象，而是设置单个字段。');
            }
      }

      Object.defineProperty(Vue, 'config', configDef);

      // Vue.util 以及 util 下的四个方法都不被认为是公共API的一部分，
      // 要避免依赖他们，
      // 但是你依然可以使用，只不过风险要自己控制。

      Vue.util = {
            // warn,
            // extend,
            // mergeOptions,
            // defineReactive
      }

      // 向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 (比如 this.myObject.newProperty = 'hi')
      Vue.set = set;

      // 删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到属性被删除的限制，但是你应该很少会使用它。
      Vue.delete = del;

      // 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
      // Vue.nextTick = nextTick;


      // 空对象
      Vue.options = Object.create(null);

      ASSET_TYPES.forEach(type => {
            Vue.options[type + 's'] = Object.create(null);
      });


      // 这用于标识“base”构造函数以扩展所有普通对象
      // components with in Weex's multi-instance scenarios.
      // Vue.options = {
      //       components: Object.create(null),
      //       directives: Object.create(null),
      //       filters: Object.create(null),
      //       _base: Vue
      // }
      Vue.options._base = Vue;

      // 注册内部组件
      // 将 builtInComponents 属性混合到 Vue.options.components 中 builtInComponents = KeepAlive
      // Vue.options.components = {
      //       KeepAlive
      // }
      extend(Vue.options.components, builtInComponents);

      // 到这里Vue.options 变成这样
      // Vue.options = {
      //       components: {
      //             KeepAlive
      //       },
      //       directives: Object.create(null),
      //       filters: Object.create(null),
      //       _base: Vue
      // }

      // 安装 Vue 插件
      initUse(Vue);

      // 全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。
      // 插件作者可以使用混入，向组件注入自定义的行为。不推荐在应用代码中使用。
      initMixin(Vue);

      // 在 Vue 上添加了 Vue.cid 静态属性，和 Vue.extend 静态方法
      initExtend(Vue);

      // initAssetRegisters 输出一下三个静态方法
      // Vue.component
      // Vue.directive
      // Vue.filter
      initAssetRegisters(Vue);
}
