[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Tiếng Việt](README.vi.md) | [Português](README.pt.md) | Русский | [Türkçe](README.tr.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md)

# oh-my-gemini-cli

[![npm version](https://img.shields.io/npm/v/oh-my-gemini-sisyphus?color=cb3837)](https://www.npmjs.com/package/oh-my-gemini-sisyphus)
[![npm downloads](https://img.shields.io/npm/dm/oh-my-gemini-sisyphus?color=blue)](https://www.npmjs.com/package/oh-my-gemini-sisyphus)
[![GitHub stars](https://img.shields.io/github/stars/Yeachan-Heo/oh-my-gemini-cli?style=flat&color=yellow)](https://github.com/Yeachan-Heo/oh-my-gemini-cli/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-❤️-red?style=flat&logo=github)](https://github.com/sponsors/Yeachan-Heo)
[![Discord](https://img.shields.io/discord/1466022107199574193?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/qRJw62Gvh7)

**Мультиагентная оркестрация для Gemini Code. Нулевой порог вхождения.**

_Не изучайте Gemini Code. Просто используйте OMC._

[Начать](#быстрый-старт) • [Документация](https://yeachan-heo.github.io/oh-my-gemini-cli-website) • [Руководство по миграции](docs/MIGRATION.md)

---

## Быстрый старт

**Шаг 1: Установка**

```bash
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-gemini-cli
/plugin install oh-my-gemini-cli
```

**Шаг 2: Настройка**

```bash
/oh-my-gemini-cli:omg-setup
```

**Шаг 3: Создайте что-нибудь**

```
autopilot: build a REST API for managing tasks
```

Вот и всё. Всё остальное происходит автоматически.

## Team Mode (Рекомендуется)

Начиная с **v4.1.7**, **Team** — это каноническая поверхность оркестрации в OMC. Устаревшие точки входа, такие как **swarm** и **ultrapilot**, по-прежнему поддерживаются, но теперь **направляются в Team под капотом**.

```bash
/oh-my-gemini-cli:team 3:executor "fix all TypeScript errors"
```

Team работает как поэтапный pipeline:

`team-plan → team-prd → team-exec → team-verify → team-fix (loop)`

Включите нативные команды Gemini Code в `~/.gemini/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

> Если teams отключены, OMC предупредит вас и переключится на выполнение без Team, если это возможно.

> **Примечание: Название пакета** — Проект использует бренд **oh-my-gemini-cli** (репозиторий, плагин, команды), но npm-пакет публикуется как [`oh-my-gemini-sisyphus`](https://www.npmjs.com/package/oh-my-gemini-sisyphus). Если вы устанавливаете CLI-инструменты через npm/bun, используйте `npm install -g oh-my-gemini-sisyphus`.

### Обновление

```bash
# 1. Обновите плагин
/plugin install oh-my-gemini-cli

# 2. Перезапустите setup для обновления конфигурации
/oh-my-gemini-cli:omg-setup
```

Если после обновления возникли проблемы, очистите старый кэш плагина:

```bash
/oh-my-gemini-cli:omg-doctor
```

<h1 align="center">Ваш Gemini только что получил суперсилу.</h1>

<p align="center">
  <img src="assets/omg-character.jpg" alt="oh-my-gemini-cli" width="400" />
</p>

---

## Почему oh-my-gemini-cli?

- **Настройка не требуется** — Работает сразу из коробки с умными значениями по умолчанию
- **Team-first оркестрация** — Team является каноническим мультиагентным интерфейсом (swarm/ultrapilot — фасады совместимости)
- **Интерфейс на естественном языке** — Не нужно запоминать команды, просто описывайте, что вам нужно
- **Автоматическая параллелизация** — Сложные задачи распределяются между специализированными агентами
- **Настойчивое выполнение** — Не сдаётся, пока работа не будет проверена и завершена
- **Оптимизация затрат** — Умная маршрутизация моделей экономит 30-50% токенов
- **Обучение на опыте** — Автоматически извлекает и переиспользует паттерны решения задач
- **Видимость в реальном времени** — HUD statusline показывает, что происходит под капотом

---

## Возможности

### Режимы оркестрации

Множество стратегий для разных сценариев — от оркестрации через Team до рефакторинга с экономией токенов. [Подробнее →](https://yeachan-heo.github.io/oh-my-gemini-cli-website/docs.html#execution-modes)

| Режим                               | Описание                                                                                      | Применение                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Team (рекомендуется)**            | Канонический поэтапный pipeline (`team-plan → team-prd → team-exec → team-verify → team-fix`) | Координированные агенты, работающие над общим списком задач                       |
| **Autopilot**                       | Автономное выполнение (один ведущий агент)                                                    | Сквозная разработка фич с минимальной церемонией                                  |
| **Ultrawork**                       | Максимальный параллелизм (без Team)                                                           | Параллельные исправления/рефакторинг, когда Team не нужен                         |
| **Ralph**                           | Режим настойчивости с циклами verify/fix                                                      | Задачи, которые должны быть полностью завершены (без тихих частичных результатов) |
| **Ecomode**                         | Токен-эффективная маршрутизация                                                               | Бюджетно-ориентированная итерация                                                 |
| **Pipeline**                        | Последовательная поэтапная обработка                                                          | Многоступенчатые трансформации со строгим порядком                                |
| **Swarm / Ultrapilot (устаревшие)** | Фасады совместимости, направляющие в **Team**                                                 | Существующие рабочие процессы и старая документация                               |

### Интеллектуальная оркестрация

- **32 специализированных агента** для архитектуры, исследований, дизайна, тестирования, data science
- **Умная маршрутизация моделей** — Haiku для простых задач, Opus для сложных рассуждений
- **Автоматическое делегирование** — Правильный агент для правильной задачи, каждый раз

### Опыт разработчика

- **Магические ключевые слова** — `ralph`, `ulw`, `eco`, `plan` для явного управления
- **HUD statusline** — Метрики оркестрации в реальном времени в строке состояния
- **Обучение навыкам** — Извлечение переиспользуемых паттернов из сессий
- **Аналитика и отслеживание затрат** — Понимание использования токенов по всем сессиям

### Пользовательские навыки

Выучите один раз — используйте всегда. OMC извлекает ценные знания отладки в портативные файлы навыков, которые автоматически внедряются при необходимости.

| | Область проекта | Область пользователя |
|---|---|---|
| **Путь** | `.omg/skills/` | `~/.omg/skills/` |
| **Доступно** | Команде (под контролем версий) | Всем вашим проектам |
| **Приоритет** | Выше (переопределяет пользовательскую область) | Ниже (резервный) |

```yaml
# .omg/skills/fix-proxy-crash.md
---
name: Fix Proxy Crash
description: aiohttp proxy crashes on ClientDisconnectedError
triggers: ["proxy", "aiohttp", "disconnected"]
source: extracted
---
Оберните обработчик в server.py:42 в try/except ClientDisconnectedError...
```

**Управление навыками:** `/skill list | add | remove | edit | search`
**Автообучение:** `/learner` извлекает переиспользуемые паттерны со строгими критериями качества
**Автовнедрение:** Подходящие навыки автоматически загружаются в контекст — ручной вызов не требуется

[Полный список возможностей →](docs/REFERENCE.md)

---

## Магические ключевые слова

Опциональные ярлыки для опытных пользователей. Естественный язык работает без них.

| Ключевое слово | Эффект                                          | Пример                                                          |
| -------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `team`         | Каноническая Team-оркестрация                   | `/oh-my-gemini-cli:team 3:executor "fix all TypeScript errors"` |
| `autopilot`    | Полностью автономное выполнение                 | `autopilot: build a todo app`                                   |
| `ralph`        | Режим настойчивости                             | `ralph: refactor auth`                                          |
| `ulw`          | Максимальный параллелизм                        | `ulw fix all errors`                                            |
| `eco`          | Токен-эффективное выполнение                    | `eco: migrate database`                                         |
| `plan`         | Интервью для планирования                       | `plan the API`                                                  |
| `ralplan`      | Итеративный консенсус планирования              | `ralplan this feature`                                          |
| `swarm`        | Устаревшее ключевое слово (направляется в Team) | `swarm 5 agents: fix lint errors`                               |
| `ultrapilot`   | Устаревшее ключевое слово (направляется в Team) | `ultrapilot: build a fullstack app`                             |

**Примечания:**

- **ralph включает ultrawork**: при активации ralph mode автоматически включается параллельное выполнение ultrawork.
- Синтаксис `swarm N agents` по-прежнему распознаётся для определения количества агентов, но в v4.1.7+ среда выполнения основана на Team.

## Утилиты

### Ожидание Rate Limit

Автоматическое возобновление сессий Gemini Code при сбросе rate limit.

```bash
omg wait          # Проверить статус, получить рекомендации
omg wait --start  # Включить демон автовозобновления
omg wait --stop   # Отключить демон
```

**Требуется:** tmux (для обнаружения сессии)

### Теги уведомлений (Telegram/Discord)

Вы можете настроить, кого отмечать, когда stop-коллбэки отправляют сводку сессии.

```bash
# Установить/заменить список тегов
omg config-stop-callback telegram --enable --token <bot_token> --chat <chat_id> --tag-list "@alice,bob"
omg config-stop-callback discord --enable --webhook <url> --tag-list "@here,123456789012345678,role:987654321098765432"

# Инкрементальные обновления
omg config-stop-callback telegram --add-tag charlie
omg config-stop-callback discord --remove-tag @here
omg config-stop-callback discord --clear-tags
```

Поведение тегов:

- Telegram: `alice` нормализуется в `@alice`
- Discord: поддерживает `@here`, `@everyone`, числовые ID пользователей и `role:<id>`
- Коллбэки типа `file` игнорируют параметры тегов

### Интеграция с OpenClaw

Пересылайте события сессий Gemini Code на шлюз [OpenClaw](https://openclaw.ai/), чтобы обеспечить автоматические ответы и рабочие процессы через вашего агента OpenClaw.

**Быстрая настройка (рекомендуется):**

```bash
/oh-my-gemini-cli:configure-notifications
# → При запросе введите "openclaw" → выберите "OpenClaw Gateway"
```

**Ручная настройка:** создайте `~/.gemini/omg_config.openclaw.json`:

```json
{
  "enabled": true,
  "gateways": {
    "my-gateway": {
      "url": "https://your-gateway.example.com/wake",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" },
      "method": "POST",
      "timeout": 10000
    }
  },
  "hooks": {
    "session-start": { "gateway": "my-gateway", "instruction": "Session started for {{projectName}}", "enabled": true },
    "stop":          { "gateway": "my-gateway", "instruction": "Session stopping for {{projectName}}", "enabled": true }
  }
}
```

**Переменные окружения:**

| Переменная | Описание |
|-----------|----------|
| `OMC_OPENCLAW=1` | Включить OpenClaw |
| `OMC_OPENCLAW_DEBUG=1` | Включить отладочное логирование |
| `OMC_OPENCLAW_CONFIG=/path/to/config.json` | Переопределить путь к файлу конфигурации |

**Поддерживаемые события хуков (6 активных в bridge.ts):**

| Событие | Триггер | Основные переменные шаблона |
|---------|---------|----------------------------|
| `session-start` | Начало сессии | `{{sessionId}}`, `{{projectName}}`, `{{projectPath}}` |
| `stop` | Завершение ответа Gemini | `{{sessionId}}`, `{{projectName}}` |
| `keyword-detector` | При каждой отправке промпта | `{{prompt}}`, `{{sessionId}}` |
| `ask-user-question` | Gemini запрашивает ввод пользователя | `{{question}}`, `{{sessionId}}` |
| `pre-tool-use` | Перед вызовом инструмента (высокая частота) | `{{toolName}}`, `{{sessionId}}` |
| `post-tool-use` | После вызова инструмента (высокая частота) | `{{toolName}}`, `{{sessionId}}` |

**Переменные окружения канала ответа:**

| Переменная | Описание |
|-----------|----------|
| `OPENCLAW_REPLY_CHANNEL` | Канал ответа (напр. `discord`) |
| `OPENCLAW_REPLY_TARGET` | ID канала |
| `OPENCLAW_REPLY_THREAD` | ID потока |

См. `scripts/openclaw-gateway-demo.mjs` — эталонный шлюз, который пересылает полезные данные OpenClaw в Discord через ClawdBot.

---

## Документация

- **[Полный справочник](docs/REFERENCE.md)** — Полная документация по функциям
- **[Мониторинг производительности](docs/PERFORMANCE-MONITORING.md)** — Отслеживание агентов, отладка и оптимизация
- **[Веб-сайт](https://yeachan-heo.github.io/oh-my-gemini-cli-website)** — Интерактивные руководства и примеры
- **[Руководство по миграции](docs/MIGRATION.md)** — Обновление с v2.x
- **[Архитектура](docs/ARCHITECTURE.md)** — Как это работает под капотом

---

## Требования

- [Gemini Code](https://docs.anthropic.com/gemini-code) CLI
- Подписка Gemini Max/Pro ИЛИ API-ключ Anthropic

### Опционально: Мульти-AI оркестрация

OMC может опционально использовать внешних AI-провайдеров для перекрёстной валидации и единообразия дизайна. Они **не обязательны** — OMC полностью работает без них.

| Провайдер                                                 | Установка                           | Что даёт                                                 |
| --------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `npm install -g @google/gemini-cli` | Ревью дизайна, единообразие UI (контекст 1M токенов)     |
| [Codex CLI](https://github.com/openai/codex)              | `npm install -g @openai/codex`      | Валидация архитектуры, перекрёстная проверка code review |

**Стоимость:** 3 плана Pro (Gemini + Gemini + ChatGPT) покрывают всё за ~$60/месяц.

---

## Лицензия

MIT

---

<div align="center">

**Вдохновлено:** [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) • [gemini-hud](https://github.com/ryanjoachim/gemini-hud) • [Superpowers](https://github.com/NexTechFusion/Superpowers) • [everything-gemini-code](https://github.com/affaan-m/everything-gemini-code)

**Нулевой порог вхождения. Максимальная мощность.**

</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Yeachan-Heo/oh-my-gemini-cli&type=date&legend=top-left)](https://www.star-history.com/#Yeachan-Heo/oh-my-gemini-cli&type=date&legend=top-left)

## 💖 Поддержите этот проект

Если Oh-My-GeminiCLI помогает вашему рабочему процессу, рассмотрите спонсорство:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-❤️-red?style=for-the-badge&logo=github)](https://github.com/sponsors/Yeachan-Heo)

### Зачем спонсировать?

- Поддержание активной разработки
- Приоритетная поддержка для спонсоров
- Влияние на дорожную карту и функции
- Помощь в поддержании свободного и открытого исходного кода

### Другие способы помочь

- ⭐ Поставьте звезду репозиторию
- 🐛 Сообщайте об ошибках
- 💡 Предлагайте функции
- 📝 Вносите вклад в код
