import { REACT_ELEMENT, REACT_FORWARD_ELEMENT } from "./utils";
import { addEvent } from "./Event";

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
    if (typeof children[i] === "string" || typeof children[i] === "number") {
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
      addEvent(dom, key.toLowerCase(), props[key]);
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

  const { type, $$typeof, props, ref } = VNode;

  // ============ 1. 创建元素 =============
  let dom;

  // 可以在index.js打印一下，看看babel把组件或者JSX转换成什么样的，这样就可以找到type是啥了

  // forwardRef组件, type是一个对象
  if (type && type.$$typeof === REACT_FORWARD_ELEMENT) {
    return getDomByForwardRefFunctionComponent(VNode);
  }

  // 说明渲染的是类组件，此时type是类
  // 类也是函数，所以我们要在类组件身上加一个标识，搞个静态属性
  if (typeof type === "function" && $$typeof === REACT_ELEMENT && type.IS_CLASS_COMPONENT) {
    return getDomByClassComponent(VNode);
  }

  if (typeof type === "function" && $$typeof === REACT_ELEMENT) {
    // 说明需要渲染的是个函数组件，此时type是函数本身
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

    // 给原生标签的ref赋值
    if (ref) {
      ref.current = dom;
    }
    VNode.dom = dom;
  }

  return dom;
}

function getDomByClassComponent(VNode) {
  const { type, props, ref } = VNode;
  // 类组件，type是类,因此可以直接new
  const instance = new type(props);
  const renderDOM = instance.render();
  instance.oldVNode = renderDOM; // 用于更新使用，新旧虚拟DOM对比
  // 给类组件的ref赋值，ref其实就是类的实例
  if (ref) ref.current = instance;
  // ================测试代码====================
  // setTimeout(() => {
  //   instance.setState({
  //     name: "chenjiang666",
  //   });
  // }, 3000);
  // ================测试代码====================

  if (!renderDOM) return null;
  return createDOM(renderDOM);
}

function getDomByFunctionComponent(VNode) {
  const { type, props } = VNode;
  // 由于type为函数组件，本身是个函数，那我们执行一下就可以得到返回值，而返回值就是我们需要渲染的JSX
  const renderDOM = type(props);
  if (!renderDOM) return null;
  return createDOM(renderDOM);
}

function getDomByForwardRefFunctionComponent(VNode) {
  const { props, ref, type } = VNode;

  const renderDOM = type.render(props, ref);
  if (!renderDOM) return null;
  return createDOM(renderDOM);
}

export function findDomByVNode(VNode) {
  if (!VNode) return;
  // 此时发现虚拟DOM和真实DOM没有关联，无法找到，那么就需要在生成DOM的时候，将两者绑定起来，移步到88行
  if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldDOM, newVNode) {
  // 清除旧DOM，通过新的虚拟DOM生成新的DOM并挂在到页面中
  const parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);

  parentNode.appendChild(createDOM(newVNode));
}

const ReactDOM = {
  render,
};

export default ReactDOM;
