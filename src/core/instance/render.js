/* @flow */

import { installRenderHelpers } from './render-helpers/index';


export function initRender (vm: Component) {
      // the root of the child tree  子树的根
      vm._vnode = null
      // v-once cached trees  v-once缓存树
      vm._staticTrees = null


      // const options = vm.$options
      // const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
      // const renderContext = parentVnode && parentVnode.context
      // vm.$slots = resolveSlots(options._renderChildren, renderContext)
      // vm.$scopedSlots = emptyObject

      // 以上代码无论它处理是什么内容其结果都是在 Vue 当前实例对象上添加三个实例属性
      // vm.$vnode
      // vm.$slots
      // vm.$scopedSlots


      // 将createElement fn绑定到此实例
      // 以便我们在其中获得适当的渲染上下文。
      // args order：tag，data，children，normalizationType，alwaysNormalize
      // internal version is used by render functions compiled from templates
      // 对内部函数 createElement 的包装
      
      // 用于编译器根据模板字符串生成渲染函数
      // vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
      // 用于创建虚拟节点
      // vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, false)

      // 在 Vue 实例对象上定义两个属性 vm.$attrs 和 vm.$listeners 函数
      // const parentData = parentVnode && parentVnode.data
      // /* istanbul ignore else */
      // if (process.env.NODE_ENV !== 'production') {
      //   defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      //     !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
      //   }, true)
      //   defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      //     !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
      //   }, true)
      // } else {
      //   defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
      //   defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
      // }

}


export function renderMixin (Vue: Class<Component>) {
      // install runtime convenience helpers 注册帮助函数
      installRenderHelpers(Vue.prototype);

      Vue.prototype.$nextTick = function (fn: Function) {

      };

      // Vue.prototype._render = function (): VNode {
      //       const vm: Component = this

      //       // render self
      //       let vnode

      //       // 使用 call 方法指定了函数的执行环境为 vm._renderProxy
      //       // vnode = render.call(vm._renderProxy, vm.$createElement)



      //       return vnode;
      // };

}