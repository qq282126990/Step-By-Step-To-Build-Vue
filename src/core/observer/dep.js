import { remove } from '../util/index'

export default class Dep {
    static target: ?Watcher;
    id: number;
    subs: Array<Watcher>;

    constructor() {
        this.id = uid++
        this.subs = []
    }

    // 接受观察者对象作为参数
    // 并将接受到的观察者添加到 Dep 实例对象的 subs 数组中
    // 是真正用来收集观察者的方法，
    // 并且收集到的观察者都会被添加到 subs 数组中存起来。
    addSub (sub: Watcher) {
        this.subs.push(sub)
    }

    // 接受一个要被移除的观察者作为参数，然后使用 remove 工具函数 将观察者 从 this.subs 数组中移除
    removeSub (sub: Watcher) {
        remove(this.subs, sub)
    }

    // 通知变化
    notify () {
        // 遍历当前 Dep 实例对象的 subs 属性中所保存的所有观察者对象
        const subs = this.subs.slice();
        for (let i = 0, l = subs.length; i < l; i++) {
            // 逐个调用观察者对象的 update 方法，触发响应
            subs[i].update()
        }


    }
}

Dep.target = null
const targetStack = []

// 参数就是调用该函数的观察者对象
export function pushTarget (_target: ?Watcher) {
    // 用 Dep.target 属性赋值 = 保存者一个观察者对象
    if (Dep.target) targetStack.push(Dep.target)

    // 将接受到的参数赋值给 Dep.target 属性
    Dep.target = _target
}
