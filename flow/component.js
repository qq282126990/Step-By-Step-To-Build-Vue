
declare class Component {
      // constructor information
      static options: Object;
      static super: Class<Component>;

      //公共属性
      $data: Object;
      $props: Object;
      $options: ComponentOptions;

      // 私有属性
      _uid: number | string;
      _name: string; // this only exists in dev mode
      _isVue: true;

      // 生命周期
      _init: Function;

      // 公共方法
      $on: (event: string | Array<string>, fn: Function) => Component;
      $once: (event: string, fn: Function) => Component;
      $off: (event?: string | Array<string>, fn?: Function) => Component;
      $emit: (event: string, ...args: Array<mixed>) => Component;
      $forceUpdate: () => void;
      $destroy: () => void;
      $nextTick: (fn: Function) => void | Promise<*>;

      // 生命周期
      _update: (vnode: VNode, hydrating?: boolean) => void;

      // rendering
      _render: () => VNode;
};
