# Webpack 构建工具

## 目录

---

## 1. Webpack 基础概念

### 1.1 什么是 Webpack？
Webpack 是一个静态模块打包工具，它能够递归地分析项目中的依赖关系，然后将这些模块打包成一个或多个 bundle。

### 1.2 核心概念

#### Entry（入口）
指示 Webpack 从哪个文件开始构建依赖图
```javascript
module.exports = {
  entry: './src/index.js'
  // 或
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  }
};
```

#### Output（输出）
告诉 Webpack 在哪里输出 bundle，以及如何命名
```javascript
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/'
  }
};
```

#### Loader（加载器）
让 Webpack 能够处理非 JavaScript 文件
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
```

#### Plugin（插件）
用于执行范围更广的任务，从打包优化和压缩，到重新定义环境中的变量
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

#### Mode（模式）
提供 mode 配置选项，告知 Webpack 使用相应模式的内置优化
```javascript
module.exports = {
  mode: 'production' // 或 'development'
};
```

## 2. Webpack 配置详解

### 2.1 完整配置示例
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',

  entry: {
    app: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.js', '.json', '.vue'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [
      '...',
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },

  devServer: {
    hot: true,
    open: true,
    compress: true,
    port: 8080,
    historyApiFallback: true
  }
};
```

## 3. Loader详解

### 3.1 Babel Loader
```javascript
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-runtime'],
      cacheDirectory: true
    }
  }
}
```

### 3.2 CSS Loader
```javascript
{
  test: /\.css$/,
  use: [
    'style-loader', // 创建 style 标签
    'css-loader',   // 处理 @import 和 url()
    'postcss-loader' // 自动添加浏览器前缀
  ]
}

// 生产环境使用 MiniCssExtractPlugin
{
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'postcss-loader'
  ]
}
```

### 3.3 File Loader / URL Loader
```javascript
// Webpack 5 使用 Asset Modules
{
  test: /\.(png|jpg|jpeg|gif|svg)$/,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024 // 小于 8kb 转为 base64
    }
  },
  generator: {
    filename: 'images/[name].[hash:8][ext]'
  }
}
```

### 3.4 Vue Loader
```javascript
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
```

## 4. Plugin 详解

### 4.1 HtmlWebpackPlugin
```javascript
new HtmlWebpackPlugin({
  template: './public/index.html',
  filename: 'index.html',
  minify: {
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: true
  },
  chunks: ['app', 'vendors', 'runtime']
})
```

### 4.2 CleanWebpackPlugin
```javascript
new CleanWebpackPlugin({
  cleanOnceBeforeBuildPatterns: ['**/*', '!static/**']
})
```

### 4.3 MiniCssExtractPlugin
```javascript
new MiniCssExtractPlugin({
  filename: '[name].[contenthash:8].css',
  chunkFilename: '[id].[contenthash:8].css'
})
```

### 4.4 DefinePlugin
```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'BASE_URL': JSON.stringify('/')
})
```

### 4.5 HotModuleReplacementPlugin
```javascript
new webpack.HotModuleReplacementPlugin()
```

## 5. 性能优化

### 5.1 构建速度优化

#### 缓存 Loader
```javascript
{
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true
  }
}
```

#### 使用 DLLPlugin
```javascript
// webpack.dll.js
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    vendors: ['react', 'react-dom', 'vue', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(__dirname, 'dll/[name].manifest.json')
    })
  ]
};

// webpack.config.js
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendors.manifest.json')
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, 'dll/*.dll.js')
    })
  ]
};
```

#### 多进程构建
```javascript
const HappyPack = require('happypack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=babel'
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader']
    })
  ]
};
```

### 5.2 打包体积优化

#### 按需加载
```javascript
// 路由懒加载
const Home = () => import('./views/Home');
const About = () => import('./views/About');

const router = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];
```

#### Tree Shaking
```javascript
// production 模式自动开启 Tree Shaking
// 手动配置
optimization: {
  usedExports: true,
  sideEffects: false
}
```

#### 代码分割
```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    minSize: 30000,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      },
      commons: {
        name: 'commons',
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true
      }
    }
  }
}
```

#### 压缩代码
```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: true
    }),
    new CssMinimizerPlugin()
  ]
}
```

### 5.3 运行时优化

#### Gzip 压缩
```javascript
const CompressionPlugin = require('compression-webpack-plugin');

new CompressionPlugin({
  algorithm: 'gzip',
  test: /\.(js|css|html|svg)$/,
  threshold: 10240,
  minRatio: 0.8
})
```

#### CDN 加速
```javascript
output: {
  publicPath: 'https://cdn.example.com/'
}
```

## 6. 模块解析

### 6.1 resolve 配置
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@utils': path.resolve(__dirname, 'src/utils')
  },
  extensions: ['.js', '.json', '.vue', '.ts'],
  modules: [
    path.resolve(__dirname, 'src'),
    'node_modules'
  ],
  mainFields: ['browser', 'module', 'main']
}
```

### 6.2 外部扩展
```javascript
externals: {
  vue: 'Vue',
  'element-ui': 'ELEMENT',
  react: 'React',
  'react-dom': 'ReactDOM'
}
```

## 7. 开发环境

### 7.1 DevServer
```javascript
devServer: {
  hot: true,
  open: true,
  compress: true,
  port: 8080,
  host: '0.0.0.0',
  historyApiFallback: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }
  },
  client: {
    overlay: {
      errors: true,
      warnings: false
    }
  }
}
```

### 7.2 Source Map
```javascript
devtool: 'eval-cheap-module-source-map'
```

Source Map 类型：
- `eval`：最快，但转换后的代码
- `source-map`：最完整，但构建最慢
- `eval-source-map`：平衡选择

## 8. 面试高频题

### Q1: Loader 和 Plugin 的区别？
- **Loader**：用于转换文件，处理特定类型的文件
- **Plugin**：用于扩展 Webpack 功能，在构建流程的特定时机执行

### Q2: Tree Shaking 是什么？
- 移除 JavaScript 上下文中的未引用代码
- 基于 ES6 模块的静态分析
- 生产模式自动开启

### Q3: 如何优化 Webpack 构建速度？
- 使用 Loader 的缓存
- 开启多进程构建
- 使用 DLLPlugin
- 减少文件搜索范围

### Q4: 如何减少打包体积？
- 按需加载
- Tree Shaking
- 代码分割
- 压缩代码
- 使用 CDN

### Q5: Hash、ChunkHash、ContentHash 的区别？
- **Hash**：每次构建都变化
- **ChunkHash**：同一个 chunk 变化才变化
- **ContentHash**：文件内容变化才变化

### Q6: Webpack 构建流程？
1. 初始化参数
2. 开始编译
3. 确定入口
4. 编译模块
5. 完成模块编译
6. 输出资源
7. 输出完成

### Q7: HMR 原理？
- WebSocket 建立连接
- 监听文件变化
- 重新编译变化的模块
- 发送更新消息
- 替换旧模块

## 9. 实战技巧

### 9.1 环境变量管理
```javascript
// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map'
});

// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map'
});
```

### 9.2 性能分析
```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  openAnalyzer: false
})
```

### 9.3 多页面配置
```javascript
entry: {
  page1: './src/page1/index.js',
  page2: './src/page2/index.js'
},
plugins: [
  new HtmlWebpackPlugin({
    template: './src/page1/index.html',
    filename: 'page1.html',
    chunks: ['page1']
  }),
  new HtmlWebpackPlugin({
    template: './src/page2/index.html',
    filename: 'page2.html',
    chunks: ['page2']
  })
]
```

## 10. 最佳实践

### 10.1 配置拆分
- webpack.common.js：公共配置
- webpack.dev.js：开发环境配置
- webpack.prod.js：生产环境配置

### 10.2 版本控制
- package.json 中指定版本
- 使用 npm ci 代替 npm install
- 锁定依赖版本

### 10.3 监控和日志
- 构建时间监控
- 文件体积监控
- 错误日志收集

## 11. 总结

Webpack 是前端工程化的核心工具，需要掌握：
- 核心概念（Entry、Output、Loader、Plugin）
- 配置优化
- 性能优化
- 构建流程
- 实战技巧

推荐资源：
- Webpack 官方文档：https://webpack.js.org/
- Webpack 中文文档：https://webpack.docschina.org/

---

**知识点:**
- Webpack
- 构建工具
- 模块打包
- Loader
- Plugin
- 代码分割
- Tree Shaking
- HMR
