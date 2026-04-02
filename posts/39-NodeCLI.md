# 浣跨敤 Node.js 鎼缓 CLI 宸ュ叿

> 浠庨浂鏋勫缓鍛戒护琛屽伐鍏凤紝鏀寔浜や簰寮忛棶绛斻€佸弬鏁拌В鏋愩€佸僵鑹茶緭鍑恒€佽繘搴︽潯銆佽嚜鍔ㄥ畨瑁?

## 目录

- [涓€銆丆LI 鍩烘湰鍘熺悊](#涓銆丆li-鍩烘湰鍘熺悊)
- [浜屻€侀」鐩垵濮嬪寲](#浜屻侀鐩垵濮嬪寲)
- [涓夈€佸叆鍙ｆ枃浠讹細bin/index.js](#涓夈佸叆鍙ｆ枃浠讹細binindexjs)
- [鍥涖€佸弬鏁拌В鏋愶細commander.js](#鍥涖佸弬鏁拌в鏋愶細commanderjs)
- [浜斻€佷氦浜掑紡闂瓟锛歩nquirer](#浜斻佷氦浜掑紡闂瓟锛歩nquirer)
- [鍏€侀鑹茶緭鍑猴細chalk](#鍏侀鑹茶緭鍑猴細chalk)
- [涓冦€佽繘搴︽潯锛歰ra](#涓冦佽繘搴潯锛歰ra)
- [鍏€佺敓鎴愭枃浠舵ā鏉?](#鍏佺敓鎴愭枃浠舵ā鏉)
- [涔濄€佽嚜鍔ㄥ畨瑁呬緷璧栵細spawn](#涔濄佽嚜鍔ㄥ畨瑁呬緷璧栵細spawn)
- [鍗併€佹湰鍦拌皟璇曚笌鍙戝竷](#鍗併佹湰鍦拌皟璇曚笌鍙戝竷)
  - [鏈湴 link 璋冭瘯](#鏈湴-link-璋冭瘯)
  - [鍙戝竷鍒?npm](#鍙戝竷鍒npm)
- [鍗佷竴銆佸畬鏁撮」鐩粨鏋?](#鍗佷竴銆佸畬鏁撮鐩粨鏋)
- [鍗佷簩銆佸疄鐢ㄨ繘闃舵妧宸?](#鍗佷簩銆佸疄鐢ㄨ繘闃舵妧宸)
  - [瀛愬懡浠ょ嫭绔嬫枃浠?](#瀛愬懡浠ょ嫭绔嬫枃浠)
  - [鐜妫€娴嬶紙璺ㄥ钩鍙板吋瀹癸級](#鐜妫娴嬶紙璺ㄥ钩鍙板吋瀹癸級)
  - [鍏ㄥ眬閰嶇疆瀛樺偍](#鍏ㄥ眬閰嶇疆瀛樺偍)

---
## 涓€銆丆LI 鍩烘湰鍘熺悊

CLI锛圕ommand Line Interface锛夋湰璐ㄦ槸**鎺ユ敹鍛戒护鍙傛暟 鈫?鎵ц閫昏緫 鈫?杈撳嚭缁撴灉**锛?

```bash
# 鐢ㄦ埛杈撳叆
$ mycli --name 寮犱笁 --age 25 init

# 瑙ｆ瀽鍚?
{ name: '寮犱笁', age: 25, command: 'init' }
```

**瀹炵幇鍘熺悊锛?*
- `#!/usr/bin/env node`锛圫hebang锛夛細鍛婅瘔绯荤粺鐢?Node.js 鎵ц姝よ剼鏈?
- `process.argv`锛氭帴鏀剁敤鎴蜂紶鍏ョ殑鍙傛暟
- `stdin/stdout/stderr`锛氳鍙栬緭鍏ュ拰杈撳嚭

---

## 浜屻€侀」鐩垵濮嬪寲

```bash
mkdir my-cli && cd my-cli
npm init -y
npm install commander inquirer chalk ora cli-table3 download-git-repo

# 寮€鍚?bin 鍛戒护
npm install --save-dev @types/node
```

**package.json 閰嶇疆 bin锛?*

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "mycli": "./bin/index.js"
  },
  "type": "module",
  "scripts": {
    "dev": "node ./bin/index.js",
    "link": "npm link"
  }
}
```

---

## 涓夈€佸叆鍙ｆ枃浠讹細bin/index.js

```js
#!/usr/bin/env node

// 浣跨敤 ES Module
import '../src/index.js'
```

**璁剧疆 bin 鏉冮檺锛坢acOS/Linux锛夛細**

```bash
chmod +x ./bin/index.js
```

---

## 鍥涖€佸弬鏁拌В鏋愶細commander.js

```js
// src/index.js
import { program } from 'commander'

// 鐗堟湰淇℃伅
program
  .name('mycli')
  .description('涓€涓疄鐢ㄧ殑鍓嶇鑴氭墜鏋跺伐鍏?)
  .version('1.0.0')

// 鍏ㄥ眬閫夐」
program
  .option('-v, --verbose', '杈撳嚭璇︾粏鏃ュ織')

// init 鍛戒护
program
  .command('init <project-name>')
  .description('鍒濆鍖栦竴涓柊椤圭洰')
  .option('-t, --template <name>', '椤圭洰妯℃澘', 'default')
  .option('-f, --force', '寮哄埗瑕嗙洊宸插瓨鍦ㄧ殑鐩綍')
  .action(async (name, options) => {
    console.log(`鍒濆鍖栭」鐩? ${name}, 妯℃澘: ${options.template}`)
    await initProject(name, options)
  })

// page 鍛戒护锛氱敓鎴愰〉闈?
program
  .command('page <page-name>')
  .description('鐢熸垚鏂伴〉闈㈡枃浠?)
  .option('-d, --dir <path>', '椤甸潰鐩綍', 'src/views')
  .action(async (name, options) => {
    await generatePage(name, options)
  })

// config 鍛戒护
program
  .command('config')
  .description('绠＄悊閰嶇疆鏂囦欢')
  .addOption(
    new Option('-g, --get <key>', '鑾峰彇閰嶇疆鍊?).choices(['theme', 'language'])
  )
  .addOption(
    new Option('-s, --set <key> <value>', '璁剧疆閰嶇疆鍊?)
  )
  .action((options) => {
    handleConfig(options)
  })

// 瑙ｆ瀽鍙傛暟
program.parse(process.argv)
```

---

## 浜斻€佷氦浜掑紡闂瓟锛歩nquirer

```js
// src/prompts.js
import inquirer from 'inquirer'

export async function askProjectInfo() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '椤圭洰鍚嶇О锛?,
      default: 'my-project',
      validate: (input) => /^[a-z0-9-]+$/.test(input) || '鍙兘鍖呭惈灏忓啓瀛楁瘝銆佹暟瀛楀拰涓垝绾?
    },
    {
      type: 'list',
      name: 'framework',
      message: '閫夋嫨妗嗘灦锛?,
      choices: [
        { name: 'Vue 3 + TypeScript', value: 'vue-ts' },
        { name: 'Vue 3 (JavaScript)', value: 'vue-js' },
        { name: 'React + TypeScript', value: 'react-ts' },
        { name: 'React (JavaScript)', value: 'react-js' }
      ],
      default: 0
    },
    {
      type: 'checkbox',
      name: 'features',
      message: '閫夋嫨闄勫姞鍔熻兘锛?,
      choices: [
        'ESLint 浠ｇ爜瑙勮寖',
        'Prettier 鏍煎紡鍖?,
        'Git 鍒濆鍖?,
        'Docker 鏀寔'
      ],
      default: [0, 1]
    },
    {
      type: 'confirm',
      name: 'install',
      message: '鏄惁鑷姩瀹夎渚濊禆锛?,
      default: true
    },
    {
      type: 'password',
      name: 'token',
      message: '璇疯緭鍏?GitHub Token锛堝彲閫夛級锛?,
      mask: '*'
    }
  ])

  return answers
}
```

---

## 鍏€侀鑹茶緭鍑猴細chalk

```js
import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'

console.log(chalk.blue('钃濊壊鏂囧瓧'))
console.log(chalk.green('鉁?鎴愬姛'))
console.log(chalk.red('鉂?澶辫触'))
console.log(chalk.yellow('鈿狅笍 璀﹀憡'))
console.log(chalk.gray('鐏拌壊鎻愮ず'))

// 缁勫悎鏍峰紡
console.log(chalk.bold.cyan('绮椾綋闈掕壊'))
console.log(chalk.bgRed.white('绾㈠簳鐧藉瓧'))

// 娓愬彉鑹插姩鐢伙紙鍚姩鐢婚潰锛?
const rainbow = chalkAnimation.rainbow('姝ｅ湪鍚姩 my-cli...')
setTimeout(() => rainbow.stop(), 2000)
```

---

## 涓冦€佽繘搴︽潯锛歰ra

```js
import ora from 'ora'
import figlet from 'figlet'

async function initProject(name, options) {
  // 鍚姩鍔ㄧ敾
  const spinner = ora({
    text: chalk.cyan('姝ｅ湪鎷夊彇妯℃澘...'),
    spinner: 'dots'
  }).start()

  try {
    // 姝ラ1锛氬厠闅嗘ā鏉?
    await downloadTemplate(name, options.template)
    spinner.succeed(chalk.green(`鉁?宸蹭笅杞芥ā鏉垮埌 ${name}`))

    // 姝ラ2锛氬畨瑁呬緷璧?
    const installSpinner = ora({
      text: chalk.cyan('姝ｅ湪瀹夎渚濊禆...'),
      spinner: 'bouncingBall'
    }).start()

    await installDependencies(name)
    installSpinner.succeed(chalk.green('鉁?渚濊禆瀹夎瀹屾垚'))

    // 姝ラ3锛氬垵濮嬪寲 Git
    const gitSpinner = ora({
      text: chalk.cyan('姝ｅ湪鍒濆鍖?Git...'),
      spinner: 'arc'
    }).start()

    await initGit(name)
    gitSpinner.succeed(chalk.green('鉁?Git 鍒濆鍖栧畬鎴?))

    console.log(chalk.bold.green('\n 馃帀 椤圭洰鍒濆鍖栧畬鎴愶紒'))
    console.log(chalk.gray(`\n  cd ${name}`))
    console.log(chalk.gray(`  npm run dev\n`))

  } catch (err) {
    spinner.fail(chalk.red(`鍒濆鍖栧け璐ワ細${err.message}`))
    process.exit(1)
  }
}
```

---

## 鍏€佺敓鎴愭枃浠舵ā鏉?

```js
// src/generators/page.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const template = (name, options) => `// ${name}.vue
<template>
  <div class="${name}">
    <h1>${name} Page</h1>
  </div>
</template>

<script setup lang="ts">
// ${name} 椤甸潰
</script>

<style scoped lang="scss">
.${name} {
  padding: 20px;
}
</style>
`

export async function generatePage(name, options) {
  const dir = path.resolve(options.dir, name)
  const filePath = path.join(dir, 'index.vue')

  // 纭繚鐩綍瀛樺湪
  fs.mkdirSync(dir, { recursive: true })

  // 鍐欏叆鏂囦欢
  fs.writeFileSync(filePath, template(name, options), 'utf-8')

  console.log(chalk.green(`鉁?椤甸潰宸茬敓鎴愶細${filePath}`))
}
```

---

## 涔濄€佽嚜鍔ㄥ畨瑁呬緷璧栵細spawn

```js
// src/utils/install.js
import { spawn } from 'child_process'

export function installDependencies(cwd, packageManager = 'npm') {
  return new Promise((resolve, reject) => {
    const cmd = packageManager === 'yarn' ? 'yarn' : 'npm'
    const args = packageManager === 'yarn' ? [] : ['install']

    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    })

    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`install 杩涚▼閫€鍑虹爜锛?{code}`))
    })

    child.on('error', reject)
  })
}
```

---

## 鍗併€佹湰鍦拌皟璇曚笌鍙戝竷

### 鏈湴 link 璋冭瘯

```bash
# 鍦ㄩ」鐩牴鐩綍鎵ц
npm link

# 鐜板湪鍙互鐩存帴浣跨敤
mycli init my-project
mycli page login

# 鍙栨秷 link
npm unlink
```

### 鍙戝竷鍒?npm

```bash
# 1. 鐧诲綍 npm
npm login

# 2. 鍙戝竷锛堢‘淇?package.json name 鍞竴锛?
npm publish --access public

# 3. 鎵撴爣绛撅紙鍙戝竷娴嬭瘯鐗堬級
npm publish --tag beta

# 4. 鏇存柊鐗堟湰鍙?
npm version patch    # 1.0.0 鈫?1.0.1
npm version minor    # 1.0.0 鈫?1.1.0
npm version major    # 1.0.0 鈫?2.0.0
```

---

## 鍗佷竴銆佸畬鏁撮」鐩粨鏋?

```
my-cli/
鈹溾攢鈹€ bin/
鈹?  鈹斺攢鈹€ index.js              # CLI 鍏ュ彛锛圫hebang锛?
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ index.js              # 涓婚€昏緫锛坈ommander 娉ㄥ唽锛?
鈹?  鈹溾攢鈹€ prompts.js            # 浜や簰闂瓟
鈹?  鈹溾攢鈹€ commands/
鈹?  鈹?  鈹溾攢鈹€ init.js           # init 鍛戒护瀹炵幇
鈹?  鈹?  鈹溾攢鈹€ page.js          # page 鍛戒护瀹炵幇
鈹?  鈹?  鈹斺攢鈹€ config.js         # config 鍛戒护瀹炵幇
鈹?  鈹溾攢鈹€ generators/
鈹?  鈹?  鈹溾攢鈹€ page.js           # 椤甸潰妯℃澘鐢熸垚
鈹?  鈹?  鈹斺攢鈹€ component.js     # 缁勪欢妯℃澘鐢熸垚
鈹?  鈹溾攢鈹€ templates/            # 椤圭洰妯℃澘
鈹?  鈹?  鈹溾攢鈹€ vue-ts/
鈹?  鈹?  鈹斺攢鈹€ react-ts/
鈹?  鈹斺攢鈹€ utils/
鈹?      鈹溾攢鈹€ install.js        # 渚濊禆瀹夎
鈹?      鈹溾攢鈹€ logger.js         # 鏃ュ織宸ュ叿
鈹?      鈹斺攢鈹€ download.js       // 涓嬭浇妯℃澘
鈹溾攢鈹€ package.json
鈹斺攢鈹€ README.md
```

---

## 鍗佷簩銆佸疄鐢ㄨ繘闃舵妧宸?

### 瀛愬懡浠ょ嫭绔嬫枃浠?

```js
// src/commands/init.js
export function init(program) {
  program
    .command('init <name>')
    .description('鍒濆鍖栭」鐩?)
    .action(async (name) => { /* ... */ })
}

// src/index.js
import { init } from './commands/init.js'
import { page } from './commands/page.js'
import { config } from './commands/config.js'

init(program)
page(program)
config(program)
```

### 鐜妫€娴嬶紙璺ㄥ钩鍙板吋瀹癸級

```js
// Windows 涓婃墽琛?.bat/.ps1 鑴氭湰
import { execSync } from 'child_process'

const isWindows = process.platform === 'win32'

export function clearScreen() {
  console.clear()
}

export function openBrowser(url) {
  const cmd = isWindows ? 'start' : isMac ? 'open' : 'xdg-open'
  execSync(`${cmd} ${url}`, { stdio: 'ignore' })
}
```

### 鍏ㄥ眬閰嶇疆瀛樺偍

```js
// ~/.mycli/config.json
import { homedir } from 'os'
import { join } from 'path'
import fs from 'fs'

const configPath = join(homedir(), '.mycli', 'config.json')

export function getConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }
  return {}
}

export function setConfig(key, value) {
  const config = getConfig()
  config[key] = value
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}
```
