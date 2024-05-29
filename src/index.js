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

class ChildComponent extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      count: 0,
    };
  }

  handleClick(num) {
    this.setState({
      count: this.state.count + num,
    });
  }
  render() {
    return (
      <div>
        <h2
          onClick={() => {
            this.handleClick(1);
          }}
        >
          点我：{this.state.count}
        </h2>
      </div>
    );
  }
}

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.childRef = React.createRef();
    this.inputRef = React.createRef();
  }
  render() {
    return (
      <div className="container">
        <input ref={this.inputRef} />
        <button
          onClick={() => {
            this.inputRef.current.focus();
          }}
        >
          获取焦点
        </button>
        <br />
        <button
          onClick={() => {
            this.childRef.current.handleClick(100);
          }}
        >
          点我子组件+100
        </button>

        <ChildComponent ref={this.childRef} />
      </div>
    );
  }
}
// 可以打印一下，看看babel把组件或者JSX转换成什么样的
// console.log("MyComponent", MyComponent);

ReactDOM.render(<MyComponent name="chenjiang" />, document.getElementById("root"));
