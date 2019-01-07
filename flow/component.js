
declare class Component {
      // constructor information
      static options: Object;
      static super: Class<Component>;

      //公共属性
      $data: Object;
      $props: Object;
      $options: ComponentOptions;
      $refs: { [key: string]: Component | Element | Array<Component | Element> | void };
      $children: Array<Component>;
      $root: Component;
      $parent: Component | void;
      $attrs: { [key: string] : string };
      $listeners: { [key: string]: Function | Array<Function> };

      // 私有属性
      _uid: number | string;
      _name: string; // this only exists in dev mode
      _isVue: true;
      _renderProxy: Component;
      _self: Component;
      _isBeingDestroyed: boolean;
      _isDestroyed: boolean;
      _isMounted: boolean;
      _directInactive: boolean;
      _inactive: boolean | null;
      _watcher: Function | null;
      _hasHookEvent: boolean;
      _events: Object;
      _staticTrees: ?Array<VNode>; // v-once cached trees
      _vnode: ?VNode; // self root node

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
