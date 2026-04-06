# Vue 通用业务组件开发

在实际项目中，我们经常需要开发一些可复用的业务组件，让不同页面甚至不同项目都能通过配置直接使用，而无需重复造轮子。本文以一个**可配置化动态表单组件**为核心案例，完整演示通用业务组件从设计到实现的全过程，涵盖组件设计思想、Props 契约、插槽扩展、事件通信、联动控制、动态校验等核心知识点。

---

## 目录
- [一、什么是通用业务组件](#一什么是通用业务组件)
- [二、案例介绍：可配置化动态表单](#二案例介绍可配置化动态表单)
- [三、组件设计思路](#三组件设计思路)
- [四、核心数据结构设计](#四核心数据结构设计)
- [五、DynamicForm 组件完整实现](#五dynamicform-组件完整实现)
- [六、子组件：各类型字段渲染](#六子组件各类型字段渲染)
- [七、联动控制实现](#七联动控制实现)
- [八、动态增减行（子表单）](#八动态增减行子表单)
- [九、远程数据源（异步选项）](#九远程数据源异步选项)
- [十、表单校验系统](#十表单校验系统)
- [十一、父组件调用示例](#十一父组件调用示例)
- [十二、进阶：组件测试与文档化](#十二进阶组件测试与文档化)
- [十三、通用业务组件开发核心原则](#十三通用业务组件开发核心原则)

---

## 一、什么是通用业务组件

通用业务组件（Business Component）介于基础 UI 组件（Button、Input）和页面级组件之间，它封装了某类具体业务逻辑，可以在多处以**配置驱动**的方式复用。

| 层级 | 典型例子 | 特点 |
|------|----------|------|
| 基础组件 | Button、Input、Modal | 无业务逻辑，高度通用 |
| **通用业务组件** | DynamicForm、TableFilter、RichEditor | 封装业务逻辑，配置驱动 |
| 页面组件 | UserListPage、OrderDetailPage | 特定业务，低复用性 |

通用业务组件的核心价值：
- **减少重复代码**：同类交互只写一次
- **统一 UX 规范**：相同场景统一体验
- **降低维护成本**：改一处全局生效
- **提升开发效率**：业务开发者只需关注配置

---

## 二、案例介绍：可配置化动态表单

我们要开发的组件叫 `DynamicForm`，支持以下能力：

1. **多种字段类型**：文本、数字、下拉、日期、开关、上传、动态列表
2. **字段联动**：某字段的值决定另一个字段的显隐/可用性
3. **动态增减行**：列表类字段支持动态添加/删除行
4. **远程数据源**：Select 选项可通过 API 异步加载
5. **完整校验体系**：内置必填、正则、自定义函数校验，支持异步校验
6. **插槽扩展**：支持自定义字段渲染

使用示例（父组件调用时只需传配置）：

```vue
<DynamicForm
  :schema="formSchema"
  :model="formData"
  @submit="handleSubmit"
  @change="handleChange"
/>
```

---

## 三、组件设计思路

优秀的通用组件必须在**灵活性**和**易用性**之间取得平衡。设计前需回答三个问题：

**1. 谁来决定渲染什么？**
→ 由 `schema`（表单描述配置）驱动，父组件声明字段类型和规则

**2. 数据如何流动？**
→ 遵循 Vue 单向数据流：父传 `model`，组件内部做深拷贝，通过 `emit('update:model')` 通知父组件

**3. 如何支持扩展而不修改核心代码？**
→ 提供具名插槽 `#field-{fieldName}`，允许父组件自定义特定字段的渲染

```
父组件
  │  :schema (配置)     ↑ @submit / @change
  │  :model  (数据)     ↑ update:model
  ▼
DynamicForm
  ├── FormItem (每个字段的容器，包含 label + 校验提示)
  │     ├── TextField
  │     ├── SelectField (含远程数据源)
  │     ├── DateField
  │     ├── SwitchField
  │     ├── UploadField
  │     └── ListField (动态增减行)
  └── <slot #field-xxx /> (自定义字段扩展点)
```

---

## 四、核心数据结构设计

好的 TypeScript 类型定义是组件开发的基础，先把契约定清楚：

```typescript
// types/dynamic-form.ts

// 校验规则
export interface ValidateRule {
  required?: boolean
  message?: string           // 校验失败提示
  min?: number               // 最小长度/值
  max?: number               // 最大长度/值
  pattern?: RegExp           // 正则校验
  validator?: (value: any, formData: Record<string, any>) => 
    Promise<string | void> | string | void  // 自定义校验（支持异步）
}

// 联动条件
export interface LinkageCondition {
  field: string              // 依赖的字段名
  value: any                 // 触发条件的值（支持数组，表示 or 关系）
  action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue'
  setValue?: any             // action 为 setValue 时的目标值
}

// 选项（用于 Select、Radio、Checkbox）
export interface FieldOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
  children?: FieldOption[]   // 级联选择
}

// 远程数据源配置
export interface RemoteSource {
  url: string
  method?: 'GET' | 'POST'
  params?: Record<string, any>
  labelKey?: string          // 响应数据中作为 label 的字段
  valueKey?: string          // 响应数据中作为 value 的字段
  // 依赖其他字段时重新请求（如省市区联动）
  dependsOn?: string
}

// 字段列表项配置（用于 ListField 中每个子字段）
export interface ListSubField {
  name: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: FieldOption[]
  rules?: ValidateRule[]
  width?: number             // 列宽（百分比）
}

// 单个字段的完整描述
export interface FieldSchema {
  name: string               // 字段名（对应 model 的 key）
  label: string              // 显示名称
  type:
    | 'text'
    | 'number'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'daterange'
    | 'switch'
    | 'upload'
    | 'list'                 // 动态增减行
    | 'custom'               // 自定义（使用插槽）
  placeholder?: string
  defaultValue?: any
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean            // 初始隐藏
  options?: FieldOption[]    // 静态选项
  remote?: RemoteSource      // 远程数据源
  rules?: ValidateRule[]     // 校验规则
  linkage?: LinkageCondition[]  // 联动规则
  subFields?: ListSubField[] // type 为 list 时的子字段配置
  maxRows?: number           // list 类型最大行数
  minRows?: number           // list 类型最小行数
  span?: number              // Grid 占位（1-24，仿 Element Plus）
  tips?: string              // 字段提示信息
  // 上传相关
  accept?: string
  multiple?: boolean
  maxSize?: number           // 单位 MB
}

// 整个表单的 Schema
export interface FormSchema {
  fields: FieldSchema[]
  layout?: 'horizontal' | 'vertical'
  labelWidth?: number        // 单位 px
  columns?: 1 | 2 | 3 | 4   // 多列布局
  submitText?: string
  resetText?: string
  showReset?: boolean
}
```

---

## 五、DynamicForm 组件完整实现

```vue
<!-- components/DynamicForm/index.vue -->
<template>
  <form class="dynamic-form" :class="`layout-${schema.layout || 'vertical'}`" @submit.prevent="handleSubmit">
    <!-- 按 columns 分列布局 -->
    <div class="form-grid" :style="gridStyle">
      <template v-for="field in visibleFields" :key="field.name">
        <!-- 自定义字段：优先使用具名插槽 -->
        <div
          class="form-grid-item"
          :style="getItemStyle(field)"
        >
          <slot :name="`field-${field.name}`" :field="field" :value="innerModel[field.name]" :onChange="(v: any) => setFieldValue(field.name, v)">
            <!-- 默认渲染 FormItem + 对应类型字段 -->
            <FormItem
              :field="field"
              :error="errors[field.name]"
              :label-width="schema.labelWidth"
              :layout="schema.layout || 'vertical'"
            >
              <component
                :is="getFieldComponent(field.type)"
                :field="field"
                :value="innerModel[field.name]"
                :disabled="isFieldDisabled(field)"
                :options="fieldOptions[field.name]"
                :loading="optionsLoading[field.name]"
                @change="(v: any) => setFieldValue(field.name, v)"
              />
            </FormItem>
          </slot>
        </div>
      </template>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <slot name="actions" :submit="handleSubmit" :reset="handleReset">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '提交中...' : (schema.submitText || '提交') }}
        </button>
        <button v-if="schema.showReset !== false" type="button" class="btn btn-default" @click="handleReset">
          {{ schema.resetText || '重置' }}
        </button>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineProps, defineEmits, defineExpose } from 'vue'
import type { FormSchema, FieldSchema, FieldOption } from './types/dynamic-form'
import FormItem from './FormItem.vue'
import TextField from './fields/TextField.vue'
import NumberField from './fields/NumberField.vue'
import TextareaField from './fields/TextareaField.vue'
import SelectField from './fields/SelectField.vue'
import DateField from './fields/DateField.vue'
import SwitchField from './fields/SwitchField.vue'
import UploadField from './fields/UploadField.vue'
import ListField from './fields/ListField.vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  schema: FormSchema
  model: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:model', val: Record<string, any>): void
  (e: 'submit', val: Record<string, any>): void
  (e: 'change', field: string, val: any, model: Record<string, any>): void
  (e: 'validate-fail', errors: Record<string, string>): void
}>()

// ─── 内部状态 ─────────────────────────────────────────────────────────────────

// 深拷贝外部 model，避免直接修改父组件数据
const innerModel = ref<Record<string, any>>({})
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
// 每个字段的选项列表（可能来自 props.field.options 或远程加载）
const fieldOptions = ref<Record<string, FieldOption[]>>({})
const optionsLoading = ref<Record<string, boolean>>({})
// 记录哪些字段被联动隐藏
const hiddenFields = ref<Set<string>>(new Set())
// 记录哪些字段被联动禁用
const disabledFields = ref<Set<string>>(new Set())

// ─── 初始化 ───────────────────────────────────────────────────────────────────

const initModel = () => {
  const model: Record<string, any> = {}
  props.schema.fields.forEach(field => {
    // 优先使用外部传入的值，其次用 defaultValue，最后用类型默认值
    if (props.model[field.name] !== undefined) {
      model[field.name] = deepClone(props.model[field.name])
    } else if (field.defaultValue !== undefined) {
      model[field.name] = deepClone(field.defaultValue)
    } else {
      model[field.name] = getTypeDefaultValue(field.type)
    }
  })
  innerModel.value = model
}

const getTypeDefaultValue = (type: FieldSchema['type']) => {
  const defaults: Record<string, any> = {
    text: '',
    number: null,
    textarea: '',
    select: null,
    multiselect: [],
    date: null,
    daterange: [],
    switch: false,
    upload: [],
    list: [],
    custom: undefined,
  }
  return defaults[type] ?? ''
}

// ─── 联动系统 ─────────────────────────────────────────────────────────────────

// 当任意字段值变化时，重新计算联动
const evaluateLinkage = (changedField?: string) => {
  const newHidden = new Set<string>()
  const newDisabled = new Set<string>()

  props.schema.fields.forEach(field => {
    if (!field.linkage) return

    field.linkage.forEach(rule => {
      const depValue = innerModel.value[rule.field]
      const conditionMet = Array.isArray(rule.value)
        ? rule.value.includes(depValue)
        : depValue === rule.value

      if (conditionMet) {
        if (rule.action === 'hide') newHidden.add(field.name)
        if (rule.action === 'show') {/* 默认显示，不加入 hidden */}
        if (rule.action === 'disable') newDisabled.add(field.name)
        if (rule.action === 'enable') {/* 默认可用 */}
        if (rule.action === 'setValue' && rule.setValue !== undefined) {
          // 只有在触发字段变化时才执行 setValue，避免死循环
          if (changedField === rule.field) {
            setFieldValue(field.name, rule.setValue, false /* 不触发联动递归 */)
          }
        }
      } else {
        // 条件不满足，恢复原始状态
        if (rule.action === 'hide') {/* 不加入 hidden，即显示 */}
        if (rule.action === 'disable') {/* 不加入 disabled */}
      }
    })
  })

  hiddenFields.value = newHidden
  disabledFields.value = newDisabled
}

// ─── 远程数据源 ───────────────────────────────────────────────────────────────

const loadRemoteOptions = async (field: FieldSchema, triggerField?: string) => {
  if (!field.remote) return
  // 如果 dependsOn 指定了依赖字段，而不是由该字段触发，则跳过
  if (field.remote.dependsOn && triggerField && triggerField !== field.remote.dependsOn) return

  optionsLoading.value[field.name] = true
  try {
    const params = { ...field.remote.params }
    // 将依赖字段的值注入请求参数
    if (field.remote.dependsOn) {
      params[field.remote.dependsOn] = innerModel.value[field.remote.dependsOn]
    }

    const url = new URL(field.remote.url, window.location.origin)
    if (field.remote.method !== 'POST') {
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]))
    }

    const res = await fetch(url.toString(), {
      method: field.remote.method || 'GET',
      ...(field.remote.method === 'POST' ? {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      } : {})
    })
    const data = await res.json()

    const labelKey = field.remote.labelKey || 'label'
    const valueKey = field.remote.valueKey || 'value'
    const list = Array.isArray(data) ? data : (data.data || data.list || [])

    fieldOptions.value[field.name] = list.map((item: any) => ({
      label: item[labelKey],
      value: item[valueKey],
      disabled: item.disabled || false,
    }))
  } catch (e) {
    console.error(`[DynamicForm] 加载字段 "${field.name}" 的远程选项失败`, e)
    fieldOptions.value[field.name] = []
  } finally {
    optionsLoading.value[field.name] = false
  }
}

const initAllRemoteOptions = () => {
  props.schema.fields.forEach(field => {
    if (field.options) {
      fieldOptions.value[field.name] = field.options
    }
    if (field.remote && !field.remote.dependsOn) {
      loadRemoteOptions(field)
    }
  })
}

// ─── 字段值更新 ───────────────────────────────────────────────────────────────

const setFieldValue = (name: string, value: any, triggerLinkage = true) => {
  innerModel.value[name] = value
  // 清除该字段的错误
  if (errors.value[name]) {
    delete errors.value[name]
  }
  // 向父组件同步
  emit('update:model', deepClone(innerModel.value))
  emit('change', name, value, deepClone(innerModel.value))

  if (triggerLinkage) {
    evaluateLinkage(name)
    // 检查是否有远程选项依赖此字段，若有则重新加载
    props.schema.fields.forEach(field => {
      if (field.remote?.dependsOn === name) {
        // 依赖字段变化时，清空已选值
        setFieldValue(field.name, getTypeDefaultValue(field.type), false)
        loadRemoteOptions(field, name)
      }
    })
  }
}

// ─── 表单校验 ─────────────────────────────────────────────────────────────────

const validateField = async (field: FieldSchema): Promise<string | null> => {
  const value = innerModel.value[field.name]
  const rules = field.rules || []

  for (const rule of rules) {
    // 必填校验
    if (rule.required) {
      const isEmpty = value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (isEmpty) {
        return rule.message || `${field.label}不能为空`
      }
    }

    // 跳过空值的后续校验（非必填时）
    if (value === null || value === undefined || value === '') continue

    // 最小值/长度
    if (rule.min !== undefined) {
      const checkVal = typeof value === 'string' ? value.length : Number(value)
      if (checkVal < rule.min) {
        return rule.message || `${field.label}不能小于 ${rule.min}`
      }
    }

    // 最大值/长度
    if (rule.max !== undefined) {
      const checkVal = typeof value === 'string' ? value.length : Number(value)
      if (checkVal > rule.max) {
        return rule.message || `${field.label}不能大于 ${rule.max}`
      }
    }

    // 正则校验
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || `${field.label}格式不正确`
    }

    // 自定义校验（支持异步）
    if (rule.validator) {
      const result = await rule.validator(value, innerModel.value)
      if (result) return result
    }
  }

  return null
}

const validateAll = async (): Promise<boolean> => {
  const newErrors: Record<string, string> = {}
  // 只校验可见字段
  const fields = visibleFields.value

  await Promise.all(
    fields.map(async field => {
      const err = await validateField(field)
      if (err) newErrors[field.name] = err
    })
  )

  errors.value = newErrors
  if (Object.keys(newErrors).length > 0) {
    emit('validate-fail', newErrors)
    // 滚动到第一个错误字段
    const firstErrorField = document.querySelector('.form-item.has-error')
    firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  return true
}

// ─── 表单操作 ─────────────────────────────────────────────────────────────────

const handleSubmit = async () => {
  submitting.value = true
  try {
    const valid = await validateAll()
    if (valid) {
      emit('submit', deepClone(innerModel.value))
    }
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  initModel()
  errors.value = {}
  evaluateLinkage()
}

// ─── 计算属性 ─────────────────────────────────────────────────────────────────

// 过滤掉隐藏字段
const visibleFields = computed(() => {
  return props.schema.fields.filter(field => {
    if (field.hidden) return false
    if (hiddenFields.value.has(field.name)) return false
    return true
  })
})

const gridStyle = computed(() => {
  const cols = props.schema.columns || 1
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '16px 24px',
  }
})

const getItemStyle = (field: FieldSchema) => {
  if (!field.span) return {}
  return { gridColumn: `span ${field.span}` }
}

const isFieldDisabled = (field: FieldSchema) => {
  return field.disabled || disabledFields.value.has(field.name)
}

// 字段类型 → 组件映射
const FIELD_COMPONENT_MAP: Record<string, any> = {
  text: TextField,
  number: NumberField,
  textarea: TextareaField,
  select: SelectField,
  multiselect: SelectField,
  date: DateField,
  daterange: DateField,
  switch: SwitchField,
  upload: UploadField,
  list: ListField,
}

const getFieldComponent = (type: FieldSchema['type']) => {
  return FIELD_COMPONENT_MAP[type] || TextField
}

// ─── 监听外部 model 变化 ──────────────────────────────────────────────────────

watch(() => props.model, (newVal) => {
  // 外部数据变化时同步到内部（如编辑场景回填数据）
  props.schema.fields.forEach(field => {
    if (newVal[field.name] !== undefined) {
      innerModel.value[field.name] = deepClone(newVal[field.name])
    }
  })
  evaluateLinkage()
}, { deep: true })

// ─── 暴露方法给父组件 ─────────────────────────────────────────────────────────

defineExpose({
  validate: validateAll,
  reset: handleReset,
  getValues: () => deepClone(innerModel.value),
  setFieldValue,
})

// ─── 生命周期 ─────────────────────────────────────────────────────────────────

onMounted(() => {
  initModel()
  initAllRemoteOptions()
  evaluateLinkage()
})

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function deepClone<T>(val: T): T {
  if (val === null || typeof val !== 'object') return val
  return JSON.parse(JSON.stringify(val))
}
</script>
```

---

## 六、子组件：各类型字段渲染

以 `SelectField` 为例，它需要支持本地选项和远程加载两种模式：

```vue
<!-- components/DynamicForm/fields/SelectField.vue -->
<template>
  <div class="field-select" :class="{ loading: loading }">
    <select
      :value="modelValue"
      :disabled="disabled || loading"
      :multiple="field.type === 'multiselect'"
      class="select-input"
      @change="handleChange"
    >
      <option value="" disabled>{{ field.placeholder || `请选择${field.label}` }}</option>
      <option
        v-for="opt in displayOptions"
        :key="String(opt.value)"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </select>
    <span v-if="loading" class="loading-indicator">⟳ 加载中</span>
    <p v-if="field.tips" class="field-tips">{{ field.tips }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldSchema, FieldOption } from '../types/dynamic-form'

const props = defineProps<{
  field: FieldSchema
  value: any
  disabled: boolean
  options: FieldOption[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'change', val: any): void
}>()

// 优先使用父组件注入的 options（含远程加载结果），否则用 field 上静态定义的
const displayOptions = computed(() => {
  return props.options?.length ? props.options : (props.field.options || [])
})

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  if (props.field.type === 'multiselect') {
    const selected = Array.from(target.selectedOptions).map(o => o.value)
    emit('change', selected)
  } else {
    emit('change', target.value)
  }
}
</script>
```

`ListField`（动态增减行）的渲染逻辑稍复杂，见下一章节。

---

## 六.5、插槽系统：深度自定义字段渲染

通用业务组件的核心设计原则之一就是**渐进增强**——基础功能开箱即用，高级功能通过插槽按需扩展。DynamicForm 提供了完整的插槽体系，让调用者可以自定义任何字段的渲染逻辑，而无需 fork 代码。

### 6.5.1 插槽设计概览

DynamicForm 支持以下几种插槽类型：

| 插槽名 | 作用域参数 | 用途 |
|--------|-----------|------|
| `#field-{fieldName}` | `{ field, fieldConfig, value, modelValue, updateValue }` | 自定义单个字段渲染 |
| `#label-{fieldName}` | `{ field, label }` | 自定义字段标签 |
| `#error-{fieldName}` | `{ field, error }` | 自定义错误信息 |
| `#before` | 无 | 表单开头插入内容 |
| `#after` | 无 | 表单结尾插入内容 |
| `#footer` | `{ handleSubmit, handleReset }` | 底部操作区 |
| `#tip-{fieldName}` | `{ field }` | 字段提示信息 |

### 6.5.2 基础插槽使用

```vue
<template>
  <DynamicForm
    v-model="formData"
    :schema="schema"
    @submit="handleSubmit"
  >
    <!-- 表单开头：标题区域 -->
    <template #before>
      <div class="form-header">
        <h2>用户注册</h2>
        <p class="subtitle">请填写以下信息完成注册</p>
      </div>
    </template>

    <!-- 自定义用户名字段渲染 -->
    <template #field-userName="{ field, value, updateValue }">
      <div class="custom-input-wrapper">
        <el-input
          :model-value="value"
          :placeholder="field.placeholder"
          @update:model-value="updateValue"
          @blur="handleUsernameBlur"
        >
          <template #prefix>
            <i class="el-icon-user"></i>
          </template>
        </el-input>
        <span class="input-tip">支持中英文、数字、下划线</span>
      </div>
    </template>

    <!-- 自定义密码字段渲染（带强度指示器） -->
    <template #field-password="{ field, value, updateValue }">
      <div class="password-field">
        <el-input
          :model-value="value"
          type="password"
          show-password
          placeholder="请输入密码"
          @update:model-value="updateValue"
        />
        <PasswordStrengthIndicator :value="value" />
      </div>
    </template>

    <!-- 自定义头像上传字段 -->
    <template #field-avatar="{ field, value, updateValue }">
      <AvatarUploader
        :value="value"
        @change="(url) => updateValue(url)"
      />
    </template>

    <!-- 自定义协议复选框 -->
    <template #field-agreement="{ field, value, updateValue }">
      <el-checkbox
        :model-value="value"
        @update:model-value="updateValue"
      >
        我已阅读并同意 <a href="/agreement">《用户协议》</a> 和 <a href="/privacy">《隐私政策》</a>
      </el-checkbox>
    </template>

    <!-- 表单底部操作区 -->
    <template #footer="{ handleSubmit, handleReset }">
      <div class="form-actions">
        <el-button type="primary" size="large" @click="handleSubmit">
          立即注册
        </el-button>
        <el-button size="large" @click="handleReset">
          重置表单
        </el-button>
      </div>
      <p class="login-tip">已有账号？<a href="/login">立即登录</a></p>
    </template>

    <!-- 自定义协议复选框 -->
    <template #field-agreement="{ field, value, updateValue }">
      <el-checkbox
        :model-value="value"
        @update:model-value="updateValue"
      >
        我已阅读并同意 <a href="/agreement">《用户协议》</a> 和 <a href="/privacy">《隐私政策》</a>
      </el-checkbox>
    </template>

    <!-- 自定义条款详情插槽 -->
    <template #field-userName="{ field, value, updateValue }">
      <div class="username-field">
        <el-input
          :model-value="value"
          placeholder="请输入用户名"
          @update:model-value="updateValue"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </div>
    </template>
  </DynamicForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import DynamicForm from './DynamicForm.vue'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue'
import AvatarUploader from './AvatarUploader.vue'

const formData = ref({})

const schema = [
  {
    name: 'userName',
    label: '用户名',
    type: 'custom',  // 使用 custom 类型激活插槽
    span: 2,
    rules: [{ required: true, message: '请输入用户名' }]
  },
  {
    name: 'password',
    label: '密码',
    type: 'custom',
    span: 2,
    rules: [{ required: true, min: 8, message: '密码至少8位' }]
  },
  {
    name: 'avatar',
    label: '头像',
    type: 'custom',
    span: 1
  },
  {
    name: 'agreement',
    label: '',
    type: 'custom',
    span: 2
  }
]

function handleSubmit(values: any) {
  console.log('提交:', values)
}
</script>
```

### 6.5.3 高级：完整自定义字段组件

有时候插槽内的逻辑太复杂，需要抽成独立的子组件。以下是**省市级联选择器**的完整实现：

```vue
<!-- RegionCascader.vue -->
<template>
  <div class="region-cascader">
    <el-cascader
      v-model="selectedValue"
      :options="options"
      :props="cascaderProps"
      :placeholder="placeholder"
      clearable
      filterable
      @change="handleChange"
      @active-item-change="handleActiveChange"
    >
      <template #empty>
        <el-spin v-if="loading" />
        <span v-else>暂无数据</span>
      </template>
    </el-cascader>

    <!-- 详细地址输入（选完省市区后显示） -->
    <el-input
      v-if="showDetailInput"
      v-model="detailAddress"
      type="textarea"
      :rows="2"
      placeholder="请输入详细地址"
      class="detail-input"
      @blur="emit('update:modelValue', finalValue)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: any
  placeholder?: string
  level?: number  // 显示层级：2=省市区，3=省市区街道
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const selectedValue = ref<any[]>([])
const detailAddress = ref('')
const options = ref<any[]>([])
const loading = ref(false)

const cascaderProps = {
  expandTrigger: 'hover' as const,
  emitPath: true,
  checkStrictly: props.level === 3
}

const showDetailInput = computed(() =>
  selectedValue.value?.length >= (props.level || 3)
)

const finalValue = computed(() => ({
  region: selectedValue.value,
  detail: detailAddress.value
}))

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedValue.value = val.region || []
    detailAddress.value = val.detail || ''
  }
}, { immediate: true })

async function loadProvinces() {
  loading.value = true
  const data = await fetchProvinces()
  options.value = data.map(p => ({
    value: p.code,
    label: p.name,
    children: []
  }))
  loading.value = false
}

async function handleActiveChange(selected: string[]) {
  if (selected.length === 0) return
  const [provinceCode] = selected
  const province = options.value.find(o => o.value === provinceCode)
  if (province && province.children.length === 0) {
    const cities = await fetchCities(provinceCode)
    province.children = cities.map(c => ({
      value: c.code,
      label: c.name,
      children: props.level === 3 ? [] : undefined
    }))
  }
  if (selected.length === 1) return
  const cityCode = selected[1]
  const city = province.children.find(c => c.value === cityCode)
  if (city && props.level === 3 && city.children.length === 0) {
    const districts = await fetchDistricts(cityCode)
    city.children = districts.map(d => ({
      value: d.code,
      label: d.name
    }))
  }
}

function handleChange(value: any[]) {
  emit('update:modelValue', finalValue.value)
}

loadProvinces()
</script>

<style scoped>
.region-cascader {
  width: 100%;
}

.detail-input {
  margin-top: 12px;
}
</style>
```

在 DynamicForm 中使用：

```typescript
// 父组件注册子组件
import RegionCascader from './RegionCascader.vue'

// 在 schema 中配置
const schema = [
  {
    name: 'region',
    label: '收货地址',
    type: 'custom',
    span: 2,
    props: {
      placeholder: '请选择省市区',
      level: 3  // 省市区街道
    }
  }
]

// 注册到 components
<DynamicForm
  v-model="formData"
  :schema="schema"
  :components="{ RegionCascader }"
>
```

### 6.5.4 作用域插槽进阶：条件渲染

使用插槽实现更复杂的条件渲染逻辑：

```vue
<template #field-contractType="{ field, value, updateValue }">
  <div class="contract-type-selector">
    <el-radio-group
      :model-value="value"
      @update:model-value="updateValue"
    >
      <el-radio-button label="permanent">正式合同</el-radio-button>
      <el-radio-button label="temporary">临时合同</el-radio-button>
      <el-radio-button label="project">项目合同</el-radio-button>
    </el-radio-group>

    <!-- 根据选择动态显示提示 -->
    <div class="contract-hint" :class="value">
      <template v-if="value === 'permanent'">
        <el-icon><InfoFilled /></el-icon>
        正式合同期限为3年，试用期6个月
      </template>
      <template v-else-if="value === 'temporary'">
        <el-icon><Warning /></el-icon>
        临时合同最长期限为6个月
      </template>
      <template v-else>
        <el-icon><Clock /></el-icon>
        项目结束后合同自动终止
      </template>
    </div>
  </div>
</template>

<template #field-salary="{ field, value, updateValue, modelValue }">
  <div class="salary-input">
    <el-input-number
      :model-value="value"
      :min="0"
      :precision="2"
      :controls="false"
      @update:model-value="updateValue"
    />

    <!-- 当合同类型为项目合同时，显示提成选项 -->
    <template v-if="modelValue.contractType === 'project'">
      <el-select
        v-model="commissionType"
        placeholder="提成方式"
        class="commission-select"
      >
        <el-option label="固定提成" value="fixed" />
        <el-option label="百分比提成" value="percentage" />
      </el-select>

      <el-input-number
        v-if="commissionType === 'fixed'"
        v-model="commissionAmount"
        :min="0"
        :precision="2"
        placeholder="提成金额"
      />
      <el-input-number
        v-if="commissionType === 'percentage'"
        v-model="commissionRate"
        :min="0"
        :max="100"
        :precision="2"
        placeholder="提成比例"
      />
      <span v-if="commissionType === 'percentage'" class="unit">%</span>
    </template>
  </div>
</template>
```

### 6.5.5 插槽与 Props 的协同设计

最佳实践：**插槽负责布局，Props 负责行为**。

```vue
<!-- 不好：插槽内包含太多行为逻辑 -->
<template #field-product="{ field, value, updateValue }">
  <div>
    <!-- 太多逻辑混在一起 -->
    <el-select v-model="value" @change="复杂逻辑...">
      ...
    </el-select>
    <el-button @click="打开弹窗">选择商品</el-button>
    <div>{{ 计算结果 }}</div>
  </div>
</template>

<!-- 好：抽成子组件 -->
<template #field-product="{ field, value, updateValue }">
  <ProductSelector
    :value="value"
    @select="updateValue"
  />
</template>

<!-- ProductSelector 内部处理所有复杂逻辑 -->
<script setup>
// 内部管理自己的状态和行为
// 通过 emit 暴露简洁的事件给父插槽
</script>
```

### 6.5.6 插槽性能优化

插槽每次父组件重渲染都会重新执行，复杂插槽可能导致性能问题：

```typescript
// 优化1：使用 computed 缓存计算结果
const computedSlots = computed(() => ({
  header: () => h('div', { class: 'header' }, '标题'),
  footer: () => h('div', { class: 'footer' }, computedFooter.value)
}))

// 优化2：v-memo 减少不必要的重渲染
<template v-memo="[fieldConfig.name]">
  <template #field-userName="{ value }">
    <!-- 只有 value 变化时才重渲染 -->
    <ComplexRender :value="value" />
  </template>
</template>

// 优化3：懒加载插槽内容
const LazySlot = defineAsyncComponent(() =>
  import('./ComplexField.vue')
)
```

### 6.5.7 插槽文档化

为插槽编写清晰的 JSDoc 注释：

```typescript
/**
 * ## 插槽系统
 *
 * DynamicForm 通过作用域插槽提供完整的字段自定义能力。
 * 所有字段插槽都以 `field-` 或 `label-` 前缀命名，便于识别。
 *
 * ### 通用插槽参数
 * ```ts
 * interface SlotScope {
 *   field: FieldConfig        // 字段配置对象
 *   fieldConfig: FieldConfig  // 同上，兼容别名
 *   value: any               // 当前字段值
 *   modelValue: object       // 整个表单的值对象
 *   updateValue: (val: any) => void  // 更新当前字段值
 *   setFieldValue: (name: string, val: any) => void  // 更新任意字段值
 *   getFieldValue: (name: string) => any  // 获取任意字段值
 *   validate: (name?: string) => Promise  // 触发表单校验
 *   errors: Record<string, string>  // 当前所有校验错误
 *   loading: Record<string, boolean>  // 字段级加载状态
 * }
 * ```
 *
 * ### 使用示例
 * ```vue
 * <DynamicForm :schema="schema">
 *   <template #field-userName="{ value, updateValue }">
 *     <CustomInput :value="value" @change="updateValue" />
 *   </template>
 * </DynamicForm>
 * ```
 *
 * @slot before - 表单开头插入内容
 * @slot after - 表单结尾插入内容
 * @slot footer - 底部操作区
 * @slot #field-{name} - 自定义字段渲染
 * @slot #label-{name} - 自定义字段标签
 * @slot #error-{name} - 自定义错误信息
 * @slot #tip-{name} - 字段提示信息
 */
```

---

## 七、联动控制实现

在第五章的 `evaluateLinkage` 函数中，我们已经实现了核心逻辑。这里演示完整的使用场景：

```typescript
// 父组件中的 schema 配置示例

const formSchema: FormSchema = {
  fields: [
    {
      name: 'contractType',
      label: '合同类型',
      type: 'select',
      options: [
        { label: '固定期限', value: 'fixed' },
        { label: '无固定期限', value: 'permanent' },
        { label: '实习协议', value: 'intern' },
      ],
      rules: [{ required: true, message: '请选择合同类型' }]
    },
    {
      name: 'endDate',
      label: '合同结束日期',
      type: 'date',
      // 联动：只有 contractType 为 fixed 时才显示
      linkage: [{
        field: 'contractType',
        value: 'fixed',
        action: 'show'
      }, {
        field: 'contractType',
        value: ['permanent', 'intern'],  // 多值触发
        action: 'hide'
      }],
      rules: [{ required: true }]
    },
    {
      name: 'internSchool',
      label: '实习学校',
      type: 'text',
      linkage: [{
        field: 'contractType',
        value: 'intern',
        action: 'show'
      }, {
        field: 'contractType',
        value: ['fixed', 'permanent'],
        action: 'hide'
      }, {
        // 切换回非 intern 时自动清空
        field: 'contractType',
        value: ['fixed', 'permanent'],
        action: 'setValue',
        setValue: ''
      }]
    },
    {
      name: 'salaryType',
      label: '薪资结构',
      type: 'select',
      options: [
        { label: '固定薪资', value: 'fixed' },
        { label: '底薪+提成', value: 'commission' },
      ]
    },
    {
      name: 'commissionRate',
      label: '提成比例(%)',
      type: 'number',
      linkage: [{
        field: 'salaryType',
        value: 'commission',
        action: 'show'
      }, {
        field: 'salaryType',
        value: 'fixed',
        action: 'hide'
      }],
      rules: [{ min: 0, max: 100, message: '提成比例需在 0~100 之间' }]
    }
  ]
}
```

---

## 八、动态增减行（子表单）

`ListField` 是整个组件中逻辑最复杂的部分，它实现了行级的增减、拖拽排序和每行独立校验：

```vue
<!-- components/DynamicForm/fields/ListField.vue -->
<template>
  <div class="list-field">
    <!-- 行列表 -->
    <div
      v-for="(row, rowIndex) in localList"
      :key="row.__id"
      class="list-row"
      :class="{ 'row-error': rowErrors[rowIndex] }"
    >
      <!-- 每行的子字段 -->
      <div
        v-for="subField in field.subFields"
        :key="subField.name"
        class="list-row-cell"
        :style="{ width: subField.width ? `${subField.width}%` : 'auto' }"
      >
        <label class="sub-label">{{ subField.label }}</label>
        <!-- 根据子字段类型渲染 -->
        <input
          v-if="subField.type === 'text' || subField.type === 'number'"
          :type="subField.type"
          :value="row[subField.name]"
          class="sub-input"
          :class="{ 'sub-input-error': rowErrors[rowIndex]?.[subField.name] }"
          @input="(e) => updateCell(rowIndex, subField.name, (e.target as HTMLInputElement).value)"
        />
        <select
          v-else-if="subField.type === 'select'"
          :value="row[subField.name]"
          class="sub-input"
          @change="(e) => updateCell(rowIndex, subField.name, (e.target as HTMLSelectElement).value)"
        >
          <option
            v-for="opt in subField.options"
            :key="String(opt.value)"
            :value="opt.value"
          >{{ opt.label }}</option>
        </select>
        <!-- 行级错误提示 -->
        <span v-if="rowErrors[rowIndex]?.[subField.name]" class="sub-error">
          {{ rowErrors[rowIndex][subField.name] }}
        </span>
      </div>

      <!-- 行操作：删除 -->
      <button
        type="button"
        class="row-delete-btn"
        :disabled="localList.length <= (field.minRows || 0)"
        @click="deleteRow(rowIndex)"
        title="删除此行"
      >✕</button>
    </div>

    <!-- 为空时的占位 -->
    <div v-if="localList.length === 0" class="list-empty">暂无数据，请添加</div>

    <!-- 添加按钮 -->
    <button
      type="button"
      class="add-row-btn"
      :disabled="!!field.maxRows && localList.length >= field.maxRows"
      @click="addRow"
    >
      + 添加一行
      <span v-if="field.maxRows" class="row-count">
        ({{ localList.length }}/{{ field.maxRows }})
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FieldSchema } from '../types/dynamic-form'

const props = defineProps<{
  field: FieldSchema
  value: Record<string, any>[]
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'change', val: Record<string, any>[]): void
}>()

// 为每行添加唯一 ID（便于 v-for 追踪）
let idCounter = 0
const withId = (row: Record<string, any>) => ({ ...row, __id: ++idCounter })

const localList = ref<(Record<string, any> & { __id: number })[]>(
  (props.value || []).map(withId)
)

const rowErrors = ref<Record<number, Record<string, string>>>({})

const addRow = () => {
  if (props.field.maxRows && localList.value.length >= props.field.maxRows) return
  // 生成空行，按 subFields 初始化默认值
  const newRow: Record<string, any> = {}
  props.field.subFields?.forEach(sf => {
    newRow[sf.name] = sf.type === 'number' ? null : ''
  })
  localList.value.push(withId(newRow))
  emitChange()
}

const deleteRow = (index: number) => {
  if (props.field.minRows && localList.value.length <= props.field.minRows) return
  localList.value.splice(index, 1)
  // 清除该行错误
  delete rowErrors.value[index]
  emitChange()
}

const updateCell = (rowIndex: number, fieldName: string, value: any) => {
  localList.value[rowIndex][fieldName] = value
  // 实时清除该格错误
  if (rowErrors.value[rowIndex]) {
    delete rowErrors.value[rowIndex][fieldName]
  }
  emitChange()
}

const emitChange = () => {
  // 去掉内部 __id，只暴露业务数据
  const cleanData = localList.value.map(({ __id, ...rest }) => rest)
  emit('change', cleanData)
}

// 行级校验（供父组件的 validateAll 调用时透传）
const validateRows = async () => {
  const errs: Record<number, Record<string, string>> = {}
  for (let i = 0; i < localList.value.length; i++) {
    const row = localList.value[i]
    for (const sf of (props.field.subFields || [])) {
      for (const rule of (sf.rules || [])) {
        const val = row[sf.name]
        if (rule.required && (val === null || val === undefined || val === '')) {
          if (!errs[i]) errs[i] = {}
          errs[i][sf.name] = rule.message || `${sf.label}不能为空`
          break
        }
      }
    }
  }
  rowErrors.value = errs
  return Object.keys(errs).length === 0
}

defineExpose({ validateRows })

watch(() => props.value, (newVal) => {
  if (newVal) {
    localList.value = newVal.map(withId)
  }
}, { deep: true })
</script>
```

---

## 九、远程数据源（异步选项）

在第五章 `DynamicForm` 中，`loadRemoteOptions` 函数已实现完整的远程加载逻辑。这里演示一个**省市联动**的真实配置：

```typescript
const addressSchema: FormSchema = {
  columns: 3,
  fields: [
    {
      name: 'province',
      label: '省份',
      type: 'select',
      remote: {
        url: '/api/regions',
        params: { level: 1 },
        labelKey: 'name',
        valueKey: 'code',
      },
      rules: [{ required: true }]
    },
    {
      name: 'city',
      label: '城市',
      type: 'select',
      remote: {
        url: '/api/regions',
        params: { level: 2 },
        labelKey: 'name',
        valueKey: 'code',
        dependsOn: 'province',  // 依赖省份，省份变化时重新请求
      },
      rules: [{ required: true }]
    },
    {
      name: 'district',
      label: '区县',
      type: 'select',
      remote: {
        url: '/api/regions',
        params: { level: 3 },
        labelKey: 'name',
        valueKey: 'code',
        dependsOn: 'city',
      },
      rules: [{ required: true }]
    }
  ]
}
```

当 `province` 字段值变化时，`DynamicForm` 内部会自动：
1. 清空 `city` 的已选值
2. 携带新的 `province` 值重新请求 `/api/regions?level=2&province=xxx`
3. 同样地，`city` 变化也会触发 `district` 重新加载

整个联动过程对父组件完全透明，只需要在 `schema` 中声明依赖关系即可。

---

## 十、表单校验系统

### 10.1 内置规则使用

```typescript
const formSchema: FormSchema = {
  fields: [
    {
      name: 'phone',
      label: '手机号',
      type: 'text',
      rules: [
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
      ]
    },
    {
      name: 'idCard',
      label: '身份证号',
      type: 'text',
      rules: [
        { required: true },
        { min: 18, max: 18, message: '身份证号必须为18位' },
        {
          pattern: /^\d{17}[\dX]$/i,
          message: '身份证号格式错误'
        }
      ]
    },
    {
      name: 'salary',
      label: '薪资(元)',
      type: 'number',
      rules: [
        { required: true },
        { min: 3000, message: '薪资不得低于3000元' },
        { max: 999999, message: '薪资不得超过999999元' }
      ]
    }
  ]
}
```

### 10.2 异步校验（查重）

```typescript
const registerSchema: FormSchema = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'text',
      rules: [
        { required: true },
        { min: 3, max: 20, message: '用户名长度为 3~20 个字符' },
        {
          // 异步校验：调用接口验证用户名是否已被占用
          validator: async (value) => {
            const res = await fetch(`/api/check-username?name=${value}`)
            const { exists } = await res.json()
            if (exists) return '该用户名已被占用，请换一个'
          }
        }
      ]
    },
    {
      name: 'password',
      label: '密码',
      type: 'text',
      rules: [
        { required: true },
        {
          pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          message: '密码至少8位，需包含字母和数字'
        }
      ]
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      type: 'text',
      rules: [
        { required: true },
        {
          // 跨字段校验：与 password 字段进行比对
          validator: (value, formData) => {
            if (value !== formData.password) return '两次输入的密码不一致'
          }
        }
      ]
    }
  ]
}
```

---

## 十一、父组件调用示例

### 11.1 新增表单

```vue
<!-- pages/AddEmployee.vue -->
<template>
  <div class="page">
    <h2>新增员工</h2>
    <DynamicForm
      ref="formRef"
      :schema="employeeSchema"
      v-model:model="formData"
      @submit="handleSubmit"
      @change="handleFieldChange"
    >
      <!-- 自定义"合同附件"字段的渲染 -->
      <template #field-attachment="{ field, value, onChange }">
        <div class="custom-upload-field">
          <label>{{ field.label }}</label>
          <MyCustomUploader
            :value="value"
            :accept="field.accept"
            @change="onChange"
          />
        </div>
      </template>

      <!-- 自定义操作按钮区域 -->
      <template #actions="{ submit, reset }">
        <button type="button" @click="saveDraft">保存草稿</button>
        <button type="button" @click="reset">重置</button>
        <button type="button" @click="submit" class="primary">提交</button>
      </template>
    </DynamicForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DynamicForm from '@/components/DynamicForm/index.vue'
import type { FormSchema } from '@/components/DynamicForm/types/dynamic-form'

const formRef = ref()
const formData = ref<Record<string, any>>({})

const employeeSchema: FormSchema = {
  columns: 2,
  labelWidth: 120,
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'text',
      rules: [{ required: true }, { min: 2, max: 10 }],
      span: 1
    },
    {
      name: 'gender',
      label: '性别',
      type: 'select',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ],
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'department',
      label: '所属部门',
      type: 'select',
      remote: {
        url: '/api/departments',
        labelKey: 'deptName',
        valueKey: 'deptId'
      },
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'position',
      label: '职位',
      type: 'select',
      remote: {
        url: '/api/positions',
        labelKey: 'posName',
        valueKey: 'posId',
        dependsOn: 'department'  // 依赖部门
      },
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'entryDate',
      label: '入职日期',
      type: 'date',
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'contractType',
      label: '合同类型',
      type: 'select',
      options: [
        { label: '固定期限', value: 'fixed' },
        { label: '无固定期限', value: 'permanent' }
      ],
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'contractEnd',
      label: '合同到期日',
      type: 'date',
      linkage: [
        { field: 'contractType', value: 'fixed', action: 'show' },
        { field: 'contractType', value: 'permanent', action: 'hide' }
      ],
      rules: [{ required: true }],
      span: 1
    },
    {
      name: 'emergencyContacts',
      label: '紧急联系人',
      type: 'list',
      minRows: 1,
      maxRows: 3,
      span: 2,  // 占两列
      subFields: [
        { name: 'name', label: '姓名', type: 'text', width: 25, rules: [{ required: true }] },
        { name: 'relationship', label: '关系', type: 'select', width: 20,
          options: [
            { label: '父母', value: 'parent' },
            { label: '配偶', value: 'spouse' },
            { label: '兄弟姐妹', value: 'sibling' }
          ],
          rules: [{ required: true }]
        },
        { name: 'phone', label: '电话', type: 'text', width: 30, rules: [{ required: true }] },
        { name: 'remark', label: '备注', type: 'text', width: 25 }
      ]
    },
    {
      name: 'attachment',
      label: '合同附件',
      type: 'custom',   // 使用插槽自定义渲染
      accept: '.pdf,.docx',
      span: 2
    }
  ]
}

const handleSubmit = async (data: Record<string, any>) => {
  console.log('提交数据：', data)
  await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

const handleFieldChange = (field: string, value: any) => {
  console.log(`字段 [${field}] 变更为：`, value)
}

const saveDraft = async () => {
  // 不校验直接保存草稿
  const data = formRef.value?.getValues()
  await fetch('/api/employees/draft', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
</script>
```

### 11.2 编辑回填数据

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const formData = ref({})

onMounted(async () => {
  // 获取已有数据，直接赋给 formData
  // DynamicForm 内部会通过 watch 监听并同步到 innerModel
  const res = await fetch(`/api/employees/${route.params.id}`)
  formData.value = await res.json()
})
</script>
```

### 11.3 外部触发校验（多步骤表单场景）

```vue
<script setup lang="ts">
const formRef = ref()

// 下一步时手动触发校验
const nextStep = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    currentStep.value++
  }
}

// 获取当前表单数据
const getStepData = () => {
  return formRef.value?.getValues()
}
</script>
```

---

## 十二、进阶：组件测试与文档化

### 12.1 单元测试（Vitest + Vue Test Utils）

```typescript
// tests/DynamicForm.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import DynamicForm from '@/components/DynamicForm/index.vue'
import type { FormSchema } from '@/components/DynamicForm/types/dynamic-form'

const basicSchema: FormSchema = {
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'text',
      rules: [{ required: true, message: '姓名不能为空' }]
    },
    {
      name: 'type',
      label: '类型',
      type: 'select',
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' }
      ]
    },
    {
      name: 'subField',
      label: '子字段',
      type: 'text',
      linkage: [
        { field: 'type', value: 'a', action: 'show' },
        { field: 'type', value: 'b', action: 'hide' }
      ]
    }
  ]
}

describe('DynamicForm', () => {
  it('必填校验失败时显示错误信息', async () => {
    const wrapper = mount(DynamicForm, {
      props: { schema: basicSchema, model: {} }
    })

    // 触发提交
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // 应该显示错误信息
    expect(wrapper.text()).toContain('姓名不能为空')
  })

  it('联动：type=b 时 subField 应隐藏', async () => {
    const wrapper = mount(DynamicForm, {
      props: {
        schema: basicSchema,
        model: { type: 'b' }
      }
    })

    await wrapper.vm.$nextTick()
    // subField 对应的表单项不应在 DOM 中
    const labels = wrapper.findAll('label')
    const labelTexts = labels.map(l => l.text())
    expect(labelTexts).not.toContain('子字段')
  })

  it('emit change 事件', async () => {
    const wrapper = mount(DynamicForm, {
      props: { schema: basicSchema, model: {} }
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('张三')

    expect(wrapper.emitted('change')?.[0]).toEqual(['name', '张三', expect.any(Object)])
  })
})
```

### 12.2 用 JSDoc 注释提升 IDE 智能提示

```typescript
/**
 * 单个表单字段的描述配置
 * @example
 * const field: FieldSchema = {
 *   name: 'username',
 *   label: '用户名',
 *   type: 'text',
 *   rules: [{ required: true }]
 * }
 */
export interface FieldSchema {
  /** 字段唯一标识，对应 model 的 key */
  name: string
  /** 表单项标签文本 */
  label: string
  /** 
   * 字段渲染类型
   * - text/number/textarea: 输入类
   * - select/multiselect: 选择类
   * - date/daterange: 日期类
   * - switch: 开关
   * - upload: 文件上传
   * - list: 动态增减行
   * - custom: 自定义插槽
   */
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' |
        'date' | 'daterange' | 'switch' | 'upload' | 'list' | 'custom'
  // ... 其余字段
}
```

---

## 十三、通用业务组件开发核心原则

通过本文的案例，总结出开发通用业务组件时需遵循的核心原则：

| 原则 | 说明 | 本案例体现 |
|------|------|-----------|
| **契约优先** | 先定义 TypeScript 类型，再写实现 | `types/dynamic-form.ts` |
| **配置驱动** | 外部通过配置控制行为，组件不感知业务细节 | `schema` 描述一切 |
| **单向数据流** | Props 下行，Events 上行，内部深拷贝 | `innerModel` + `emit('update:model')` |
| **关注点分离** | 校验、联动、远程加载分别独立处理 | 各自独立函数 |
| **渐进增强** | 基础功能开箱即用，高级功能按需开启 | 插槽、自定义校验均可选 |
| **暴露 API** | 通过 `defineExpose` 给父组件提供命令式接口 | `validate()`、`getValues()` |
| **可测试性** | 纯函数逻辑易于单元测试，状态可注入 | 分离 validateField 逻辑 |

> **一句话总结**：通用业务组件的本质是把**变化的部分（业务配置）**外置给调用者，把**不变的部分（渲染逻辑、交互规则）**封装在内部。Schema 驱动 + 插槽扩展 + 暴露 API 是三大核心武器。
