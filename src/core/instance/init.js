import config from '../config';
import { mark, measure } from '../util/perf';
import { formatComponentName, mergeOptions } from '../util/index';
import { initProxy } from './proxy'
import { initLifecycle, callHook } from './lifecycle'
import { initEvents } from './events'
import { initRender } from './render'
import { initState } from './state'

let uid = 0;

export function initMixin (Vue: Class<Component>) {
      Vue.prototype._init = function (options?: Object) {
            const vm: Component = this;

            // a uid
            vm._uid = uid++;

            let startTag, endTag;


            /* istanbul ignore if */
            // 在非生产环境下，并且 config.performance 和 mark 都为真，那么才执行里面的代码
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                  // 标志开始
                  startTag = `vue-perf-start:${vm._uid}`;
                  // 标志结束
                  endTag = `vue-perf-end:${vm._uid}`;

                  mark(startTag);
            }

            // 被追踪性能的代码

            // 标识一个对象是Vue实例
            // 即如果发现一个对象拥有 _isVue 属性并且其值为 true，
            // 那么就代表该对象是 Vue 实例。这样可以避免该对象被响应系统观测（
            vm._isVue = true;
            // merge options
            // _isComponent参数是内部选项
            if (options && options._isComponent) {
                  // optimize internal component instantiation
                  // since dynamic options merging is pretty slow, and none of the
                  // internal component options needs special treatment.
                  // initInternalComponent(vm, options)
            } else {

                  // 在Vue实例上添加了 $options 属性
                  //  用于vue初始化实例
                  // 第一个参数是通过调用一个函数得到的，这个函数叫做 resolveConstructorOptions，
                  // 并将 vm.constructor 作为参数传递进去。
                  // 第二个参数 options 就是我们调用 Vue 构造函数时透传进来的对象，
                  // 第三个参数是当前 Vue 实例
                  vm.$options = mergeOptions(
                        resolveConstructorOptions(vm.constructor),
                        options || {},
                        vm
                  )
            }

            /* istanbul ignore else */

            // 非生产环境的话则执行 initProxy(vm) 函数
            if (process.env.NODE_ENV !== 'production') {
                  // 这个函数的主要作用其实就是在实例对象 vm 上添加 _renderProxy 属性
                  initProxy(vm)
            } else {
                  // 在生产环境则直接在实例上添加 _renderProxy 实例属性，该属性的值就是当前实例
                  vm._renderProxy = vm
            }

            // 在Vue实例对象 vm 上添加了 _self 属性，指向真实的实例本身
            vm._self = vm
            initLifecycle(vm)
            initEvents(vm)
            initRender(vm)

            // 调用生命周期钩子函数
            callHook(vm, 'beforeCreate')
            // resolve injections before data/props
            // initInjections(vm)

            // 包括了：initProps、initMethods、initData、initComputed 以及 initWatch
            // initState(vm)

            // resolve provide after data/props
            // initProvide(vm)

            callHook(vm, 'created')

            /* istanbul ignore if */
            // 在非生产环境下，并且 config.performance 和 mark 都为真，那么才执行里面的代码
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                  vm._name = formatComponentName(vm, false);

                  mark(endTag);

                  measure(`vue ${vm._name} init`, startTag, endTag);
            }


            // 到这一步时所有初始化已经完成
            if (vm.$options.el) {
                  vm.$mount(vm.$options.el)
            }
      }
}


// 解析构造函数选项 options
export function resolveConstructorOptions (Ctor: Class<Component>) {
      // Ctor 即传递进来的参数vm.constructor = Vue的构造函数
      let options = Ctor.options;

      // 判断  当前选项是否是子类
      // super 这个属性是与 Vue.extend 有关系的
      // if(Ctor.super) {
      // 递归调用了自身,此时参数是构造者的父类
      // const superOptions = resolveConstructorOptions(Ctor.super);
      // }

      return options;
}
