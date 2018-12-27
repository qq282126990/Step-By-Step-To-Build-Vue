/* @flow */

export function initExtend (Vue: GlobalAPI) {
      /**
      * 每个实例构造函数（包括Vue）都具有唯一性
      * cid。 这使我们能够创造包裹的“孩子”
      * 构造函数“用于原型继承并缓存它们。
      */
      Vue.cid = 0;// 静态属性
      let cid = 1;

      /**
       * 
       * 类继承
       * 
       * 静态方法
       */
      Vue.extend = function (extendOptions: Object): Function {

            return this;
      }
};