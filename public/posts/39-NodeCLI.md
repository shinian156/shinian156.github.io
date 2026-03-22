# 使用 Node.js 构建 CLI 工具

> 从零搭建命令行工具，支持交互式问答、参数解析、色彩输出、进度条、自动安装

## 目录

1. [CLI 基本原理](#一cli-基本原理)
2. [项目初始化](#二项目初始化)
3. [Commander 参数解析](#三commander-参数解析)
4. [Inquirer 交互问答](#四inquirer-交互问答)
5. [Chalk 色彩输出](#五chalk-色彩输出)
6. [Ora 进度指示器](#六ora-进度指示器)
7. [Shell 命令执行](#七shell-命令执行)
8. [项目脚手架实战](#八项目脚手架实战)
9. [npm 发布与使用](#九npm-发布与使用)
10. [常见问题](#十常见问题)

---

## 一、CLI 基本原理

CLI（Command Line Interface）本质是**接收命令行参数 → 执行逻辑 → 输出结果**。

```bash
# 用户输入
$ mycli --name 张三 --age 25 init

# 解析参数
{ name: '张三', age: 25, command: 'init' }
```

**实现原理：**
- `#!/usr/bin/env node`（shebang）：告诉系统用 Node.js 执行此脚本
- `process.argv`：接收用户传入的参数
- `stdin/stdout/stderr`：读取输入和输出

---

## 二、项目初始化

```bash
mkdir my-cli && cd my-cli
npm init -y
npm install commander inquirer chalk ora cli-table3 download-git-repo

# 开启 bin 命令
npm install --save-dev @types/node
```

**package.json 配置 bin：**

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "mycli": "./bin/index.js"
  },
  "preferGlobal": true
}
```

**创建入口文件：**

```bash
mkdir bin && touch bin/index.js
chmod +x bin/index.js
```

```javascript
#!/usr/bin/env node
console.log('CLI 启动成功！');
```

---

## 三、Commander 参数解析

Commander 是最流行的命令行参数解析库。

```bash
npm install commander
```

### 基础用法

```javascript
const { program } = require('commander');

program
  .name('mycli')
  .description('一个示例 CLI 工具')
  .version('1.0.0');

// 定义命令
program
  .command('init <project>')
  .description('初始化项目')
  .option('-t, --template <type>', '选择模板', 'default')
  .option('-s, --skip-install', '跳过安装依赖')
  .action((project, options) => {
    console.log('初始化项目:', project);
    console.log('模板:', options.template);
  });

program.parse();
```

### 选项类型

```javascript
// 布尔选项
.option('-d, --debug', '开启调试模式')

// 带默认值
.option('-p, --port <number>', '端口号', 3000)

// 可选值
.option('-e, --env <environment>', '环境', /^(dev|prod|test)$/i, 'dev')

// 多次使用
.option('-c, --config <path>', '配置文件', collect, [])

function collect(value, previous) {
  return previous.concat(value);
}
```

### 子命令

```javascript
// 命令作为独立文件
program.command('install [packages]', { isDefault: true }).action(install);

// 或者使用子命令
const installCmd = program.command('install');
installCmd.option('--save', '保存到 dependencies');
installCmd.action(install);
```

---

## 四、Inquirer 交互问答

Inquirer 用于创建交互式命令行界面。

```bash
npm install inquirer
```

### 基础问答

```javascript
const inquirer = require('inquirer');

async function ask() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '项目名称:',
      default: 'my-project'
    },
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: '是否使用 TypeScript?',
      default: true
    },
    {
      type: 'list',
      name: 'framework',
      message: '选择前端框架:',
      choices: ['Vue', 'React', 'Angular', 'None']
    },
    {
      type: 'checkbox',
      name: 'features',
      message: '选择特性:',
      choices: ['ESLint', 'Prettier', 'Unit Test', 'E2E Test']
    }
  ]);
  
  console.log(answers);
}
```

### 密码输入

```javascript
{
  type: 'password',
  name: 'password',
  message: '输入密码:',
  mask: '*'
}
```

### 选择列表（带分组）

```javascript
{
  type: 'expand',
  name: 'action',
  message: '选择操作:',
  choices: [
    { key: 'y', name: '是', value: 'yes' },
    { key: 'n', name: '否', value: 'no' }
  ]
}
```

---

## 五、Chalk 色彩输出

Chalk 用于终端彩色输出。

```bash
npm install chalk
```

### 基础用法

```javascript
const chalk = require('chalk');

console.log(chalk.blue('蓝色文字'));
console.log(chalk.red.bold('红色粗体'));
console.log(chalk.green('成功') + chalk.white('进行中'));

// 组合使用
console.log(chalk.blue.bgRed.bold('醒目文字'));

// 模板字符串
console.log(chalk`
  CPU: {red ${cpu}}
  Memory: {green ${mem}}
  Disk: {yellow ${disk}}
`);
```

### 常用样式

| 方法 | 效果 |
|------|------|
| `chalk.red()` | 红色 |
| `chalk.green()` | 绿色 |
| `chalk.blue()` | 蓝色 |
| `chalk.yellow()` | 黄色 |
| `chalk.cyan()` | 青色 |
| `chalk.magenta()` | 洋红 |
| `chalk.bold()` | 粗体 |
| `chalk.dim()` | 暗淡 |
| `chalk.underline()` | 下划线 |

### 自动检测颜色支持

```javascript
const chalk = require('chalk');

// 自动禁用颜色（输出到文件时）
chalk.level = 0; // 完全禁用
chalk.level = 1; // 基本颜色
chalk.level = 2; // 256色
chalk.level = 3; // 真彩色
```

---

## 六、Ora 进度指示器

Ora 用于显示加载动画。

```bash
npm install ora
```

### 基础用法

```javascript
const ora = require('ora');

const spinner = ora('加载中...').start();

setTimeout(() => {
  spinner.color = 'yellow';
  spinner.text = '处理中...';
}, 1000);

setTimeout(() => {
  spinner.succeed('完成!');
}, 2000);
```

### 状态方法

```javascript
spinner.start(text);   // 开始
spinner.stop();        // 停止（无状态）
spinner.succeed(text); // 成功 ✓
spinner.fail(text);    // 失败 ✗
spinner.warn(text);    // 警告 ⚠
spinner.info(text);    // 信息 ℹ
spinner.stopAndPersist(symbol, text); // 自定义
```

### 自定义动画

```javascript
const spinner = ora({
  text: '处理中',
  spinner: 'dots',  // 动画样式
  color: 'cyan'
}).start();
```

常用动画：`dots`、`dots2`、`line`、`pipe`、`hamburger`、`moon`

---

## 七、Shell 命令执行

### 使用 child_process

```javascript
const { exec, spawn } = require('child_process');

// 执行单条命令
exec('npm install', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

// 同步执行
const { execSync } = require('child_process');
const output = execSync('ls -la', { encoding: 'utf-8' });
```

### Promise 封装

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function install() {
  try {
    const { stdout } = await execPromise('npm install');
    console.log(stdout);
  } catch (error) {
    console.error(error);
  }
}
```

### spawn 流式输出

```javascript
const { spawn } = require('child_process');

const child = spawn('npm', ['install'], { shell: true });

child.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`进程退出: ${code}`);
});
```

---

## 八、项目脚手架实战

### 完整 CLI 示例

```javascript
#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

program
  .name('create-app')
  .description('快速创建前端项目')
  .version('1.0.0');

// create 命令
program
  .command('create <project>')
  .description('创建新项目')
  .option('-t, --template <name>', '项目模板', 'vue')
  .option('-s, --skip-install', '跳过安装')
  .action(async (project, options) => {
    const spinner = ora('正在创建项目...').start();

    try {
      // 1. 下载模板
      spinner.text = '下载模板中...';
      await execPromise(`git clone https://github.com/xxx/${options.template}-template ${project}`);
      spinner.succeed('项目创建成功');

      // 2. 安装依赖
      if (!options.skipInstall) {
        const installSpinner = ora('安装依赖中...').start();
        await execPromise('npm install', { cwd: project });
        installSpinner.succeed('依赖安装完成');
      }

      // 3. 显示成功信息
      console.log(chalk.green('\n✓ 项目创建成功!'));
      console.log(chalk.cyan(`\n  cd ${project}`));
      console.log(chalk.cyan('  npm run dev\n'));
    } catch (error) {
      spinner.fail('创建失败');
      console.error(chalk.red(error.message));
    }
  });

// init 命令（交互式）
program
  .command('init')
  .description('初始化当前目录')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        default: 'my-project'
      },
      {
        type: 'list',
        name: 'template',
        message: '选择模板:',
        choices: ['Vue', 'React', 'Vue3 + Vite', 'React + Vite']
      }
    ]);

    console.log(chalk.blue(`正在创建 ${answers.name}...`));
    console.log(chalk.green('完成!'));
  });

program.parse();
```

---

## 九、npm 发布与使用

### 发布 CLI 包

```bash
# 1. 登录 npm
npm login

# 2. 发布
npm publish

# 3. 发布beta版本
npm publish --tag beta
```

### 使用发布的 CLI

```bash
# 全局安装
npm install -g my-cli

# 直接使用
mycli init my-project

# 或使用 npx
npx my-cli init my-project
```

### 版本管理

```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 发布新版本
npm publish
```

---

## 十、常见问题

### Q: Windows 下 shebang 不生效？

在 Windows 上，确保使用 `#!/usr/bin/env node`，或安装 `cross-env`：

```javascript
// bin/index.js
#!/usr/bin/env node
require('../src/index.js');
```

### Q: 中文乱码？

确保文件编码为 UTF-8，Windows 下可能需要：

```javascript
process.stdout.setEncoding('utf-8');
```

### Q: 跨平台兼容？

使用 `cross-env` 处理环境变量：

```bash
npm install cross-env
```

```javascript
const { spawn } = require('cross-env');

spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});
```

### Q: 加载慢？

使用 `oclif` 或 `ink` 构建更专业的 CLI：

- **oclif**：Heroku 推出的 CLI 框架
- **ink**：用 React 风格构建 CLI

### Q: 测试 CLI？

使用 `execa` 和 `strip-ansi`：

```javascript
const { execa } = require('execa');

test('CLI 输出正确', async () => {
  const { stdout } = await execa('node', ['bin/index.js', '--version']);
  expect(stdout).toContain('1.0.0');
});
```

---

## 推荐工具汇总

| 工具 | 用途 |
|------|------|
| commander | 参数解析 |
| inquirer | 交互问答 |
| chalk | 彩色输出 |
| ora | 加载动画 |
| cli-table3 | 表格展示 |
| download-git-repo | 下载远程模板 |
| cross-env | 跨平台环境变量 |
| execa | Promise 化的子进程 |
| signale | 更美观的日志输出 |
