/* @flow */
import { no, noop, identity } from '../shared/util';
import { LIFECYCLE_HOOKS } from '../shared/constants';

export type Config = {
      // user
      optionMergeStrategies: { [key: string]: Function };
      silent: boolean;
      productionTip: boolean;
      performance: boolean;
      devtools: boolean;
      errorHandler: ?(err: Error, vm: Component, info: string) => void;
      warnHandler: ?(msg: string, vm: Component, trace: string) => void;
      ignoredElements: Array<string | RegExp>;
      keyCodes: { [key: string]: number | Array<number> };

      // platform
      isReservedTag: (x?: string) => boolean;
      isReservedAttr: (x?: string) => boolean;
      parsePlatformTagName: (x: string) => string;
      isUnknownElement: (x?: string) => boolean;
      getTagNamespace: (x?: string) => string | void;
      mustUseProp: (tag: string, type: ?string, name: string) => boolean;

      // private
      async: boolean;

      // legacy
      _lifecycleHooks: Array<string>;
};


export default ({
      /**
       * 自定义合并策略的选项。
       * 合并策略选项分别接收在父实例和子实例上定义的该选项的值作为第一个和第二个参数，
       * Vue 实例上下文被作为第三个参数传入。
       */

      /* $flow-disable-line */
      optionMergeStrategies: Object.create(null),

      /**
       * 取消Vue所有的日志和警告
       */
      silent: false,

      /**
       * 设置为 false 以阻止 vue 在启动时生成生产提示。
       */
      productionTip: process.env.NODE_ENV !== 'production',

      /**
       * 配置是否允许 vue-devtools 检查代码。
       * 开发版本默认为 true，生产版本默认为 false。
       * 生产版本设为 true 可以启用检查。
       */
      devtools: process.env.NODE_ENV !== 'production',

      /**
       * 设置为 true 以在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪。
       * 只适用于开发模式和支持 performance.mark API 的浏览器上。
       */
      performance: false,

      /**
       * 指定组件的渲染和观察期间未捕获错误的处理函数。
       * 这个处理函数被调用时，可获取错误信息和 Vue 实例。
       */
      errorHandler: null,

      /**
       * 为 Vue 的运行时警告赋予一个自定义处理函数。
       * 注意这只会在开发者环境下生效，在生产环境下它会被忽略。
       */
      warnHandler: null,

      /**
       * 须使 Vue 忽略在 Vue 之外的自定义元素 (e.g. 使用了 Web Components APIs)。
       * 否则，它会假设你忘记注册全局组件或者拼错了组件名称，
       * 从而抛出一个关于 Unknown custom element 的警告。
       */
      ignoredElements: [],

      /**
       * 给 v-on 自定义键位别名。
       */

      /* $flow-disable-line */
      keyCodes: Object.create(null),

      /**
       * 检查标签是否保留，以便不能将其注册为组件。
       *  这取决于平台，可能会被覆盖。
       */
      isReservedTag: no,

      /**
       * 检查属性是否被保留，以便它不能用作组件 prop。
       *  这取决于平台，可能会被覆盖。
       */
      isReservedAttr: no,

      /**
       * 检查标签是否是未知元素。平台依赖性。
       */
      isUnknownElement: no,

      /**
       * 获取元素的命名空间
       */
      getTagNamespace: noop,

      /**
       * 解析特定平台的真实标签名称。
       */
      parsePlatformTagName: identity,

      /**
       * 检查属性是否必须使用属性绑定，例如 value
       * 平台依赖性。
       */
      mustUseProp: no,

      /**
       * 异步执行更新。 拟由Vue Test Utils使用
       * 
       * 如果设置为false，这将显着降低性能。
       */
      async: true,


      /**
       * 生命周期钩子
       */
      _lifecycleHooks: LIFECYCLE_HOOKS
}: Config);