# TensorFlow.js 介绍与使用

## 一、TensorFlow.js 简介

### 1. 什么是 TensorFlow.js？

**TensorFlow.js** 是 Google 开源的 JavaScript 机器学习库，可以在浏览器和 Node.js 中运行。

#### 特点
- **浏览器运行**：直接在浏览器中训练和运行模型
- **Node.js 运行**：在服务端运行 TensorFlow.js
- **导入预训练模型**：支持导入 Python TensorFlow 训练的模型
- **高性能**：支持 WebGL 加速，GPU 加速

---

### 2. 安装

#### 浏览器
```html
<!-- 方式 1：通过 CDN 引入 -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js"></script>

<script>
  // 使用 TensorFlow.js
  const tensor = tf.tensor([1, 2, 3])
  tensor.print()
</script>

<!-- 解释：通过 CDN 引入 TensorFlow.js，简单快捷 -->
```

**解释**：通过 CDN 引入是最简单的方式，适合快速实验。

---

#### Node.js
```bash
# 安装 TensorFlow.js
npm install @tensorflow/tfjs-node

# 或安装 CPU 版本（体积更小）
npm install @tensorflow/tfjs-node-cpu

# 或安装 GPU 版本（需要 CUDA）
npm install @tensorflow/tfjs-node-gpu

# 解释：Node.js 版本支持 CPU 和 GPU 加速
```

**解释**：
- `tfjs-node`：默认版本，根据系统自动选择 CPU 或 GPU
- `tfjs-node-cpu`：纯 CPU 版本，体积更小
- `tfjs-node-gpu`：GPU 版本，需要 CUDA，速度更快

---

#### npm 包（浏览器构建工具）
```bash
# 使用 npm 安装（适用于 Webpack、Rollup 等构建工具）
npm install @tensorflow/tfjs

# 在代码中导入
import * as tf from '@tensorflow/tfjs'

# 解释：适用于现代前端项目，配合 Webpack、Vite 等构建工具
```

**解释**：适用于现代前端项目，配合 Webpack、Vite 等构建工具。

---

## 二、TensorFlow.js 基础

### 1. 张量（Tensor）

#### 创建张量
```javascript
// ✅ 正确：创建 1D 张量
const tensor1D = tf.tensor([1, 2, 3])
tensor1D.print()  // Tensor [1, 2, 3]

// ✅ 正确：创建 2D 张量（矩阵）
const tensor2D = tf.tensor([[1, 2], [3, 4]])
tensor2D.print()  // Tensor [[1, 2], [3, 4]]

// ✅ 正确：创建 3D 张量
const tensor3D = tf.tensor([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
tensor3D.print()

// 解释：张量是 TensorFlow.js 的基本数据结构，类似 NumPy 数组
```

**解释**：张量（Tensor）是 TensorFlow.js 的基本数据结构，类似 NumPy 数组，可以是 1D、2D、3D 等。

---

#### 快速创建张量
```javascript
// ✅ 正确：创建全零张量
const zeros = tf.zeros([3, 3])
zeros.print()  // Tensor [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

// ✅ 正确：创建全一张量
const ones = tf.ones([2, 3])
ones.print()  // Tensor [[1, 1, 1], [1, 1, 1]]

// ✅ 正确：创建随机张量
const random = tf.randomNormal([3, 3])  // 正态分布
random.print()

const randomUniform = tf.randomUniform([3, 3], 0, 1)  // 均匀分布（0-1）
randomUniform.print()

// ✅ 正确：创建序列张量
const range = tf.range(1, 10)  // [1, 2, ..., 9]
range.print()

// 解释：快速创建常用张量，提高开发效率
```

**解释**：快速创建全零、全一、随机张量，提高开发效率。

---

#### 张量操作
```javascript
// ✅ 正确：张量加法
const a = tf.tensor([1, 2, 3])
const b = tf.tensor([4, 5, 6])
const sum = a.add(b)
sum.print()  // [5, 7, 9]

// ✅ 正确：张量减法
const diff = a.sub(b)
diff.print()  // [-3, -3, -3]

// ✅ 正确：张量乘法（逐元素）
const product = a.mul(b)
product.print()  // [4, 10, 18]

// ✅ 正确：矩阵乘法
const matrixA = tf.tensor2d([[1, 2], [3, 4]])
const matrixB = tf.tensor2d([[5, 6], [7, 8]])
const matmul = matrixA.matMul(matrixB)
matmul.print()  // [[19, 22], [43, 50]]

// ✅ 正确：张量转置
const transpose = matrixA.transpose()
transpose.print()  // [[1, 3], [2, 4]]

// ✅ 正确：张量重塑形状
const reshaped = a.reshape([3, 1])
reshaped.print()  // [[1], [2], [3]]

// 解释：张量支持加减乘除、矩阵乘法、转置、重塑形状等操作
```

**解释**：张量支持加减乘除、矩阵乘法、转置、重塑形状等操作。

---

### 2. 变量（Variable）

#### 创建变量
```javascript
// ✅ 正确：创建变量
const variable = tf.variable(tf.tensor([1, 2, 3]))
variable.print()  // Tensor [1, 2, 3]

// ✅ 正确：修改变量值
variable.assign(tf.tensor([4, 5, 6]))
variable.print()  // Tensor [4, 5, 6]

// ✅ 正确：变量加法
const newValue = variable.add(tf.tensor([1, 1, 1]))
variable.assign(newValue)
variable.print()  // Tensor [5, 6, 7]

// 解释：变量是可变的张量，用于模型训练时更新参数
```

**解释**：变量（Variable）是可变的张量，用于模型训练时更新参数。

---

### 3. 内存管理

#### 自动清理内存
```javascript
// ❌ 错误：不清理内存，可能导致内存泄漏
for (let i = 0; i < 1000; i++) {
  const tensor = tf.tensor([1, 2, 3])
  // 内存泄漏！
}

// ✅ 正确：使用 tidy 自动清理内存
for (let i = 0; i < 1000; i++) {
  tf.tidy(() => {
    const tensor = tf.tensor([1, 2, 3])
    // 自动清理内存
  })
}

// ✅ 正确：手动清理内存
const tensor = tf.tensor([1, 2, 3])
tensor.dispose()  // 手动清理

// 解释：TensorFlow.js 使用 WebGL 内存，需要手动清理，否则可能导致内存泄漏
```

**解释**：
- TensorFlow.js 使用 WebGL 内存，需要手动清理
- `tf.tidy()` 自动清理内部张量
- `tensor.dispose()` 手动清理单个张量

---

## 三、构建和训练模型

### 1. 顺序模型（Sequential Model）

#### 创建模型
```javascript
// ✅ 正确：创建顺序模型
const model = tf.sequential()

// ✅ 正确：添加层
model.add(tf.layers.dense({
  units: 10,  // 输出维度
  inputShape: [5],  // 输入形状
  activation: 'relu'  // 激活函数
}))

model.add(tf.layers.dense({
  units: 1,
  activation: 'sigmoid'  // 输出层使用 sigmoid（二分类）
}))

// 解释：顺序模型是最简单的模型，层按顺序连接
```

**解释**：顺序模型（Sequential Model）是最简单的模型，层按顺序连接。

---

#### 编译模型
```javascript
// ✅ 正确：编译模型
model.compile({
  optimizer: 'adam',  // 优化器
  loss: 'binaryCrossentropy',  // 损失函数（二分类）
  metrics: ['accuracy']  // 评估指标
})

// 解释：编译模型时指定优化器、损失函数和评估指标
```

**解释**：编译模型时指定优化器、损失函数和评估指标。

---

### 2. 训练模型

#### 准备数据
```javascript
// ✅ 正确：准备训练数据
const inputs = tf.tensor2d([
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
])

const outputs = tf.tensor2d([
  [0],
  [1],
  [1],
  [0]
])

// 解释：XOR 问题，使用神经网络解决
```

**解释**：XOR 问题，无法用线性模型解决，需要神经网络。

---

#### 训练模型
```javascript
// ✅ 正确：训练模型
async function trainModel() {
  await model.fit(inputs, outputs, {
    epochs: 1000,  // 训练轮数
    batchSize: 4,  // 批量大小
    validationSplit: 0.2,  // 验证集比例
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`)
      }
    }
  })
}

trainModel()

// 解释：fit 方法训练模型，指定轮数、批量大小、验证集比例和回调函数
```

**解释**：`fit` 方法训练模型，指定轮数、批量大小、验证集比例和回调函数。

---

### 3. 评估和预测

#### 评估模型
```javascript
// ✅ 正确：评估模型
const evaluation = model.evaluate(inputs, outputs)
evaluation[0].print()  // 损失
evaluation[1].print()  // 准确率

// 解释：evaluate 方法评估模型性能，返回损失和准确率
```

**解释**：`evaluate` 方法评估模型性能，返回损失和准确率。

---

#### 预测
```javascript
// ✅ 正确：预测
const prediction = model.predict(tf.tensor2d([[1, 0]]))
prediction.print()  // 接近 1

// 解释：predict 方法对新数据进行预测
```

**解释**：`predict` 方法对新数据进行预测。

---

## 四、图像识别

### 1. 使用预训练模型

#### 加载 MobileNet
```javascript
// ✅ 正确：加载 MobileNet 模型
async function loadModel() {
  const model = await mobilenet.load()

  // ✅ 正确：预测图像
  const img = document.getElementById('image')
  const predictions = await model.classify(img)

  console.log('预测结果:', predictions)
  // [
  //   { className: 'Egyptian cat', probability: 0.8380281329 },
  //   { className: 'tabby, tabby cat', probability: 0.0464155518 }
  // ]
}

loadModel()

// 解释：MobileNet 是轻量级图像分类模型，适合移动端和浏览器
```

**解释**：MobileNet 是轻量级图像分类模型，适合移动端和浏览器。

---

#### 完整示例
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js"></script>
</head>
<body>
  <input type="file" id="imageInput" accept="image/*">
  <img id="image" />
  <div id="prediction"></div>

  <script>
    const imageInput = document.getElementById('imageInput')
    const image = document.getElementById('image')
    const prediction = document.getElementById('prediction')

    imageInput.addEventListener('change', async (event) => {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = async (e) => {
        image.src = e.target.result

        // 加载模型
        const model = await mobilenet.load()

        // 预测图像
        const predictions = await model.classify(image)

        // 显示结果
        prediction.innerHTML = predictions.map(p => `
          <div>${p.className}: ${(p.probability * 100).toFixed(2)}%</div>
        `).join('')
      }
      reader.readAsDataURL(file)
    })
  </script>
</body>
</html>

<!-- 解释：完整的图像识别示例，支持上传图像并分类 -->
```

**解释**：完整的图像识别示例，支持上传图像并分类。

---

## 五、文本分类

### 1. 使用预训练模型

#### 加载 Universal Sentence Encoder
```javascript
// ✅ 正确：加载 Universal Sentence Encoder 模型
async function loadModel() {
  const model = await use.load()

  // ✅ 正确：编码句子
  const sentences = [
    'I love programming',
    'JavaScript is awesome'
  ]

  const embeddings = await model.embed(sentences)
  embeddings.print()  // 输出句子向量

  // ✅ 正确：计算句子相似度
  const similarity = tf.metrics.cosineProximity(
    embeddings.slice([0, 0], [1, -1]),
    embeddings.slice([1, 0], [1, -1])
  )
  similarity.print()  // 输出相似度
}

loadModel()

// 解释：Universal Sentence Encoder 将句子编码为向量，用于计算相似度
```

**解释**：Universal Sentence Encoder 将句子编码为向量，用于计算相似度。

---

## 六、实时目标检测

### 1. 使用 COCO-SSD 模型

#### 加载模型
```javascript
// ✅ 正确：加载 COCO-SSD 模型
async function loadModel() {
  const model = await cocoSsd.load()

  // ✅ 正确：检测图像中的物体
  const img = document.getElementById('image')
  const predictions = await model.detect(img)

  console.log('检测结果:', predictions)
  // [
  //   { bbox: [x, y, width, height], class: 'person', score: 0.8 },
  //   { bbox: [x, y, width, height], class: 'dog', score: 0.7 }
  // ]
}

loadModel()

// 解释：COCO-SSD 可以检测 80 种物体
```

**解释**：COCO-SSD 可以检测 80 种物体（人、车、动物等）。

---

#### 完整示例
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js"></script>
  <style>
    #canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
</head>
<body>
  <video id="video" width="640" height="480" autoplay></video>
  <canvas id="canvas"></canvas>

  <script>
    const video = document.getElementById('video')
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')

    // 打开摄像头
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream
      })

    // 加载模型
    cocoSsd.load().then(model => {
      // 实时检测
      async function detect() {
        const predictions = await model.detect(video)

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制检测框
        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox

          ctx.strokeStyle = 'red'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, width, height)

          ctx.fillStyle = 'red'
          ctx.font = '18px Arial'
          ctx.fillText(`${prediction.class} ${(prediction.score * 100).toFixed(0)}%`, x, y - 5)
        })

        requestAnimationFrame(detect)
      }

      detect()
    })
  </script>
</body>
</html>

<!-- 解释：实时目标检测，支持摄像头输入 -->
```

**解释**：实时目标检测，支持摄像头输入。

---

## 七、模型转换

### 1. 从 TensorFlow Python 导入

#### 保存 Python 模型
```python
# Python 代码
import tensorflow as tf

# 创建模型
model = tf.keras.Sequential([
  tf.keras.layers.Dense(10, input_shape=[5], activation='relu'),
  tf.keras.layers.Dense(1, activation='sigmoid')
])

# 编译模型
model.compile(optimizer='adam', loss='binaryCrossentropy', metrics=['accuracy'])

# 保存为 TensorFlow.js 格式
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'model')

# 解释：将 Python TensorFlow 模型转换为 TensorFlow.js 格式
```

**解释**：将 Python TensorFlow 模型转换为 TensorFlow.js 格式。

---

#### 在 JavaScript 中加载
```javascript
// ✅ 正确：加载转换后的模型
async function loadModel() {
  const model = await tf.loadLayersModel('model/model.json')
  console.log('模型加载成功')
}

loadModel()

// 解释：加载转换后的模型，可以在浏览器和 Node.js 中使用
```

**解释**：加载转换后的模型，可以在浏览器和 Node.js 中使用。

---

## 八、最佳实践

### 1. 性能优化

#### 使用 WebGL 后端
```javascript
// ✅ 正确：使用 WebGL 后端（默认）
tf.setBackend('webgl')

// ✅ 或使用 WebGL2 后端（更快）
tf.setBackend('webgl2')

// ✅ 或使用 CPU 后端（兼容性更好）
tf.setBackend('cpu')

// 查看可用后端
console.log(tf.getBackend())

// 解释：WebGL 后端使用 GPU 加速，性能更好
```

**解释**：WebGL 后端使用 GPU 加速，性能更好。

---

#### 批量处理
```javascript
// ❌ 错误：逐个处理（慢）
for (let i = 0; i < 1000; i++) {
  const prediction = model.predict(tf.tensor2d([data[i]]))
}

// ✅ 正确：批量处理（快）
const batch = tf.tensor2d(data)  // 批量
const predictions = model.predict(batch)

// 解释：批量处理提高性能
```

**解释**：批量处理提高性能，充分利用 GPU 并行计算。

---

### 2. 模型压缩

#### 量化模型
```javascript
// ✅ 正确：量化模型（减少模型大小）
const quantizationBytes = 2  // 1 或 2
const quantizedModel = await tf.quantization.quantize(model, quantizationBytes)

// 保存量化后的模型
await quantizedModel.save('quantized-model')

// 解释：量化减少模型大小，提高推理速度
```

**解释**：量化减少模型大小 4 倍，提高推理速度。

---

## 九、常见问题

### 1. 什么是 TensorFlow.js？
Google 开源的 JavaScript 机器学习库，可以在浏览器和 Node.js 中运行。

### 2. TensorFlow.js 的优势？
- 浏览器中运行，无需服务器
- 支持 WebGL 加速
- 可以导入 Python 训练的模型

### 3. 什么是张量？
TensorFlow.js 的基本数据结构，类似 NumPy 数组，可以是 1D、2D、3D 等。

### 4. 什么是变量？
可变的张量，用于模型训练时更新参数。

### 5. 如何清理 TensorFlow.js 内存？
使用 `tf.tidy()` 或 `tensor.dispose()`。

### 6. 什么是顺序模型？
最简单的模型，层按顺序连接。

### 7. 如何训练模型？
使用 `model.fit()` 方法，指定轮数、批量大小、验证集比例等。

### 8. 如何评估模型？
使用 `model.evaluate()` 方法，返回损失和准确率。

### 9. 常用的预训练模型有哪些？
- MobileNet（图像分类）
- COCO-SSD（目标检测）
- Universal Sentence Encoder（文本编码）

### 10. 如何优化 TensorFlow.js 性能？
- 使用 WebGL 后端（GPU 加速）
- 批量处理数据
- 量化模型
