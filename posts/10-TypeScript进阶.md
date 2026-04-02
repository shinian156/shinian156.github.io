# TypeScript 进阶核心知识

## 目录

- [1. 泛型（Generics）](#1-泛型generics)
  - [1.1 什么是泛型？](#11-什么是泛型)
  - [1.2 泛型函数](#12-泛型函数)
  - [1.3 泛型接口](#13-泛型接口)
  - [1.4 泛型类](#14-泛型类)
  - [1.5 泛型约束](#15-泛型约束)
  - [1.6 泛型工具类型](#16-泛型工具类型)
  - [1.7 高级泛型](#17-高级泛型)
- [2. 装饰器（Decorators）](#2-装饰器decorators)
  - [2.1 什么是装饰器？](#21-什么是装饰器)
  - [2.2 类装饰器](#22-类装饰器)
  - [2.3 方法装饰器](#23-方法装饰器)
  - [2.4 属性装饰器](#24-属性装饰器)
  - [2.5 参数装饰器](#25-参数装饰器)
  - [2.6 装饰器应用场景](#26-装饰器应用场景)
- [3. 类的高级特性](#3-类的高级特性)
  - [3.1 访问修饰符](#31-访问修饰符)
  - [3.2 继承](#32-继承)
  - [3.3 抽象类](#33-抽象类)
  - [3.4 接口实现](#34-接口实现)
- [4. 类型推断和类型断言](#4-类型推断和类型断言)
  - [4.1 类型推断](#41-类型推断)
  - [4.2 类型断言](#42-类型断言)
- [5. 高级类型](#5-高级类型)
  - [5.1 联合类型](#51-联合类型)
  - [5.2 交叉类型](#52-交叉类型)
  - [5.3 类型守卫](#53-类型守卫)
  - [5.4 可辨识联合](#54-可辨识联合)
  - [5.5 映射类型](#55-映射类型)
- [6. 模块和命名空间](#6-模块和命名空间)
  - [6.1 模块](#61-模块)
  - [6.2 命名空间](#62-命名空间)
- [7. 声明文件](#7-声明文件)
  - [7.1 .d.ts 文件](#71-dts-文件)
  - [7.2 类型声明](#72-类型声明)
- [8. 面试高频题](#8-面试高频题)
  - [Q1: 什么是泛型？有什么作用？](#q1-什么是泛型有什么作用)
  - [Q2: TypeScript 中的 unknown 和 any 有什么区别？](#q2-typescript-中的-unknown-和-any-有什么区别)
  - [Q3: interface 和 type 的区别？](#q3-interface-和-type-的区别)
  - [Q4: 什么是装饰器？](#q4-什么是装饰器)
  - [Q5: 如何实现条件类型？](#q5-如何实现条件类型)
  - [Q6: Partial 和 Required 的区别？](#q6-partial-和-required-的区别)
  - [Q7: readonly 和 const 的区别？](#q7-readonly-和-const-的区别)
- [9. 最佳实践](#9-最佳实践)
  - [9.1 代码规范](#91-代码规范)
  - [9.2 项目配置](#92-项目配置)
- [10. 总结](#10-总结)

---
## 1. 泛型（Generics）

### 1.1 什么是泛型？
泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型。

### 1.2 泛型函数
```typescript
// 基础泛型
function identity<T>(arg: T): T {
  return arg;
}

const result1 = identity<string>('hello');
const result2 = identity<number>(123);

// 类型推断
const result3 = identity('hello'); // 自动推断为 string
```

### 1.3 泛型接口
```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

### 1.4 泛型类
```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };

let myGenericString = new GenericNumber<string>();
myGenericString.zeroValue = '';
myGenericString.add = function(x, y) { return x + y; };
```

### 1.5 泛型约束
```typescript
// 使用接口约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity({ length: 10, value: 3 }); // 正确
// loggingIdentity(3); // 错误：number 没有 length 属性

// 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const obj = { a: 1, b: 2, c: 3 };
getProperty(obj, 'a'); // 正确
// getProperty(obj, 'd'); // 错误：'d' 不是 obj 的 key
```

### 1.6 泛型工具类型
```typescript
// Partial<T> - 将所有属性变为可选
interface User {
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; }

// Required<T> - 将所有属性变为必选
type RequiredUser = Required<PartialUser>;
// { name: string; age: number; }

// Readonly<T> - 将所有属性变为只读
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; }

// Pick<T, K> - 选择部分属性
type PickUser = Pick<User, 'name'>;
// { name: string; }

// Omit<T, K> - 排除部分属性
type OmitUser = Omit<User, 'age'>;
// { name: string; }

// Record<K, T> - 创建对象类型
type UserMap = Record<string, User>;

// Exclude<T, U> - 从 T 中排除 U
type T1 = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'

// Extract<T, U> - 从 T 中提取 U
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'

// NonNullable<T> - 排除 null 和 undefined
type T3 = NonNullable<string | null | undefined>; // string

// ReturnType<T> - 获取函数返回值类型
function f() { return { x: 10, y: 20 }; }
type FReturn = ReturnType<typeof f>; // { x: number; y: number; }

// Parameters<T> - 获取函数参数类型
type FParams = Parameters<typeof f>; // []
```

### 1.7 高级泛型
```typescript
// 条件类型
type TypeName<T> = 
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

type T1 = TypeName<string>; // 'string'
type T2 = TypeName<number[]>; // 'object'

// 映射类型
type Readonly2<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial2<T> = {
  [P in keyof T]?: T[P];
};

// 条件映射类型
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
};

interface Person {
  name: string;
  age: number;
}

type LazyPerson = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

## 2. 装饰器（Decorators）

### 2.1 什么是装饰器？
装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、访问符、属性或参数上。装饰器使用 `@expression` 的形式。

### 2.2 类装饰器
```typescript
// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return `Hello, ${this.greeting}`;
  }
}

// 装饰器工厂
function sealedFactory(isSealed: boolean) {
  return function(constructor: Function) {
    if (isSealed) {
      Object.seal(constructor);
    }
  };
}

@sealedFactory(true)
class MyClass {
  // ...
}
```

### 2.3 方法装饰器
```typescript
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`调用方法: ${key}`);
    console.log(`参数:`, args);
    
    const result = originalMethod.apply(this, args);
    
    console.log(`返回值:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2); // 打印调用信息
```

### 2.4 属性装饰器
```typescript
function logProperty(target: any, key: string) {
  let value = target[key];
  
  const getter = () => {
    console.log(`获取属性: ${key}`);
    return value;
  };
  
  const setter = (newVal: any) => {
    console.log(`设置属性: ${key}, 值: ${newVal}`);
    value = newVal;
  };
  
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class Person {
  @logProperty
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person('Alice');
person.name = 'Bob'; // 打印设置信息
console.log(person.name); // 打印获取信息
```

### 2.5 参数装饰器
```typescript
function required(target: any, key: string, index: number) {
  const requiredParams: number[] = Reflect.getMetadata('required', target, key) || [];
  requiredParams.push(index);
  Reflect.defineMetadata('required', requiredParams, target, key);
}

class User {
  @validate
  greet(@required name: string, @required age: number) {
    console.log(`${name} is ${age} years old`);
  }
}

function validate(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const requiredParams: number[] = Reflect.getMetadata('required', target, key) || [];
    
    requiredParams.forEach(index => {
      if (args[index] === undefined) {
        throw new Error(`参数 ${index} 是必须的`);
      }
    });
    
    return originalMethod.apply(this, args);
  };
}
```

### 2.6 装饰器应用场景
- 日志记录
- 性能监控
- 缓存
- 权限验证
- 依赖注入
- 请求验证

## 3. 类的高级特性

### 3.1 访问修饰符
```typescript
class Person {
  // public：默认，公开
  public name: string;
  
  // private：私有，只能在类内部访问
  private age: number;
  
  // protected：受保护，可以在类和子类中访问
  protected address: string;
  
  constructor(name: string, age: number, address: string) {
    this.name = name;
    this.age = age;
    this.address = address;
  }
  
  private getAge(): number {
    return this.age;
  }
  
  protected getAddress(): string {
    return this.address;
  }
}
```

### 3.2 继承
```typescript
class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  move(distance: number): void {
    console.log(`${this.name} moved ${distance}m`);
  }
}

class Dog extends Animal {
  breed: string;
  
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
  
  bark(): void {
    console.log('Woof!');
  }
  
  move(distance: number): void {
    console.log(`${this.name} the ${this.breed} dog moved ${distance}m`);
  }
}
```

### 3.3 抽象类
```typescript
abstract class Animal {
  abstract makeSound(): void;
  
  move(): void {
    console.log('Moving...');
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('Woof!');
  }
}
```

### 3.4 接口实现
```typescript
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date;
  
  setTime(d: Date) {
    this.currentTime = d;
  }
}
```

## 4. 类型推断和类型断言

### 4.1 类型推断
```typescript
// 变量声明推断
let x = 3; // 推断为 number

// 函数返回值推断
function add(a: number, b: number) {
  return a + b; // 推断为 number
}

// 最佳通用类型推断
let zoo = [new Rhino(), new Elephant(), new Snake()]; // 推断为 (Rhino | Elephant | Snake)[]

// 上下文类型推断
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // mouseEvent 被推断为 MouseEvent
};
```

### 4.2 类型断言
```typescript
// 尖括号语法
let someValue: any = 'this is a string';
let strLength: number = (<string>someValue).length;

// as 语法（推荐）
let strLength2: number = (someValue as string).length;

// 非空断言
function f(str: string | null) {
  const s = str!; // 断言 str 非空
  console.log(s.length);
}

// 双重断言（慎用）
let value: string = 'hello';
let length: number = (value as unknown as number); // 双重断言
```

## 5. 高级类型

### 5.1 联合类型
```typescript
function printId(id: number | string) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

// 联合类型使用接口
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function getSmallPet(): Fish | Bird {
  // ...
}

let pet = getSmallPet();
pet.layEggs(); // 可以访问
// pet.fly(); // 错误：Fish 可能没有 fly 方法
```

### 5.2 交叉类型
```typescript
interface BusinessPartner {
  name: string;
  credit: number;
}

interface Individual {
  name: string;
  address: string;
}

type Employee = BusinessPartner & Individual;

const employee: Employee = {
  name: 'Alice',
  credit: 1000,
  address: '123 Main St'
};
```

### 5.3 类型守卫
```typescript
// typeof 类型守卫
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  return padding + value;
}

// instanceof 类型守卫
interface Padder {
  getPaddingString(): string;
}

class SpaceRepeatingPadder implements Padder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(' ');
  }
}

class StringPadder implements Padder {
  constructor(private value: string) {}
  getPaddingString() {
    return this.value;
  }
}

function getRandomPadder() {
  return Math.random() < 0.5 
    ? new SpaceRepeatingPadder(4) 
    : new StringPadder('hello');
}

let padder: Padder = getRandomPadder();
if (padder instanceof SpaceRepeatingPadder) {
  console.log(padder); // 类型推断为 SpaceRepeatingPadder
}
```

### 5.4 可辨识联合
```typescript
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape): number {
  switch (s.kind) {
    case 'square':
      return s.size * s.size;
    case 'rectangle':
      return s.width * s.height;
    case 'circle':
      return Math.PI * s.radius * s.radius;
    default:
      const _exhaustiveCheck: never = s;
      return _exhaustiveCheck;
  }
}
```

### 5.5 映射类型
```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Person = {
  name: string;
  age: number;
};

type ReadonlyPerson = Readonly<Person>;
type PartialPerson = Partial<Person>;

// 条件映射类型
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
};
```

## 6. 模块和命名空间

### 6.1 模块
```typescript
// utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export class Calculator {
  // ...
}

export const PI = 3.14159;

// main.ts
import { add, Calculator, PI } from './utils';
import * as utils from './utils';
```

### 6.2 命名空间
```typescript
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}

// 使用
const validator = new Validation.LettersOnlyValidator();
```

## 7. 声明文件

### 7.1 .d.ts 文件
```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      init(): void;
    };
  }
}

export {};
```

### 7.2 类型声明
```typescript
// 为第三方库添加类型声明
declare module 'some-library' {
  export function doSomething(): void;
}
```

## 8. 面试高频题

### Q1: 什么是泛型？有什么作用？
- 泛型是可以在使用时指定类型的类型参数
- 作用：提高代码复用性、类型安全
- 适用于函数、接口、类

### Q2: TypeScript 中的 unknown 和 any 有什么区别？
- **any**：绕过类型检查，可以访问任何属性
- **unknown**：类型安全的 any，使用前必须进行类型检查

### Q3: interface 和 type 的区别？
- **interface**：可以声明合并，支持继承
- **type**：可以使用联合类型、交叉类型、映射类型
- 一般建议使用 interface，需要高级特性时使用 type

### Q4: 什么是装饰器？
- 修饰类、方法、属性、参数的函数
- 使用 @ 符号
- 可用于元编程、AOP

### Q5: 如何实现条件类型？
```typescript
type TypeName<T> = 
  T extends string ? 'string' :
  T extends number ? 'number' :
  never;
```

### Q6: Partial 和 Required 的区别？
- **Partial**：将所有属性变为可选
- **Required**：将所有属性变为必选

### Q7: readonly 和 const 的区别？
- **readonly**：用于属性，运行时检查
- **const**：用于变量，编译时检查

## 9. 最佳实践

### 9.1 代码规范
- 优先使用 interface 而不是 type
- 使用严格的类型检查
- 避免使用 any
- 使用泛型提高复用性
- 合理使用类型推断

### 9.2 项目配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

## 10. 总结

TypeScript 进阶特性需要重点掌握：
- 泛型的各种用法和约束
- 装饰器的使用
- 类的高级特性
- 类型推断和断言
- 高级类型（联合、交叉、映射等）
- 类型守卫和可辨识联合

推荐资源：
- TypeScript 官方文档：https://www.typescriptlang.org/docs/
- TypeScript 深入理解：https://jkchao.github.io/typescript-book-chinese/
