/* @flow */

export * from './element';

/**
 * 如果元素选择器不是元素，则查询它。
 */
export function query (el: string | Element): Element {
      if (typeof el === 'string') {
            // 如果参数是字符串，
            // 那么将该字符串作为 css 选择符并使用 document.querySelector() 函数查询元素
            const selected = document.querySelector(el);

            // 在非生产环境下会打印警告信息并返回一个新创建的 div
            if (!selected) {
                  process.env.NODE_ENV !== 'production' &&
                        console.warn('Cannot find element: ' + el);

                  return document.createElement('div');
            }
            // 如果查找到该元素则返回该元素
            return selected;
      }
      else {
            return el;
      }
}