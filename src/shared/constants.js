// 资源/选项
export const ASSET_TYPES = [
      'component', // 注册或获取全局组件。注册还会自动使用给定的id设置组件的名称
      'directive', // 包含 Vue 实例可用指令的哈希表。自定义指令
      'filter' // 注册或获取全局过滤器。
]

// 生命周期
export const LIFECYCLE_HOOKS = [
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'beforeUpdate',
      'updated',
      'beforeDestroy',
      'destroyed',
      'activated',
      'deactivated',
      'errorCaptured'
]
