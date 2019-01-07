/* @flow */
import config from '../config'
import { inBrowser } from './env'

// * `{any} vm` 这里应该传递 `Vue` 实例
// * `{String} info` `Vue` 特定的错误提示信息
export function handleError (err: Error, vm: any, info: string) {
      if (vm) {
            let cur = vm
            // 链表遍历，逐层寻找父级组件
            while ((cur = cur.$parent)) {
                  const hooks = cur.$options.errorCaptured
                  // 如果父级组件使用了 errorCaptured 选项，则调用
                  if (hooks) {
                        // errorCaptured 选项内部是以一个数字形式存在的，所以需要 for 循环遍历
                        for (let i = 0; i < hooks.length; i++) {
                              try {
                                    const capture = hooks[i].call(cur, err, vm, info) === false
                                    // capture 是钩子调用的返回值与 false 做全等比较的结果
                                    // 如果 errorCaptured 钩子函数返回假，那么 capture 为真直接 return
                                    // 程序不会走 if 语句块后面的 globalHandleError
                                    // 如果 errorCaptured 钩子函数返回假将阻止错误继续向“上级”传递
                                    if (capture) return
                              } catch (e) {
                                    globalHandleError(e, cur, 'errorCaptured hook')
                              }
                        }
                  }
            }
      }
}


function globalHandleError (err, vm, info) {
      // 实现判断 config.errorHandler 是否为真
      // 如果为真则调用 config.errorHandler 并将参数透传
      // ，这里的 config.errorHandler 就是 Vue 全局API提供的用于自定义错误处理的配置
      if (config.errorHandler) {
            try {
                  return config.errorHandler.call(null, err, vm.info)
            } catch (e) {
                  // 当发生错误时使用 logError 函数打印错误
                  logError(e, null, 'config.errorHandler')
            }
      }

      logError(err, vm, info)
}

function logError (err, vm, info) {
      // 在非生产环境下，先使用 warn 函数报一个警告
      if (process.env.NODE_ENV !== 'production') {
            console.warn(`Error in ${info}: "${err.toString()}"`, vm)
      }

      // 判断是否在浏览器或者Weex环境且 console 是否可用
      /* istanbul ignore else */
      if (inBrowser && typeof console !== 'undefined') {
            console.error(err)
      }
      // 没有则直接 throw err
      else {
            throw err
      }

}