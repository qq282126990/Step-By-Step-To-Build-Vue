/* @flow */

export * from './element';

/**
 * 如果元素选择器不是元素，则查询它。
 */
export function query (el: string | Element): Element {
      if (typeof el === 'string') {
            const selected = document.querySelector(el);
            if (!selected) {
                  process.env.NODE_ENV !== 'production' &&
                        console.warn('Cannot find element: ' + el);

                  return document.createElement('div');
            }
            return selected;
      }
      else {
            return el;
      }
}