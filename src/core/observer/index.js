/* @flow */
import {
      def,
      isObject,
      hasOwn,
      isPlainObject
} from '../util/index'
import VNode from '../vdom/vnode'
import isPlainObject = require('is-plain-object');


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


            if () {

            }
            else {
                  
            }
      }

      walk (obj: Object) {


      }

      observeArray (items: Array<any>) {

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


      return ob
}
