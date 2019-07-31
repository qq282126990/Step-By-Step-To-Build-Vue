import {
      handleError,
      emptyObject
} from '../util/index'
import { mark, measure } from '../util/perf'
import Watcher from '../observer/watcher'

// 定义 isUpdatingChildComponent，并初始化为 false
export let isUpdatingChildComponent: boolean = false

export function updateChildComponent (
      vm: Component,
      propsData: ?Object,
      listeners: ?Object,
      parentVnode: MountedComponentVNode,
      renderChildren: ?Array<VNode>
) {
      // 当 updateChildComponent 函数开始执行的时候会更新为 true
      if (process.env.NODE_ENV !== 'production') {
            isUpdatingChildComponent = true
      }



      // 更新$ attrs和$ listeners
      // these are also reactive so they may trigger child update if the child
      // 在渲染过程中使用它们
      vm.$attrs = parentVnode.data.attrs || emptyObject
      vm.$listeners = listeners || emptyObject

      // 执行结束又将 isUpdatingChildComponent 还原为 false
      // 这是因为 updateChildComponent 函数需要更新实例对象的 $attrs 和 $listeners 属性
      // 所以此时是不需要提示 $attrs 和 $listeners 是只读属性的
      if (process.env.NODE_ENV !== 'production') {
            isUpdatingChildComponent = false
      }
}

export function lifecycleMixin (Vue: Class<Component>) {

      Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {

            if (!prevVnode) {
                  // vm.$el 的值将被 vm.__patch__ 函数的返回值重写
                  // initial render
                  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
            } else {
                  // updates
                  vm.$el = vm.__patch__(prevVnode, vnode)
            }
      }

      // 迫使 Vue 实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。
      Vue.prototype.$forceUpdate = function () { };

      // 完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。
      Vue.prototype.$destroy = function () { };
}


export function initLifecycle (vm: Component) {
      // 定义 options ，它是 vm.$options 的引用，后面的代码使用的都是 options 常量
      const options = vm.$options


      //---将当前实例添加到父实例的$children 属性里，并设置当前实例的 $parent 指向父实例---//

      // locate first non-abstract parent (查找第一个非抽象的父组件)
      // 定义 parent ，它引用当前实例的父实例
      let parent = options.parent
      // 如果当前实例有父组件，且当前实例不是抽象的
      if (parent && !options.abstract) {
            // 使用 while 循环查找第一个非抽象的父组件
            // 沿着父实例链逐层向上寻找到第一个不抽象的实例作为父级
            while (parent.$options.abstract && parent.$parent) {
                  parent = parent.$parent
            }
            // 经过上面的 while 循环后，parent 应该是一个非抽象的组件，将它作为当前实例的父级
            // 所以将当前实例 vm 添加到父级的 $children 属性里
            parent.$children.push(vm)
      }

      // 设置当前实例的 $parent 属性，指向父级
      vm.$parent = parent
      // 设置 $root 属性，有父级就用父级的 $root ，否则 $root 指向自身
      vm.$root = parent ? parent.$root : vm

      //-------//

      // 初始化为数组
      vm.$children = []
      // 初始化为一个空 json 对象
      vm.$refs = {}


      vm._watcher = null
      vm._inactive = null
      vm._directInactive = false
      vm._isMounted = false
      vm._isDestroyed = false
      vm._isBeingDestroyed = false

}

// 接受两个参数 实例对象和要调用的生命周期钩子的名称
export function callHook (vm: Component, hook: string) {
      // 获取要调用的生命周期钩子
      // 相当于  vm.$options.created
      const handlers = vm.$options[hook]

      // 由于开发者在编写组件时未必会写生命周期钩子，
      // 所以获取到的 handlers 可能不存在，
      // 所以使用 if 语句进行判断，
      // 只有当 handlers 存在的时候才对 handlers 进行遍历
      if (handlers) {
            for (let i = 0, j = handlers.length; i < j; i++) {
                  try {
                        // 为了保证生命周期钩子函数内可以通过 this 访问实例对象,
                        // 所以使用 .call(vm) 执行这些函数
                        handlers[i].call(vm)
                  } catch (e) {
                        handleError(e, vm, `${hook} hook`)
                  }
            }
      }


      // vm._hasHookEvent 是在 initEvents 函数中定义的
      // 判断是否存在生命周期钩子的事件监听器
      // <child
      // @hook: beforeCreate = "handleChildBeforeCreate"
      // @hook: created = "handleChildCreated"
      // @hook: mounted = "handleChildMounted"
      // @hook: 生命周期钩子
      //       />

      if (vm._hasHookEvent) {
            vm.$emit('hook:' + hook)
      }

}


/**
 * 接受三个参数
 * 组件实例 vm
 * 挂在元素 el
 * 透传过来的 hydrating
 *  */
export function mountComponent (
      vm: Component,
      el: ?Element,
      hydrating?: boolean
): Component {
      // 在组件实例对象上添加 $el 属性，其值为挂载元素 el
      vm.$el = el

      // 首先检查渲染函数是否存在
      if (!vm.$options.render) {
            // 将 vm.$options.render 的值设置为 createEmptyVNode 函数，
            // 也就是说此时渲染函数的作用将仅仅渲染一个空的 vnode 对象
            vm.$options.render = createEmptyVNode
            if (process.env.NODE_ENV !== 'production') {
                  /* istanbul ignore if */
                  if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                        vm.$options.el || el) {
                        console.warn(
                              'You are using the runtime-only build of Vue where the template ' +
                              'compiler is not available. Either pre-compile the templates into ' +
                              'render functions, or use the compiler-included build.',
                              vm
                        )
                  } else {
                        console.warn(
                              'Failed to mount component: template or render function not defined.',
                              vm
                        )
                  }
            }

            // 触发 beforeMount 生命周期钩子
            callHook(vm, 'beforeMount')


            // 组件开始挂载工作
            // 定义并初始化 updateComponent 函数
            // 这个函数将用作创建 Watcher 实例时传递给 Watcher 构造函数的第二个参数

            let updateComponent

            // 分别统计了 vm._render() 函数以及 vm._update() 函数的运行性能
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                  updateComponent = () => {
                        const name = vm._name
                        const id = vm._uid
                        const startTag = `vue-perf-start:${id}`
                        const endTag = `vue-perf-end:${id}`

                        mark(startTag)
                        const vnode = vm._render()
                        mark(endTag)
                        measure(`vue ${name} render`, startTag, endTag)

                        mark(startTag)
                        vm._update(vnode, hydrating)
                        mark(endTag)
                        measure(`vue ${name} patch`, startTag, endTag)
                  }
            }
            else {
                  // 该函数的作用是以 vm._render() 函数的返回值作为第一个参数调用 vm._update() 函数
                  // vm._render 函数的作用调用 vm.$options.render 函数并返回生成的虚拟节点
                  // vm._update 函数作用吧 vm._render 函数生成的虚拟节点渲染成真正的 DOM
                  // 把渲染函数生成的虚拟DOM渲染成真正的DOM
                  updateComponent = () => {
                        vm._update(vm._render(), hydrating)
                  }
            }


            // 对 updateComponent 函数求值
            // 渲染函数的观察者
            new Watcher(vm, updateComponent, noop, {
                  before () {
                        if (vm._isMounted) {
                              callHook(vm, 'beforeUpdate')
                        }
                  }
            }, true /* isRenderWatcher */)

      }

}
