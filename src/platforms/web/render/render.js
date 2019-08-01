import { VNodeFlags, ChildrenFlags } from './flags'
import { createTextVNode } from './h';

// 检测应该以 Property 的方式添加到 DOM 元素上的属性
// 匹配那些拥有大写字母的属性 诸如 innerHTML、textContent 等属性设计的
const domPropsRe = /\W|^(?:value|checked|selected|muted)$/

// 元素节点
function mountElement (vnode, container, isSVG) {
    isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;

    // 创建元素 处理 SVG 标签
    const el = isSVG ?
        document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
        : document.createElement(vnode.tag);

    vnode.el = el;

    // 拿到 VNodeData
    const data = vnode.data

    if (data) {
        // 如果 VNodeData 存在，则遍历之
        for (let key in data) {
            // key 可能是 class、style、on 等等
            switch (key) {
                case 'style':
                    // 如果 key 的值是 style 说明是内联样式,逐个将样式规则应用到 el
                    for (let k in data.style) {
                        el.style[k] = data.style[k];
                    }
                    break;
                // class
                case 'class':
                    if (isSVG) {
                        el.setAttribute('class', data[key]);
                    }
                    else {
                        el.className = data[key]
                    }
                    break
                default:
                    // 匹配事件
                    if (key[0] === 'o' && key[1] === 'n') {
                        el.addEventListener(key.slice(2), data[key])
                    }
                    else if (domPropsRe.test(key)) {
                        // 当作 DOM Prop 处理
                        el[key] = data[key]
                    }
                    else {
                        // 当作 attr 处理
                        el.setAttribute(key, data[key])
                    }
                    break
            }
        }
    }


    // 拿到 children 和 childFlags
    const childFlags = vnode.childFlags;
    const children = vnode.children

    // 检测如果没有子节点则无需递归挂载
    if (childFlags !== ChildrenFlags.NO_CHILDREN) {
        if (childFlags & ChildrenFlags.SINGLE_VNODE) {
            // 如果是单个子节点则调用 mount 函数挂载
            // 这里需要把 isSVG 传递下去
            mount(children, el, isSVG)
        }
        else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
            // 如果是单多个子节点则遍历并调用 mount 函数挂载
            for (let i = 0; i < children.length; i++) {
                // 这里需要把 isSVG 传递下去
                mount(children[i], el, isSVG)
            }
        }
    }


    // 将元素添加到容器
    container.appendChild(el)
}

// 文本节点
function mountText (vnode, container) {
    const el = document.createTextNode(vnode.children)
    vnode.el = el

    container.appendChild(el)
}

// Fragment节点
function mountFragment (vnode, container, isSVG) {
    // 拿到 children 和 childFlags
    const { children, childFlags } = vnode

    // 根据不同的类型采用不同的挂载方式
    switch (childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            // 如果单个子节点，直接调用 mount
            mount(children, container, isSVG)
            // 单个子节点，就指向该节点
            vnode.el = children.el
            break
        case ChildrenFlags.NO_CHILDREN:
            // 如果没有子节点，等价于加载空片段,会创建一个空的文本节点占位
            const placeholder = createTextVNode('')
            mountText(placeholder, container)
            // 没有子节点指向占位的空文本节点
            vnode.el = placeholder.el
            break
        default:
            // 多个子节点，遍历挂载之
            for (let i = 0; i < children.length; i++) {
                mount(children[i], container, isSVG)
            }
            // 多个字节点，指向第一个子节点
            vnode.el = children[0].el
    }
}

// 可以被到处挂载的 Fragment
function mountPortal (vnode, container) {
    const { tag, children, childFlags } = vnode


    // 获取挂载点
    const target = typeof tag === 'string' ? document.querySelector(tag) : tag

    if (childFlags & ChildrenFlags.SINGLE_VNODE) {
        // 将children挂载到target上，而非 container
        mount(children, target)
    }
    else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
        for (let i = 0; i < children.length; i++) {
            // 将 children 挂载到 target 上，而非 container
            mount(children[i], target)
        }
    }

    // 占位的空文本节点
    const placeholder = createTextVNode('')
    // 将该及诶单挂载到 container 中
    mountText(placeholder, container, null)
    // el属性引用该节点
    vnode.el = placeholder.el
}

function mountStatefulComponent (vnode, container, isSVG) {
    // 创建组件实例
    const instance = new vnode.tag();
    // 渲染 vnode
    instance.$vnode = instance.render()
    // 挂载
    mount(instance.$vnode, container, isSVG)
    // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
    instance.$el = vnode.$el = instance.$vnode.el
}

function mountFunctionalComponent (vnode, container, isSVG) {
    // 获取 VNode
    const $vnode = vnode.tag();
    // 挂载
    mount($vnode, container, isSVG)
    // el 元素引用该组件的根元素
    vnode.el = $vnode.el
}

function mountComponent (vnode, container, isSVG) {
    // 有状态组件 通过检查 vnode.flags 判断要挂载的 VNode 是否属于有状态组件
    if (vnode.flags & VNodeFlags.COMPONENT_STATEFUL) {
        mountStatefulComponent(vnode, container, isSVG)
    }
    // 无状态组件
    else {
        mountFunctionalComponent(vnode, container, isSVG)
    }
}


// 把一个 VNode 渲染成真实 DOM
function mount (vnode, container, isSVG) {
    const { flags } = vnode;

    // 挂载普通标签
    if (flags & VNodeFlags.ELEMENT) {
        mountElement(vnode, container, isSVG)
    }
    // 挂载组件
    else if (flags & VNodeFlags.COMPONENT) {
        mountComponent(vnode, container, isSVG)
    }
    // 挂载纯文本
    else if (flags & VNodeFlags.TEXT) {
        mountText(vnode, container, isSVG)
    }
    // 挂载 Fragment
    else if (flags & VNodeFlags.FRAGMENT) {
        mountFragment(vnode, container, isSVG)
    }
    else if (flags & VNodeFlags.PORTAL) {
        // 挂载 Portal
        mountPortal(vnode, container, isSVG)
    }
}

// 移除DOM
function replaceVNode (prevVNode, nextVNode, container) {
    // 将旧的 VNode 所渲染的 DOM 从容器中移除
    container.removeChild(prevVNode.el)
    // 再把新的 VNode 挂载到容器中
    mount(nextVNode, container)
}

// 更新标签
function patchElement (prevVNode, nextVNode, container) {
    // 如果新旧 vnode 描述的是不同的标签，则调用 replaceVNode 函数，使用新的 VNode 替换旧的 VNode
    if (prevVNode.tag !== nextVNode.tag) {
        replaceVNode(prevVNode, nextVNode, container)
        return
    }

    // 拿到 el 元素，注意这时要让 nextVNode.el 也引用该元素
    const el = (nextVNode.el = prevVNode.el)

    // 拿到 新旧 VNodeData
    const prevData = prevVNode.data
    const nextData = nextVNode.data

    // 新的 VNodeData 存在时才有必要更新
    if (nextData) {
        // 遍历新的 nextData
        for (let key in nextData) {
            // 根据 key 拿到新的 VNodeData 值
            const prevValue = prevData[key]
            const nextValue = nextData[key]

            patchData(el, key, prevValue, nextValue)
        }
    }

    if (prevData) {
        // 遍历旧的 VNodeData，将已经不存在于新的 VNodeData 中的数据移除
        for (let key in prevData) {
            const prevValue = prevData[key]
            if (prevValue && !nextData.hasOwnProperty(key)) {
                // 第四个参数为 null，代表移除数据
                patchData(el, key, prevValue, null)
            }
        }
    }


    // 调用 patchChildren 递归更新子节点
    // 同层级对比
    patchChildren(
        // 旧的 VNode 子节点的类型
        prevVNode.childFlags,
        // 新的 VNode 子节点的类型
        nextVNode.childFlags,
        // 旧的 VNode 子节点
        prevVNode.children,
        // 新的 VNode 子节点
        nextVNode.children,
        // 当前标签元素，即这些子节点的父节点
        el
    )
}

// 负责更新数据
export function patchData (el, key, prevValue, nextValue) {
    switch (key) {
        case 'style':
            // 将新的样式数据应用到元素
            for (let k in nextValue) {
                el.style[k] = nextValue[k]
            }
            // 移除已经不存在的样式
            for (let k in prevValue) {
                if (!nextValue.hasOwnProperty(k)) {
                    el.style[k] = ''
                }
            }
            break
        // class
        case 'class':
            el.className = nextValue;
            break
        default:
            // 事件
            if (key[0] === 'o' && key[1] === 'n') {
                // 移除旧事件
                if (prevValue) {
                    el.removeEventListener(key.slice(2), prevValue)
                }
                // 添加新事件
                if (nextValue) {
                    el.addEventListener(key.slice(2), nextValue)
                }
            }
            else if (domPropsRE.test(key)) {
                // 当作 DOM Prop 处理
                el[key] = nextValue
            }
            else {
                // 当作 Attr 处理
                el.setAttribute(key, nextValue)
            }
            break
    }
}

// 更新子节点
export function patchChildren (prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
    switch (prevChildFlags) {
        // 旧的 children 是单个子节点
        case ChildrenFlags.SINGLE_VNODE:
            switch (nextChildFlags) {
                // 新的 children 也是单个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    // 此时 prevChildren 和 nextChildren 都是 VNode 对象
                    patch(prevChildren, nextChildren, container)
                    break
                // 新的 children 没有子节点
                case ChildrenFlags.NO_CHILDREN:
                    container.removeChild(prevChildren.el)
                    break
                // 新的 children 中有多个子节点
                default:
                    // 移除旧单个字节点
                    container.removeChild(prevChildren.el)
                    // 遍历新的多个子节点,逐个挂载到容器中
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
            break
        // 旧的 children 中没有子节点
        case ChildrenFlags.NO_CHILDREN:
            switch (nextChildFlags) {
                // 新的 children 也是单个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    // mount 将新的子节点挂载到容器元素
                    mount(nextChildren, container)
                    break
                case ChildrenFlags.NO_CHILDREN:
                    // 新的 children 没有子节点
                    // 什么都不做
                    break
                default:
                    // 新的 children 中有多个子节点
                    // 遍历新的多个子节点,逐个挂载到容器中
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
            break
        // 旧的 childern 中有多个子节点
        default:
            switch (nextChildFlags) {
                // 新的 children 也是单个子节点
                case ChildrenFlags.SINGLE_VNODE:
                    for (let i = 0; i < prevChildren.length; i++) {
                        container.removeChild(prevChildren[i].el)
                    }
                    mount(nextChildren, container)
                    break
                // 新的 children 没有子节点
                case ChildrenFlags.NO_CHILDREN:
                    for (let i = 0; i < prevChildren.length; i++) {
                        container.removeChild(prevChildren[i].el)
                    }
                    break
                // 新的 children 中有多个子节点
                default:
                    // 遍历旧的子节点，将其全部移除
                    for (let i = 0; i < prevChildren.length; i++) {
                        container.removeChild(prevChildren[i].el)
                    }
                    // 遍历新的子节点，将其全部添加
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
            }
    }
}

// 更新文本
function patchText (prevVNode, nextVNode) {
    // 拿到文本元素 el，同时让 nextVNode.el 指向该文本元素
    const el = (nextVNode.el = prevVNode.el)
    // 只有当新旧文本内容不一致才有必要更新
    if (nextVNode.children !== prevVNode.children) {
        el.nodeValue = nextVNode.children
    }
}

// 更新 Fragment
function patchFragment (prevVNode, nextVNode, container) {
    // 直接调用 patchChildren 函数更新 新旧片段的子节点即可
    patchChildren(
        prevVNode.childFlags, // 旧片段的子节点类型
        nextVNode.childFlags, // 新片段的子节点类型
        prevVNode.children,   // 旧片段的子节点
        nextVNode.children,   // 新片段的子节点
        container
    )

    switch (nextVNode.childFlags) {
        case ChildrenFlags.SINGLE_VNODE:
            nextVNode.el = nextVNode.children.el;
            break;
        case ChildrenFlags.NO_CHILDREN:
            nextValue.el = prevVNode.el;
            break
        default:
            nextVNode.el = nextVNode.children[0].el
    }
}

// 更新 Portal
function patchPortal (prevVNode, nextVNode) {
    patchChildren(
        prevVNode.childFlags,
        nextVNode.childFlags,
        prevVNode.children,
        nextVNode.children,
        prevVNode.tag // 注意容器元素是旧的 container
    )

    // 让 nextVNode.el 指向 prevVNode.el
    nextVNode.el = prevVNode.el

    // 如果新旧容器不同，才需要搬运
    if (nextVNode.tag !== prevVNode.tag) {
        // 获取新的容器元素，即挂载目标
        const container = typeof nextVNode.tag === 'string' ? document.querySelector(nextVNode.tag) : nextVNode.tag

        switch (nextVNode.childFlags) {
            case ChildrenFlags.SINGLE_VNODE:
                // 如果新的 Portal 是单个子节点，就把该节点搬运到新容器中
                container.appendChild(nextVNode.children.el)
                break
            case ChildrenFlags.NO_CHILDREN:
                // 新的 portal 没有子节点，不需要搬运
                break
            default:
                // 如果新的 Portal 是多个子节点，遍历逐个将它们搬运到新容器中
                for (let i = 0; i < nextVNode.children.length; i++) {
                    container.appendChild(nextVNode.children[i].el)
                }
                break;
        }
    }
}

// 对比算法
function patch (prevVNode, nextVNode, container) {
    // 分别拿到新旧 vnode 的类型，即 flags
    // 旧的 VNode
    const prevFlags = prevVNode.flags;
    // 新的 VNode
    const nextFlags = nextVNode.flags;

    // 检测新旧 vnode 的类型是否相同，日过类型不同，则直接调用 replaceVNode 函数替换 VNode
    // 如果新旧 VNode 的类型相同,则根据不同的类型调用不同的比对函数
    if (prevFlags !== nextFlags) {
        replaceVNode(prevVNode, nextVNode, container)
    }
    // 普通节点
    else if (nextFlags & VNodeFlags.ELEMENT) {
        patchElement(prevVNode, nextVNode, container)
    }
    // 组件
    else if (nextFlags & VNodeFlags.COMPONENT) {
        patchComponent(prevVNode, nextVNode, container)
    }
    // 文本
    else if (nextFlags & VNodeFlags.TEXT) {
        patchText(prevVNode, nextVNode)
    }
    // Fragment
    else if (nextFlags & VNodeFlags.FRAGMENT) {
        patchFragment(prevVNode, nextVNode, container)
    }
    // Portal
    else if (nextFlags & VNodeFlags.PORTAL) {
        patchPortal(prevVNode, nextVNode)
    }
}

export function render (vnode, container) {
    const prevVNode = container.vnode

    // prevVNode
    if (prevVNode == null) {
        if (vnode) {
            // 没有旧的 vnode ,只有新的 vnode ，使用 mount 函数挂载全新的 vnode
            mount(vnode, container)
            // 将新的 VNode 添加到 container.vnode 属性下，这样下一次渲染时旧的 VNode 就存在了
            container.vnode = vnode
        }
    }
    else {
        if (vnode) {
            // 有旧的 vnode ,也有新的 vnode ，则调用 patch 函数打补丁
            patch(prevVNode, vnode, container)
            // 更新 container.vnode
            container.vnode = vnode
        }
        else {
            // 有旧的 vnode 但是没有新的 vnode ，这说明应该移除 dom ，在浏览器中可以使用 removeChild
            container.removeChild(prevVNode.el);
            container.vnode = null
        }
    }
}
