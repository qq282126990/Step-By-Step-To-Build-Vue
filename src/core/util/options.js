/* @flow */
import config from '../config';
import { isBuiltInTag, camelize, isPlainObject } from '../../shared/util'


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
      // normalizeInject(child, vm)
      // normalizeDirectives(child)





      const options = {};

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
      else if (isPlainObject(props)) {
            val = props[key];
            name = camelize(key);
            res[name] = isPlainObject(val) ? val : { type: val };
      }

}