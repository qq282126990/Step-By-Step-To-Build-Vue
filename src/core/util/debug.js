/* @flow */
import { noop } from '../../shared/util';

// 格式组件名称
export let formatComponentName = (noop: any);

if (process.env.NODE_ENV !== 'production') {
      // 分类
      const classify = str => str
            .replace(classifyRE, c => c.toUpperCase())
            .replace(/[-_]/g, '')
      const classifyRE = /(?:^|[-_])(\w)/g;

      formatComponentName = (vm, includeFile) => {
            if (vm.$root === vm) {
                  return '<Root>'
            }

            const options = typeof vm === 'function' && vm.cid !== null
                  ? vm.options : vm._isVue ?
                        vm.$options || vm.constructor.options : vm;

            let name = options.name || options._componentTag;
            const file = options.__file;

            if (!name && file) {
                  const match = file.match(/([^/\\]+)\.vue$/);
                  name = match && match[1];
            }

            return (
                  (name ? `<${classify(name)}>` : `<Anonymous>`) +
                  (file && includeFile !== false ? ` at ${file}` : '')
            )
      }
}