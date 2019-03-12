/* @flow */

/**
 *
 * 将属性混合到目标对象中
 */
export function extend (to: Object, _from: ?Object): Object {
    for (const key in _from) {
        to[key] = _from[key];
    }

    return to;
}

/**
 *
 * 将类数组对象转换为实数数组。
 *
 * list 类数组list
 *
 * start 开始转换索引
 *
 * toArray 接受两个参数,分别为类数组 list 和开始转换索引 start（默认从0开始）
 * 通过 new Array() 创建长度为 i 的数组
 * while 循环 对 ret 每一项赋值 最后返回转换后的数组 ret
 */
export function toArray (list: any, start?: number): Array<any> {
    start = start || 0;
    let i = list.length - start;

    const ret: Array<any> = new Array(i);

    while (i--) {
        ret[i] = list[i + start];
    }

    return ret;
}

/**
 * 总是返回false。
 */
export const no = (a?: any, b?: any, c?: any) => false;


/**
 * 不执行任何操作。
 * Stubbing args使Flow流畅，而不会留下无用的转换代码
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop (a?: any, b?: any, c?: any) { };


/**
 * 返回相同的值。
 */
export const identity = (_: any) => _;

/**
 * 为一个纯函数创建一个缓存版本的函数
 *
 * 纯函数有一个特性，即输入不变则输出不变
 */
export function cached<F: Function> (fn: F): F {
    // 首先创建一个 cache 对象：
    const cache = Object.create(null);

    // 随后返回一个函数：
    return (function cachedFn (str: string) {
        // 这个函数与原函数 fn 的区别就在于：先读取缓存
        const hit = cache[str];
        // 如果有命中则直接返回缓存的值，否则采用原函数 fn 计算一次并且设置缓存 返回结果
        return hit || (cache[str] = fn(str));
    }: any);
}

/**
 * 检查是否是内置的标签
 *
 * 可知：slot 和 component 为 Vue 内置的标签
 */
export const isBuiltInTag = makeMap('slot,component', true);

// makeMap 函数首先根据一个字符串生成一个 map，
// 然后根据该 map 产生一个新函数，
// 新函数接收一个字符串参数作为 key，
// 如果这个 key 在 map 中则返回 true，
// 否则返回 undefined。
/**
 *
 * {String} str 一个以逗号分隔的字符串
 * {Boolean} expectsLowerCase 是否小写
 */
export function makeMap (str: string,
    expectsLowerCase?: boolean):
    (key: string) => true | void {
    const map = Object.create(null);
    const list: Array<string> = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }

    // 新函数接收一个字符串参数作为 key，
    // 如果这个 key 在 map 中则返回 true，否则返回 undefined。
    return expectsLowerCase ? val => map[val.toLocaleLowerCase()] : val => map[val];
}


/**
 * 连字符转驼峰
 */
const camelizeRE = /-(\w)/g;
export const camelize = cached((str: string): string => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
});


/**
 * 判断给定变量是否是纯对象
 */
/**
 * 获取值的原始类型字符串，例如[object Object]。
 */
const _toString = Object.prototype.toString

export function isPlainObject (obj: any): boolean {
    return _toString.call(obj) === '[object Object]';
}

/**
 * 获取值的原始类型字符串，例如 [object Object]
 */
export function toRawType (value: any): string {
    return _toString.call(value).slice(8, -1);
}

/**
 * 检查对象 obj 是否具有属性值key
 */

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

// 创建一个空的冻结对象 emptyObject，
// 这意味着 emptyObject 是不可扩展、不可配置、不可写的。
export const emptyObject = Object.freeze({})

// 判断给定变量是否是未定义，当变量值为 null 时，也会认为其未定义
export function isUndef (v: any): boolean % checks {
    return v === undefined || v === null
}

// 判断给定变量是否是原始类型值，即：string、number、boolean以及 symbol
export function isPrimitive (value: any): boolean % checks  {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        // $flow-disable-line
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

// 判断给定变量的值是否是有效的数组索引。如果是有效的则返回 true，否则返回 false。
export function isValidArrayIndex (val: any): boolean {
    const n = parseFloat(String(val))

    // n >= 0 && Math.floor(n) === n 保证了索引是一个大于等于 0 的整数
    // isFinite(val) 保证了该值是有限的
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

// 从数组中移除指定元素
export function remove (arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item)

        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

// 当值为 JSON-compliant 类型是，用于区分对象和初始值
export function isObject (obj: mixed): boolean % checks {
    return obj !== null && typeof obj === 'object'
}
