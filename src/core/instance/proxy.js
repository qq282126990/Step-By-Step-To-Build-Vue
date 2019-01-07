/* not type checking this file because flow doesn't play well with Proxy */
import config from '../../core/config'
import { makeMap } from '../util/index'

// 声明 initProxy 变量
let initProxy

// 只有在非生产环境下 initProxy 才有值
if (process.env.NODE_ENV !== 'production') {
      // 判断当前宿主环境是否支持原生 Proxy
      const hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/)

      // 检测宿主环境是否支持 proxy ，如果支持才会执行
      if (hasProxy) {
            // isBuiltInModifier 函数用来检测是否是内置的修饰符
            const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')

            // 为 config.keyCodes 设置 set 代理，防止内置修饰符被覆盖
            config.keyCodes = new Proxy(config.keyCodes, {
                  set (target, key, value) {
                        if (isBuiltInModifier(key)) {
                              console.warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
                              return false
                        }
                        else{
                              target[key = value]
                              return true
                        }
                  }
            })
      }


      // 判断给定的 key 是否出现在上面字符串中定义的关键字中的
      const allowedGlobals = makeMap(
            'Infinity,undefined,NaN,isFinite,isNaN,' +
            'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
            'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
            'require' // for Webpack/Browserify
      )

      // 警告信息提示你“在渲染的时候引用了 key，但是在实例对象上并没有定义 key 这个属性或方法”
      const warnNonPresent = (target, key) => {
            console.warn(
                  `Property or method "${key}" is not defined on the instance but ` +
                  'referenced during render. Make sure that this property is reactive, ' +
                  'either in the data option, or for class-based components, by ' +
                  'initializing the property. ' +
                  'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
                  target
            )
      }

      const warnReservedPrefix = (target, key) => {
            console.warn(
                  `Property "${key}" must be accessed with "$data.${key}" because ` +
                  'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
                  'prevent conflicts with Vue internals' +
                  'See: https://vuejs.org/v2/api/#data',
                  target
            )
      }

      // 属性查询: foo in proxy
      // 继承属性查询: foo in Object.create(proxy)
      // with 检查: with(proxy) { (foo); }
      // Reflect.has()
      const hasHandler = {
            // target 目标对象.
            // key 需要检查是否存在的属性
            has (target, key) {
                  // has 常量是真实经过 in 运算符得来的结果
                  const has = key in target
                  // 如果 key 在 allowedGlobals 之内，或者 key 是以下划线 _ 开头的字符串，则为真
                  const isAllowed = allowedGlobals(key) || (typeof key === 'string' && key.charAt(0) === '_')
                  // 如果 has 和 isAllowed 都为假，使用 warnNonPresent 函数打印错误

                  // !has 理解为你访问了一个没有定义在实例对象（或原型链上的属性）
                  // !isAllowed 当访问了一个虽然不在实例对象上的属性，但如果访问的是全局对象哪里也是可以被允许额允许的
                  if (!has && !isAllowed) {
                        warnNonPresent(target, key)
                  }
                  return has || !isAllowed
            }
      }

      // 检测到访问的属性不存在就给你一个警告
      const getHandler = {
            get (target, key) {
                  if (typeof key === 'string' && !(key in target)) {
                        if (key in target.$data) warnReservedPrefix(target, key)
                        else warnNonPresent(target, key)
                  }
                  return target[key]
            }
      }


      // 在这里初始化 initProxy
      // 接收一个参数，实际就是 Vue 实例对象
      // 实际上就是对实例对象 vm 的代理，通过原生的 Proxy 实现
      // 设置渲染函数的代理
      initProxy = function initProxy (vm) {
            if (hasProxy) {
                  const options = vm.$options

                  // render._withStripped只有手动设置为true才会生效
                  const handlers = options.render && options.render._withStripped
                        ? getHandler
                        : hasHandler

                  // hasProxy 顾名思义，
                  // 这是用来判断宿主环境是否支持 js 原生的 Proxy 特性的，
                  // 如果发现 Proxy 存在，则执行：
                  // ，如果有代理那么就会被拦截
                  vm._renderProxy = new Proxy(vm, handlers)
            }
            else {
                  vm._renderProxy = vm
            }
      }
}
// 导出
export { initProxy }