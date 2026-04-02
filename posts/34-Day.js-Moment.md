# Day.js & Moment.js 完整指南

> 前端时间处理最全攻略，新项目推荐 Day.js

## 目录
- [一、选型建议](#一选型建议)
- [二、Day.js 安装与配置](#二dayjs-安装与配置)
- [三、创建日期对象](#三创建日期对象)
- [四、格式化输出](#四格式化输出)
- [五、日期计算](#五日期计算)
- [六、获取与设置](#六获取与设置)
- [七、比较与判断](#七比较与判断)
- [八、相对时间（几分钟前）](#八相对时间几分钟前)
- [九、时区处理](#九时区处理)
- [十、实用场景示例](#十实用场景示例)

---
## 一、选型建议

| | Day.js | Moment.js |
|---|---|---|
| 包大小 | ~2kb | ~67kb |
| API 风格 | 不可变（immutable） | 可变（mutable） |
| Tree-shaking | 支持 | 不支持 |
| 维护状态 | 活跃 | 仅维护，不新增功能 |
| 推荐程度 | ⭐⭐⭐⭐⭐ | 老项目维护 |

**结论：新项目统一使用 Day.js，Moment.js 仅用于维护旧项目。**

---

## 二、Day.js 安装与配置

```bash
npm install dayjs
```

```js
import dayjs from 'dayjs'

// 中文语言包
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

// 常用插件
import relativeTime from 'dayjs/plugin/relativeTime'      // 相对时间
import duration from 'dayjs/plugin/duration'              // 时长
import isBetween from 'dayjs/plugin/isBetween'            // 区间判断
import weekday from 'dayjs/plugin/weekday'                // 周相关
import customParseFormat from 'dayjs/plugin/customParseFormat' // 自定义解析
import timezone from 'dayjs/plugin/timezone'              // 时区
import utc from 'dayjs/plugin/utc'                       // UTC

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
```

---

## 三、创建日期对象

```js
import dayjs from 'dayjs'

// 当前时间
const now = dayjs()

// 从字符串解析
dayjs('2024-01-15')
dayjs('2024-01-15 14:30:00')

// 从时间戳
dayjs(1705327800000)          // 毫秒时间戳
dayjs.unix(1705327800)        // 秒时间戳

// 从 Date 对象
dayjs(new Date())

// 自定义格式解析（需要 customParseFormat 插件）
dayjs('15/01/2024', 'DD/MM/YYYY')
dayjs('2024年01月15日', 'YYYY年MM月DD日')
```

---

## 四、格式化输出

```js
const d = dayjs('2024-01-15 14:30:05')

d.format('YYYY-MM-DD')           // '2024-01-15'
d.format('YYYY/MM/DD HH:mm:ss') // '2024/01/15 14:30:05'
d.format('YYYY年MM月DD日')       // '2024年01月15日'
d.format('dddd')                 // '星期一'（需要中文 locale）
d.format('D日 MMMM YYYY')       // '15日 一月 2024'

// 常用格式符
// YYYY 四位年，YY 两位年
// MM 月份，M 不补零
// DD 日期，D 不补零
// HH 24小时，hh 12小时
// mm 分钟，ss 秒
// dddd 星期全称，ddd 简称，d 数字(0-6)
// A 上午/下午，a 小写
```

---

## 五、日期计算

```js
const d = dayjs('2024-01-15')

// 加法（返回新对象，不修改原始）
d.add(1, 'day')     // 加1天
d.add(2, 'month')   // 加2个月
d.add(1, 'year')    // 加1年
d.add(3, 'hour')    // 加3小时

// 减法
d.subtract(7, 'day')
d.subtract(1, 'month')

// 链式调用
d.add(1, 'month').subtract(2, 'day').format('YYYY-MM-DD')

// 时间单位：'year'|'month'|'week'|'day'|'hour'|'minute'|'second'|'millisecond'
```

---

## 六、获取与设置

```js
const d = dayjs('2024-01-15 14:30:05')

// 获取
d.year()        // 2024
d.month()       // 0（注意：月份从0开始，0=1月）
d.date()        // 15（月中的日）
d.day()         // 1（星期，0=周日）
d.hour()        // 14
d.minute()      // 30
d.second()      // 5
d.valueOf()     // 时间戳（毫秒）
d.unix()        // 时间戳（秒）
d.toDate()      // 转为原生 Date 对象
d.toISOString() // ISO 格式字符串

// 设置（返回新对象）
d.set('year', 2025)
d.set('month', 5)  // 6月（0-indexed）
d.set('date', 1)   // 1号

// 快捷方式
d.year(2025)
d.month(5)
d.date(1)
```

---

## 七、比较与判断

```js
const a = dayjs('2024-01-15')
const b = dayjs('2024-06-01')

a.isBefore(b)           // true
a.isAfter(b)            // false
a.isSame(a)             // true
a.isSame(b, 'year')     // true（同年）
a.isSame(b, 'month')    // false（不同月）

// 区间判断（需要 isBetween 插件）
const target = dayjs('2024-03-01')
target.isBetween(a, b)        // true
target.isBetween(a, b, 'month', '[]')  // 包含边界

dayjs.isDayjs(a)  // true（判断是否是 dayjs 对象）
a.isValid()       // true（是否是有效日期）
```

---

## 八、相对时间（几分钟前）

```js
// 需要 relativeTime 插件 + 中文 locale
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

dayjs('2024-01-01').fromNow()  // '几个月前'
dayjs().to(dayjs('2025-12-31')) // '2年内'

// 实际场景：评论时间显示
function timeAgo(timestamp: number): string {
  return dayjs(timestamp).fromNow()
  // 输出：'刚刚'、'3分钟前'、'2小时前'、'昨天'、'3天前'、'1个月前'
}
```

---

## 九、时区处理

```js
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

// 转换时区
dayjs().tz('Asia/Shanghai').format()    // 上海时间
dayjs().tz('America/New_York').format() // 纽约时间

// UTC 操作
dayjs.utc('2024-01-15').format()  // UTC 时间
dayjs().utc().toISOString()       // ISO UTC 格式
```

---

## 十、实用场景示例

### 月历生成

```js
function getCalendarDays(year: number, month: number) {
  const firstDay = dayjs(`${year}-${month}-01`)
  const daysInMonth = firstDay.daysInMonth()
  const startWeekday = firstDay.day() // 0=周日

  const days = []
  // 补全开头的空格（从周日开始）
  for (let i = 0; i < startWeekday; i++) days.push(null)
  // 填入当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(dayjs(`${year}-${month}-${i}`))
  }
  return days
}
```

### 倒计时

```js
function getCountdown(targetDate: string) {
  const target = dayjs(targetDate)
  const now = dayjs()
  const diff = target.diff(now)
  
  if (diff <= 0) return '已结束'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`
}
```

### 日期范围

```js
// 获取本周的开始和结束（周一到周日）
const weekStart = dayjs().startOf('week').add(1, 'day') // 周一
const weekEnd = dayjs().endOf('week').add(1, 'day')     // 周日

// 获取本月的所有日期
const monthStart = dayjs().startOf('month')
const monthEnd = dayjs().endOf('month')
const daysInMonth = monthEnd.date()
const allDays = Array.from({ length: daysInMonth }, (_, i) =>
  monthStart.add(i, 'day').format('YYYY-MM-DD')
)
```
