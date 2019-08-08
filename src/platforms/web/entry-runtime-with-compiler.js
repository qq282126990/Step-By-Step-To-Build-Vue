
// // 导入 运行时 的 Vue
// import Vue from './runtime/index';
// import { cached } from '../../core/util/index';
// import { query } from './util/index';
// // import { compileToFunctions } from './compiler/index'
// import { mark, measure } from '../../core/util/perf';


// // 根据id 获取元素的inerHtml
// // cached 通过缓存来避免重复求值
// const idToTemplate = cached(id => {
//       const el = query(id);
//       return el && el.innerHTML;
// })

// // 使用 mount 变量缓存 Vue.prototype.$mount 方法
// const mount = Vue.prototype.$mount;

// // 重写 Vue.prototype.$mount 方法
// // 添加了编译模板的能力
// Vue.prototype.$mount = function (
//       el?: string | Element,
//       hydrating?: boolean
// ): Component {
//       // 使用 query 函数获取到指定的 Dom 元素 并重新赋值给 el ，挂载点
//       el = el && query(el);

//       // 检测了挂载点是不是 <body> 元素或者 <html> 元素
//       /* istanbul ignore if */
//       if (el === document.body || el === document.documentElement) {
//             process.env.NODE_ENV !== 'production' && console.warn(
//                   `不要将Vue挂载到<html>或<body>  - 而是挂载到普通元素。`
//             )
//             return this;
//       }
//       const options = this.$options;

//       // 检测是否包含 render 选项 即是否包含渲染函数
//       if (!options.render) {
//             // 使用 template 或 el 选项构建渲染函数
//             // 在没有 render 渲染函数的情况下会优先使用 template 选项
//             // 尝试将 template 编译成渲染函数
//             let template = options.template
//             // 获取合适的内容作为模板(template)
//             if (template) {
//                   // template 类型是字符串
//                   if (typeof template === 'string') {
//                         // 如果第一个字符数 # 那么会把该字符串作为 css 选择器去选中对应的元素
//                         // 并把该元素的 innerHTML 作为模板
//                         template = idToTemplate(template)
//                         /* istanbul ignore if */
//                         if (process.env.NODE_ENV !== 'production' && !template) {
//                               console.warn(
//                                     `Template element not found or is empty: ${options.template}`,
//                                     this
//                               )
//                         }
//                   }
//                   // template 的类型是元素节点(template.nodeType 存在)
//                   else if (template.nodeType) {
//                         // 使用该元素的 innerHTML 作为模板
//                         template = template.innerHTML
//                   }
//                   // 若 template 既不是字符串又不是元素节点，那么在非生产环境会提示开发者传递的 template 选项无效
//                   else {
//                         if (process.env.NODE_ENV !== 'production') {
//                               console.warn('invalid template option:' + template, this)
//                         }
//                         return this
//                   }
//             }
//             // 开发者未必传递了 template 选项，这时会检测 el 是否存在
//             // 存在的话则使用 el.outerHTML 作为 template 的值。
//             else if (el) {
//                   template = getOuterHTML(el)
//             }
//             // 只有在 template 存在的情况下才会执行
//             if (template) {
//                   // 统计编译器性能
//                   /* istanbul ignore if */
//                   if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
//                         mark('compile')
//                   }

//                   // const { render, staticRenderFns } = compileToFunctions(template, {
//                   //       shouldDecodeNewlines,
//                   //       shouldDecodeNewlinesForHref,
//                   //       delimiters: options.delimiters,
//                   //       comments: options.comments
//                   // }, this)
//                   // options.render = render
//                   // options.staticRenderFns = staticRenderFns


//                   /* istanbul ignore if */
//                   if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
//                         mark('compile end')
//                         measure(`vue ${this._name} compile`, 'compile', 'compile end')
//                   }
//             }
//       }


//       // 给运行版本的 $mount 函数增加编译模板的能力
//       return mount.call(this, el, hydrating)
// };


// /**
//  * 获取元素的 outerHTML
//  *
//  * 接收一个 DOM 元素作为参数，并返回该元素的 outerHTM
//  */
// function getOuterHTML (el: Element): string {
//       // 实际上在 IE9-11 中 SVG 标签元素是没有 innerHTML 和 outerHTML 这两个属性的
//       if (el.outerHTML) {
//             return el.outerHTML;
//       }
//       // 可以把 SVG 元素放到一个新创建的 div 元素中，
//       // 这样新 div 元素的 innerHTML 属性的值就等价于 SVG 标签 outerHTML 的值
//       else {
//             const container = document.createElement('div');
//             container.appendChild(el.cloneNode(true));

//             return container.innerHTML;
//       }
// }


// // 在 Vue 上添加一个全局API `Vue.compile` 其值为上面导入进来的 compileToFunctions
// // Vue.compile = compileToFunctions

// // 导出 Vue
// export default Vue;

import { h, Fragment, Portal } from './render/h';
import { render } from './render/render';

const { createRenderer } = createRenderer({
    nodeOps: {
        createElement (tag, isSVG) {
            const customElement = {
                type: 'ELEMENT',
                tag,
                parentNode: null,
                children: [],
                props: {},
                eventListeners: {},
                text: null
            }
            return customElement
        },
        removeChild (parent, child) {
            // 找到将要移除的元素 child 在父元素的 children 中的位置
            const i = parent.children.indexOf(child)
            if (i > -1) {
                // 如果找到了，则将其删除
                parent.children.splice(i, 1)
            }
            else {
                // 没找到，说明渲染器出了问题，
                // 例如没有在 nodeOps.appendChild 函数中维护正确的父子关系等
                // 这时需要打印错误信息，以提示开发者
                console.error('target: ', child)
                console.error('parent: ', parent)
                throw Error('target 不是 parent 的子节点')
            }

            // 清空父子链
            child.parentNode = null
        },
        createText (text) {
            const customElement = {
                type: 'TEXT',
                parentNode: null,
                text: text
            }
            return customElement
        },
        setText (node, text) {
            node.nodeValue = text
        },
        appendChild (parent, child) {
            child.parentNode = parent
            parent.children.push(child)
        },
        insertBefore (parent, child, ref) {
            parent.insertBefore(child, ref)
        },
        parentNode (node) {
            return node.parentNode
        },
        nextSibling (node) {
            return node.nextSibling
        },
        querySelector (selector) {
            return document.querySelector(selector)
        }
    },
    patchData (
        el,
        key,
        prevValue,
        nextValue
    ) {
        // 将属性添加到元素的 props 对象下
        el.props[key] = nextValue
        // 我们将属性名字中前两个字符是 'o' 和 'n' 的属性认为是事件绑定
        if (key[0] === 'o' && key[1] === 'n') {
            // 如果是事件，则将事件添加到元素的 eventListeners 对象下
            const event = key.slice(2).toLowerCase()
                ; (el.eventListeners || (el.eventListeners = {}))[event] = nextValue
        }
    }
})
