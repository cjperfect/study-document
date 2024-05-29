import React from "./React";
import ReactDOM from "./React-dom";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<div>cxkyyds</div>);

// function MyComponent(props) {
//   return (
//     <div className="container">
//       <span>chenjiang</span>
//     </div>
//   );
// }
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "chenjiang",
      count: 0,
    };
  }
  render() {
    return (
      <div className="container">
        <button
          // 由于事件机制还没处理，这里还不能实现点击操作，只能在react-dom里面对类实例调用setState方法，做个验证
          onClick={() => {
            this.setState({
              count: this.state.count + 1,
            });
          }}
        >
          click
        </button>
        <p>
          {this.state.name}：{this.state.count}
        </p>
      </div>
    );
  }
}
// 可以打印一下，看看babel把组件或者JSX转换成什么样的
// console.log("MyComponent", MyComponent);

ReactDOM.render(<MyComponent name="chenjiang" />, document.getElementById("root"));
