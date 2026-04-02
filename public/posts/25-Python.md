# Python 核心知识

## 目录

---

## 一、Python 基础语法

### 1. 变量与类型

Python 是动态类型语言，无需声明类型：

```python
name = "Alice"       # str
age = 25             # int
height = 1.75        # float
is_active = True     # bool
data = None          # NoneType
```

### 2. 字符串操作

```python
s = "Hello, Python"

# 切片
print(s[0:5])       # Hello
print(s[-6:])       # Python

# 格式化（推荐 f-string）
name = "World"
print(f"Hello, {name}!")       # Hello, World!
print(f"{3.14159:.2f}")        # 3.14

# 常用方法
print(s.upper())               # HELLO, PYTHON
print(s.lower())               # hello, python
print(s.replace("Python", "World"))  # Hello, World
print(s.split(", "))           # ['Hello', 'Python']
print("  hello  ".strip())     # hello
```

### 3. 条件与循环

```python
# 条件
x = 10
if x > 0:
    print("正数")
elif x == 0:
    print("零")
else:
    print("负数")

# 三元表达式
result = "偶数" if x % 2 == 0 else "奇数"

# for 循环
for i in range(5):
    print(i)  # 0 1 2 3 4

# while 循环
count = 0
while count < 3:
    print(count)
    count += 1

# 列表推导式（重要！）
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

---

## 二、数据类型与数据结构

### 1. 列表 list

```python
# 创建
lst = [1, 2, 3, 4, 5]

# 常用操作
lst.append(6)           # 末尾追加 → [1,2,3,4,5,6]
lst.insert(0, 0)        # 指定位置插入
lst.remove(3)           # 删除第一个匹配值
lst.pop()               # 弹出最后一个
lst.pop(0)              # 弹出指定索引

lst.sort()              # 原地排序
lst.sort(reverse=True)  # 降序
sorted_lst = sorted(lst)  # 返回新列表

print(lst[::-1])        # 反转
print(len(lst))         # 长度
print(3 in lst)         # 成员检测
```

### 2. 元组 tuple

```python
# 不可变序列，常用于函数返回多值
point = (10, 20)
x, y = point  # 解包

# 单元素元组
single = (1,)  # 注意逗号

# 命名元组
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)
```

### 3. 字典 dict

```python
# 创建
person = {"name": "Alice", "age": 25, "city": "Beijing"}

# 访问
print(person["name"])           # Alice
print(person.get("phone", "N/A"))  # 安全获取，默认值 N/A

# 修改
person["age"] = 26
person.update({"email": "alice@example.com"})

# 遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# 字典推导式
squares = {x: x**2 for x in range(5)}

# 常用方法
print(person.keys())
print(person.values())
person.pop("city")         # 删除键值对
```

### 4. 集合 set

```python
# 无序、不重复
s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}

# 集合运算
print(s1 | s2)   # 并集 {1,2,3,4,5,6}
print(s1 & s2)   # 交集 {3,4}
print(s1 - s2)   # 差集 {1,2}
print(s1 ^ s2)   # 对称差集 {1,2,5,6}

# 去重
lst = [1, 2, 2, 3, 3, 4]
unique = list(set(lst))  # [1, 2, 3, 4]
```

---

## 三、函数与模块

### 1. 函数定义

```python
# 基本函数
def greet(name, greeting="Hello"):
    """函数文档字符串"""
    return f"{greeting}, {name}!"

print(greet("Alice"))            # Hello, Alice!
print(greet("Bob", "Hi"))        # Hi, Bob!

# 可变参数
def sum_all(*args):
    return sum(args)

def config(**kwargs):
    for key, value in kwargs.items():
        print(f"{key} = {value}")

config(host="localhost", port=5000, debug=True)
```

### 2. Lambda 函数

```python
# 匿名函数
square = lambda x: x ** 2
add = lambda x, y: x + y

# 常与 map/filter/sorted 搭配
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

students = [{"name": "Bob", "score": 85}, {"name": "Alice", "score": 92}]
sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
```

### 3. 模块与包

```python
# 导入模块
import os
import sys
from pathlib import Path
from collections import defaultdict, Counter

# 自定义模块 utils.py
# utils.py
def add(a, b):
    return a + b

# main.py
from utils import add
# 或
import utils
utils.add(1, 2)

# __all__ 控制导出
__all__ = ['add', 'subtract']
```

---

## 四、面向对象编程

### 1. 类的定义

```python
class Animal:
    # 类属性
    kingdom = "动物界"

    def __init__(self, name, age):
        # 实例属性
        self.name = name
        self.age = age
        self._score = 0   # 约定私有（单下划线）
        self.__secret = "hidden"  # 名称修饰（双下划线）

    def speak(self):
        return f"{self.name} 发出声音"

    def __str__(self):
        return f"Animal({self.name}, {self.age})"

    def __repr__(self):
        return f"Animal(name={self.name!r}, age={self.age!r})"

    @classmethod
    def create(cls, name):
        """类方法，常用作工厂方法"""
        return cls(name, 0)

    @staticmethod
    def validate_age(age):
        """静态方法，与类无关联"""
        return age >= 0
```

### 2. 继承

```python
class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)
        self.breed = breed

    def speak(self):  # 方法重写
        return f"{self.name}: 汪汪！"

    def fetch(self, item):
        return f"{self.name} 捡回了 {item}"

dog = Dog("旺财", 3, "拉布拉多")
print(dog.speak())    # 旺财: 汪汪！
print(isinstance(dog, Animal))  # True
```

### 3. 魔术方法（Dunder Methods）

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __len__(self):
        return 2

    def __getitem__(self, index):
        return (self.x, self.y)[index]

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2)   # Vector(4, 6)
print(v1 * 3)    # Vector(3, 6)
```

### 4. 数据类（dataclass）

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class Student:
    name: str
    age: int
    grades: List[float] = field(default_factory=list)

    def average(self):
        return sum(self.grades) / len(self.grades) if self.grades else 0

s = Student("Alice", 20, [85.0, 92.0, 78.0])
print(s)          # Student(name='Alice', age=20, grades=[85.0, 92.0, 78.0])
print(s.average())  # 85.0
```

---

## 五、文件与异常处理

### 1. 文件操作

```python
# 写文件
with open("data.txt", "w", encoding="utf-8") as f:
    f.write("Hello, Python!\n")
    f.writelines(["Line 1\n", "Line 2\n"])

# 读文件
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()       # 读取全部
    # lines = f.readlines()  # 读取所有行（列表）
    # for line in f:         # 逐行读取（内存友好）

# JSON 操作
import json

data = {"name": "Alice", "scores": [85, 92, 78]}
with open("data.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", "r") as f:
    loaded = json.load(f)
```

### 2. 异常处理

```python
# 基本 try-except
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"除零错误: {e}")
except (TypeError, ValueError) as e:
    print(f"类型或值错误: {e}")
except Exception as e:
    print(f"未知错误: {e}")
else:
    print("执行成功")     # 无异常时执行
finally:
    print("总是执行")     # 无论如何都执行

# 自定义异常
class ValidationError(Exception):
    def __init__(self, field, message):
        super().__init__(message)
        self.field = field

def validate_age(age):
    if not isinstance(age, int):
        raise ValidationError("age", "年龄必须是整数")
    if age < 0 or age > 150:
        raise ValidationError("age", "年龄超出合理范围")
    return True
```

---

## 六、迭代器与生成器

### 1. 迭代器协议

```python
# 实现迭代器
class CountDown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in CountDown(5):
    print(n)  # 5 4 3 2 1
```

### 2. 生成器

```python
# 生成器函数（yield）
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# 生成器表达式（内存高效）
gen = (x**2 for x in range(1000000))
print(next(gen))   # 0
print(next(gen))   # 1

# 实际应用：处理大文件
def read_large_file(filepath):
    with open(filepath) as f:
        for line in f:
            yield line.strip()

for line in read_large_file("big_data.txt"):
    process(line)  # 按需处理，不占用大量内存
```

---

## 七、装饰器

### 1. 函数装饰器

```python
import functools
import time

# 基本装饰器
def timer(func):
    @functools.wraps(func)  # 保留原函数元数据
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 耗时 {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"

slow_function()  # slow_function 耗时 1.0001s
```

### 2. 带参数的装饰器

```python
def retry(times=3, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == times - 1:
                        raise
                    print(f"第 {attempt + 1} 次重试...")
        return wrapper
    return decorator

@retry(times=3, exceptions=(ConnectionError,))
def fetch_data(url):
    # 模拟网络请求
    ...
```

### 3. 类装饰器

```python
# 缓存装饰器（lru_cache）
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # 354224848179261915075
```

---

## 八、并发编程

### 1. 多线程（I/O 密集型）

```python
import threading
import time

def download(url, results, index):
    time.sleep(1)  # 模拟下载
    results[index] = f"Downloaded {url}"

urls = ["url1", "url2", "url3"]
results = [None] * len(urls)
threads = []

for i, url in enumerate(urls):
    t = threading.Thread(target=download, args=(url, results, i))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(results)
```

### 2. 多进程（CPU 密集型）

```python
from multiprocessing import Pool

def cpu_task(n):
    return sum(i * i for i in range(n))

with Pool(processes=4) as pool:
    results = pool.map(cpu_task, [1000000, 2000000, 3000000, 4000000])
print(results)
```

### 3. 异步编程（asyncio）

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/1",
    ]
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
    return results

# asyncio.run(main())  # Python 3.7+
```

---

## 九、常用标准库

### 1. os 与 pathlib

```python
import os
from pathlib import Path

# os 模块
os.getcwd()                    # 当前目录
os.listdir(".")                # 列出目录内容
os.makedirs("a/b/c", exist_ok=True)  # 创建多级目录
os.environ.get("HOME")         # 环境变量

# pathlib（推荐，面向对象风格）
p = Path("./data")
p.mkdir(parents=True, exist_ok=True)

config = Path.home() / ".config" / "app" / "settings.json"
if config.exists():
    content = config.read_text(encoding="utf-8")

for f in Path(".").glob("**/*.py"):
    print(f)
```

### 2. collections

```python
from collections import Counter, defaultdict, OrderedDict, deque

# Counter：计数器
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)
print(counter.most_common(2))  # [('apple', 3), ('banana', 2)]

# defaultdict：带默认值的字典
graph = defaultdict(list)
graph["A"].append("B")
graph["A"].append("C")

# deque：双端队列（高效的左端操作）
dq = deque([1, 2, 3])
dq.appendleft(0)   # 左端追加
dq.popleft()       # 左端弹出
```

### 3. itertools

```python
import itertools

# 排列组合
perms = list(itertools.permutations([1, 2, 3], 2))  # 排列
combs = list(itertools.combinations([1, 2, 3, 4], 2))  # 组合

# 链接迭代器
chain = list(itertools.chain([1, 2], [3, 4], [5, 6]))  # [1,2,3,4,5,6]

# 分组
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
```

---

## 十、高频知识点汇总

1. **Python 中 `==` 和 `is` 的区别？**
   - `==` 比较值是否相等
   - `is` 比较是否是同一对象（内存地址）
   - 小整数（-5~256）和短字符串会被缓存，`is` 可能为 True

2. **深拷贝和浅拷贝的区别？**
   ```python
   import copy
   lst = [[1, 2], [3, 4]]
   shallow = lst.copy()       # 浅拷贝，内层对象共享
   deep = copy.deepcopy(lst)  # 深拷贝，完全独立
   ```

3. **GIL 是什么？**
   - Global Interpreter Lock，全局解释器锁
   - 同一时刻只有一个线程执行 Python 字节码
   - I/O 密集型用多线程，CPU 密集型用多进程

4. **`__init__` 和 `__new__` 的区别？**
   - `__new__` 创建实例（分配内存），返回实例对象
   - `__init__` 初始化实例，接收 `__new__` 返回的对象

5. **列表、元组、字典、集合的区别？**

   | 类型 | 有序 | 可变 | 可重复 | 用途 |
   |------|------|------|--------|------|
   | list | ✅ | ✅ | ✅ | 通用序列 |
   | tuple | ✅ | ❌ | ✅ | 不可变序列、多返回值 |
   | dict | ✅(3.7+) | ✅ | key唯一 | 键值映射 |
   | set | ❌ | ✅ | ❌ | 去重、集合运算 |

6. **生成器 vs 列表推导式？**
   - 列表推导式 `[...]` 一次性生成所有元素，占内存
   - 生成器表达式 `(...)` 按需生成，节省内存

7. **`*args` 和 `**kwargs` 的区别？**
   - `*args`：接收任意数量的位置参数（元组）
   - `**kwargs`：接收任意数量的关键字参数（字典）

8. **Python 中如何实现单例模式？**
   ```python
   class Singleton:
       _instance = None

       def __new__(cls, *args, **kwargs):
           if not cls._instance:
               cls._instance = super().__new__(cls)
           return cls._instance
   ```

9. **`@property` 的作用？**
   ```python
   class Circle:
       def __init__(self, radius):
           self._radius = radius

       @property
       def radius(self):
           return self._radius

       @radius.setter
       def radius(self, value):
           if value < 0:
               raise ValueError("半径不能为负")
           self._radius = value
   ```

10. **Python 的垃圾回收机制？**
    - 引用计数（主要）：对象引用数为 0 时释放
    - 循环垃圾收集器：处理循环引用
    - `gc` 模块可手动控制
