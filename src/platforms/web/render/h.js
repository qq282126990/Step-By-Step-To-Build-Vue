import { VNodeFlags, ChildrenFlags } from './flags'

export const Fragment = Symbol()
export const Portal = Symbol()

function normalizeVNodes (children) {
    const newChildren = [];

    // 遍历 children
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.key == null) {
            // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
            child.key = '|' + i
        }

        newChildren.push(child)
    }

    // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
    return newChildren
}

export function createTextVNode (text) {
    return {
        _isVNode: true,
        // flags 是 VNodeFlags.TEXT
        flags: VNodeFlags.TEXT,
        tag: null,
        data: null,
        // 纯文本类型的 VNode，其 children 属性存储的是与之相符的文本内容
        children: text,
        // 文本节点没有子节点
        childFlags: ChildrenFlags.NO_CHILDREN,
        el: null
    }
}

// 序列化 class
function normalizeClass (classValue) {
    // res 是最终要返回的类名字符串
    let res = ''

    if (typeof classValue === 'string') {
        res = classValue
    }
    // 是否数值
    else if (Array.isArray(classValue)) {
        for (let i = 0; i < classValue.length; i++) {
            res += normalizeClass(classValue[i]) + ' '
        }
    }
    // 对象
    else if (typeof classValue === 'object') {
        for (const name in classValue) {
            if (classValue[name]) {
                res += name + ' '
            }
        }
    }

    return res.trim();
}


export function h (tag, data = null, children = null) {
    let flags = null;

    // 判断该 VNode 的 flags 属性
    if (typeof tag === 'string') {
        flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML

        // 序列化 class
        if (data) {
            data.class = normalizeClass(data.class);
        }
    }
    else if (tag === Fragment) {
        flags = VNodeFlags.FRAGMENT
    }
    else if (tag === Portal) {
        flags = VNodeFlags.PORTAL;
        // target 数据存储在 VNodeData 中
        tag = data && data.target;
    }
    else {
        // 兼容 Vue2 的对象式组件
        if (tag !== null && typeof tag === 'object') {
            flags = tag.functional
                ? VNodeFlags.COMPONENT_FUNCTIONAL   // 函数式组件
                : VNodeFlags.COMPONENT_STATEFUL_NORMAL; // 有状态组件
        }
        else if (typeof tag === 'function') {
            // vue3 类组件
            flags = tag.prototype && tag.prototype.render
                ? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
                : VNodeFlags.COMPONENT_FUNCTIONAL  // 函数式组件

        }
    }

    // children 的不同形式
    let childFlags = null
    if (Array.isArray(children)) {
        const { length } = children
        // 没有 children
        if (length === 0) {
            childFlags = ChildrenFlags.NO_CHILDREN
        }
        // 单个子节点
        else if (length === 1) {
            childFlags = ChildrenFlags.SINGLE_VNODE
            children = children[0]
        }
        // 多个子节点，且子节点使用 key
        else {
            childFlags = ChildrenFlags.KEYED_VNODES
            children = normalizeVNodes(children)
        }
    }
    // 没有子节点
    else if (children == null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN
    }
    // 单子节点
    else if (children._isVNode) {
        childFlags = ChildrenFlags.SINGLE_VNODE
    }
    // 当作文本节点处理
    else {
        childFlags = ChildrenFlags.SINGLE_VNODE
        children = createTextVNode(children + '')
    }


    return {
        _isVNode: true,
        flags,
        tag,
        data,
        key: data && data.key ? data.key : null,
        children,
        childFlags,
        el: null
    }
}
