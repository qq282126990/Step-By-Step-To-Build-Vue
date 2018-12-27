/* @flow */
import { toArray } from '../util/index';

export function initUse (Vue: GlobalAPI) {
      Vue.use = function (plugin: Function | Object) {

            // 安装插件
            const installedPlugins = (this._installedPlugins || (this._installedPlugins = []));

            if (installedPlugins.indexOf(plugin) > -1) {
                  return this;
            }

            // 附加参数
            const args = toArray(arguments, 1);
            // 数组的开头添加一个或更多元素
            args.unshift(this);

            if (typeof plugin.install === 'function') {
                  plugin.install.apply(plugin, args);
            }
            else if (typeof plugin === 'function') {
                  plugin.apply(null, args);
            }

            installedPlugins.push(plugin);

            return this;
      }
};