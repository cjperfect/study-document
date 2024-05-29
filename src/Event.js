import { updateQueue, flushUpdaterQueue } from "./Component";
export function addEvent(dom, eventName, bindFunction) {
  dom.attch = dom.attch || {};
  dom.attch[eventName] = bindFunction;

  // 事件合成机制的核心点一：事件绑定到document上
  if (document[eventName]) return; // 已经绑定过了这个事件

  // react合成事件，是利用冒泡机制，在元素上触发事件，然后通过冒泡到根节点，再由根节点处理绑定的函数
  document[eventName] = dispatchEvent; // 所有事件都是交给根节点代理的，这里有一个专门处理事件的函数
}

function dispatchEvent(nativeEvent) {
  // 这里来触发绑定的函数，上面提到了是由根节点来触发，那根节点怎么知道，事件名称，绑定函数时什么
  // 一种解决办法，把事件名称和绑定的函数，放到dom本身（dom本身也是一个对象），后续通过event.target就可以拿到了，可以看addEvent函数的前2行的代码
  // 一般触发函数里面，都有更新操作，例如setState，而之前编写setState源码时候提到批量更新，批量更新一般都是在事件处理当中执行

  updateQueue.isBatch = true; // 标识着需要批量更新

  // 事件合成机制的核心点二：屏蔽浏览器之间的差异，合成事件对象（也就是将原始的事件对象转换成合成事件对象，nativeEvent => syntheticEvent）
  let syntheticEvent = createSyntheticEvent(nativeEvent);
  // 合成事件创建了，该如何使用呢？
  // 子元素有一个onClick事件，父元素也有一个onClick事件，那是不是要通过冒泡机制，挨个执行，那存在一个问题，如何找到父元素并执行绑定的事件？
  // 答案：addEvnet上面给dom记录了事件名称和绑定事件，那我可以通过nativeEvent.target.parentNode找到父元素，然后parentNode.attch[eventName]();执行对应的绑定函数就可以了
  let target = nativeEvent.target;
  while (target) {
    syntheticEvent.currentTarget = target;
    let eventName = `on${nativeEvent.type}`;
    let bindFunction = target.attch && target.attch[eventName];
    if (bindFunction) {
      bindFunction(syntheticEvent); // 调用绑定的函数，并且把合成事件对象传进去
    }

    // 如果阻止冒泡了，就不用循环了
    if (syntheticEvent.isPropagationStopped) {
      break;
    }

    target = target.parentNode;
  }

  flushUpdaterQueue(); // 批量更新
}

function createSyntheticEvent(nativeEvent) {
  // 默认行为和阻止冒泡是存在兼容问题的，因此需要做处理，也就是屏蔽浏览器之间的差异
  let nativeEventKeyValues = {};

  for (let key in nativeEvent) {
    // 因为事件合成对象，是自定义对象，用户在调用合成对象里面的函数时候，一旦用到了this，那么就存在this指向问题，因此需要绑定this指向
    // 就算返回的是自定义对象，但是里面函数的this指向还是原生事件对象
    nativeEventKeyValues[key] =
      typeof nativeEvent[key] === "function" ? nativeEvent[key].bind(nativeEvent) : nativeEvent[key];
  }

  // 最终返回的事件合成对象
  let syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false,
    isPropagationStopped: false,
    // 阻止默认事件
    preventDefault: () => {
      this.isDefaultPrevented = true;

      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = true;
      }
    },
    // 阻止冒泡
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });

  return syntheticEvent;
}
