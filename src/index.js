import React from "./React";
import ReactDOM from "./React-dom";

/* 输入一个jsx，在执行阶段，自动去react里面找到createElement函数并运行 */

ReactDOM.render(
  <div className="container" key={"1"} ref={"aaa"} style={{ color: "red" }}>
    chenjiang
  </div>,
  document.getElementById("root")
);

// root.render(<div>cxkyyds</div>);
