# form-create 动态表单生成器开发指南

> 深入剖析 form-create 的设计理念、核心架构、配置协议，以及如何基于它构建企业级动态表单系统。

## 前言

[form-create](https://github.com/xaboy/form-create) 是 Vue生态中最成熟的**动态表单生成器**之一。与上一章手撸的 `DynamicForm` 不同，form-create 追求的是**极致的配置灵活性**——通过一套 JSON Schema 驱动整个表单的生命周期，包括渲染、校验、提交、联动。

本篇文章带你从设计理念出发，理解它的架构核心，并最终掌握如何用它快速搭建企业级表单系统。

---

## 目录
- [一、form-create 解决了什么问题](#一form-create-解决了什么问题)
- [二、核心设计理念](#二核心设计理念)
- [三、快速上手](#三快速上手)
- [四、核心功能详解](#四核心功能详解)
- [五、完整企业级案例](#五完整企业级案例)
- [六、高级用法](#六高级用法)
- [七、与手撸 DynamicForm 的对比](#七与手撸-dynamicform-的对比)
- [八、性能优化](#八性能优化)
- [九、总结](#九总结)

---

## 一、form-create 解决了什么问题

### 1.1 传统表单开发的痛点

| 痛点 | 描述 |
|------|------|
| 字段多、维护成本高 | 一个表单几十个字段，每个都写 template，业务变更时简直是噩梦 |
| 重复代码多 | 表单校验逻辑、布局、提交处理几乎每个表单都要写一遍 |
| 动态渲染困难 | 某些字段需要根据用户角色、数据状态动态显示/隐藏/校验 |
| 配置分散 | 后端返回的配置和前端渲染逻辑往往脱节 |

### 1.2 form-create 的解决思路

```
后端下发 JSON Schema → 前端解析配置 → 动态渲染表单组件 → 自动处理校验/提交
```

- **后端可控**：表单结构完全由后端控制，前端只负责渲染
- **配置即代码**：JSON 配置就是表单的蓝图
- **所见即所得**：配合设计器，可以实现可视化表单构建

---

## 二、核心设计理念

### 2.1 三层分离架构

form-create 采用了清晰的三层分离设计：

```
┌─────────────────────────────────────────────────────┐
│                    生成器层                          │
│         form-create-core / @form-create/element-ui  │
│                    负责任务调度                      │
├─────────────────────────────────────────────────────┤
│                    渲染器层                          │
│              解析配置 → 生成 VNode                   │
│           支持自定义组件和第三方组件                  │
├─────────────────────────────────────────────────────┤
│                    组件层                           │
│         input / select / datePicker / ...           │
│              实际负责数据交互的 UI                    │
└─────────────────────────────────────────────────────┘
```

### 2.2 两种使用方式

```typescript
// 方式一：Vue 组件方式（推荐，快速上手）
<form-create v-model="fApi" :rule="rule" :option="option" />

// 方式二：API 方式（更灵活，适合复杂场景）
import formCreate from '@form-create/element-ui'

const fApi = formCreate.create(rule, option)
```

### 2.3 配置协议概览

```typescript
// 完整字段配置结构
interface FormRule {
  type: string                    // 组件类型: 'input' | 'select' | 'datePicker' | ...
  field: string                   // 字段名，唯一标识
  title: string                   // 字段标题
  value: any                      // 默认值

  // 布局控制
  col?: { span: number }          // 栅格占比

  // 组件专属配置
  props?: Record<string, any>    // 透传给目标组件的 props
  options?: OptionItem[]          // select/radio/checkbox 的选项
  emit?: string[]                 // 监听子组件事件 ['change', 'input']
  emitPrefix?: string             // 事件前缀

  // 交互控制
  validate?: ValidateRule[]       // 校验规则
  on?: { [event: string]: Function } // 事件处理

  // 动态控制
  ifShow?: boolean | string | ((rule: FormRule, fApi: FormCreate) => boolean)
  control?: ControlRule[]         // 联动控制

  // 插槽支持
  slot?: string                   // 自定义插槽名
  render?: (h, params: RenderParams) => VNode  // 自定义渲染函数

  // 高级
  native?: boolean                // 原生事件（不打通 v-model）
  hidden?: boolean                // 完全隐藏
  display?: boolean                // 控制显隐（保留值）
}
```

---

## 三、快速上手

### 3.1 安装与注册

```bash
npm install @form-create/element-ui form-create-element-ui
```

```typescript
// main.ts
import formCreate from '@form-create/element-ui'
import 'form-create-element-ui/dist/form-create.css'

Vue.use(formCreate)
```

### 3.2 基础用法

```vue
<template>
  <div>
    <form-create v-model="fApi" :rule="rule" :option="option" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fApi = ref()

// 表单配置规则
const rule = [
  {
    type: 'input',
    field: 'name',
    title: '姓名',
    value: '',
    props: { placeholder: '请输入姓名' },
    validate: [{ required: true, message: '姓名不能为空' }]
  },
  {
    type: 'select',
    field: 'gender',
    title: '性别',
    value: '',
    props: { placeholder: '请选择性别' },
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    validate: [{ required: true, message: '请选择性别' }]
  }
]

const option = {
  onSubmit: (formData: any) => {
    console.log('提交数据:', formData)
    // 这里调用接口
    // 成功后调用 fApi.resetFields() 重置
  },
  resetBtn: true,
  submitBtn: {
    type: 'primary',
    innerText: '提交',
    col: { span: 12, push: 6 }
  }
}

function onSubmit(formData: any) {
  console.log('表单数据:', formData)
}
</script>
```

---

## 四、核心功能详解

### 4.1 校验规则配置

form-create 基于 async-validator 实现校验，支持**规则级**和**全局级**两种配置方式：

```typescript
// 规则级校验
{
  type: 'input',
  field: 'phone',
  title: '手机号',
  value: '',
  validate: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
    {
      validator: (rule, value, callback) => {
        // 异步校验：检查手机号是否已注册
        checkPhoneExist(value).then(exists => {
          if (exists) {
            callback(new Error('该手机号已注册'))
          } else {
            callback()
          }
        })
      },
      trigger: 'blur'
    }
  ]
}

// 全局校验器
const option = {
  validate: {
    phone: [
      { required: true, message: '请输入手机号' }
    ]
  }
}
```

### 4.2 联动控制

**方式一：`control` 配置（推荐）**

```typescript
{
  type: 'select',
  field: 'orderType',
  title: '订单类型',
  value: '',
  options: [
    { label: '普通订单', value: 'normal' },
    { label: '预售订单', value: 'preorder' },
    { label: '定制订单', value: 'custom' }
  ]
},
{
  type: 'datePicker',
  field: 'preorderDate',
  title: '预售发货日期',
  value: '',
  // 仅预售订单时显示
  control: [
    {
      handle: (val: string) => val === 'preorder',
      rule: [{ handle: (val: any, rule: any) => rule.hide(), status: 1 }]
    }
  ]
},
{
  type: 'input',
  field: 'customSpec',
  title: '定制规格说明',
  value: '',
  // 定制订单时显示，且必填
  control: [
    {
      handle: (val: string) => val === 'custom',
      rule: [
        { handle: (val: any, rule: any) => rule.show(), status: 1 },
        { handle: (val: any, rule: any) => rule.required(true), status: 1 }
      ]
    }
  ]
}
```

**方式二：`ifShow` 函数**

```typescript
{
  type: 'input',
  field: 'managerName',
  title: '负责人',
  value: '',
  // 复杂显隐逻辑
  ifShow: (rule, fApi) => {
    const role = fApi.getValue('userRole')
    return ['admin', 'manager'].includes(role)
  }
}
```

### 4.3 远程数据加载

```typescript
// 场景：省市区三级联动
{
  type: 'cascader',
  field: 'region',
  title: '所在地区',
  value: [],
  props: {
    props: { checkStrictly: true },
    clearable: true
  },
  // 远程加载选项
  options: (() => []),
  loading: false,
  on: {
    'visible-change': async (flag: boolean, api: any) => {
      if (flag && api.options.length === 0) {
        api.loading = true
        const data = await fetchRegionData()
        api.options = data
        api.loading = false
      }
    }
  }
}
```

**更优雅的方式：使用 `effect` 钩子**

```typescript
import { useRequest } from '@/composables/useRequest'

{
  type: 'select',
  field: 'product',
  title: '商品',
  value: '',
  // 通过 effect 触发数据加载
  effect: {
    // 监听 category 字段变化
    loadingData: async (field, api) => {
      const categoryId = api.getValue('category')
      if (!categoryId) return []
      return await fetchProductsByCategory(categoryId)
    }
  }
}
```

### 4.4 动态增减行

form-create 内置了**动态表格**组件 `group`：

```typescript
{
  type: 'group',
  field: 'members',
  title: '团队成员',
  value: [{ name: '', role: '', phone: '' }],
  props: {
    // 可拖拽排序
    draggable: true,
    // 默认行数
    defaultValue: { name: '', role: '', phone: '' }
  },
  children: [
    {
      type: 'input',
      field: 'name',
      title: '姓名'
    },
    {
      type: 'select',
      field: 'role',
      title: '角色',
      options: [
        { label: '前端', value: 'frontend' },
        { label: '后端', value: 'backend' },
        { label: '产品', value: 'product' }
      ]
    },
    {
      type: 'input',
      field: 'phone',
      title: '手机号',
      validate: [
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
      ]
    }
  ]
}
```

### 4.5 自定义组件

#### 4.5.1 注册全局自定义组件

```typescript
// components/FormComponents.ts
import { maker } from 'form-create-comm'

// 定义一个省市选择组件
export const AreaPicker = {
  name: 'AreaPicker',
  props: {
    modelValue: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const province = ref('')
    const city = ref('')
    const district = ref('')

    watch([province, city, district], () => {
      emit('update:modelValue', [province.value, city.value, district.value])
    })

    return () => (
      <div class="area-picker">
        <el-select v-model={province.value} placeholder="省">
          {/* 渲染省 */}
        </el-select>
        <el-select v-model={city.value} placeholder="市">
          {/* 渲染市 */}
        </el-select>
        <el-select v-model={district.value} placeholder="区">
          {/* 渲染区 */}
        </el-select>
      </div>
    )
  }
}

// 注册到 form-create
formCreate.component('AreaPicker', AreaPicker)

// 定义配置生成器
export const createAreaPicker = maker('省市区选择', 'area', [])
  .props({ placeholder: '请选择' })
```

#### 4.5.2 在规则中使用自定义组件

```typescript
const rule = [
  // 使用 maker 生成器
  createAreaPicker.props({ placeholder: '请选择所在地区' })
    .validate([{ required: true, message: '请选择地区' }])
    .col(24),

  // 或直接配置 type
  {
    type: 'AreaPicker',
    field: 'area',
    title: '所在地区',
    value: []
  }
]
```

### 4.6 插槽使用

```typescript
{
  type: 'input',
  field: 'avatar',
  title: '头像',
  value: '',
  // 使用 slot 配置插槽名
  slot: 'uploadSlot'
}

// 在模板中定义插槽
<template>
  <form-create
    v-model="fApi"
    :rule="rule"
    :option="option"
  >
    <template #uploadSlot="{ rule, t }">
      <div class="custom-upload">
        <img v-if="rule.value" :src="rule.value" class="avatar" />
        <el-button v-else type="primary">
          <i class="el-icon-upload"></i>
          {{ t('upload') }}
        </el-button>
      </div>
    </template>
  </form-create>
</template>
```

---

## 五、完整企业级案例

### 5.1 需求分析

实现一个**订单管理系统**中的新增订单表单，包含：

- 客户信息（姓名、手机、地区）
- 商品选择（联动分类→商品）
- 订单配置（类型、配送方式、备注）
- 动态明细行（可增删商品）
- 动态校验（总价验证、库存校验）

### 5.2 完整配置

```typescript
// orderFormConfig.ts
import { maker } from 'form-create-comm'

// 省市区选择器 maker
const areaPicker = (field: string, title: string) =>
  maker.component('AreaPicker', field, title)
    .validate([{ required: true, message: '请选择完整地区' }])

export const orderFormRule = [
  // 客户信息区块
  {
    type: 'group',
    title: '客户信息',
    field: 'customer',
    value: { name: '', phone: '', area: [] },
    children: [
      maker.input('姓名', 'name', '').validate([{ required: true, message: '请输入客户姓名' }]).col(8).props({
        maxlength: 20,
        showWordLimit: true
      }),
      maker.input('手机号', 'phone', '').validate([
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
      ]).col(8).props({ maxlength: 11 }),
      areaPicker('area', '所在地区').col(8)
    ]
  },

  // 商品分类与商品联动
  maker.select('商品分类', 'category', '')
    .options(async () => {
      const data = await fetchCategories()
      return data.map((c: any) => ({ label: c.name, value: c.id }))
    })
    .col(12),

  {
    type: 'select',
    field: 'product',
    title: '商品',
    value: '',
    options: [],
    validate: [{ required: true, message: '请选择商品' }],
    col: 12,
    effect: {
      // 监听 category 变化，自动加载对应商品
      toggle: 'category'
    },
    on: {
      // category 变化时触发
      change: (val: string, api: any) => {
        if (!val) {
          api.load({ options: [] })
          return
        }
        fetchProducts(val).then((products: any[]) => {
          api.load({ options: products, value: '' })
        })
      }
    }
  },

  // 订单类型联动
  {
    type: 'radioGroup',
    field: 'orderType',
    title: '订单类型',
    value: 'normal',
    options: [
      { label: '普通订单', value: 'normal' },
      { label: '预售订单', value: 'preorder' },
      { label: '加急订单', value: 'urgent' }
    ]
  },

  // 预售日期（仅预售订单可见）
  {
    type: 'datePicker',
    field: 'deliveryDate',
    title: '期望发货日期',
    value: '',
    props: { type: 'date' },
    control: [
      {
        handle: (val: string) => val === 'preorder',
        rule: [
          { handle: (val: any, rule: any) => rule.show(), status: 1 },
          { handle: (val: any, rule: any) => rule.required(true), status: 1 }
        ]
      }
    ]
  },

  // 加急说明（仅加急订单可见）
  {
    type: 'input',
    field: 'urgentReason',
    title: '加急原因',
    value: '',
    props: { type: 'textarea', rows: 2 },
    control: [
      {
        handle: (val: string) => val === 'urgent',
        rule: [{ handle: (val: any, rule: any) => rule.show(), status: 1 }]
      }
    ]
  },

  // 配送方式
  maker.select('配送方式', 'delivery', 'express')
    .options([
      { label: '快递配送', value: 'express' },
      { label: '上门自提', value: 'pickup' },
      { label: '同城配送', value: 'local' }
    ])
    .col(12),

  // 自提地址（仅上门自提可见）
  {
    type: 'input',
    field: 'pickupAddress',
    title: '自提地址',
    value: '',
    control: [
      {
        handle: (val: string) => val === 'pickup',
        rule: [
          { handle: (val: any, rule: any) => rule.show(), status: 1 },
          { handle: (val: any, rule: any) => rule.required(true), status: 1 }
        ]
      }
    ]
  },

  // 动态明细行
  {
    type: 'group',
    field: 'items',
    title: '订单明细',
    value: [{ productName: '', quantity: 1, price: 0, subtotal: 0 }],
    props: {
      draggable: true,
      defaultValue: { productName: '', quantity: 1, price: 0, subtotal: 0 }
    },
    validate: [
      {
        validator: (rule, value, callback) => {
          if (!value || value.length === 0) {
            callback(new Error('请至少添加一条商品明细'))
          } else {
            callback()
          }
        }
      }
    ],
    children: [
      maker.input('商品名称', 'productName', '').validate([{ required: true, message: '请输入商品名称' }]),
      maker.number('数量', 'quantity', 1).props({ min: 1, max: 999 }).col(6)
        .on({
          input: (val: number, api: any) => {
            // 自动计算小计
            const price = api.parent.getValue().price || 0
            api.updateValue({ subtotal: val * price })
          }
        }),
      maker.number('单价', 'price', 0).props({ min: 0, precision: 2 }).col(6)
        .on({
          input: (val: number, api: any) => {
            // 自动计算小计
            const quantity = api.parent.getValue().quantity || 1
            api.updateValue({ subtotal: val * quantity })
          }
        }),
      { type: 'inputNumber', field: 'subtotal', title: '小计', value: 0, props: { readonly: true, precision: 2 }, col: 6 }
    ]
  },

  // 备注
  maker.textarea('订单备注', 'remark', '').col(24).props({
    rows: 3,
    maxlength: 500,
    showWordLimit: true,
    placeholder: '请输入订单备注信息（选填）'
  })
]

export const orderFormOption = {
  resetBtn: {
    show: true,
    innerText: '重置',
    col: { span: 6, pull: 6 }
  },
  submitBtn: {
    type: 'primary',
    innerText: '提交订单',
    col: { span: 6 },
    // 提交前钩子
    hook: (submit: () => void) => {
      return async (formData: any) => {
        // 自定义提交逻辑
        console.log('提交数据:', formData)
        // 可在此进行数据验证、转换等处理
        await submit() // 继续执行默认提交
      }
    }
  },
  // 全局配置
  global: {
    input: {
      props: { clearable: true }
    },
    select: {
      props: { clearable: true }
    }
  }
}
```

### 5.3 组件使用

```vue
<template>
  <div class="order-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增订单</span>
        </div>
      </template>

      <form-create
        v-model="fApi"
        :rule="orderFormRule"
        :option="orderFormOption"
        @submit="handleSubmit"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orderFormRule, orderFormOption } from './orderFormConfig'

const fApi = ref()

// 表单提交
async function handleSubmit(formData: any) {
  try {
    // 处理明细行数据
    const submitData = {
      ...formData,
      totalAmount: formData.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    }

    await submitOrder(submitData)
    ElMessage.success('订单提交成功')
    fApi.value.resetFields()
  } catch (error) {
    ElMessage.error('订单提交失败，请重试')
  }
}
</script>

<style scoped>
.order-form-container {
  padding: 20px;
}
</style>
```

---

## 六、高级用法

### 6.1 动态修改表单配置

```typescript
// 动态添加字段
fApi.value.appendField(
  {
    type: 'input',
    field: 'extraField',
    title: '额外字段',
    value: ''
  },
  'remark' // 在哪个字段后面插入
)

// 动态删除字段
fApi.value.removeField('extraField')

// 动态修改字段
fApi.value.updateRule('phone', {
  props: { disabled: true },
  value: '138****8888'
})

// 获取/设置值
const name = fApi.value.getValue('name')
fApi.value.setValue({ name: '张三', phone: '13800138000' })

// 重置表单
fApi.value.resetFields()

// 清除校验信息
fApi.value.clearValidate()

// 触发表单校验
fApi.value.validate((valid: boolean) => {
  if (valid) {
    console.log('校验通过')
  }
})
```

### 6.2 表单数据持久化

```typescript
// 保存表单状态到 localStorage
function saveFormState() {
  const state = fApi.value.formData()
  localStorage.setItem('orderFormState', JSON.stringify(state))
}

// 恢复表单状态
function restoreFormState() {
  const state = localStorage.getItem('orderFormState')
  if (state) {
    fApi.value.setValue(JSON.parse(state))
  }
}

// 监听表单变化自动保存
watch(fApi, () => {
  saveFormState()
}, { deep: true })
```

### 6.3 复杂校验：跨字段联动校验

```typescript
{
  type: 'datePicker',
  field: 'startDate',
  title: '开始日期',
  value: '',
  validate: [{ required: true, message: '请选择开始日期' }]
},
{
  type: 'datePicker',
  field: 'endDate',
  title: '结束日期',
  value: '',
  validate: [
    { required: true, message: '请选择结束日期' },
    {
      validator: (rule, value, callback) => {
        const startDate = fApi.value.getValue('startDate')
        if (startDate && value && new Date(value) <= new Date(startDate)) {
          callback(new Error('结束日期必须大于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}
```

---

## 七、与手撸 DynamicForm 的对比

| 对比维度 | DynamicForm（手撸） | form-create |
|---------|-------------------|-------------|
| **上手成本** | 低，完全可控 | 中，需要理解配置协议 |
| **灵活性** | 高，随意定制 | 高，但受限于组件库 |
| **配置化程度** | 低，需改代码 | 高，后端可控制 |
| **组件封装** | 需自己实现 | 已有丰富内置组件 |
| **第三方集成** | 需自己适配 | 支持自定义组件 |
| **适合场景** | 固定表单、内部系统 | 多租户、配置化平台 |
| **学习曲线** | 陡峭（需要架构能力） | 平缓（配置即所见） |

**结论**：
- 如果你是**组件库开发者**或需要**深度定制**，手撸 DynamicForm 是必经之路
- 如果你是**业务开发者**或需要**快速交付**，form-create 是更好的选择

---

## 八、性能优化

### 8.1 大数据量优化

```typescript
// 使用虚拟滚动处理大量选项
{
  type: 'select',
  field: 'product',
  title: '商品',
  value: '',
  props: {
    filterable: true,        // 启用搜索
    remote: true,            // 远程搜索
    'remote-method': (query: string) => {
      if (query) {
        fetchProducts({ keyword: query }).then((data: any[]) => {
          fApi.value.updateRule('product', { options: data })
        })
      }
    },
    'loading-text': '加载中...',
    'no-match-text': '无匹配数据',
    'no-data-text': '请输入关键词搜索'
  }
}
```

### 8.2 减少重渲染

```typescript
// 避免在 render 函数中创建新对象
// ❌ 错误
{
  render: (h) => h('div', { class: 'custom' }, 'content')
}

// ✅ 正确：使用 slot 或提前定义
{
  type: 'template',
  slot: 'customSlot',
  components: { CustomRender }  // 注册组件
}
```

---

## 九、总结

form-create 最大的价值在于**将表单逻辑抽象为配置**，让：

1. **后端可以控制表单结构**：动态表单、多租户场景迎刃而解
2. **设计师可以搭建表单**：配合设计器，实现可视化配置
3. **开发者可以快速交付**：复杂表单，几行配置搞定

它的设计哲学值得所有组件开发者学习：**配置即代码，代码即配置**。

下一章我们将介绍 **VueUse 组合式工具库**，看看社区最流行的工具集是如何设计的。

---

**相关文章**：
- [Vue 通用业务组件开发](./78-Vue通用业务组件开发) - 手撸复杂业务组件
- [VueUse 工具库](./36-Vueuse) - 组合式工具集
