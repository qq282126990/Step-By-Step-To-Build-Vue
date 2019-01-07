/* @flow */
import {
      nativeWatch,
} from '../util/index'

export function stateMixin (Vue: Class<Component>) {
      // flow 不知何故有直接声明的定义对象的问题
      // 当使用Object.defineProperty时，我们必须在程序上建立
      // 这里的对象


      // 定义 $data 对象
      const dataDef = {};
      dataDef.get = function () { return this._data };

      // 定义 $props 定义
      const propsDef = {};
      propsDef.get = function () { return this._props };

      // 判断如果是生产模式 为 dataDef 和 propsDef 设置 set 表示不允许修改
      if (process.env.NODE_ENV !== 'production') {
            dataDef.set = function () {
                  console.warn('避免替换实例根 $data' + '改用嵌套数据属性' + this);
            }

            propsDef.set = function () {
                  console.warn('$props 是只读的' + this);
            }
      }

      // 使用 Object.defineProperty 在 Vue.prototype 上定义两个属性
      // 就是 $data 和 $props 
      Object.defineProperty(Vue.prototype, '$data', dataDef);
      Object.defineProperty(Vue.prototype, '$props', propsDef);
}

// 选项初始化的汇总，包括：props、methods、data、computed 和 watch 等
// props 初始化早于 data 选项初始化，所有可以使用 props 初始化 data 数据
export function initState (vm: Component, propsOptions: Object) {
      // 在 Vue 实例对象添加一个属性
      // 用来存储所有该组件实例的 watcher 对象
      vm._watchers = []

      // vm.$options 的引用
      const opts = vm.$options

      // 如果 opts.props 存在，
      // 即选项中有 props 那么就调用 initProps 初始化props 选项
      // if (opts.props) initProps(vm, opts.props)
      // 如果 opts.methods 存在，则调用 initMethods 初始化 methods 选项
      // if (opts.methods) initMethods(vm, opts.methods)

      // 首先判断 data 选项是否存在\
      // 如果存在则调用 initData 初始化 data 选项
      // 如果不存在则直接调用 observe 函数观测一个空对象：{}
      if (opts.data) {
            // initData(vm)
      }
      else {
            // observe(vm._data = {}, true /* asRootData */)
      }

      // 采用同样的方式初始化 computed 选项
      // if (opts.computed) initComputed(vm, opts.computed)

      // 对于 watch 选项仅仅判断 optis.watch 是否存在还不够
      // 还要判断 opts.watch 是不是原升的 watch 对象
      // 因为在 Firefox 中原生提供了 Object.prototype.watch 函数
      if (opts.watch && opts.watch !== nativeWatch) {
            // initWatch(vm, opts.watch)
      }

}