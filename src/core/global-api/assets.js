/* @flow */
import { ASSET_TYPES } from '../../shared/constants'

export function initAssetRegisters (Vue: GlobalAPI) {
      /**
       * 创建 asset 注册方法
       */
      ASSET_TYPES.forEach(type => {
            Vue[type] = function (
                  id: string,
                  definition: Function | Object
            ): Function | Object | void {
                  if (!definition) {
                        return this.options[type + 's'][id];
                  }
                  else {

                  }
            }
      });

};