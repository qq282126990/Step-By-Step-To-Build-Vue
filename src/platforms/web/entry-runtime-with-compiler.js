
/* @flow */
// 导入 运行时 的 Vue
import Vue from './runtime/index';
import { cached } from '../../core/util/index';
import { query } from './util/index';
// import { compileToFunctions } from './compiler/index'


// 根据id 获取元素的inerHtml
const idToTemplate = cached(id => {
      const el = query(id);
      return el && el.innerHTML;
})

// 使用 mount 变量缓存 Vue.prototype.$mount 方法
const mount = Vue.prototype.$mount;

// 重写 Vue.prototype.$mount 方法
// Vue.prototype.$mount = function (
//       el?: string | Element,
//       hydrating?: boolean
// ): Component {
      // el = el && query(el);

      // /* istanbul ignore if */
      // if (el === document.body || el === document.documentElement) {
      //       process.env.NODE_ENV !== 'production' && console.warn(
      //             `不要将Vue挂载到<html>或<body>  - 而是挂载到普通元素。`
      //       )
      //       return this;
      // }
      // const options = this.$options;
// };


/**
 * 获取元素的 outerHTML
 */
function getOuterHTML (el: Element): string {
      if (el.outerHTML) {
            return el.outerHTML;
      }
      else {
            const container = document.createElement('div');
            container.appendChild(el.cloneNode(true));

            return container.innerHTML;
      }
}


// 在 Vue 上添加一个全局API `Vue.compile` 其值为上面导入进来的 compileToFunctions
// Vue.compile = compileToFunctions

// 导出 Vue
export default Vue;
