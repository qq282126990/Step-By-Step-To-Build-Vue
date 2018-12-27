/* @flow */

import { installRenderHelpers } from './render-helpers/index';

export function renderMixin (Vue: Class<Component>) {
      // install runtime convenience helpers 注册帮助函数
      installRenderHelpers(Vue.prototype);

      Vue.prototype.$nextTick = function (fn: Function) {

      };

      // Vue.prototype._render = function (): VNode {
      //       const vm: Component = this

      //       // render self
      //       let vnode

      //       return vnode;
      // };

}