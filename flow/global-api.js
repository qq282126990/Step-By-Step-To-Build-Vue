declare interface GlobalAPI {
      options: Object;
      config: Config;
      util: Object;
      cid: number;

      extend: (options: Object) => Function;
      set: <T>(target: Object | Array<T>, key: string | number) => T;
      delete: <T>(target: Object | Array<T>, key: string | number) => void;
      nextTick: (fn: Function, context?: Object) => void | Promise<*>;
      mixin: (mixin: Object) => GlobalAPI;
      use: (plugin: Function | Object) => GlobalAPI;

      // 允许动态方法注册
      [key: string]: any
};
