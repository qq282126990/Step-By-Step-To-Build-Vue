/* @flow */

// 为 Vue 添加全局的API，也就是静态的方法和属性
import Vue from '../../../core/index';
import config from '../../../core/config';
import { extend } from '../../../shared/util';
import { inBrowser, isChrome, devtools } from '../../../core/util/index';
import {query} from '../util/index'
// 平台指令
import platformDirectives from './directives/index';
// 平台组件
import platformComponents from './components/index';
import { mountComponent } from '../../../core/instance/lifecycle'

import {
      isReservedTag
} from '../util/index';



// 配置是与平台有关的，很可能会被覆盖掉
// Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
// Vue.config.isReservedAttr = isReservedAttr
// Vue.config.getTagNamespace = getTagNamespace
// Vue.config.isUnknownElement = isUnknownElement

// 在 Vue.options 上添加 web 平台运行时的特定组件和指令。
// platformDirectives = {
//       model,
//       show
// }
extend(Vue.options.directives, platformDirectives);
// platformComponents = {
//       Transition,
//       TransitionGroup
// }
extend(Vue.options.components, platformComponents);


//如果在浏览器环境运行的话，这个方法的值为 patch 函数，否则是一个空函数 noop。
// Vue.prototype.__patch__ =  inBrowser ? patch : noop;


// public mount method
// 第一个参数 el 可以是一个字符串也可以是一个 DOM 元素
// 第二个参数 hydrating 是用于 Virtual DOM 的补丁算法的
Vue.prototype.$mount = function (
      el?: string | Element,
      hydrating?: boolean
): Component {
      // 判断当前环境是否是浏览器， 重写 el 
      // query 根据给定的参数在 DOM 中查找对应的元素并返回
      el = el && inBrowser ? query(el) : undefined
      return mountComponent(this, el, hydrating)
}

// devtools global hook
// vue-devtools 的全局钩子，它被包裹在 setTimeout 中
/* istanbul ignore next */
if (inBrowser) {
      setTimeout(() => {
            if (config.devtools) {
                  if (devtools) {
                        devtools.emit('init', Vue);
                  }
                  else if (
                        process.env.NODE_ENV !== 'production' &&
                        process.env.NODE_ENV !== 'test' &&
                        isChrome
                  ) {
                        console[console.info ? 'info' : 'log'](
                              'Download the Vue Devtools extension for a better development experience:\n' +
                              'https://github.com/vuejs/vue-devtools'
                        )
                  }
            }

            if (process.env.NODE_ENV !== 'production' &&
                  process.env.NODE_ENV !== 'test' &&
                  config.productionTip !== false &&
                  typeof console !== 'undefined'
            ) {
                  console[console.info ? 'info' : 'log'](
                        `You are running Vue in development mode.\n` +
                        `Make sure to turn on production mode when deploying for production.\n` +
                        `See more tips at https://vuejs.org/guide/deployment.html`
                  )
            }
      }, 0);
}


/**
 * 以上文件说明
 * 
 * 设置平台化的Vue.config
 * 在 Vue.options 上混合两个指令(directives),分别是 model 和 show
 * 在 Vue.options 上混合两个组件(components),分别是 Transition 和 TransitionGroup
 * 在 Vue.prototype 上添加两个方法 __patch__ 和 $mount
 * 
 */


export default Vue;
