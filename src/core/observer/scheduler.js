import {
    nextTick
  } from '../util/index'
let has: { [key: number]: ?true } = {}
const queue: Array<Watcher> = []
let flushing = false
let waiting = false

// 接受观察者对象作为参数
export function queueWatcher (watcher: Watcher) {
    // 定义 id 观察者对象的唯一 id
    const id = watcher.id

    // 避免将相同的观察者重复入队
    if (has[id] === null) {
        // 将观察者的 id 值登记到 has
        has[id] = true

        // 执行了真正的入队操作
        // flushing 只有当队列没有执行更新时才会简单地将观察者追加到队列的尾部
        if (!flushing) {
            // 将观察者添加到数组的尾部
            // 将会在突变完成之后统一执行关系
            queue.push(watcher)
        }
        // 队列正在执行更新
        // 保证观察者的执行顺序
        else {
            // 由于计算属性在实现方式上与普通响应式属性有所不同
            // 所以当触发计算属性的 get 拦截器函数时会有观察者入队的行为，
            // 这个时候我们需要特殊处理
            let i = queue.length - 1
            while (i > index && queue[i].id > watcher.id) {
                i--
            }
            queue.splice(i + 1, 0, watcher);
        }

        // 先将 waiting 的值设置为 true
        // 意味着无论调用多少次 queueWatcher 函数，该 if 语句块只会执行一次
        if (!waiting) {
            waiting = true

            // if (process.env.NODE_ENV !== 'production' && !config.async) {
            //     flushSchedulerQueue()
            //     return
            // }

            // flushSchedulerQueue 将队列中的观察者统一执行更新
            // flushSchedulerQueue 函数将会在下一次事件循环开始时立即调用
            nextTick(flushSchedulerQueue)
        }
    }
}
