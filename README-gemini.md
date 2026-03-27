# oh-my-gemini-cli — Gemini Code CLI 适配版

> 基于 [oh-my-claude-code](https://github.com/anthropics/oh-my-claude-code) 迁移适配，支持 [Gemini Code CLI](https://github.com/google/gemini-cli) 扩展规范。

## 与上游的差异

本分支将 oh-my-claude-code 的 Claude Code 插件架构迁移到了 Gemini Code CLI 扩展规范，主要修改如下：

### 1. Hook 事件名映射

| Claude Code 事件 | Gemini CLI 事件 | 说明 |
|---|---|---|
| `UserPromptSubmit` | `BeforeAgent` | 用户提交 prompt 前 |
| `PreToolUse` | `BeforeTool` | 工具调用前 |
| `PostToolUse` | `AfterTool` | 工具调用后 |
| `PreCompact` | `PreCompress` | 上下文压缩前 |
| `Stop` | `AfterAgent` | Agent 结束后 |
| `PostToolUseFailure` | *(合并到 AfterTool)* | Gemini CLI 无此事件 |
| `PermissionRequest` | *(已移除)* | Gemini CLI 无此事件 |
| `SubagentStart/Stop` | *(已移除)* | Gemini CLI 无此事件 |

### 2. 路径变量

- `$CLAUDE_PLUGIN_ROOT` → `${extensionPath}${/}` （Gemini CLI 扩展路径变量）

### 3. 环境变量

- 新增 `GEMINI_CONFIG_DIR` 支持（保留对 `CLAUDE_CONFIG_DIR` 的向后兼容）

### 4. MCP 配置

- `.mcp.json` 和 `gemini-extension.json` 统一使用 `${extensionPath}` 变量
- MCP server 配置内联到 `gemini-extension.json`

### 5. 依赖清理

- 移除了 `@anthropic-ai/claude-agent-sdk` 和 `@anthropic-ai/sdk` 依赖
- 移除了 `anthropic` 相关的 keywords

---

## 安装

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [Gemini Code CLI](https://github.com/google/gemini-cli) 已安装

### 方式一：从源码构建安装

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/oh-my-gemini-cli.git
cd oh-my-gemini-cli

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 全局安装（可选）
npm link
```

### 方式二：作为 Gemini CLI 扩展加载

将构建后的目录作为本地扩展加载：

```bash
# 在 Gemini CLI 中执行
/extension add /path/to/oh-my-gemini-cli
```

或手动配置 `~/.gemini/settings.json`：

```json
{
  "extensions": [
    "/absolute/path/to/oh-my-gemini-cli"
  ]
}
```

---

## 使用

### 初始设置

在 Gemini CLI 会话中执行：

```
/setup
/omg-setup
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `autopilot: <任务描述>` | 自动模式执行任务 |
| `ralph: <任务描述>` | 超级执行模式（持续运行直到完成） |
| `ulw: <任务描述>` | Ultra Work 深度工作模式 |
| `/team 3:executor "<任务>"` | 多 Agent 协作执行 |
| `/deep-interview "<想法>"` | 苏格拉底式需求澄清 |
| `/plan <任务描述>` | 生成项目计划 |
| `/debug <问题描述>` | 系统化调试 |
| `/test` | 生成和运行测试 |

### CLI 工具

安装后可直接在终端使用：

```bash
# 团队 API
omg team api list-tasks --input '{"team_name":"my-team"}' --json

# 状态查看
omg status
```

---

## 开发

```bash
# 运行测试
npm test

# 运行所有测试（一次性）
npm run test:run

# 构建
npm run build

# 开发模式（TypeScript 监听）
npm run dev
```

### 项目结构

```
oh-my-gemini-cli/
├── gemini-extension.json   # Gemini CLI 扩展清单
├── hooks/hooks.json        # Hook 事件配置
├── .mcp.json               # MCP server 配置
├── bridge/                 # CJS 入口桥接
├── scripts/                # Hook 脚本
├── skills/                 # 内置技能
├── src/
│   ├── hooks/              # Hook 处理逻辑
│   ├── installer/          # 安装器
│   ├── team/               # 多 Agent 团队运行时
│   └── utils/              # 工具函数
└── dist/                   # 构建输出
```

---

## 许可证

MIT
