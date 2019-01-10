/* @flow */

// 用来检测一个字符是否以 $ 或者 _ 开头
// 主要用来判断一个字段的建名是否是保留的
// 比如在 Vue 中不允许使用以 $或_开头的字符串作为 data 数据的字段名
export function isReserved (str: string): boolean {
      const c = (str + '').charCodeAt(0)

      return c === 0x24 || c === 0x5F
}