/* @flow */

export function stateMixin (Vue: Class<Component>) {
      // flow 不知何故有直接声明的定义对象的问题
      // 当使用Object.defineProperty时，我们必须在程序上建立
      // 这里的对象


      // 定义 $data 对象
      const dataDef = {};
      dataDef.get = function () { return this._data };

      // 定义 $props 定义
      const propsDef = {};
      propsDef.get = function () { return this._props };

      // 判断如果是生产模式 为 dataDef 和 propsDef 设置 set 表示不允许修改
      if (process.env.NODE_ENV !== 'production') {
          dataDef.set = function () {
                console.warn('避免替换实例根 $data' + '改用嵌套数据属性' + this);
          }

          propsDef.set = function () {
                console.warn('$props 是只读的' + this);
          }
      }

      // 使用 Object.defineProperty 在 Vue.prototype 上定义两个属性
      // 就是 $data 和 $props 
      Object.defineProperty(Vue.prototype, '$data', dataDef);
      Object.defineProperty(Vue.prototype, '$props', propsDef);
}