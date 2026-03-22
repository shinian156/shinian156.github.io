# JavaScript高级特性核心知识

## 目录

1. [闭包](#1-闭包closure)
2. [防抖和节流](#2-防抖和节流)
3. [Promise](#3-promise)
4. [call、apply、bind](#4-callapplybind)
5. [深拷贝和浅拷贝](#5-深拷贝和浅拷贝)
6. [函数柯里化](#6-函数柯里化)
7. [面试高频题](#7-面试高频题)
8. [总结](#8-总结)

---

## 1. 闭包（Closure）

### 1.1 什么是闭包？
闭包是指有权访问另一个函数作用域中变量的函数。简单来说，就是函数内部定义的函数，可以访问外部函数的变量。

### 1.2 闭包的特点
1. **函数嵌套函数**
2. **内部函数引用外部函数的变量**
3. **外部函数执行完毕后，内部函数依然可以访问外部函数的变量**
4. **外部函数的变量保存在内存中**

### 1.3 闭包示例

#### 基础闭包
```javascript
function outer() {
  let count = 0;
  
  function inner() {
    count++;
    return count;
  }
  
  return inner;
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

#### 防抖闭包
```javascript
function debounce(func, wait) {
  let timeout;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
```

### 1.4 闭包的经典问题

#### 定时器问题
```javascript
// 问题：输出什么？
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// 输出：5个5
```

#### 解决方案1：使用IIFE（立即执行函数）
```javascript
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);
    }, 1000);
  })(i);
}
// 输出：0, 1, 2, 3, 4
```

#### 解决方案2：使用let
```javascript
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// 输出：0, 1, 2, 3, 4
```

### 1.5 闭包的优缺点

#### 优点
- **变量私有化**：实现数据封装
- **状态保持**：函数外部访问函数内部变量
- **模块化**：创建私有变量和方法

#### 缺点
- **内存消耗**：变量保存在内存中，可能导致内存泄漏
- **性能影响**：闭包比普通函数执行慢

### 1.6 闭包的常见应用场景
- 函数柯里化
- 模块模式
- 防抖节流函数
- 事件委托
- 单例模式

## 2. 防抖和节流

### 2.1 防抖（Debounce）

#### 什么是防抖？
触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会重新计算函数执行时间。

#### 防抖实现

##### 非立即执行版
```javascript
function debounce(func, wait) {
  let timeout;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
```

##### 立即执行版
```javascript
function debounce(func, wait) {
  let timeout;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (timeout) clearTimeout(timeout);
    
    const callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    
    if (callNow) func.apply(context, args);
  };
}
```

##### 完整版（合并）
```javascript
function debounce(func, wait, immediate) {
  let timeout;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (timeout) clearTimeout(timeout);
    
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args);
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
  };
}
```

#### 防抖应用场景
- 搜索框输入
- 窗口resize事件
- 滚动事件
- 表单验证

### 2.2 节流（Throttle）

#### 什么是节流？
固定周期内，只执行一次动作，若有新事件触发，不执行。周期结束后，又有事件触发，开始新的周期。

#### 节流实现

##### 时间戳版
```javascript
function throttle(func, wait) {
  let previous = 0;
  
  return function() {
    const context = this;
    const args = arguments;
    const now = Date.now();
    
    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}
```

##### 定时器版
```javascript
function throttle(func, wait) {
  let timeout;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args);
      }, wait);
    }
  };
}
```

##### 完整版
```javascript
function throttle(func, wait, type) {
  let timeout;
  let previous = 0;
  
  return function() {
    const context = this;
    const args = arguments;
    
    if (type === 1) { // 时间戳版
      const now = Date.now();
      if (now - previous > wait) {
        func.apply(context, args);
        previous = now;
      }
    } else if (type === 2) { // 定时器版
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args);
        }, wait);
      }
    }
  };
}
```

#### 节流应用场景
- 滚动加载
- 鼠标移动
- 按钮点击
- 拖拽事件

### 2.3 防抖和节流的区别
- **防抖**：高频事件触发后，n秒内只执行一次
- **节流**：高频事件触发后，n秒内只执行一次，但保证每隔n秒执行一次

## 3. Promise

### 3.1 Promise 状态
- **Pending（等待态）**：初始状态
- **Fulfilled（执行态）**：成功状态
- **Rejected（拒绝态）**：失败状态

状态只能从 Pending → Fulfilled 或 Pending → Rejected，一旦改变就不能再变。

### 3.2 Promise 基本用法

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
    // reject('error');
  }, 1000);
});

promise
  .then(value => {
    console.log(value);
  })
  .catch(error => {
    console.error(error);
  });
```

### 3.3 Promise 链式调用

```javascript
fetch('/api/user')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    return fetch(`/api/posts/${data.id}`);
  })
  .then(response => response.json())
  .then(posts => {
    console.log(posts);
  })
  .catch(error => {
    console.error(error);
  });
```

### 3.4 Promise 并发处理

#### Promise.all
```javascript
const promises = [
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
];

Promise.all(promises)
  .then(responses => {
    // 所有请求都成功才执行
    return Promise.all(responses.map(r => r.json()));
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    // 任意一个失败就失败
    console.error(error);
  });
```

#### Promise.race
```javascript
const promises = [
  fetch('/api/fast'),
  fetch('/api/slow')
];

Promise.race(promises)
  .then(response => {
    // 最先完成的请求
    console.log(response);
  });
```

#### Promise.allSettled
```javascript
const promises = [
  fetch('/api/success'),
  fetch('/api/error')
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(result.value);
      } else {
        console.log(result.reason);
      }
    });
  });
```

### 3.5 手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    } else if (this.state === 'rejected') {
      onRejected(this.reason);
    } else if (this.state === 'pending') {
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

### 3.6 Promise 常见问题

#### Q1: Promise 的执行顺序
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出：1, 4, 3, 2
```

#### Q2: Promise 中的错误处理
```javascript
Promise.resolve()
  .then(() => {
    throw new Error('error1');
  })
  .then(() => {
    console.log('success');
  })
  .catch(error => {
    console.log(error.message); // error1
  })
  .then(() => {
    console.log('continue'); // 继续执行
  });
```

## 4. call、apply、bind

### 4.1 基本用法

#### call
```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'Alice' };

greet.call(person, 'Hello'); // Hello, Alice
```

#### apply
```javascript
function sum(a, b, c) {
  return a + b + c;
}

const numbers = [1, 2, 3];
console.log(sum.apply(null, numbers)); // 6
```

#### bind
```javascript
const person = { name: 'Alice' };

const greet = function() {
  console.log(`Hello, ${this.name}`);
}.bind(person);

greet(); // Hello, Alice
```

### 4.2 手写实现

#### 手写 call
```javascript
Function.prototype.myCall = function(context) {
  context = context || window;
  context.fn = this;
  const args = [...arguments].slice(1);
  const result = context.fn(...args);
  delete context.fn;
  return result;
};
```

#### 手写 apply
```javascript
Function.prototype.myApply = function(context, args) {
  context = context || window;
  context.fn = this;
  let result;
  if (args) {
    result = context.fn(...args);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};
```

#### 手写 bind
```javascript
Function.prototype.myBind = function(context) {
  const self = this;
  const args = [...arguments].slice(1);
  
  return function() {
    const newArgs = [...arguments];
    return self.apply(context, args.concat(newArgs));
  };
};
```

## 5. 深拷贝和浅拷贝

### 5.1 浅拷贝
```javascript
// Object.assign
const obj = { a: 1, b: { c: 2 } };
const copy = Object.assign({}, obj);

// 展开运算符
const copy2 = { ...obj };

// Array.from
const arr = [1, 2, 3];
const copy3 = Array.from(arr);
```

### 5.2 深拷贝

#### JSON.stringify
```javascript
const obj = { a: 1, b: { c: 2 } };
const copy = JSON.parse(JSON.stringify(obj));

// 缺点：无法拷贝函数、undefined、Symbol
```

#### 递归深拷贝
```javascript
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  const result = Array.isArray(obj) ? [] : {};
  map.set(obj, result);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key], map);
    }
  }
  
  return result;
}
```

### 5.3 拷贝常见问题

```javascript
const obj = {
  a: 1,
  b: {
    c: 2
  },
  d: function() {
    console.log('hello');
  }
};

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy); // { a: 1, b: { c: 2 } } // d 函数丢失
```

## 6. 函数柯里化

### 6.1 什么是柯里化？
将一个多参数的函数转换成一系列使用一个参数的函数的技术。

### 6.2 基础实现
```javascript
function add(a) {
  return function(b) {
    return a + b;
  };
}

console.log(add(1)(2)); // 3
```

### 6.3 通用柯里化函数
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
```

## 7. 面试高频题

### Q1: 闭包的应用场景？
- 数据封装
- 模块化
- 防抖节流
- 单例模式
- 柯里化

### Q2: 防抖和节流的区别？
- 防抖：高频触发后，n秒内只执行一次
- 节流：高频触发后，n秒内只执行一次，但保证每隔n秒执行一次
- 应用场景不同

### Q3: Promise 的状态有哪些？
- Pending
- Fulfilled
- Rejected

### Q4: 如何实现深拷贝？
- JSON.parse(JSON.stringify())
- 递归实现
- 处理循环引用

### Q5: call、apply、bind 的区别？
- call：参数逐个传递
- apply：参数为数组
- bind：返回新函数，不立即执行

## 8. 总结

JavaScript 高级特性是面试的重点，需要重点掌握：
- 闭包的原理和应用
- 防抖和节流的实现和应用场景
- Promise 的使用和原理
- call、apply、bind 的实现
- 深拷贝和浅拷贝
- 函数柯里化

推荐阅读：
- JavaScript 高级程序设计
- 你不知道的 JavaScript
- MDN 文档
