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
 * 创建纯函数的缓存版本。
 */
export function cached<F: Function> (fn: F): F {
      const cache = Object.create(null);
      return (function cachedFn (str: string) {
            const hit = cache[str];
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