import { REACT_ELEMENT } from "./utils";

function render(VNode, container) {
  // 处理虚拟dom，转换成真实dom
  // 挂载到容器
  mount(VNode, container);
}

// 挂载dom
function mount(VNode, container) {
  const dom = createDOM(VNode);
  if (dom) {
    container.appendChild(dom);
  }
}

function mountArray(children, parent) {
  for (let i = 0; i < children.length; i++) {
    // 文本节点
    if (typeof children[i] === "string") {
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      mount(children[i], parent);
    }
  }
}

function setPropsForDOM(dom, props) {
  if (!dom) return;

  for (let key in props) {
    // 忽略children属性
    if (key === "children") continue;
    // 事件需要单独处理
    if (/^on[A-Z].*/.test(key)) {
    } else if (key === "style") {
      // 传过来的是一个对象
      Object.keys(props[key]).forEach((styleName) => {
        dom.style[styleName] = props[key][styleName];
      });
    } else {
      // 其他普通属性
      dom.setAttribute(key, props[key]);
    }
  }
}

function createDOM(VNode) {
  // 1.创建元素， 2. 处理子节点  3. 处理属性props

  const { type, $$typeof, props } = VNode;

  // ============ 1. 创建元素 =============
  let dom;

  // 说明需要渲染的是个函数组件
  if (typeof type === "function" && $$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }
  if (type && $$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }

  if (props) {
    // ============ 2. 处理子节点 =============
    if (typeof props.children === "object" && props.children.type) {
      // 只有一子个节点，创建并挂载
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      // 有多个子节点，逐个创建并挂载
      mountArray(props.children, dom);
    } else if (typeof props.children === "string") {
      // 子节点为字符串，直接创建文本节点并挂载
      dom.appendChild(document.createTextNode(props.children));
    }

    // ============ 3. 处理属性 =============
    // JSX身上所带的属性，绑定到DOM上
    setPropsForDOM(dom, props);
  }

  return dom;
}

function getDomByFunctionComponent(VNode) {
  const { type, props } = VNode;
  // 由于type为函数组件，本身是个函数，那我们执行一下就可以得到返回值，而返回值就是我们需要渲染的JSX
  const renderDOM = type(props);
  if (!renderDOM) return null;
  return createDOM(renderDOM);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
