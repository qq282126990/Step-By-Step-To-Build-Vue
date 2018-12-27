import { initMixin } from './init';
import { stateMixin } from './state'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'

function Vue (options) {
      // 使用安全模式来提醒你要使用 new 操作符来调用 Vue
      if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
            console.warn('Vue is a constructor and should be called with the `new` keyword')
      }

      console.log(options)
      // 初始化 当执行 new Vue() 时 this._init(options) 将被执行
      this._init(options);
}

initMixin(Vue);
// 状态
stateMixin(Vue);
// 事件
eventsMixin(Vue);
// 生命周期
lifecycleMixin(Vue);
// 渲染
renderMixin(Vue);

// 导出Vue
export default Vue
