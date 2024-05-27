import { findDomByVNode, updateDomTree } from "./React-dom";

// 更新器队列
let updateQueue = {
  isBatch: false,
  updates: new Set(),
};

// 执行批量更新的函数
function flushUpdaterQueue() {
  updateQueue.isBatch = false;

  // 执行每个更新器的更新操作
  for (let updater of updateQueue.updates) {
    updater.launchUpdate();
  }

  // 清空
  updateQueue.updates.clear();
}

// 更新器，其实是管理状态的
class Updater {
  constructor(ClassComponentInstance) {
    this.ClassComponentInstance = ClassComponentInstance;
    // 每次执行setState的时候，先把需要更新的state保存下来
    this.pendingState = [];
  }

  addState(partialState) {
    // setState存在单次执行，也存在多次执行，那需要做区分，如果是多次执行，就需要合并成一次再来执行
    this.pendingState.push(partialState);
    this.preHandleForUpdate(); // 这里就是需要判断是批量执行还是单次执行，如果是批量就要做处理，如果是单次直接启动更新操作
  }

  preHandleForUpdate() {
    // 如果是批量更新，那就不能立刻执行launchUpdate
    if (updateQueue.isBatch) {
      updateQueue.updates.add(this); // 将当前的更新存起来

      // 进行批量更新
      flushUpdaterQueue();
    } else {
      // 如果是单次更新
      this.launchUpdate();
    }
  }

  launchUpdate() {
    // 更新，其实最终就是类组件的更新，而类组件的更新操作，在update方法中
    const { ClassComponentInstance, pendingState } = this;

    if (pendingState.length === 0) return; // 说明没有要更新的内容

    // 根据待更新的state来更新类组件本身的state，也就是给类组件设置最新的state
    ClassComponentInstance.state = pendingState.reduce((prevState, newState) => {
      return { ...prevState, ...newState };
    }, ClassComponentInstance.state);

    // 然后清空待更新state的队列
    this.pendingState.length = 0;

    // 执行更新
    ClassComponentInstance.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true;
  constructor(props) {
    this.updater = new Updater(this);
    this.state = {};
    this.props = props;
  }

  setState(partialState) {
    // 合并属性
    // this.state = { ...this.state, ...partialState };
    // 重新渲染进行更新
    // 存在多次调用setState的情况，所以需要合并属性，避免重复渲染，就需要处理这种批量更新的情况
    // 更新机制比较复杂，不适合在主线Component类中实现逻辑，一般复杂的逻辑，需要多个类组合来完成
    // this.update();

    // 有了更新器过后，28，32行就不需要
    this.updater.addState(partialState); // 等同于先把需要更新的state加入队列当中，然后由更新器去判断是走批量更新，还是单次直接更新
  }

  update() {
    // 需要考虑一个问题：这里可以拿到新的虚拟DOM，那么旧的虚拟DOM呢？新的和旧的又有多少区别？
    // 重新执行组件的render函数，获取最新的虚拟DOM
    // 根据新的虚拟DOM生成新的真实DOM
    // 将真实DOM挂在到页面当中
    let oldVNode = this.oldVNode; // 让类组件拥有oldVnode属性，这个属性保存的是类组件实例对应的虚拟DOM

    let oldDOM = findDomByVNode(oldVNode); // 根据虚拟DOM找到对应的真实DOM，关于DOM操作的都放在React-dom文件里面

    let newVNode = this.render(); // 获取最新的虚拟DOM

    updateDomTree(oldDOM, newVNode);

    this.oldVNode = newVNode;
  }
}
