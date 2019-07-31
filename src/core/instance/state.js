import {
    nativeWatch,
    handleError,
    isPlainObject,
    hasOwn,
    isReserved,
    noop
} from '../util/index'
import Watcher from '../observer/watcher'

import {
    set,
    del,
    observe
} from '../observer/index'

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

export function stateMixin (Vue: Class<Component>) {
    // flow 不知何故有直接声明的定义对象的问题
    // 当使用Object.defineProperty时，我们必须在程序上建立
    // 这里的对象


    // 定义 $data 对象
    const dataDef = {};
    dataDef.get = function () { return this._data };

    // 定义 $props 定义
    const propsDef = {};
    propsDef.get = function () { return this._props };

    // 判断如果是生产模式 为 dataDef 和 propsDef 设置 set 表示不允许修改
    if (process.env.NODE_ENV !== 'production') {
        dataDef.set = function () {
            console.warn('避免替换实例根 $data' + '改用嵌套数据属性' + this);
        }

        propsDef.set = function () {
            console.warn('$props 是只读的' + this);
        }
    }

    // 使用 Object.defineProperty 在 Vue.prototype 上定义两个属性
    // 就是 $data 和 $props
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);


    Vue.prototype.$set = set
    Vue.prototype.$delete = del

    Vue.prototype.$watch = function (
        // 要观察的属性
        expOrFn: string | Function,
        // 回调函数
        cb: any,
        // 选项参数，是否立即执行回调，是否深度观察等
        options?: Object
    ) {
        // 假设第二个参数是一个函数

        // 当前组件实例对象
        const vm: Component = this;

        // 检测 第二个参数是否是纯对象
        if (isPlainObject(cb)) {
            return createWatcher(vm, expOrFn, cb, options)
        }

        // 没有传递 options 默认是 {}
        options = options || {}
        // 代表该观察者实例是用户创建的
        options.user = true
        // 创建 Watcher 实例对象
        const watcher = new Watcher(vm, expOrFn, cb, options)

        // 在属性或函数被监听后立即执行回调
        if (options.immediate) {
            // 此时回调函数的参数只有新值，没有旧值
            cb.call(vm, watcher.value)
        }


        // 返回一个方法 解除当前观察者对属性的观察
        // 通过观察者实例对象的 watcher.teardown 函数实现
        return function unwatchFn () {
            watcher.teardown()
        }
    }
}

// 选项初始化的汇总，包括：props、methods、data、computed 和 watch 等
// props 初始化早于 data 选项初始化，所有可以使用 props 初始化 data 数据
export function initState (vm: Component, propsOptions: Object) {
    // 在 Vue 实例对象添加一个属性
    // 用来存储所有该组件实例的 watcher 对象
    vm._watchers = []

    // vm.$options 的引用
    const opts = vm.$options

    // 如果 opts.props 存在，
    // 即选项中有 props 那么就调用 initProps 初始化props 选项
    // if (opts.props) initProps(vm, opts.props)
    // 如果 opts.methods 存在，则调用 initMethods 初始化 methods 选项
    // if (opts.methods) initMethods(vm, opts.methods)

    // 首先判断 data 选项是否存在\
    // 如果存在则调用 initData 初始化 data 选项
    // 如果不存在则直接调用 observe 函数观测一个空对象：{}
    if (opts.data) {
        initData(vm)
    }
    else {
        // $data 属性是一个访问器属性，其代理的值就是 _data
        // observe(vm._data = {}, true /* asRootData */)
    }

    // 采用同样的方式初始化 computed 选项
    if (opts.computed) initComputed(vm, opts.computed)

    // 对于 watch 选项仅仅判断 optis.watch 是否存在还不够
    // 还要判断 opts.watch 是不是原升的 watch 对象
    // 因为在 Firefox 中原生提供了 Object.prototype.watch 函数
    if (opts.watch && opts.watch !== nativeWatch) {
        // 初始化 computed 和 watch 选项
        initWatch(vm, opts.watch)
    }

}


// 初始化 data
function initData (vm: Component) {
    // 首先定义 data 变量，它是 vm.$options.data 的引用
    let data = vm.$options.data

    // 使用 typeof 判断 data 数据类型
    // mergeOptions 函数处理后 data 选项必然是一个函数
    // 在 beforeCreate 生命周期钩子函数是在 mergeOptions 函数之后
    // initData 之前调用的，如果在 beforeCreate 生命周期钩子中修改了 vm.$options.data
    // 的值 那么在 initData 函数中对于 vm.$options.data 类型的判断是有必要的

    // getData 拿到最终的数据对象后，将该对象赋值给 vm._data，同时重写的 data 变量
    data = vm._data = typeof data === 'function'
        ? getData(data.vm)
        : data || {}

    // 使用 isPlainObject 函数判断变量 data 是不是一个纯对象
    // 如果不是会在生产环境打印警告
    if (!isPlainObject(data)) {
        data = {}
        process.env.NODE_ENV !== 'production' && console.warn(
            'data functions should return an object:\n' +
            'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
            vm
        )
    }

    // 获取 data 对象的所有建，并将 data 对象的建组成的数组赋值给 keys 常量
    const keys = Object.keys(data)
    const props = vm.$options.props
    const methods = vm.$options.methods

    let i = keys.length
    // 循环遍历 keys 数组
    while (i--) {
        const key = kyes[i]

        // data 数据的 key 与 methods 对象中定义的函数名称相同，那么会打印一个警告
        // 提示开发者：你定义在 methods 对象中的函数名称已经被作为 data 对象中某个数据字段的 key 了，
        // 你应该换一个函数名字
        if (methods && hasOwn(methods, key)) {
            console.warn(
                `Method "${key}" has already been defined as a data property.`,
                vm
            )
        }

        // 如果发现 data 数据字段的 key 已经在 props 中有定义了，那么就会打印警告
        // 优先级关系 props优先级 > methods 优先级 > data 优先级
        // 即如果一个 key 在 props 中有定义了那么就不能在 data 和 methods 中出现了；
        // 如果一个 key 在 data 中出现了那么就不能在 methods 中出现了
        if (props && hasOwn(props, key)) {
            process.env.NODE_ENV !== 'production' && console.warn(
                `The data property "${key}" is already declared as a prop. ` +
                `Use prop default value instead.`,
                vm
            )
        }
        // 判断定义在 data 中的 key 是否是保留建
        // Vue 是不会代理那些键名以 $ 或 _ 开头的字段的，
        // 因为 Vue 自身的属性和方法都是以 $ 或 _ 开头的，
        // 所以这么做是为了避免与 Vue 自身的属性和方法相冲突
        else if (!isReserved(key)) {
            // 实现实例对象的代理访问
            proxy(vm, `_data`, key)
        }
    }

    // 调动 observe 函数将 data 数据对象转换成响应式
    observe(data, true /* asRootData */)
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

// 实例对象代理
// proxy 函数的原理是通过 Object.defineProperty 函数在实例对象 vm 上定义与 data
//  数据字段同名的访问器属性，并且这些属性代理的值是 vm._data 上对应属性的值。
export function proxy (target: Object, sourceKey: string, key: string) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }

    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }

    Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 第一个参数是 data 选项
// 第二个参数是 Vue 实例对象
// 作用 通过调用 data 函数获取真正的数据对象并返回
export function getData (data: Function, vm: Component): any {

    try {
        return data.call(vm, vm)
    }
    // 错误返回一个空对象
    catch (e) {
        handleError(e, vm, `data()`)
        return {}
    }
}

// 初始化 watch
function initWatch (vm: Component, watch: Object) {
    // 对象 watch 进行遍历
    for (const key in watch) {
        // 通过 createWatcher 函数创建观察者对象
        const handler = watch[key]

        // handler 常量可以是一个数组
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        }
        else {
            createWatcher(vm, key, handler)
        }
    }
}

// 将纯对象形式的参数规范化
// 再通过调动 $watch 方法创建观察者
function createWatcher (
    vm: Component,
    expOrFn: string | Function,
    handler: any,
    options?: Object
) {
    // 检测参数 handler 是否是纯对象
    if (isPlainObject(handler)) {
        options = handler
        handler = handler.handler
    }

    // handler 除了是一个纯对象还可以是一个字符串
    if (typeof handler === 'string') {
        // 读取组件实例对象的 handler 属性的值并用该值重写 handler 值
        handler = vm[handler]
    }


    return vm.$watch(expOrFn, handler, options)

}


// 标识一个观察者对象是计算属性的观察者
const computedWatcherOptions = { lazy: true }

// 初始化计算属性
// 第一个组件对象实例
// 第二个 对应的选项
function initComputed (vm: Component, computed: Object) {
    // $flow-disable-line
    // 初始值都是创建空对象
    const watchers = vm._computedWatchers = Object.create(null)

    // ssr
    const isSSR = isServerRendering()

    // 循环遍历 computed 选项对象
    for (const key in computed) {
        // 获取计算属性对象中相应的属性值
        // 传入函数 ， 或者 定义 get,set
        const userDef = computed[key]
        // 根据 userDef 常量值决定
        const getter = typeof userDef === 'function' ? userDef : userDef.get
    }

    // 只有在非服务器渲染时才会去执行
    if (!isSSR) {
        // 创建一个观察者实例对象
        // 建值对应计算属性的名字
        // 第二个属性是 getter ，计算属性观察者的求值对象是 getter 函数
        // vm._computedWatchers 对象是用来存储计算属性观察者的。
        watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions)
    }


    // 检测计算属性的名字是否已经存在于组件实例对象中
    // 没有就调用 defineComputed 定义计算属性
    if (!(key in vm)) {
        defineComputed(vm, key, userDef)
    }
    else if (process.env.NODE_ENV !== 'production') {
        if (key in vm.$data) {
            warn(`The computed property "${key}" is already defined in data.`, vm)
        } else if (vm.$options.props && key in vm.$options.props) {
            warn(`The computed property "${key}" is already defined as a prop.`, vm)
        }
    }
}

function defineComputed (target: any, key: string, userDef: Object | Function) {
    // 判断服务器渲染
    const shouldCache = !isServerRendering()
    // 检车 userDef 是否是函数
    // userDef 是函数 计算属性并没有指定 set 拦截器函数
    // sharedPropertyDefinition.set = noop
    if (typeof userDef === 'function') {
        // 为真调用 createComputedGetter 函数返回值作为  sharedPropertyDefinition.get 的值
        sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef
    }
    // 不是则说明是对象
    else {
        sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get : noop

        sharedPropertyDefinition.set = userDef.set
            ? userDef.set
            : noop
    }

    // 在非生产环境下如果发现 sharedPropertyDefinition.set 的值是一个空函数
    // 重写 sharedPropertyDefinition.set 函数
    if (process.env.NODE_ENV !== 'production' &&
        sharedPropertyDefinition.set === noop) {
        sharedPropertyDefinition.set = function () {
            warn(
                `Computed property "${key}" was assigned to but it has no setter.`,
                this
            )
        }
    }


    // 最终效果
    // sharedPropertyDefinition = {
    //     enumerable: true,
    //     configurable: true,
    //     get: createComputedGetter(key),
    //     set: userDef.set // 或 noop
    //   }

    // 通过 Object.defineProperty 函数在组件实例对象上定义于计算属性同名的实例属性，
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 计算属性真正的 get 拦截器函数就是 computedGetter 函数
function createComputedGetter (key) {
    return function computedGetter () {
        // 观察者对象
        const watcher = this._computedWatchers && this._computedWatchers[key];

        if (watcher) {
            watcher.depend()
            return watcher.evaluate()
        }
    }
}


// 简单 数据响应

// const data = {
//       name: '霍春阳',
//       age: 24
// }

// function walk (data) {
//       for (const key in data) {
//             // dep 数组就是我们所谓的“筐”
//             const dep = []
//             // 缓存字段原有的值
//             let val = data[key]
//             // 如果val 是对象递归调用 walk 函数将其转为访问器属性
//             const nativeString = Object.prototype.toString.call(val)
//             if (nativeString === '[object Object]') {
//                   walk(val)
//             }

//             Object.defineProperty(data, key, {
//                   set (newVal) {
//                         // 如果值没变什么都不做
//                         if (newVal === val) {
//                               return
//                         }

//                         val = newVal


//                         // 当属性被设置的时候，将“筐”里的依赖都执行一次
//                         dep.forEach(fn => fn())
//                   },
//                   get () {
//                         // 当属性被获取的时候，把依赖放到“筐”里
//                         dep.push(Target)

//                         return val
//                   }
//             })
//       }
// }

// walk(data)


// // 定义全局变量
// let Target = null
// //  target的值设置为依赖
// function $watch (exp, fn) {
//       Target = fn

//       let pathArr,
//             obj = data

//       // 如果 exp 是函数，直接执行函数
//       if (typeof exp === 'function') {
//             exp()
//             return
//       }

//       // 检测 exp 是否包含 .
//       if (/\./.test(exp)) {
//             // 将字符串转为数组，例：'a.b' => ['a', 'b']
//             pathArr = exp.split('.')
//             // 使用循环读取到 data.a.b
//             pathArr.forEach(p => {
//                   obj = obj[p]
//             })
//             return
//       }

//       data[exp]
// }

// function render () {
//       return document.write(`姓名：${data.name}; 年龄：${data.age}`)
// }

// $watch(render, render)
