/* @flow */

import { installRenderHelpers } from './render-helpers/index';

export function renderMixin (Vue: Class<Component>) {
      // install runtime convenience helpers 注册帮助函数
      installRenderHelpers(Vue.prototype);

      Vue.prototype.$nextTick = function (fn: Function) {

      };

      Vue.prototype._render = function (): VNode {
            const vm: Component = this

            // render self
            let vnode

            // 使用 call 方法指定了函数的执行环境为 vm._renderProxy
            vnode = render.call(vm._renderProxy, vm.$createElement)



            return vnode;
      };

}