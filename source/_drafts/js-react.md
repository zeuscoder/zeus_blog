---
title: JS：React 基础
tags:
---
学习 React，吸收它的框架设计理念与优点。

<!-- more -->

> UI = fn(state)

---

### 核心语法

本文先只讲函数式组件，函数组件语法更短、更简单，这使得它更容易开发、理解和测试，更符合 React 的设计理念。

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```


```javascript
const FunctionalComponent = () => {
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <p>count: {count}</p >
            <button onClick={() => setCount(count + 1)}>Click</button>
        </div>
    );
};
```



```javascript
const FunctionalComponent = () => {
    useEffect(() => {
        console.log("Hello");
    }, []);

    useEffect(() => {
   	return () => {
     	    console.log("Bye");
   	};
    }, []);

    return <h1>Hello, World</h1>;
};
```

高阶组件

```javascript
class Home extends React.Component {
    render() {
        return (<h1>Hello World.</h1>);
    }
}
function withTiming(WrappedComponent) {
    return class extends WrappedComponent {
        constructor(props) {
            super(props);
            this.start = 0;
            this.end = 0;
        }
        componentWillMount() {
            super.componentWillMount && super.componentWillMount();
            this.start = Date.now();
        }
        componentDidMount() {
            super.componentDidMount && super.componentDidMount();
            this.end = Date.now();
            console.log(`${WrappedComponent.name} 组件渲染时间为 ${this.end - this.start} ms`);
        }
        render() {
            return super.render();
        }
    };
}

export default withTiming(Home);
```





双缓存机制



### **`Firbe`架构**




hooks


setState 

[《React设计原理》读书分享–框架概述 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/629657853)

子类是没有自己的 `this` 对象的，它只能继承父类的 `this` 对象，然后对其进行加工

而 `super()` 就是将父类中的 `this` 对象继承给子类的，没有 `super()` 子类就得不到 `this` 对象

如果先调用 `this`，再初始化 `super()`，同样是禁止的行为

在 `React` 中，类组件是基于 `ES6` 的规范实现的，继承 `React.Component`，因此如果用到 `constructor` 就必须写 `super()` 才初始化 `this`
