export interface VNode {
      tag?: string;
      data?: VNodeData;
      children?: VNode[];
      text?: string;
      elm?: Node;
      ns?: string;
      context?: Vue;
      key?: string | number;
      componentOptions?: VNodeComponentOptions;
      componentInstance?: Vue;
      parent?: VNode;
      raw?: boolean;
      isStatic?: boolean;
      isRootInsert: boolean;
      isComment: boolean;
}

declare type VNodeComponentOptions = {
      Ctor: Class<Component>;
      propsData: ?Object;
      listeners: ?Object;
      children: ?Array<VNode>;
      tag?: string;
};

declare interface VNodeData {
      key?: string | number;
      slot?: string;
      ref?: string;
      is?: string;
      pre?: boolean;
      tag?: string;
      staticClass?: string;
      class?: any;
      staticStyle?: { [key: string]: any };
      style?: Array<Object> | Object;
      normalizedStyle?: Object;
      props?: { [key: string]: any };
      attrs?: { [key: string]: string };
      domProps?: { [key: string]: any };
      hook?: { [key: string]: Function };
      on?: ?{ [key: string]: Function | Array<Function> };
      nativeOn?: { [key: string]: Function | Array<Function> };
      transition?: Object;
      show?: boolean; // marker for v-show
      inlineTemplate?: {
            render: Function;
            staticRenderFns: Array<Function>;
      };
      directives?: Array<VNodeDirective>;
      keepAlive?: boolean;
      scopedSlots?: { [key: string]: Function };
      model?: {
            value: any;
            callback: Function;
      };
};

declare type VNodeDirective = {
      name: string;
      rawName: string;
      value?: any;
      oldValue?: any;
      arg?: string;
      // modifiers?: ASTModifiers;
      def?: Object;
};


declare type MountedComponentVNode = {
      context: Component;
      componentOptions: VNodeComponentOptions;
      componentInstance: Component;
      parent: VNode;
      data: VNodeData;
};