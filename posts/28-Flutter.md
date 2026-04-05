# Flutter 跨平台开发

## 目录

---

## 一、Flutter 简介

Flutter 是 Google 开源的 UI 框架，使用 Dart 语言，通过自研的 Skia/Impeller 渲染引擎绘制 UI，实现真正意义上的跨平台一致性体验。

### 核心优势

| 特性 | 说明 |
|---|---|
| 高性能 | 自渲染引擎，不依赖原生控件，60/120fps 流畅体验 |
| 跨平台 | iOS、Android、Web、Desktop（Windows/macOS/Linux） |
| 热重载 | 毫秒级热重载，开发效率极高 |
| 丰富 Widget | Material Design 和 Cupertino 组件库开箱即用 |
| 强类型 | Dart 强类型语言，IDE 提示完善 |

### Flutter vs React Native vs uni-app

| 维度 | Flutter | React Native | uni-app |
|---|---|---|---|
| 渲染方式 | 自渲染（Skia） | 原生控件 | WebView + 原生 |
| 语言 | Dart | JavaScript/TypeScript | Vue.js |
| 性能 | ★★★★★ | ★★★★ | ★★★ |
| UI 一致性 | ★★★★★ | ★★★ | ★★★ |
| 学习成本 | ★★★ | ★★★★ | ★★★★★ |
| 生态 | ★★★★ | ★★★★★ | ★★★★★ |

---

## 二、环境搭建

### 安装 Flutter SDK

```bash
# macOS（使用 homebrew）
brew install flutter

# 验证安装
flutter doctor

# 常见问题修复
flutter doctor --android-licenses  # 接受 Android 协议
```

### 创建项目

```bash
flutter create my_app
cd my_app
flutter run              # 运行（连接设备或模拟器）
flutter run -d chrome    # 运行到 Web
flutter run -d macos     # 运行到 macOS Desktop
```

### 项目结构

```
├── lib/                    # Dart 代码（核心）
│   ├── main.dart           # 入口文件
│   ├── pages/              # 页面
│   ├── widgets/            # 自定义组件
│   ├── models/             # 数据模型
│   ├── services/           # API 服务
│   └── utils/              # 工具函数
├── assets/                 # 静态资源
├── android/                # Android 原生代码
├── ios/                    # iOS 原生代码
├── web/                    # Web 相关
├── pubspec.yaml            # 依赖配置（类似 package.json）
└── test/                   # 测试
```

---

## 三、Dart 语言基础

### 变量与类型

```dart
// 类型推断
var name = 'Flutter';          // String
var age = 3;                   // int
var version = 3.16;            // double
var isReady = true;            // bool

// 显式声明
String title = 'Hello';
int count = 0;
List<String> tags = ['a', 'b'];
Map<String, dynamic> data = {'key': 'value'};

// 可空类型（Null Safety）
String? nullableName;          // 可以为 null
String nonNull = 'required';   // 不能为 null

// final 和 const
final datetime = DateTime.now();  // 运行时常量
const pi = 3.14159;               // 编译时常量
```

### 函数

```dart
// 普通函数
int add(int a, int b) => a + b;

// 命名参数
void greet({required String name, int age = 0}) {
  print('Hello $name, age $age');
}
greet(name: 'Tom', age: 25);

// 异步函数
Future<String> fetchData() async {
  final response = await http.get(Uri.parse('https://api.example.com'));
  return response.body;
}
```

### 类与继承

```dart
class Animal {
  final String name;
  Animal(this.name);  // 简化构造函数

  void speak() => print('...');
}

class Dog extends Animal {
  Dog(String name) : super(name);

  @override
  void speak() => print('$name says: Woof!');
}

// Mixin
mixin Swimmer {
  void swim() => print('Swimming...');
}

class Duck extends Animal with Swimmer {
  Duck() : super('Duck');
}
```

---

## 四、Widget 体系

Flutter 中万物皆 Widget，分为两类：

### StatelessWidget（无状态）

```dart
class MyButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const MyButton({
    super.key,
    required this.text,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

### StatefulWidget（有状态）

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count', style: const TextStyle(fontSize: 24)),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('+1'),
        ),
      ],
    );
  }
}
```

### 常用基础 Widget

```dart
// 文本
Text('Hello Flutter', style: TextStyle(fontSize: 18, color: Colors.blue))

// 图片
Image.network('https://example.com/image.png', width: 100, height: 100)
Image.asset('assets/logo.png')

// 图标
Icon(Icons.home, color: Colors.green, size: 30)

// 按钮
ElevatedButton(onPressed: () {}, child: Text('按钮'))
TextButton(onPressed: () {}, child: Text('文字按钮'))
IconButton(icon: Icon(Icons.add), onPressed: () {})

// 输入框
TextField(
  decoration: InputDecoration(
    hintText: '请输入',
    border: OutlineInputBorder(),
  ),
  onChanged: (val) => print(val),
)

// 列表
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(
    title: Text(items[index]),
    leading: Icon(Icons.star),
    onTap: () {},
  ),
)
```

---

## 五、布局系统

### 线性布局

```dart
// 横向排列
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Text('Left'),
    Text('Center'),
    Text('Right'),
  ],
)

// 纵向排列
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    Text('Top'),
    SizedBox(height: 16),  // 间距
    Text('Bottom'),
  ],
)
```

### 弹性布局

```dart
Row(
  children: [
    Expanded(flex: 2, child: Container(color: Colors.red)),
    Expanded(flex: 1, child: Container(color: Colors.blue)),
  ],
)
```

### Stack 层叠布局

```dart
Stack(
  alignment: Alignment.center,
  children: [
    Image.asset('assets/bg.png'),
    Positioned(
      bottom: 20,
      right: 20,
      child: FloatingActionButton(onPressed: () {}, child: Icon(Icons.add)),
    ),
    Text('覆盖文字', style: TextStyle(color: Colors.white)),
  ],
)
```

### 容器修饰

```dart
Container(
  width: 200,
  height: 100,
  margin: const EdgeInsets.all(16),
  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 4)),
    ],
    gradient: LinearGradient(colors: [Colors.blue, Colors.purple]),
  ),
  child: Text('容器'),
)
```

---

## 六、状态管理

### Provider（推荐入门）

```dart
// pubspec.yaml
// dependencies:
//   provider: ^6.1.0

// model
class CounterModel extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }
}

// 注入
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CounterModel(),
      child: const MyApp(),
    ),
  );
}

// 消费
class CounterView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final counter = context.watch<CounterModel>();
    return Column(
      children: [
        Text('${counter.count}'),
        ElevatedButton(
          onPressed: () => context.read<CounterModel>().increment(),
          child: Text('+1'),
        ),
      ],
    );
  }
}
```

### Riverpod（推荐进阶）

```dart
// dependencies: flutter_riverpod: ^2.4.0

final counterProvider = StateNotifierProvider<CounterNotifier, int>((ref) {
  return CounterNotifier();
});

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state++;
}

// 使用
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  }
}
```

---

## 七、路由与导航

### 命名路由

```dart
MaterialApp(
  routes: {
    '/': (context) => const HomePage(),
    '/detail': (context) => const DetailPage(),
    '/login': (context) => const LoginPage(),
  },
  initialRoute: '/',
)

// 导航
Navigator.pushNamed(context, '/detail', arguments: {'id': 123});

// 接收参数
final args = ModalRoute.of(context)!.settings.arguments as Map;
print(args['id']);

// 返回
Navigator.pop(context, 'result');
```

### go_router（推荐）

```dart
// dependencies: go_router: ^13.0.0

final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (ctx, state) => const HomePage()),
    GoRoute(
      path: '/detail/:id',
      builder: (ctx, state) => DetailPage(id: state.pathParameters['id']!),
    ),
  ],
)

// 导航
context.go('/detail/123');
context.push('/detail/123');
context.pop();
```

---

## 八、网络请求与数据持久化

### HTTP 请求

```dart
// dependencies: http: ^1.1.0

import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const baseUrl = 'https://api.example.com';

  static Future<Map<String, dynamic>> get(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Request failed: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> post(String path, Map body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(body),
    );
    return json.decode(response.body);
  }
}
```

### 本地存储

```dart
// shared_preferences - KV 存储
final prefs = await SharedPreferences.getInstance();
await prefs.setString('token', 'xxx');
final token = prefs.getString('token');
await prefs.remove('token');

// sqflite - SQLite 数据库
final db = await openDatabase(
  'my_db.db',
  version: 1,
  onCreate: (db, version) {
    return db.execute(
      'CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT)',
    );
  },
);
await db.insert('users', {'name': 'Tom'});
final users = await db.query('users');
```

---

## 九、原生交互

### Platform Channel

```dart
// Dart 侧
static const platform = MethodChannel('com.example.app/battery');

Future<int> getBatteryLevel() async {
  try {
    final int result = await platform.invokeMethod('getBatteryLevel');
    return result;
  } on PlatformException catch (e) {
    print('Failed: ${e.message}');
    return -1;
  }
}

// Android 侧（Kotlin）
// MainActivity.kt
MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/battery")
  .setMethodCallHandler { call, result ->
    if (call.method == "getBatteryLevel") {
      result.success(getBatteryLevel())
    } else {
      result.notImplemented()
    }
  }
```

---

## 十、性能优化

### 1. 减少不必要的 rebuild

```dart
// 使用 const 构造函数
const Text('Static Text')
const Icon(Icons.home)

// 拆分 Widget，缩小 setState 影响范围
// 使用 RepaintBoundary 隔离绘制边界
RepaintBoundary(child: HeavyAnimationWidget())
```

### 2. 列表优化

```dart
// 使用 ListView.builder 懒加载
ListView.builder(
  itemCount: 1000,
  itemBuilder: (ctx, i) => ItemWidget(items[i]),
)

// 固定高度时使用 itemExtent
ListView.builder(
  itemExtent: 60,
  itemBuilder: (ctx, i) => ItemWidget(items[i]),
)
```

### 3. 图片优化

```dart
// 指定尺寸，避免全量加载
Image.network(
  url,
  width: 100,
  height: 100,
  cacheWidth: 200,  // 缓存分辨率
)

// 使用 cached_network_image
CachedNetworkImage(
  imageUrl: url,
  placeholder: (ctx, url) => CircularProgressIndicator(),
  errorWidget: (ctx, url, err) => Icon(Icons.error),
)
```

---

## 十一、打包与发布

### Android 打包

```bash
# 生成签名
keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key

# 打包 APK
flutter build apk --release

# 打包 AAB（Google Play 推荐）
flutter build appbundle --release
```

### iOS 打包

```bash
# 需要 macOS + Xcode
flutter build ipa --release
# 通过 Xcode 上传到 App Store Connect
```

### Web 打包

```bash
flutter build web --release
# dist 在 build/web 目录
```

---

## 十二、常见问题

**Q1：Flutter 性能真的比 React Native 好吗？**

是的，Flutter 的自渲染引擎避免了 JS Bridge 通信开销，动画帧率更稳定。但对于静态页面差异不大，对于复杂动画和列表滚动差异明显。

**Q2：Flutter Web 能上生产环境吗？**

可以，但 SEO 支持差，首屏加载较慢（需要加载 Skia 引擎）。适合内部工具、WebApp，不适合公开网站。

**Q3：Dart 语言难学吗？**

有 JavaScript/Java 基础的话，1~2 周可掌握基础。Dart 语法简洁，类型系统严格，长期写起来反而更省心。

**Q4：Flutter 和原生 SwiftUI/Jetpack Compose 如何选择？**

- 需要跨平台：选 Flutter
- 只做 iOS 且追求最佳原生体验：选 SwiftUI
- 只做 Android 且追求最佳原生体验：选 Jetpack Compose

**Q5：pub.dev 找不到合适插件怎么办？**

1. 自写 Platform Channel 调用原生
2. 使用 FFI 调用 C/C++ 库
3. 使用 Dart 的 js 包在 Web 端调用 JS
