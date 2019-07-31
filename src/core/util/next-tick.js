/* globals MessageChannel */
import { isIOS, isNative } from './env'
import { handleError } from './error'

let microTimerFunc
let macroTimerFunc
const callbacks = []
let pending = false

// 将回调全部执行并清空
function flushCallbacks () {
    // 将变量 pending 重置为 false
    pending = false

    // 使用 copies 保存一份 callbacks
    const copies = callbacks.slice(0)
    // 将 callbacks 数组清空
    callbacks.length = 0
    // 遍历 copies 数组
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

// macroTimerFunc 将 flushCallbacks 函数注册为 macrotask
// 将一个回调函数注册为 macrotask 的方式有很多
// setTimeout setInterval setImmediate 等等
// 首选方案是 setImmediate 因为 setImmediate 拥有比 setTimeout 更好的性能
// setTimeout 在将回调注册为 macrotask 之前要不听的做超时检测
// setImmediate 不需要
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {

}
// 为兼容非 IE 浏览器做兼容处理
else if (typeof MessageChannel !== 'undefined' &&
    (isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]'
    )) {
    // 一个 MessageChannel 实例对象拥有两个属性 port1 和 port2
    // 让其中一个 port1 监听 onmessage 事件
    // 使用另外一个 port2 的 postMessage 来向前一个 port1 发送消息即可
    // 这样前一个 port1 的 onmessage 回调就会被注册为 macrotask
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = flushCallbacks
    macroTimerFunc = () => {
        port.postMessage(1)
    }
}
// setTimeout 被作为最后的备选方案：
else {
    macroTimerFunc = () => {
        setTimeout(flushCallbacks, 0)
    }
}

// 检测当前宿主环境是否支持原生 Promise
// 支持者优先使用 Promise 注册 microtack
if (typeof Promise !== 'undefined' && isNative(Promise)) {
    // 立即 resolve 的 Promise 实例对象
    const p = Promise.resolve()

    // 定义一个函数 执行 将 flushCallbacks 函数注册为 microtack
    microTimerFunc = () => {
        p.then(flushCallbacks)

        // ，在一些 UIWebViews 中存在很奇怪的问题
        // 即 microtack 没有被刷新
        // 解决方案就是让浏览器做一些其他的事情比如注册一个 macrotask
        // 即使这个 macrotask 什么都不做，这样就能间接触发 microtack 的刷新
        if (isIOS) setTimeout(noop)
    }
}
// 如果宿主环境不支持 Promise
// 降级处理，即注册 macrotask
else {
    microTimerFunc = macroTimerFunc
}

// 第二个参数是硬编码为当前组件实例对象 this
// $nextTick 方法会返回一个 promise 实例对象
export function nextTick (cb?: Function, ctx?: Object) {
    let _resolve

    // 将 cb 添加到 callbacks 数组中间接调用 cb 回调函数
    callbacks.push(() => {

        if (cb) {
            try {
                // 使用 .call 方法将 cb 的作用域设置为 ctx
                // 传递给 $nextTick 方法的回调函数的作用域就是当前组件实例对象
                cb.call(ctx)
            }
            catch (e) {
                handleError(e, ctx, 'nextTick')
            }
        }
        // 没有传入 cb 参数 直接调用 _resolve 函数
        // 返回 Promise 实例对象 resolve 函数
        else if (_resolve) {
            _resolve(ctx)
        }

    })

    // 判断变量 pending 的真假
    // 代表回调队列是否处于等待刷新的状态
    // 初始为 false 代表 回调队列为空不需要等待刷新
    if (!pending) {
        // 优先将变量 pending 设置为 true 代表着此刻回调队列不为空，正在等待刷新
        pending = true
        if (useMacroTask) {
            macroTimerFunc()
        } else {
            microTimerFunc()
        }
    }

    // 当 nextTick 函数没有接收到 cb 参数时，
    // 会检测当前宿主环境是否支持 Promise
    // 支持则直接返回一个 Promise 实例对象
    // 并且将 resolve 函数赋值给 _resolve
    if (!cb && typeof Promise !== 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}
