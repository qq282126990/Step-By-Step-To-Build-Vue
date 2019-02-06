/* @flow */

// 用来检测一个字符是否以 $ 或者 _ 开头
// 主要用来判断一个字段的建名是否是保留的
// 比如在 Vue 中不允许使用以 $或_开头的字符串作为 data 数据的字段名
export function isReserved (str: string): boolean {
      const c = (str + '').charCodeAt(0)

      return c === 0x24 || c === 0x5F
}


export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
      Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
      })
}

// 不是 \w，也就是说这个位置不能是 字母 或 数字 或 下划线
// 不是字符 .
// 不是字符 $
const bailRE = /[^\w.$]/

export function parsePath (path: string): any {
      // 使用该正则来匹配传递给 parsePath 的参数 path 如果匹配则直接返回
      // 返回值为 undefined
      // 也就是说如果 path 匹配正则 bailRE 那么最终 this.getter 将不是一个函数而是 undefined
      if (bailRE.test(path)) {
            return
      }

      // 定义 segments 常量
      // 它的值得通过字符 . 分割 path 字符串产生的数组
      const segments = path.split('.')

      // 返回一个函数, 遍历 segments 数组循环访问 path 指定的属性值
      // 这样就触发了数据属性的 get 拦截器
      // 注意 parsePath 返回的新函数将作为 this,getter 的值

      return function (obj) {
            for (let i = 0; i < segments.length; i++) {
                  if (!obj) return
                  obj = obj[segments[i]]
            }
            return obj
      }
}