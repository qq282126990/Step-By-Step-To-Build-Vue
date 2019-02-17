/* @flow */
import {
      parsePath,
} from '../util/index'
import { pushTarget } from './dep'

export default class Watcher {
      /**
       * 
       * @param {组件实例对象 vm} vm 
       * @param {要观察的表达式} expOrFn 
       * @param {当被观测的表达式的值变化时的回调函数} cb 
       * @param {一些传递给当前观察者对象的选项} options 
       * @param {一个布尔值，用来标识该观察者实例是否是渲染函数的观察者} isRenderWatcher 
       */
      constructor(
            vm: Component,
            expOrFn: string | Function,
            cb: Function,
            options?: ?Object,
            isRenderWatcher?: boolean
      ) {
            // 将当前组件实例对象 vm 赋值给该观察者实例的 this.vm 属性
            this.vm = vm

            // 判断是否是渲染函数的观察者
            if (isRenderWatcher) {
                  // 组件实例的 _watcher 属性的值引用着该组件的渲染函数观察者
                  vm._watcher = this
            }
            // 将当前观察者实例对象 push 到 vm._watchers 数组中，
            // 也就是说属于该组件实例的观察者都会被添加到该组件实例对象的 vm._watchers 数组中
            vm._watchers.push(this)

            // 判断是否传递了 options 参数
            if (options) {
                  // 使用 options 对象中同名属性值的真假来初始化

                  // 告诉当前观察者实例对象是否是深度观测
                  this.deep = !!options.deep

                  // 表示当前观察者实例对象是 开发者定义的 还是 内部定义的
                  // 除了内部定义的观察者(如：渲染函数的观察者、计算属性的观察者等)之外，所有观察者都被认为是开发者定义的
                  this.user = !!options.user

                  // 表示当前观察者实例对象是否是计算属性的观察者
                  this.computed = !!options.computed

                  // 告诉观察者当前数据变化是否同步求值并执行回调
                  this.sync = !!options.sync

                  // options.before，可以理解为 Watcher 实例的钩子，当数据变化之后，触发更新之前，
                  // 调用在创建渲染函数的观察者实例对象时传递的 before 选项。
                  this.before = !!options.before

                  // 值为 cb 回调函数
                  this.cb = cb

                  // 观察者实例对象的唯一标识
                  this.id = ++uid

                  // 标识着该观察者实例对象是否是激活状态 默认值为 true 代表激活
                  this.active = true

                  // 该属性的值与 this.computed 属性的值相同
                  this.dirty = this.computed


                  // 实现避免收集重复依赖 且移除无用依赖的功能
                  this.deps = []
                  this.newDeps = []
                  this.depIds = new Set()
                  this.newDepIds = new Set()

            }
            else {
                  // 将当前观察者实例对象的四个属性全部初始化为 false
                  this.deep = this.user = this.computed = this.sync = false
            }


            // 非生产环境下该属性的值为表达式(expOrFn)的字符串表示 在生产环境下其值为空字符串
            this.expression = process.env.NODE_ENV !== 'production'
                  ? expOrFn.toString()
                  : ''

            // 检测 expOrFn 
            // 是函数直接使用 expOrFn 作为 this.getter 属性的值
            if (typeof expOrFn === 'function') {
                  this.getter = expOrFn
            }
            // 如果 expOrFn 不是函数，那么将 expOrFn 透传给 parsePath 函数
            // 并以 parsePath 函数的返回值作为 this.getter 属性的值
            else {
                  this.getter = parsePath(expOrFn)

                  if (!this.getter) {
                        this.getter = function () { }
                        process.env.NODE_ENV !== 'production' && console.warn(
                              `Failed watching path: "${expOrFn}" ` +
                              'Watcher only accepts simple dot-delimited paths. ' +
                              'For full control, use a function instead.',
                              vm
                        )
                  }
            }

            // 计算属性的观察者之外的所有观察者实例对象都将执行如上代码的 else 分支语句，
            // 即调用 this.get() 方法
            if (this.computed) {
                  this.value = undefined
                  this.dep = new Dep()
            } else {
                  this.value = this.get()
            }
      }


      // 求值
      // 第一个是能够触发访问器属性的 get 拦截器函数
      // 第二个是能获取被观察目标的值，并且能够触发访问器属性的 get 拦截器函数是依赖被手机的关键
      get () {
            // 将当前观察者实例对象作为参数传递
            pushTarget(this)

            // this.getter 函数的返回值
            let value

            const vm = this.vm

            try {
                  value = this.getter.call(vm, vm)
            } catch (e) {

            } finally {
                  popTarget()
                  // 清空 newDepIds 属性和 newDeps 属性的值
                  this.cleanupDeps()
            }



            return value
      }

      addDep (dep: Dep) {
            // 值为 Dep实例对象的唯一 id 值
            const id = dep.id

            // 避免手机重复依赖
            // 检测该 Dep 实例对象是否已经存在于 newDepIds 中
            // newDepIds 避免一次求值 过程中收集重复依赖
            if (!this.newDepIds.has(id)) {
                  // 同时将 dep.id 属性和 Dep实例对象本身分别添加到 newDepIds 和 newDeps 属性中
                  this.newDepIds.add(id)
                  this.newDeps.push(dep)

                  // depIds 在多次求值中避免收集重复依赖
                  // 多次求值是指当数据变化时重新求值的过程
                  if (!this.depIds.has(id)) {
                        dep.addSub(this)
                  }
            }
      }

      cleanupDeps () {
            let i = this.deps.length

            // 移除废弃的观测者
            // 对 deps 数组进行遍历 对上次求值所收集到的 Dep 对象进行遍历
            // 然后在循环内部检查上次求值所收集到的 Dep 实例对象是否存在于当前这次求值所收集到的 Dep 实例对象中
            while (i--) {
                  const dep = this.deps[i]
                  if (!this.newDepIds.has(dep.id)) {
                        dep.removeSub(this)
                  }
            }

            // 引用类型变量交换值的过程
            let tmp = this.depIds
            this.depIds = this.newDepIds
            this.newDepIds = tmp
            this.newDepIds.clear()

            tmp = this.deps
            this.deps = this.newDeps
            this.newDeps = tmp
            this.newDeps.length = 0
      }

      update () {
            // 省略...
      }

      run () {
            // 省略...
      }

      getAndInvoke (cb: Function) {
            // 省略...
      }

      evaluate () {
            // 省略...
      }

      depend () {
            if (Dep.target) {
                  Dep.target.addDep(this)
            }
      }

      teardown () {
            // 省略...
      }
}