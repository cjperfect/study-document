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

  let dom;
  if (type && $$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }

  // 有属性
  if (props) {
    if (typeof props.children === "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === "string") {
      dom.appendChild(document.createTextNode(props.children));
    }

    // 处理属性

    setPropsForDOM(dom, props);
  }

  return dom;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
