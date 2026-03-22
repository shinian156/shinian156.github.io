# 三维GIS开发核心知识

## 1. GIS 基础概念

### 1.1 什么是 GIS？
GIS（Geographic Information System，地理信息系统）是一种用于采集、存储、管理、分析、显示地理空间数据的计算机系统。

### 1.2 常见 GIS 数据格式
- **矢量数据**：GeoJSON、KML、Shapefile
- **栅格数据**：GeoTIFF、DEM、影像数据
- **3D 模型**：glTF、OBJ、3D Tiles

### 1.3 坐标系统
- **WGS84**：全球通用坐标系（GPS）
- **GCJ02**：中国火星坐标系（高德、腾讯）
- **BD09**：百度坐标系
- **Web Mercator**：Web 地图常用投影

## 2. WebGL 技术栈

### 2.1 WebGL 简介
WebGL（Web Graphics Library）是一种 JavaScript API，用于在任何兼容的 Web 浏览器中渲染高性能的交互式 3D 和 2D 图形。

### 2.2 主流 WebGL 框架

#### Three.js
- ✅ 功能强大，生态完善
- ✅ 文档丰富，社区活跃
- ✅ 易于上手
- ❌ 文件体积较大

#### Cesium.js
- ✅ 专为 GIS 设计
- ✅ 支持 3D 地球
- ✅ 支持 3D Tiles
- ✅ 时间动态展示
- ❌ 学习曲线较陡

#### Mapbox GL JS
- ✅ 性能优秀
- ✅ 矢量瓦片支持好
- ❌ 3D 能力相对弱

#### ArcGIS API for JavaScript
- ✅ 功能全面
- ✅ 企业级支持
- ❌ 商业收费
- ❌ 体积庞大

### 2.3 技术选型建议
- **智慧城市/数字孪生**：Cesium.js
- **3D 地球展示**：Cesium.js
- **室内导航**：Three.js + 自定义
- **地图可视化**：Mapbox GL JS
- **企业级项目**：ArcGIS API

## 3. Cesium.js 核心概念

### 3.1 Viewer 组件
```javascript
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain(),  // 地形
  baseLayerPicker: false,  // 底图选择器
  animation: false,        // 动画控件
  timeline: false,         // 时间轴
  sceneMode: Cesium.SceneMode.SCENE3D  // 3D/2D/2.5D 模式
});
```

### 3.2 Entity（实体）
```javascript
viewer.entities.add({
  name: 'Blue Box',
  position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
  box: {
    dimensions: new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
    material: Cesium.Color.BLUE
  }
});
```

### 3.3 Primitive（图元）
```javascript
// Primitive 性能更好，适合大量数据
const primitive = viewer.scene.primitives.add(
  new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(-100.0, 30.0, -90.0, 40.0)
      })
    }),
    appearance: new Cesium.MaterialAppearance()
  })
);
```

## 4. 常用功能

### 4.1 加载 3D 模型
```javascript
// 加载 glTF 模型
const entity = viewer.entities.add({
  name: '模型',
  position: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706),
  model: {
    uri: './models/CesiumMilkTruck.glb',
    minimumPixelSize: 128,
    maximumScale: 20000
  }
});

viewer.zoomTo(entity);
```

### 4.2 加载 3D Tiles
```javascript
// 加载 3D Tiles（点云、BIM、倾斜摄影等）
const tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: './tilesets/bim/tileset.json'
  })
);

tileset.readyPromise.then(function(tileset) {
  viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, tileset.boundingSphere.radius * 2));
});
```

### 4.3 地形服务
```javascript
// 添加地形
const terrainProvider = new Cesium.CesiumTerrainProvider({
  url: 'https://api.vworld.kr/req/data',
  requestWaterMask: true,
  requestVertexNormals: true
});
viewer.terrainProvider = terrainProvider;
```

### 4.4 相机控制
```javascript
// 飞向指定位置
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
  orientation: {
    heading: Cesium.Math.toRadians(0.0),
    pitch: Cesium.Math.toRadians(-15.0)
  },
  duration: 3
});

// 设置视角
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 15000.0)
});
```

### 4.5 拾取和交互
```javascript
// 点击事件
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function(movement) {
  const pickedObject = viewer.scene.pick(movement.position);
  if (Cesium.defined(pickedObject)) {
    console.log('选中对象:', pickedObject);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
```

## 5. 性能优化

### 5.1 加载优化
```javascript
// 设置 3D Tiles 加载参数
tileset.maximumScreenSpaceError = 2;  // 最大屏幕空间误差
tileset.dynamicScreenSpaceError = true;
tileset.dynamicScreenSpaceErrorDensity = 0.00278;
tileset.dynamicScreenSpaceErrorFactor = 4.0;
tileset.dynamicScreenSpaceErrorHeightFalloff = 0.25;
```

### 5.2 渲染优化
```javascript
// 启用光照
viewer.scene.globe.enableLighting = true;

// 设置性能参数
viewer.scene.fog.enabled = true;
viewer.scene.fog.density = 0.0002;

// 限制帧率
viewer.targetFrameRate = 60;
```

### 5.3 内存优化
```javascript
// 清理资源
viewer.entities.removeAll();
viewer.scene.primitives.removeAll();
viewer.dataSources.removeAll();

// 销毁 Viewer
viewer.destroy();
```

## 6. 坐标转换

### 6.1 经纬度转笛卡尔坐标
```javascript
const cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
```

### 6.2 笛卡尔坐标转经纬度
```javascript
const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
const longitude = Cesium.Math.toDegrees(cartographic.longitude);
const latitude = Cesium.Math.toDegrees(cartographic.latitude);
const height = cartographic.height;
```

### 6.3 坐标系转换
```javascript
// WGS84 转 GCJ02（中国火星坐标）
function wgs84ToGcj02(lng, lat) {
  // 转换算法实现
}

// GCJ02 转 BD09（百度坐标）
function gcj02ToBd09(lng, lat) {
  // 转换算法实现
}
```

## 7. 实战案例

### 7.1 建筑物可视化
```javascript
// 加载建筑物 GeoJSON
Cesium.GeoJsonDataSource.load('./data/buildings.geojson')
  .then(function(dataSource) {
    viewer.dataSources.add(dataSource);
    const entities = dataSource.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      entity.polygon.material = Cesium.Color.BLUE.withAlpha(0.5);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.BLUE;
    }
  });
```

### 7.2 路径动画
```javascript
// 轨迹动画
const property = new Cesium.SampledPositionProperty();
property.addSample(Cesium.JulianDate.fromIso8601('2024-01-01T00:00:00Z'),
  Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883));
property.addSample(Cesium.JulianDate.fromIso8601('2024-01-01T00:01:00Z'),
  Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883));

const entity = viewer.entities.add({
  position: property,
  point: { pixelSize: 10, color: Cesium.Color.YELLOW },
  path: {
    resolution: 1,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.1,
      color: Cesium.Color.YELLOW
    })
  }
});

viewer.trackedEntity = entity;
```

### 7.3 热力图
```javascript
// 使用 Cesium Heatmap
import Heatmap from './heatmap';

const heatmapLayer = new Heatmap('heatmap', {
  radius: 20,
  maxOpacity: 0.8,
  minOpacity: 0.1,
  blur: 0.75,
  gradient: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  }
});

heatmapLayer.setData(heatmapData);
viewer.scene.imageryLayers.add(heatmapLayer);
```

## 8. 常见问题

### 8.1 模型不显示
- 检查模型文件路径
- 检查模型格式是否支持
- 检查坐标位置是否正确
- 检查相机位置

### 8.2 性能问题
- 数据量过大
- 渲染参数设置不合理
- 内存泄漏
- 网络加载慢

### 8.3 坐标偏移问题
- 坐标系不匹配
- 偏移转换未处理
- 数据精度问题

### 8.4 3D Tiles 加载失败
- URL 配置错误
- 文件格式问题
- 网络问题

## 9. 面试高频题

### Q1: Cesium 和 Three.js 的区别？
- Cesium：专为 GIS 设计，支持地球、地形、3D Tiles
- Three.js：通用 3D 框架，自由度更高
- Cesium 内置坐标系转换，Three.js 需要自己处理
- Cesium 适合地图场景，Three.js 适合自定义 3D 场景

### Q2: 如何优化三维 GIS 性能？
- 使用 3D Tiles 分层加载
- 设置合理的屏幕空间误差
- 限制渲染距离
- 使用 LOD（Level of Detail）
- 及时清理不需要的资源

### Q3: 如何实现点击拾取？
```javascript
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function(movement) {
  const pickedObject = viewer.scene.pick(movement.position);
  if (pickedObject && pickedObject.id) {
    console.log(pickedObject.id);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
```

### Q4: 3D Tiles 是什么？
- 开放的 3D 地理空间数据规范
- 支持大规模三维数据流式传输
- 支持层次细节（LOD）
- 支持点云、BIM、倾斜摄影等

### Q5: 如何实现轨迹回放？
- 使用 SampledPositionProperty
- 设置时间采样点
- 使用 viewer.clock 控制播放
- 使用 viewer.trackedEntity 跟踪

### Q6: 中国坐标系问题？
- GCJ02 是加密坐标系
- 需要和 WGS84 转换
- 不同地图平台使用不同坐标系
- 开源库：coordtransform

## 10. 进阶技巧

### 10.1 自定义着色器
```javascript
const primitive = viewer.scene.primitives.add(
  new Cesium.Primitive({
    geometryInstances: geometryInstance,
    appearance: new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: 'MyMaterial',
          uniforms: {
            color: Cesium.Color.RED
          },
          source: `
            czm_material czm_getMaterial(czm_materialInput materialInput) {
              czm_material material = czm_getDefaultMaterial(materialInput);
              material.diffuse = materialInput.color.rgb;
              material.alpha = materialInput.color.a;
              return material;
            }
          `
        }
      })
    })
  })
);
```

### 10.2 后处理效果
```javascript
// 泛光效果
viewer.postProcessStages.add(Cesium.PostProcessStageLibrary.createBloomStage());
```

### 10.3 粒子系统
```javascript
const particleSystem = viewer.scene.primitives.add(
  new Cesium.ParticleSystem({
    image: './images/circle.png',
    startColor: Cesium.Color.CYAN,
    endColor: Cesium.Color.TRANSPARENT,
    particleLife: 3.0,
    speed: 5.0,
    imageSize: new Cesium.Cartesian2(25.0, 25.0),
    emissionRate: 5.0,
    emitter: new Cesium.CircleEmitter(0.5),
    position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 100)
  })
);
```

## 11. 项目实战

### 11.1 智慧城市项目
```javascript
// 项目结构
src/
├── components/
│   ├── BuildingLayer.ts    // 建筑图层
│   ├── TrafficLayer.ts     // 交通图层
│   ├── EnvironmentLayer.ts // 环境图层
│   └── AnalysisTools.ts    // 分析工具
├── utils/
│   ├── coordinate.ts       // 坐标转换
│   └── dataLoader.ts       // 数据加载
└── App.vue
```

### 11.2 数字孪生项目
```javascript
// 加载 BIM 模型
const tileset = await Cesium.Cesium3DTileset.fromUrl('./bim/tileset.json');
viewer.scene.primitives.add(tileset);

// 添加传感器数据
sensorData.forEach(data => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(data.lng, data.lat, data.height),
    point: { pixelSize: 8, color: Cesium.Color.RED },
    label: { text: data.value }
  });
});
```

## 12. 最佳实践

### 12.1 开发规范
- 组件化开发
- 统一的数据格式
- 清晰的目录结构
- 完善的注释

### 12.2 调试技巧
- 使用 Cesium Inspector
- Chrome DevTools
- 性能监控

### 12.3 部署建议
- 使用 CDN 加速
- 数据压缩
- 懒加载
- 服务端渲染（SSR）

## 13. 总结

三维 GIS 开发需要掌握：
- GIS 基础知识
- WebGL/Three.js/Cesium.js
- 坐标系统转换
- 性能优化技巧
- 3D 数据格式

推荐资源：
- Cesium 官方文档：https://cesium.com/learn/
- Cesium Sandcastle：https://sandcastle.cesium.com/
- Three.js 官方文档：https://threejs.org/docs/
- OGC 标准：https://www.ogc.org/
