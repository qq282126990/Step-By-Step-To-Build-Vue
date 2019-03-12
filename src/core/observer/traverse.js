import { isObject } from "util";

/* @flow */
import { isObject } from '../util/index'

const seenObjects = new Set()

// 接收被观察属性的值作为参数
export function traverse (val: any) {
    // 调用 递归遍历
    _traverse(val, seenObjects)
    seenObjects.clear()
}

// 第一个参数观察属性的值
// 第二个属性 set 数据结构实例
function _traverse (val: any, seen: SimpleSet) {
    let i, keys
    const isA = Array.isArray(val)
    // 检查 val 是不是数组
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
        return
    }


    // 防止死循环 使用一个变量存储已经被遍历过的对象
    // 当再次遍历该对象时程序会发现该对象已经被遍历过了，这时会跳过遍历，从而避免死循环
    // 判断 val.__ob__ 是否有值 是否是响应式
    if (val.__ob__) {
        // 读取唯一 ID
        const depId = val.__ob__.dep.id;
        if (seen.has(depId)) {
            return
        }
        // 放到 seenObjects 中
        seen.add(depId)
    }

    // 深度观测 递归调用 _traverse 函数
    if (isA) {
        i = val.length
        while (i--) _traverse(val[i], seen)
    }
    else {
        key = Object.keys(val)
        i = keys.length
        while (i--) _traverse(val[keys[i]], seen);
    }
}
