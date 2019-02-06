/* @flow */
import {
      def,
      isObject,
      hasOwn,
      hasProto,
      isPlainObject,
      isUndef,
      isPrimitive,
      isValidArrayIndex
} from '../util/index'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'

const arr = []
// 获取所有属于 arrayMethods 对象自身的键
// 我们要拦截的数组变异方法
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
// 通过一个循环在数组实例上定义与变异方法同名的函数
// arrayKeys.forEach(method => {
//       Object.defineProperty(arr, method, {
//             enumerable: false,
//             writable: true,
//             configurable: true,
//             value: arrayMethods[method]
//       })
// })

/**
 *在某些情况下，我们可能希望禁用组件内部的观察
 *更新计算。
 */
export let shouldObserve: boolean = true

// 切换 shouldObserve 变量的真假值
export function toggleObserving (value: boolean) {
      shouldObserve = value
}


export function set (target: Array<any> | Object, key: any, val: any): any {
      return val
}


export class Observer {
      value: any;
      dep: Dep;
      vmCount: number; // number of vms that have this object as root $data

      constructor(value: any) {
            // 引用数据对象
            this.value = value
            // 保存一个新创建的 Dep 实例对象
            this.dep = new Dep()
            this.vmCount = 0
            def(value, '__ob__', this)

            // 区分数据对象到底是数组还是一个纯对象
            if (Array.isArray(value)) {
                  // 根据 hasProto 判断
                  const augment = hasProto
                        ? protoAugment
                        : copyAugment
                  augment(value, arrayMethods, arrayKeys)
                  this.observeArray(value)
            }
            else {
                  this.walk(value)
            }
      }

      // 处理对象方法
      walk (obj: Object) {
            // 获取对象多有可枚举的数据
            const keys = Object.keys(obj)
            // 遍历这些数据,同时为每个对象调用 defineReactive 函数
            for (let i = 0; i < keys.length; i++) {
                  defineReactive(obj, keys[i])
            }
      }

      // 为了使嵌套的数组或对象同样是响应式数据
      // 我们需要递归的观测那些类型为数组或对象的数组元素
      observeArray (items: Array<any>) {
            for (let i = 0, l = items.length; i < l; i++) {
                  observe(items[i])
            }
      }
}

// 将数组实例的原型指向代理原型 arrayMethods
function protoAugment (target, src: Object, keys: any) {
      /* eslint-disable no-proto */
      target.__proto__ = src
      /* eslint-disable no-proto */
}

// 环境不支持 __proto__ 属性的情况
// 通过 for 循环对其进行遍历，
// 并使用 def 函数在数组实例上定义与数组变异方法同名的且不可枚举的函数
function copyAugment (target: Object, src: Object, keys: Array<string>) {
      for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i]
            def(target, key, src[key])
      }
}


// 第一个参数是要观测的数据
// 第二个参数是一个布尔值，代表将要被观测的数据是否是根级数据
export function observe (value: any, asRootData: ?boolean): Observer | void {
      // 判断观测的数据不是一个对象或者 VNode 实例 则直接 return
      if (!isObject(value) || value instanceof VNode) {
            return
      }

      let ob: Observer | void

      // 使用 hasOwn 函数观测数据对象 value 自身是否包含有 __ob__ 属性
      // 并且 __ob__ 属性应该是 Observer 的实例。
      //  if 分支的作用是用来避免重复观测一个数据对象
      if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            // 将数据对象自身的 __ob__ 属性的值作为 ob 的值
            ob = value.__ob__
      }
      else if (
            shouldObserve &&
            // 只有当数据对象是数组或纯对象的时候才有必要对其进行观测
            (Array.isArray(value) || isPlainObject(value)),
            // 被观测对象必须是可扩展的
            // 一个普通的对象默认就是可扩展的，以下三个方法都可以使得一个对象变得不可扩展：
            // Object.preventExtensions()、Object.freeze() 以及 Object.seal()。
            Object.isExtensible(value),
            // 避免 Vue 实例对象被观测
            !value._isVue
      ) {
            ob = new Observer(value)
      }

      // 第二个参数指示着被观测的数据对象是否是根数据对象
      // 什么叫根数据对象呢？那就看 asRootData 什么时候为 true 即可
      // 所谓的根数据对象就是 data 对象
      if (asRootData && ob) {
            ob.vmCount++
      }

      return ob
}


// 在Object上定义反应属性。
export function defineReactive (
      obj: Object,
      key: string,
      val: any,
      customSetter?: ?Function,
      shallow?: boolean
) {
      const dep = new Dep()

      // 首先通过 Object.getOwnPropertyDescriptor 函数获取该字段可能已有的属性描述对象
      const property = Object.getOwnPropertyDescriptor(obj, key)
      // 判断该字段是否可配置
      if (property && property.configurable === false) {
            return
      }

      //  分别保存了来自 property 对象的 get 和 set 函数
      const getter = property && property.get
      const setter = property && property.set

      // arguments.length === 2 当只传递两个参数时，说明没有传递第三个参数 val，
      // 那么此时需要根据 key 主动去对象上获取相应的值
      //  在 defineReactive 函数内获取属性值
      // (!getter || setter)
      // 当属性拥有原本的 setter 时 即使拥有 getter 也要获取属性值并观测
      if ((!getter || setter) && arguments.length === 2) {
            val = obj[key]
      }
      // 在 if 语句块里面，获取到了对象属性的值 val，
      // 但是 val 本身有可能也是一个对象，
      // 那么此时应该继续调用 observe(val) 函数观测该对象从而深度观测数据对象。
      // 但前提是 defineReactive 函数的最后一个参数 shallow 应该是假
      // 由于在 walk 函数中调用 defineReactive 函数时没有传递 shallow 参数，
      // 所以该参数是 undefined，那么也就是说默认就是深度观测
      let childOb = !shallow && observe(val)


      Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            // 通过闭包引用了前面定义的“筐”，即 dep 常量
            // 两部分重要的工作，一个是返回正确的属性值，另一个是收集依赖
            get: function reactiveGetter () {
                  // 判断是否存在 getter ， getter 常量中保存的是属性原有的 get 函数
                  // 如果 getter 存在那么直接调用该函数，并以该函数的返回值作为属性的值,保证属性的原有读取操作正常运作
                  const value = getter ? getter.call(obj) : val

                  // 收集依赖
                  // Dep.target 保存的值就是要被手机的依赖
                  if (Dep.target) {
                        // 这里闭包引用了上面的 dep 常量
                        // 依赖被收集了
                        // 将依赖收集到 dep 中
                        // dep 对象就是属性的 getter/setter 通过闭包引用的“筐”。
                        dep.depend()


                        if (childOb) {
                              // 依赖收集到 obj,__ob__.dep 这里”筐“里
                              // 收集的依赖的触发时机是在使用 $set 或 Vue.set 给数据对象添加新属性时触发
                              // 在没有 Proxy 之前 Vue 没办法拦截到给对象添加属性的操作
                              // 触发依赖 通过数据对象的 __ob__ 属性做到的
                              childOb.dep.depend()

                              // 读取的属性值是数组，那么需要调用 dependArray 函数逐个触发数组每个元素的依赖收集
                              if (Array.isArray(value)) {
                                    dependArray(value)
                              }
                        }
                  }

                  return value
            },
            // 第一正确地为属性设置新值，第二是能够触发相应的依赖。
            set: function reactiveSetter (newVal) {
                  //  取得属性原有的值
                  // 我们需要拿到原有的值与新的值作比较
                  // 只有在原有值与新设置的值不相等的情况下才需要触发依赖和重新设置属性值，
                  // 否则意味着属性值并没有改变，当然不需要做额外的处理
                  const value = getter ? getter.call(obj) : val

                  // 对比新值和旧值
                  // newVal !== newVal 说明新值与新值自身都不全等，
                  // 同时旧值与旧值自身也不全等
                  // NaN === NaN // false
                  /* eslint-disable no-self-compare */
                  if (newVal === value || (newVal !== newVal && value !== value)) {
                        return
                  }

                  // 如果 customSetter 函数存在
                  // 那么在非生产环境下执行 customSetter 函数
                  // 你尝试修改 属性的值时，打印一段信息： 属性是只读的
                  /* eslint-enable no-self-compare */
                  if (process.env.NODE_ENV !== 'production' && customSetter) {
                        customSetter()
                  }

                  // 判断 setter 是否存在
                  // 如果属性原来拥有自身的 set 函数，
                  // 那么应该继续使用该函数来设置属性的值，
                  // 从而保证属性原有的设置操作不受影响
                  if (setter) {
                        setter.call(obj, newVal)
                  }
                  else {
                        val = newVal
                  }

                  // 使用新的观测对象重写 childOb 的值
                  // 需要深度观测的时候才会执行
                  childOb = !shallow && observe(newVal)

                  // 这里闭包引用了上面的 dep 常量
                  dep.notify()
            }
      })

}


// 当被读取的数据对象的属性值是数组时，会调用 dependArray 函数
function dependArray (value: Array<any>) {
      // 将通过 for 循环遍历数组，并取得数组每一个元素的值
      for (let e, i = 0, l = value.length; i < l; i++) {
            e = value[i]

            // 如果该元素的值拥有__ob__对象和__ob__.dep对象，
            // 那么说明该元素也是一个对象或数组
            // 那么需要递归调用 dependArray 继续收集依赖
            e && e.__ob__ && e.__ob__.dep.depend()
            if (Array.isArray(e)) {
                  dependArray(e)
            }
      }
}



// 第一个参数 target 是将要被添加属性的对象
// 第二个参数 key 以及第三个参数 val 分别是要添加属性的键名和值。
export function set (target: Array<any> | Object, key: any, val: any): any {
      // isUndef 函数用来判断一个值是否是 undefined 或 null
      // isPrimitive 函数用来判断一个值是否是原始类型值
      // 如果 set 函数的第一个参数是 undefined 或 null 或者是原始类型值，那么在非生产环境下会打印警告信息
      if (process.env.NODE_ENV !== 'production' &&
            (isUndef(target) || isPrimitive(target))
      ) {
            console.warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
      }

      // 对 target 和 key 这两个参数做了校验
      // 如果 target 是一个数组，并且 key 是一个有效的数组索引，就执行
      if (Array.isArray(target) && isValidArrayIndex(key)) {

            // 将数组的长度修改为 target.length 和 key 中的较大者，
            // 否者如果当设置的元素索引大于数组长度时 splice 无效
            target.length = Math.max(target.length, key)
            // 数组的 splice 变异方法能够完成数组元素的 删除、添加、替换等操作
            // target.splice(key, 1, val) 就利用了替换元素的能力
            // 将指定位置元素的值替换为新值
            target.splice(key, 1, val)
            return val
      }

      // 当给一个纯对象设置属性的时候，
      // 假设该属性已经在对象上有定义了，
      // 那么只需要直接设置该属性的值即可，这将自动触发响应
      if (key in target && !(key in Object.prototype)) {
            target[key] = val
            return val
      }

      // 数据对象 __ob__ 属性的引用
      const ob = (target: any).__ob__

      // Vue 实例对象拥有 _isVue 属性
      // 当第一个条件成立时，那么说明你正在使用 Vue.set/$set 函数为 Vue 实例对象添加属性
      // 不能使用 Vue.set/$set 函数为根数据或 Vue 实例对象添加属性
      if (target._isVue || (ob && ob.vmCount)) {
            process.env.NODE_ENV !== 'production' && console.warn(
                  'Avoid adding reactive properties to a Vue instance or its root $data ' +
                  'at runtime - declare it upfront in the data option.'
            )
            return val
      }

      // target 也许原本就是非响应的
      // target.__ob__ 是不存在的，所以当发现 target.__ob__ 不存在时，就简单的赋值即可
      if (!ob) {
            target[key] = val
            return val
      }

      // 使用 defineReactive 函数设置属性值,保证新添加的属性是响应式的
      defineReactive(ob.value, key, val)
      // 高亮的代码调用了 __ob__.dep.notify() 从而触发响应
      ob.dep.notify()

      return val
}

// 接收两个参数，分别是将要被删除属性的目标对象 target 以及要删除属性的键名 key
export function del (target: Array<any> | Object, key: any) {
      // 检测 target 是否是 undefined 或 null 或者是原始类型值
      if (process.env.NODE_ENV !== 'production' &&
            (isUndef(target) || isPrimitive(target))
      ) {
            console.warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
      }

      // 如果我们使用 Vue.delete/$delete 去删除一个数组的索引
      // 上面代码会被执行
      // 前提是参数 key 需要时一个有效的数组索引
      if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1)
            return
      }

      const ob = (target: any).__ob__
      // Vue 实例对象拥有 _isVue 属性
      // 不能使用 Vue.delete/$delete 删除 Vue 实例对象或根数据的属性
      // 不允许删除 Vue 实例对象的属性
      if (target._isVue || (ob && ob.vmCount)) {
            process.env.NODE_ENV !== 'production' && console.warn(
                  'Avoid adding reactive properties to a Vue instance or its root $data ' +
                  'at runtime - declare it upfront in the data option.'
            )
            return val
      }


      // 检测 key 是否是 target 对象自身拥有的属性
      if (!hasOwn(target, key)) {
            return
      }

      // 删除属性 key
      delete target[key]

      // 最后判断 ob 对象是否存在
      // 如果不存在说明 target 对象原本就不是响应的
      if (!ob) {
            return
      }

      // 触发响应
      ob.dep.notify()
}
