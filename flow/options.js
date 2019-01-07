declare type ComponentOptions = {
      componentId ?: string;

      // data
      data: Object | Function | void;
      propsData ?: ? Object;
      computed ?: {
            [key: string]: Function | {
                  get?: Function;
                  set?: Function;
                  cache?: boolean
            }
      };
      methods ?: { [key: string]: Function };
      watch ?: { [key: string]: Function | string };
      abstract?: Boolean;
      // DOM
      el ?: string | Element;
      template ?: string;
      render: (h: () => VNode) => VNode;
      renderError ?: (h: () => VNode, err: Error) => VNode;
      staticRenderFns ?: Array<() => VNode>;

      // lifecycle
      beforeCreate ?: Function;
      created ?: Function;
      beforeMount ?: Function;
      mounted ?: Function;
      beforeUpdate ?: Function;
      updated ?: Function;
      activated ?: Function;
      deactivated ?: Function;
      beforeDestroy ?: Function;
      destroyed ?: Function;
      errorCaptured ?: () => boolean | void;

      // assets
      directives ?: { [key: string]: Object };
      components ?: { [key: string]: Class<Component> };
      transitions ?: { [key: string]: Object };
      filters ?: { [key: string]: Function };

      // context
      provide ?: { [key: string | Symbol]: any } | () => { [key: string | Symbol]: any };

      // component v-model customization
      model ?: {
            prop?: string;
            event?: string;
      };

      // misc
      parent ?: Component;
      mixins ?: Array<Object>;
      name ?: string;
      extends?: Class<Component> | Object;
      delimiters ?: [string, string];
      comments ?: boolean;
      inheritAttrs ?: boolean;

      // private
      _isComponent ?: true;
      _propKeys ?: Array<string>;
      _parentVnode ?: VNode;
      _parentListeners ?: ? Object;
      _renderChildren ?: ? Array<VNode>;
      _componentTag: ? string;
      _scopeId: ? string;
      _base: Class<Component>;
};
