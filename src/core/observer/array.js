import { def } from '../util/index'

// 缓存 Array.prototype
const arrayProto = Array.prototype
// arrayMethods 对象的 __proto__ 属性指向了真正数组的原型对象
// 实现 arrayMethods.__proto__ === Array.prototype
export const arrayMethods = Object.create(arrayProto)

// 要拦截的数组变异方法
const methodsToPatch = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
]

// 使用 def 函数在 arrayMethods 对象上定义与数组变异方法同名的函数
// 从而做到拦截
methodsToPatch.forEach(method => {
      // 缓存数组原本的变异方法
      const original = arrayProto[method]
      // 使用def 函数在 arrayMethods 上定义与数组变异方法同名的函数
      def(arrayMethods, method, function mutator (...args) {
            // 在函数体内优先调用了缓存下来的数组变异方法
            const result = original.apply(this, args)
            // 定义了 ob 常量，他说 this.__ob__ 的引用
            const ob = this.__ob__

            // 保存那些被新添加进来的数组元素
            let inserted

            switch (method) {
                  // 当遇到 push 和 unshift 操作时
                  // 那么新增的元素实际上就是传递给这两个方法的参数
                  // 所以可以直接将 inserted 的值设置为 args
                  case 'push':
                  case 'unshift':
                        inserted = args
                        break;
                  // 当遇到 splice 操作时，我们知道 splice 函数从第三个参数开始到
                  // 最后一个参数都是数组的新增元素，所以直接使用 args.slice(2) 作为 inserted 的值即可
                  case 'splice':
                        inserted = args.slice(2)
                        break
            }

            // inserted 变量中所保存的就是新增的数组元素，
            // 我们只需要调用 observeArray 函数对其进行观测即可
            if (inserted) ob.observeArray(inserted)

            // 当调用数组变异方法时，必然修改了数组，
            // 所以这个时候需要将该数组的所有依赖(观察者)全部拿出来执行
            // notify change
            ob.dep.notify()

            return result
      })
})
