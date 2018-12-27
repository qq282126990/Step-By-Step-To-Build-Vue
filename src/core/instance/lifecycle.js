/* @flow */

export function lifecycleMixin (Vue: Class<Component>) {

      Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {

      }

      // 迫使 Vue 实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。
      Vue.prototype.$forceUpdate = function () { };

      // 完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。
      Vue.prototype.$destroy = function () { };
}