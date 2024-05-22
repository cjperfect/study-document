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
  render() {
    return (
      <div className="container">
        <span>{this.props.name}</span>
      </div>
    );
  }
}
// 可以打印一下，看看babel把组件或者JSX转换成什么样的
console.log("MyComponent", MyComponent);

ReactDOM.render(<MyComponent name="chenjiang" />, document.getElementById("root"));
