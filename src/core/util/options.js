/* @flow */
import config from '../config';
import { isBuiltInTag, camelize, isPlainObject, toRawType, extend, hasOwn } from '../../shared/util'
import { set } from '../observer/index'

/**
 * 默认的策略
 * 当一个选项不需要特殊处理的时候就使用默认的合并策略
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
      return childVal === undefined
            ? parentVal
            : childVal
}

/**
 * config 对象是全局配置对象
 * 此时 config.optionMergeStrategies 还只是一个空的对象 
 * config.optionMergeStrategies 是一个合并选项的策略对象
 * 如果你使用自定义选项，那么你也可以自定义该选项的合并策略，
 * 只需要在 Vue.config.optionMergeStrategies 对象上添加与自定义选项同名的函数就行
 */
const strats = config.optionMergeStrategies;

/**
 * 非生产环境下 strats 策略对象上添加两个属性分别是 el 和 propsData 且这两个属性的值是一个函数
 * 这两个策略函数是用来处理 el 选项和 propsData 选项的
 */
if (process.env.NODE_ENV !== 'production') {
      // 在生产环境下访问这两个函数将会得到 undefined
      // 那这个时候 mergeField 函数的第一句代码就起作用了：
      // 当一个选项没有对应的策略函数时，使用默认策略
      // const strat = strats[key] || defaultStrat;
      strats.el = strats.propsData = function (parent, child, vm, key) {
            // 判断是否有传递 vm 参数
            // 在策略函数中如果拿不到 vm 参数，那说明处理的是子组件选项
            if (!vm) {
                  console.warn(
                        `option "${key}" can only be used during instance ` +
                        'creation with the `new` keyword.'
                  );
            }

            return defaultStrat(parent, child);
      }
}


/**
 * 以递归方式将两个数据对象合并在一起。
 * to 对应的是 childVal 产生的纯对象，
 * from 对应 parentVal 产生的纯对象，
 */
function mergeData (to: Object, from: ?Object): Object {
      // 没有 parentVal 产生的值，就直接使用 childVal 产生的值。
      if (!from) {
            return to
      }
      // 将 parentVal 对象的属性混合到 childVal 中，
      let key, toVal, fromVal
      const keys = Object.keys(from)
      for (let i = 0; i < keys.length; i++) {
            key = keys[i];
            toVal = to[key];
            fromVal = from[key];

            //  如果 from 对象中的 key 不在 to 对象中，
            // 则使用 set 函数为 to 对象设置 key 及相应的值。
            if (!hasOwn(to, key)) {
                  set(to, key, fromVal)
            }
            // 如果 from 对象中的 key 在 to 对象中，
            // 且这两个属性的值都是纯对象则递归地调用 mergeData 函数进行深度合并。
            else if (toVal !== fromVal &&
                  isPlainObject(toVal) &&
                  isPlainObject(fromVal)
            ) {
                  mergeData(toVal,fromVal)
            }

      }

      // 最后返回的是处理后的 childVal 对象。
      return to
}


/**
 * data
 */
export function mergeDataOrFn (
      parentVal: any,
      childVal: any,
      vm?: Component
): ?Function {
      // 对 vm 进行判断，知道是子组件还是非子组件选项
      if (!vm) {
            // 选项是在调用 Vue.extend 函数时进行合并处理的，此时父子 data 选项都应该是函数。
            // 当拿不到 vm 这个参数的时候，合并操作是在 Vue.extend 中进行的

            // 如果没有 childVal，也就是说子组件的选项中没有 data 选项，
            // 那么直接返回 parentVal
            // 如果没有子选项则使用父选项，没有父选项就直接使用子选项
            if (!childVal) {
                  return parentVal
            }
            if (!parentVal) {
                  return childVal
            }

            //当parentVal和childVal都存在时，
            //我们需要返回一个返回的函数
            //合并两个函数的结果......
            //不需要检查parentVal是否是函数，因为
            //它必须是传递先前合并的函数。
            return function mergedDataFn () {
                  return mergeData(
                        // 获取数据对象(纯对象
                        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
                        typeof childVal === 'function' ? parentVal.call(this, this) : parentVal
                  )
            }
      }
      else {
            // 当合并处理的是非子组件的选项时 `data` 函数为 `mergedInstanceDataFn` 函数
            // mergeDataOrFn 函数永远返回一个函数。
            return function mergedInstanceDataFn () {
                  // 实例合并
                  // 获取数据对象(纯对象
                  const instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal
                  const defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal

                  if (instanceData) {
                        return mergeData(instanceData, defaultData)
                  }
                  else {
                        defaultData;
                  }
            }
      }
}

/**
 * 在 strats 策略对象上添加 data 策略函数，用来合并处理 data 选项
 */
strats.data = function (
      parentVal: any,
      childVal: any,
      vm?: Component
): ?Function {
      // 先判断是否传递了 vm 这个参数，
      // 我们知道当没有 vm 参数时，说明处理的是子组件的选项
      if (!vm) {
            // 判断是否传递了子组件的 data 选项(即：childVal)，
            // 并且检测 childVal 的类型是不是 function，
            // 如果 childVal 的类型不是 function 则会给你一个警告，
            // 也就是说 childVal 应该是一个函数
            // 如果不是函数，除了给你一段警告之外，会直接返回 parentVal
            if (childVal && typeof childVal !== 'function') {
                  process.env.NODE_ENV !== 'production' && console.warn(
                        'The "data" option should be a function ' +
                        'that returns a per-instance value in component ' +
                        'definitions.',
                        vm
                  )

                  return parentVal;
            }
            // 如果 childVal 是函数类型，那说明满足了子组件的 data 选项需要是一个函数的要求，
            // 那么就直接返回 mergeDataOrFn 函数的执行结果：
            return mergeDataOrFn(parentVal, childVal)
      }
      // 如果拿到了 vm 参数，那么说明处理的选项不是子组件的选项，
      // 而是正常使用 new 操作符创建实例时的选项，
      // 这个时候则直接返回 mergeDataOrFn 的函数执行结果，
      // 但是会多透传一个参数 vm
      return mergeDataOrFn(parentVal, childVal, vm)
}


/**
 * 合并两个选项对象为一个新的对象，这个函数在实例化和继承的时候都有用到，
 * 这里要注意两点：
 * 第一，这个函数将会产生一个新的对象；
 * 第二，这个函数不仅仅在实例化对象(即_init方法中)的时候用到，
 * 在继承(Vue.extend)中也有用到
 * 
 * 来合并两个选项对象为一个新对象的通用程序。
 */
export function mergeOptions (
      parent: Object,
      child: Object,
      vm?: Component
): Object {

      // 非生产环境下 会以 child 为参数 调用 checkComponents 方法 
      if (process.env.NODE_ENV !== 'production') {
            checkComponents(child)
      }

      // 这说明 child 参数除了是普通的选项对象外，
      // 还可以是一个函数，
      // 如果是函数的话就取该函数的 options 静态属性作为新的 child，
      // 通过 Vue.extend 创造出来的子类也是拥有这个属性的。
      // 所以这就允许我们在进行选项合并的时候，去合并一个 Vue 实例构造者的选项了
      if (typeof child === 'function') {
            child = child.options;
      }

      // 用于规范选项, 规范成同一种方式,以便统一处理
      normalizeProps(child, vm);
      // 规范化函数
      normalizeInject(child, vm);
      // 规范化 directives 选项
      normalizeDirectives(child);

      // 处理 extends 和 mixins 选项
      // 现在所做的事儿还都在对 parent 以及 child 进行预处理，而这是接下来合并选项的必要步骤。
      // 递归调用 mergeOptions 函数 将 parent 与 child.extends 合并
      if (!child._base) {
            // 判断 child.extends 是否存在
            if (child.extends) {
                  // 并将结果作为新的 parent 
                  // mergeOptions 返回一个新对象
                  // parent 已经被新的对象重新赋值了
                  parent = mergeOptions(parent, child.extends, vm)
            }
            if (child.mixins) {
                  // 由于 mixins 是一个数字所以需要遍历一下
                  for (let i = 0, l = child.mixins.length; i < l; i++) {
                        parent = mergeOptions(parent, child.mixins[i], vm)
                  }
            }
      }

      const options = {};

      let key;

      // 遍历 parent,并且将 parent 对象的键作为参数传递给 mergeField 函数
      for (key in parent) {
            mergeField(key);
      }

      // 遍历 child 对象
      for (key in child) {
            // 判断一个属性是否是对象自身的属性(不包括原型上的)
            // 如果 child 对象的键也在 parent 上出现，那么就不要再调用 mergeField 了，
            // 因为在上一个 for in 循环中已经调用过了，这就避免了重复调用。
            if (!hasOwn(parent, key)) {
                  mergeField(key)
            }
      }

      function mergeField (key) {
            // 定义了一个常量 strat，它的值是通过指定的 key 访问 strats 对象得到的，
            // 而当访问的属性不存在时，则使用 defaultStrat 作为值
            // 当一个选项没有对应的策略函数时，使用默认策略
            const strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
      }

      return options;
}

// 校验组件名称是否符合要求
function checkComponents (options: Object) {
      // 使用一个 fo in 循环遍历 options.components 选项，
      // 将每个组件名字 作为参数依次传递给 validateComponentName 函数
      for (const key in options.components) {
            // 校验名字函数
            validateComponentName(key);
      }
}

export function validateComponentName (name: string) {
      // 组件名字要满足这两条规则才行

      // 组件名字满足正则表达式 /^[a-zA-z][\w-]*$/
      // Vue 限定组件的名字由普通的字符和中横线(-)组成，且必须以字母开头。
      if (!/^[a-zA-z][\w-]*$/.test(name)) {
            console.warn(
                  'Invalid component name: "' + name + '". Component names ' +
                  'can only contain alphanumeric characters and the hyphen, ' +
                  'and must start with a letter.'
            );
      }

      // 要满足：条件 isBuiltInTag(name) || config.isReservedTag(name) 不成立
      // 首先将 options.components 对象的 key 小写化作为组件的名字，
      // 然后以组件的名字为参数分别调用两个方法：isBuiltInTag 和 config.isReservedTag，
      // 其中 isBuiltInTag 方法的作用是用来检测你所注册的组件是否是内置的标签
      if (isBuiltInTag(name) || config.isReservedTag(name)) {
            console.warn(
                  'Do not use built-in or reserved HTML elements as component ' +
                  'id: ' + name
            )
      }
}


/**
 * 最终是将 props 规范为对象的形式
 * 
 * 确保将所有props选项语法规范化为
 * 基于对象的格式。
 * 
 * props: ["someData"]
 * 
 * 规范为
 * props: {
      someData:{
      type: null
      }
   }
 */
function normalizeProps (options: Object, vm: ?Component) {
      // 判断选项中没有 props 选项, 则直接返回
      const props = options.props;
      if (!props) return;

      // 如果选项中有 props 开始规范化工作

      // 保存规范化后的结果,覆盖原有的 options.props
      const res = {};
      let i, val, name;

      // 开始了判断分支，这个判断分支就是用来区分开发者在使用 props 时，
      // 到底是使用字符串数组的写法还是使用纯对象的写法的
      // 如果 props 是一个字符串数组，那么就使用 while 循环遍历数组
      if (Array.isArray(props)) {
            i = props.length;
            while (i--) {
                  val = props[i];

                  // props 数组中的元素确实必须是字符串，否则非生产环境返回警告
                  if (typeof val === 'string') {
                        // 将中横线转驼峰
                        name = camelize(val);
                        res[name] = { type: null };
                  }
                  else if (process.env.NODE_ENV !== 'production') {
                        console.warn('props must be strings when using array syntax.')
                  }
            }
      }
      // 对象情况
      // 使用 isPlainObject 函数判断 props 是否是一个纯对象
      //  someData1: Number 将被规范为对象形式
      else if (isPlainObject(props)) {
            for (const key in props) {
                  val = props[key];
                  name = camelize(key);
                  //  采用 for in 循环 检测 props 每一个建的值，如果值是一个纯对象那么直接使用,否则将值作为 type 的值
                  res[name] = isPlainObject(val) ? val : { type: val };
            }
      }
      // 不是字符串数组又不是纯对象
      // toRawType 获取你所传递的props 的真实数据类型
      else if (process.env.NODE_ENV !== 'production') {
            console.warn(
                  `Invalid value for option "props": expected an Array or an Object, ` +
                  `but got ${toRawType(props)}.`,
                  vm
            )
      }

}

/**
 * 将所有注入标准化为基于对象的格式
 */
function normalizeInject (options: Object, vm: ?Component) {
      // 缓存  options.inject 规范化 inject 选项
      const inject = options.inject;

      // 判断是否传递了 inject 日过没有则直接 return
      if (!inject) {
            return
      }

      // 重写了 options.inject 的值为空的 json 对象 并定义了一个值相同为空的
      // json 对象的变量 normalized
      // 变量 normalized 和 options.inject 将拥有相同的引用，
      // 也就是说当修改 normalized 的时候，options.inject 也将受到影响
      const normalized = options.inject = {};

      // 规划化为对象语法
      if (Array.isArray(inject)) {
            // 使用for循环遍历数组的每一个元素，将元素的值作为key,然后将
            // {from: inject[i]}作为值
            // ['data1', 'data2']
            // 规范为
            // {
            //       'data1': { from: 'data1' },
            //       'data2': { from: 'data2' }
            // }
            for (let i = 0; i < inject.length; i++) {
                  normalized[inject[i]] = { from: inject[i] };
            }
      }
      else if (isPlainObject(inject)) {
            // 使用 for in 循环遍历 inject 选项 依然使用 inject对象的key 作为 normalized 的key
            // 需要判断一下值 val 是否为纯对象，如果是纯对象则使用 extend 进行混合，否则直接使用 val 作为 from 字段的值
            for (const key in inject) {
                  const val = inject[key];
                  normalized[key] = isPlainObject(val) ? extend({ from: key }, val) : { from: val };
            }

      }
      else if (process.env.NODE_ENV !== 'production') {
            console.warn(
                  `Invalid value for option "inject": expected an Array or an Object, ` +
                  `but got ${toRawType(inject)}.`,
                  vm
            )
      }

}

/**
 * 将原始函数指令规范化为对象格式。
 * 
 * 规范化 directives 选项
 */
function normalizeDirectives (options: Object) {
      const dirs = options.directives;

      if (dirs) {
            for (const key in dirs) {
                  const def = dirs[key];

                  // 当发现注册指令是一个函数的时候则将函数作为对象形式的 bind 属性和 update属性的值
                  if (typeof def === 'function') {
                        dirs[key] = { bind: def, update: def };
                  }
            }
      }

}