# ECharts数据可视化核心知识

## 1. ECharts 的基本概念和核心特点

### 1.1 什么是 ECharts？
ECharts 是一个基于 JavaScript 的开源可视化图表库，由百度开源，现在已捐献给 Apache 软件基金会。它提供了丰富的图表类型，包括折线图、柱状图、饼图、散点图、雷达图、K线图等。

### 1.2 ECharts 的核心特点
- **丰富的图表类型**：支持 20+ 种图表类型
- **高性能渲染**：基于 Canvas 实现，支持大数据量渲染
- **交互友好**：内置丰富的交互功能（缩放、漫游、图例开关等）
- **响应式设计**：自适应容器大小
- **多端支持**：支持 PC 和移动端
- **主题定制**：支持自定义主题

## 2. ECharts 的配置项

### 2.1 基础配置结构
```javascript
option = {
  title: {},        // 标题组件
  tooltip: {},      // 提示框组件
  legend: {},       // 图例组件
  grid: {},         // 直角坐标系内绘图网格
  xAxis: {},        // 直角坐标系 x 轴
  yAxis: {},        // 直角坐标系 y 轴
  series: []        // 系列列表
}
```

### 2.2 常用配置项说明

#### title（标题）
```javascript
title: {
  text: '主标题',
  subtext: '副标题',
  left: 'center',
  top: '10px',
  textStyle: {
    color: '#333',
    fontSize: 18
  }
}
```

#### tooltip（提示框）
```javascript
tooltip: {
  trigger: 'axis',  // 'item' 或 'axis'
  formatter: function(params) {
    return params[0].name + ': ' + params[0].value;
  }
}
```

#### legend（图例）
```javascript
legend: {
  data: ['销量'],
  top: '10%',
  selectedMode: true  // 点击图例是否可切换
}
```

#### series（系列）
```javascript
series: [{
  name: '销量',
  type: 'bar',  // bar、line、pie、scatter 等
  data: [10, 20, 30, 40, 50]
}]
```

## 3. 常用图表类型

### 3.1 柱状图（Bar Chart）
```javascript
series: [{
  type: 'bar',
  data: [10, 20, 30],
  barWidth: '30%',
  itemStyle: {
    color: '#5470c6',
    borderRadius: [5, 5, 0, 0]
  }
}]
```

### 3.2 折线图（Line Chart）
```javascript
series: [{
  type: 'line',
  data: [10, 20, 30],
  smooth: true,  // 是否平滑曲线
  areaStyle: {   // 区域填充样式
    color: 'rgba(84, 112, 198, 0.3)'
  }
}]
```

### 3.3 饼图（Pie Chart）
```javascript
series: [{
  type: 'pie',
  radius: ['40%', '70%'],  // 内外半径
  data: [
    { value: 1048, name: '搜索引擎' },
    { value: 735, name: '直接访问' }
  ],
  label: {
    show: true,
    formatter: '{b}: {d}%'
  }
}]
```

### 3.4 散点图（Scatter Chart）
```javascript
series: [{
  type: 'scatter',
  data: [
    [10, 20],
    [15, 30],
    [20, 25]
  ],
  symbolSize: 10,
  itemStyle: {
    color: '#91cc75'
  }
}]
```

## 4. 高级特性

### 4.1 动态数据更新
```javascript
// 使用 setOption 更新数据
myChart.setOption({
  series: [{
    data: newData
  }]
});

// 不合并模式，完全重绘
myChart.setOption(newOption, true);
```

### 4.2 响应式布局
```javascript
window.addEventListener('resize', function() {
  myChart.resize();
});
```

### 4.3 动画配置
```javascript
animation: true,
animationDuration: 1000,
animationEasing: 'cubicOut',
animationDelay: function(idx) {
  return idx * 100;
}
```

### 4.4 事件监听
```javascript
// 点击事件
myChart.on('click', function(params) {
  console.log(params);
});

// 图例开关事件
myChart.on('legendselectchanged', function(params) {
  console.log(params);
});
```

## 5. 性能优化

### 5.1 大数据量优化
```javascript
// 开启渐进式渲染
progressive: 200,  // 分片数量
progressiveThreshold: 1000  // 开启阈值

// 使用 dataZoom
dataZoom: [{
  type: 'inside',
  start: 0,
  end: 100
}]
```

### 5.2 渲染优化
- 使用 Canvas 渲染（默认）
- 避免频繁调用 setOption
- 使用数据缓存
- 减少 DOM 操作

### 5.3 按需加载
```javascript
// 只加载需要的图表类型
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
```

## 6. 常见问题

### 6.1 图表不显示
- 检查容器是否有宽高
- 检查数据格式是否正确
- 检查是否正确调用 setOption

### 6.2 图表变形
- 确保容器有明确的宽高
- 监听 resize 事件并调用 resize()

### 6.3 性能问题
- 减少数据量
- 使用 dataZoom
- 禁用动画

### 6.4 图例点击不生效
- 检查 legend.data 和 series.name 是否匹配

## 7. 实战案例

### 7.1 柱状图 + 折线图混合
```javascript
option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五']
  },
  yAxis: [
    { type: 'value', name: '销量' },
    { type: 'value', name: '增长率', position: 'right' }
  ],
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [100, 200, 150, 300, 250]
    },
    {
      name: '增长率',
      type: 'line',
      yAxisIndex: 1,
      data: [10, 20, 15, 30, 25]
    }
  ]
}
```

### 7.2 动态数据模拟
```javascript
setInterval(function() {
  const data = [];
  for (let i = 0; i < 5; i++) {
    data.push(Math.round(Math.random() * 1000));
  }
  myChart.setOption({
    series: [{
      data: data
    }]
  });
}, 2000);
```

## 8. 面试高频题

### Q1: ECharts 和 Chart.js 的区别？
- ECharts 基于 Canvas，Chart.js 基于 Canvas
- ECharts 图表类型更丰富
- ECharts 性能更好，支持大数据量
- ECharts 文档和社区更完善（中文）

### Q2: 如何实现图表的动态数据更新？
- 使用 setOption 方法
- 可以选择合并模式或不合并模式
- 注意处理数据格式变化

### Q3: 如何优化大数据量渲染性能？
- 开启 progressive 渐进式渲染
- 使用 dataZoom 缩放
- 减少数据点
- 禁用动画

### Q4: 如何自定义图表样式？
- 通过 itemStyle、lineStyle 等配置项
- 使用 visualMap 组件实现数据映射样式
- 自定义主题

### Q5: 响应式图表如何实现？
- 监听 window.resize 事件
- 调用 myChart.resize() 方法
- 确保容器有百分比宽高

## 9. 进阶技巧

### 9.1 自定义主题
```javascript
const theme = {
  color: ['#5470c6', '#91cc75', '#fac858'],
  backgroundColor: '#fff'
};
const chart = echarts.init(dom, theme);
```

### 9.2 组合图表
```javascript
// 混合多种图表类型
series: [
  { type: 'bar', data: [...] },
  { type: 'line', data: [...] },
  { type: 'pie', data: [...] }
]
```

### 9.3 地图可视化
```javascript
// 引入地图数据
import 'echarts/map/js/china';

series: [{
  type: 'map',
  map: 'china',
  data: [...]
}]
```

## 10. 总结

ECharts 是一个功能强大的数据可视化库，掌握其配置项和优化技巧对于前端开发很重要。在实际项目中，需要根据需求选择合适的图表类型，并注意性能优化。

推荐阅读：
- ECharts 官方文档：https://echarts.apache.org/zh/index.html
- ECharts Gallery：https://echarts.apache.org/examples/zh/index.html
