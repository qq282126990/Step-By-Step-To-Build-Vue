import { VNodeFlags, ChildrenFlags } from './flags'
import { createTextVNode } from './h';

// 检测应该以 Property 的方式添加到 DOM 元素上的属性
// 匹配那些拥有大写字母的属性 诸如 innerHTML、textContent 等属性设计的
const domPropsRe = /\W|^(?:value|checked|selected|muted)$/

export default function createRenderer (options) {
    // options.nodeOps 选项中包含了本章开头罗列的所有操作 DOM 的方法
    // options.patchData 选项就是 patchData 函数
    const {
        nodeOps: {
            createElement: platformCreateElement,
            createText: platformCreateText,
            setText: platformSetText, // 等价于 Web 平台的 el.nodeValue
            appendChild: platformAppendChild,
            insertBefore: platformInsertBefore,
            removeChild: platformRemoveChild,
            parentNode: platformParentNode,
            nextSibling: platformNextSibling,
            querySelector: platformQuerySelector
        },
        patchData: platformPatchData
    } = options

    function render (vnode, container) {
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

    // ========== 挂载 ==========
    // 元素节点
    function mountElement (vnode, container, isSVG, refNode) {
        isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;

        // 创建元素 处理 SVG 标签
        const el = platformCreateElement(vnode.tag, isSVG);

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
        refNode ? container.insertBefore(el, refNode) : container.appendChild(el)
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
        const instance = (vnode.children = new vnode.tag())
        // 初始化 props
        instance.$props = vnode.data


        instance._update = function () {
            // 如果 instance._mounted 为真，说明组件已挂载，应该执行更新操作
            if (instance._mounted) {
                // 更新
                // 1、拿到旧的 VNode
                const prevVNode = instance.$vnode


                // 2、重渲染新的 VNode
                const nextVNode = (instance.$vnode = instance.render())

                // 3、patch 更新
                patch(prevVNode, nextVNode, prevVNode.el.parentNode)
                // 4、更新 vnode.el 和 $el
                instance.$el = vnode.el = instance.$vnode.el
            }
            else {
                // 1、渲染VNode
                instance.$vnode = instance.render()
                // 2、挂载
                mount(instance.$vnode, container, isSVG)
                // 3、组件已挂载的标识
                instance._mounted = true
                // 4、el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
                instance.$el = vnode.el = instance.$vnode.el
                // 5、调用 mounted 钩子
                instance.mounted && instance.mounted()

            }
        }


        instance._update()
    }

    function mountFunctionalComponent (vnode, container, isSVG) {
        // 在函数式组件类型的 vnode 上添加 handle 属性，它是一个对象
        vnode.handle = {
            // 存储旧的函数组件 vnode
            prev: null,
            // 存储新的 vnode
            next: vnode,
            container,
            update: () => {
                if (vnode.handle.prev) {
                    // 更新的逻辑写在这里
                    // prevVNode 是旧的组件VNode，nextVNode 是新的组件VNode
                    const prevVNode = vnode.handle.prev;
                    const nextVNode = vnode.handle.next
                    // prevTree 是组件产出的旧的 VNode
                    const prevTree = prevVNode.children;
                    // 更新props数据
                    const props = nextVNode.data

                    console.log(nextVNode)
                    // nextTree 是组件产生的新的vnode
                    const nextTree = (nextVNode.children = nextVNode.tag(props))
                    // 调用 patch 函数更新
                    patch(prevTree, nextTree, vnode.handle.container)
                }
                else {
                    // 获取 props
                    const props = vnode.data

                    // 获取 VNode
                    const $vnode = (vnode.children = vnode.tag(props));
                    // 挂载
                    mount($vnode, container, isSVG)
                    // el 元素引用该组件的根元素
                    vnode.el = $vnode.el
                }

            }
        }


        // 立即调用 vnode.handle.update 完成初次挂载
        vnode.handle.update()
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
    function mount (vnode, container, isSVG, refNode) {
        const { flags } = vnode;

        // 挂载普通标签
        if (flags & VNodeFlags.ELEMENT) {
            mountElement(vnode, container, isSVG, refNode)
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


    // ========== patch ==========
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

    // 更新组件
    function patchComponent (prevVNode, nextVNode, container) {
        // tag 属性的值是组件类，通过对比新旧类是否相等来判断是否是相同的组件
        if (nextVNode.tag !== prevVNode.tag) {
            replaceVNode(prevVNode, nextVNode, container)
        }
        // 检测组件是否是有状态组件
        else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
            // 获取组件实例
            const instance = (nextVNode.children = prevVNode.children)
            // 更新 props
            instance.$props = nextVNode.data
            // 更新组件
            instance._update()
        }
        // 函数式组件的更新逻辑
        else {
            // 通过 prevVNode.handle 拿到 handle 对象
            const handle = (nextVNode.handle = prevVNode.handle)
            // 更新 handle 对象
            handle.prev = prevVNode;
            handle.next = nextVNode;
            handle.container = container

            // 调用 update
            handle.update();
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

    // 更新子节点
    function patchChildren (prevChildFlags, nextChildFlags, prevChildren, nextChildren, container) {
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
                        platformRemoveChild(container, prevVNode.el)
                        break
                    // 新的 children 中有多个子节点
                    default:
                        // 移除旧单个字节点
                        platformRemoveChild(container, prevVNode.el)
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
                    case ChildrenFlags.SINGLE_VNODE:
                        switch (nextChildFlags) {
                            case ChildrenFlags.SINGLE_VNODE:
                                // 新的 children 也是单个子节点时，会执行该 case 语句块
                                patch(prevChildren, nextChildren, container)
                                break
                            case ChildrenFlags.NO_CHILDREN:
                                // 新的 children 中没有子节点时，会执行该 case 语句块
                                platformRemoveChild(container, prevVNode.el)
                                break
                            default:
                                // 但新的 children 中有多个子节点时，会执行该 case 语句块
                                platformRemoveChild(container, prevVNode.el)
                                for (let i = 0; i < nextChildren.length; i++) {
                                    mount(nextChildren[i], container)
                                }
                                break
                        }
                        break
                    // 旧的 children 中没有子节点时，会执行该 case 语句块
                    case ChildrenFlags.NO_CHILDREN:
                        switch (nextChildFlags) {
                            case ChildrenFlags.SINGLE_VNODE:
                                // 新的 children 是单个子节点时，会执行该 case 语句块
                                mount(nextChildren, container)
                                break
                            case ChildrenFlags.NO_CHILDREN:
                                // 新的 children 中没有子节点时，会执行该 case 语句块
                                break
                            default:
                                // 但新的 children 中有多个子节点时，会执行该 case 语句块
                                for (let i = 0; i < nextChildren.length; i++) {
                                    mount(nextChildren[i], container)
                                }
                                break
                        }
                        break
                    default:
                        // 当新的 children 中有多个子节点时，会执行该 case 语句块
                        // let oldStartIdx = 0
                        // let oldEndIdx = prevChildren.length - 1
                        // let newStartIdx = 0
                        // let newEndIdx = nextChildren.length - 1
                        // let oldStartVNode = prevChildren[oldStartIdx]
                        // let oldEndVNode = prevChildren[oldEndIdx]
                        // let newStartVNode = nextChildren[newStartIdx]
                        // let newEndVNode = nextChildren[newEndIdx]

                        // while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                        //     if (!oldStartVNode) {
                        //         oldStartVNode = prevChildren[++oldStartIdx]
                        //     } else if (!oldEndVNode) {
                        //         oldEndVNode = prevChildren[--oldEndIdx]
                        //     } else if (oldStartVNode.key === newStartVNode.key) {
                        //         patch(oldStartVNode, newStartVNode, container)
                        //         oldStartVNode = prevChildren[++oldStartIdx]
                        //         newStartVNode = nextChildren[++newStartIdx]
                        //     } else if (oldEndVNode.key === newEndVNode.key) {
                        //         patch(oldEndVNode, newEndVNode, container)
                        //         oldEndVNode = prevChildren[--oldEndIdx]
                        //         newEndVNode = nextChildren[--newEndIdx]
                        //     } else if (oldStartVNode.key === newEndVNode.key) {
                        //         patch(oldStartVNode, newEndVNode, container)
                        //         container.insertBefore(
                        //             oldStartVNode.el,
                        //             oldEndVNode.el.nextSibling
                        //         )
                        //         oldStartVNode = prevChildren[++oldStartIdx]
                        //         newEndVNode = nextChildren[--newEndIdx]
                        //     } else if (oldEndVNode.key === newStartVNode.key) {
                        //         patch(oldEndVNode, newStartVNode, container)
                        //         container.insertBefore(oldEndVNode.el, oldStartVNode.el)
                        //         oldEndVNode = prevChildren[--oldEndIdx]
                        //         newStartVNode = nextChildren[++newStartIdx]
                        //     }
                        //     else {
                        //         // 遍历旧 children，试图寻找与 newStartVNode 拥有相同 key 值的元素
                        //         const idxInOld = prevChildren.findIndex(
                        //             node => node.key === newStartVNode.key
                        //         )

                        //         if (idxInOld >= 0) {
                        //             // vnodeToMove 就是在旧 children 中找到的节点，该节点所对应的真实 DOM 应该被移动到最前面
                        //             const vnodeToMove = prevChildren[idxInOld]
                        //             // 调用 patch 函数完成更新
                        //             patch(vnodeToMove, newStartVNode, container)
                        //             // 把 vnodeToMove.el 移动到最前面，即 oldStartVNode.el 的前面
                        //             container.insertBefore(vnodeToMove.el, oldStartVNode.el)
                        //             // 由于旧 children 中该位置的节点所对应的真实 DOM 已经被移动，所以将其设置为 undefined
                        //             prevChildren[idxInOld] = undefined
                        //         }
                        //         else {
                        //             // 使用 mount 函数挂载新节点
                        //             mount(newStartVNode, container, false, oldStartVNode.el)
                        //         }

                        //         // 将 newStartIdx 下移一位
                        //         newStartVNode = nextChildren[++newStartIdx]
                        //     }
                        // }

                        // // 还有节点没完成
                        // if (oldEndIdx < oldStartIdx) {
                        //     // 添加新节点
                        //     for (let i = newStartIdx; i <= newEndIdx; i++) {
                        //         mount(nextChildren[i], container, false, oldStartVNode.el)
                        //     }
                        // }
                        // else if (newEndIdx < newStartIdx) {
                        //     // 移除操作
                        //     for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                        //         container.removeChild(prevChildren[i].el)
                        //     }
                        // }
                        // break

                        //  j 为指向新旧 children 中第一个节点的索引
                        let j = 0
                        let prevVNode = prevChildren[j]
                        let nextVNode = nextChildren[j]
                        let prevEnd = prevChildren.length - 1
                        let nextEnd = nextChildren.length - 1

                        outer: {
                            // while 循环向后遍历, 直到遇到拥有不同key值的节点为止
                            while (prevVNode.key === nextVNode.key) {
                                // 调用 patch 函数更新
                                patch(prevVNode, nextVNode, container)
                                j++
                                if (j > prevEnd || j > nextEnd) {
                                    break outer
                                }
                                prevVNode = prevChildren[j]
                                nextVNode = nextChildren[j]
                            }

                            prevVNode = prevChildren[prevEnd]
                            nextVNode = nextChildren[nextEnd]
                            // while 循环向前遍历，直到遇到拥有不同 key 值得节点为止
                            while (prevVNode.key === nextVNode.key) {
                                // 调用 patch 函数更新
                                patch(prevVNode, nextVNode, container)
                                prevEnd--
                                nextEnd--
                                if (j > prevEnd || j > nextEnd) {
                                    break outer
                                }
                                prevVNode = prevChildren[prevEnd]
                                nextVNode = nextChildren[nextEnd]
                            }

                        }


                        // 满足条件， j-> nextend 之间的节点应作为新节点插入
                        if (j > prevEnd && j <= nextEnd) {
                            // 所有新节点应该插入到位于 nextPos 位置的节点的前面
                            const nextPos = nextEnd + 1
                            const refNode = nextPos < nextChildren.length ? nextChildren[nextPos].el : null

                            // while 循环, 调用 mount 函数挂载节点
                            while (j <= nextEnd) {
                                mount(nextChildren[j++], container, false, refNode)
                            }
                        }
                        // j > nextEnd j <= prevEnd 成立移除节点
                        else if (j > nextEnd) {
                            // j -> prevEnd 之间的节点应该被移除
                            while (j <= prevEnd) {
                                container.removeChild(prevChildren[j++].el)
                            }
                        }
                        else {
                            // 构造 source 数组
                            // 新 children 中剩余未处理节点的数量
                            const nextLeft = nextEnd - j + 1
                            const source = []

                            for (let i = 0; i < nextLeft; i++) {
                                source.push(-1)
                            }

                            // source 存储新 children 中的节点在旧 children 中的位置
                            // 后台将会使用它计算出一个最大递增序列

                            const prevStart = j
                            const nextStart = j
                            let moved = false
                            let pos = 0
                            let patched = 0
                            // 构建索引表
                            const keyIndex = {}
                            for (let i = nextStart; i <= nextEnd; i++) {
                                keyIndex[nextChildren[i].key] = i
                            }

                            // 遍历旧 children
                            for (let i = prevStart; i <= prevEnd; i++) {
                                const prevVNode = prevChildren[i]

                                // 已经更新过的节点数量应该小于新 children 中需要更新的节点数量
                                if (patched < nextLeft) {
                                    // 通过索引表快速找到新 children 中具有相同 key 的节点的位置
                                    const k = keyIndex[prevVNode.key]

                                    if (typeof k !== 'undefined') {
                                        nextVNode = nextChildren[k]

                                        // patch 更新
                                        patch(prevVNode, nextVNode, container)
                                        patched++
                                        // 更新 source 数组
                                        source[k - nextStart] = i

                                        // 判断是否需要移动
                                        if (k < pos) {
                                            moved = true
                                        }
                                        else {
                                            pos = k
                                        }
                                    }
                                    else {
                                        // 没找到，说明旧节点在新 children 中已经不存在了，应该移除
                                        container.removeChild(prevVNode.el)
                                    }
                                }
                                else {
                                    // 多余的节点，应该移除
                                    container.removeChild(prevVNode.el)
                                }

                            }

                            // 是否需要移动 dom
                            // 如果 moved 为真，则需要进行 DOM 移动操作
                            if (moved) {
                                const seq = lis(source)
                                // j 指向最长递增子序列的最后一个值
                                let j = seq.length - 1
                                // 从后向前遍历新 children 中的剩余未处理节点
                                for (let i = nextLeft - 1; i >= 0; i--) {
                                    if (source[i] === -1) {
                                        // 作为全新的节点挂载

                                        // 该节点在新 children 中的真实位置索引
                                        const pos = i + nextStart
                                        const nextVNode = nextChildren[pos]
                                        // 该节点下一个节点的位置索引
                                        const nextPos = pos + 1
                                        // 挂载
                                        mount(
                                            nextVNode,
                                            container,
                                            false,
                                            nextPos < nextChildren.length
                                                ? nextChildren[nextPos].el
                                                : null
                                        )
                                    } else if (i !== seq[j]) {
                                        // 说明该节点需要移动

                                        // 该节点在新 children 中的真实位置索引
                                        const pos = i + nextStart
                                        const nextVNode = nextChildren[pos]
                                        // 该节点下一个节点的位置索引
                                        const nextPos = pos + 1
                                        // 移动
                                        container.insertBefore(
                                            nextVNode.el,
                                            nextPos < nextChildren.length
                                                ? nextChildren[nextPos].el
                                                : null
                                        )
                                    } else {
                                        // 当 i === seq[j] 时，说明该位置的节点不需要移动
                                        // 并让 j 指向下一个位置
                                        j--
                                    }
                                }
                            }

                        }


                }

                break
        }
    }

    // 移除DOM
    function replaceVNode (prevVNode, nextVNode, container) {
        // 将旧的 VNode 所渲染的 DOM 从容器中移除
        container.removeChild(prevVNode.el)
        // 如果将要被移除的 VNode 类型是组件，则需要调用该组件实例的 unmounted 钩子函数
        if (prevVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
            // 类型为有状态组件的 vnode ,其children 属性被用来存储组件实例对象
            const instance = prevVNode.children
            instance.unmounted && instance.unmounted()
        }

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

    return { render }
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
            else if (domPropsRe.test(key)) {
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


// [ 0, 8, 4, 12, 2, 10 ]
function lis (arr) {
    const p = arr.slice()
    const result = [0]
    let i
    let j
    let u
    let v
    let c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = ((u + v) / 2) | 0
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
