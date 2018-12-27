/* @flow */

export function eventsMixin (Vue: Class<Component>) {

      // 监听当前实例上的自定义事件。事件可以由vm.$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
      Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
            const vm: Component = this

            return vm
      }

      // 监听一个自定义事件，但是只触发一次，在第一次触发之后移除监听器。
      Vue.prototype.$once = function (event: string, fn: Function): Component {
            const vm: Component = this

            return vm
      }

      // 移除自定义事件监听器。
      // 如果没有提供参数，则移除所有的事件监听器；
      // 如果只提供了事件，则移除该事件所有的监听器；
      // 如果同时提供了事件与回调，则只移除这个回调的监听器。
      Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
            const vm: Component = this

            return vm
      }

      // 触发当前实例上的事件。附加参数都会传给监听器回调。
      Vue.prototype.$emit = function (event: string): Component {
            const vm: Component = this

            return vm
      }
};