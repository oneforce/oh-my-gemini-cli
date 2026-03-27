[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Tiếng Việt](README.vi.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Türkçe](README.tr.md) | Deutsch | [Français](README.fr.md) | [Italiano](README.it.md)

# oh-my-gemini-cli

[![npm version](https://img.shields.io/npm/v/oh-my-gemini-sisyphus?color=cb3837)](https://www.npmjs.com/package/oh-my-gemini-sisyphus)
[![npm downloads](https://img.shields.io/npm/dm/oh-my-gemini-sisyphus?color=blue)](https://www.npmjs.com/package/oh-my-gemini-sisyphus)
[![GitHub stars](https://img.shields.io/github/stars/Yeachan-Heo/oh-my-gemini-cli?style=flat&color=yellow)](https://github.com/Yeachan-Heo/oh-my-gemini-cli/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-❤️-red?style=flat&logo=github)](https://github.com/sponsors/Yeachan-Heo)
[![Discord](https://img.shields.io/discord/1466022107199574193?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/qRJw62Gvh7)

**Multi-Agenten-Orchestrierung für Gemini Code. Null Lernkurve.**

_Lernen Sie nicht Gemini Code. Nutzen Sie einfach OMC._

[Loslegen](#schnellstart) • [Dokumentation](https://yeachan-heo.github.io/oh-my-gemini-cli-website) • [Migrationsleitfaden](docs/MIGRATION.md)

---

## Schnellstart

**Schritt 1: Installation**

```bash
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-gemini-cli
/plugin install oh-my-gemini-cli
```

**Schritt 2: Einrichtung**

```bash
/oh-my-gemini-cli:omg-setup
```

**Schritt 3: Etwas bauen**

```
autopilot: build a REST API for managing tasks
```

Das war's. Alles andere passiert automatisch.

## Team Mode (Empfohlen)

Ab **v4.1.7** ist **Team** die kanonische Orchestrierungsoberfläche in OMC. Legacy-Einstiegspunkte wie **swarm** und **ultrapilot** werden weiterhin unterstützt, **leiten aber im Hintergrund an Team weiter**.

```bash
/oh-my-gemini-cli:team 3:executor "fix all TypeScript errors"
```

Team läuft als gestufte Pipeline:

`team-plan → team-prd → team-exec → team-verify → team-fix (loop)`

Aktivieren Sie Gemini Code native Teams in `~/.gemini/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

> Wenn Teams deaktiviert sind, warnt OMC Sie und fällt auf Ausführung ohne Team zurück, wenn möglich.

> **Hinweis: Paketbenennung** — Das Projekt nutzt die Marke **oh-my-gemini-cli** (Repo, Plugin, Befehle), aber das npm-Paket wird als [`oh-my-gemini-sisyphus`](https://www.npmjs.com/package/oh-my-gemini-sisyphus) veröffentlicht. Wenn Sie die CLI-Tools über npm/bun installieren, verwenden Sie `npm install -g oh-my-gemini-sisyphus`.

### Aktualisierung

```bash
# 1. Plugin aktualisieren
/plugin install oh-my-gemini-cli

# 2. Setup erneut ausführen, um Konfiguration zu aktualisieren
/oh-my-gemini-cli:omg-setup
```

Bei Problemen nach der Aktualisierung leeren Sie den alten Plugin-Cache:

```bash
/oh-my-gemini-cli:omg-doctor
```

<h1 align="center">Ihr Gemini hat gerade Superkräfte erhalten.</h1>

<p align="center">
  <img src="assets/omg-character.jpg" alt="oh-my-gemini-cli" width="400" />
</p>

---

## Warum oh-my-gemini-cli?

- **Keine Konfiguration nötig** — Funktioniert sofort mit intelligenten Standardwerten
- **Team-first-Orchestrierung** — Team ist die kanonische Multi-Agenten-Oberfläche (swarm/ultrapilot sind Kompatibilitätsfassaden)
- **Natürliche Sprachschnittstelle** — Keine Befehle auswendig lernen, beschreiben Sie einfach, was Sie wollen
- **Automatische Parallelisierung** — Komplexe Aufgaben werden auf spezialisierte Agenten verteilt
- **Beharrliche Ausführung** — Gibt nicht auf, bis die Arbeit verifiziert und abgeschlossen ist
- **Kostenoptimierung** — Intelligentes Model-Routing spart 30-50% an Tokens
- **Aus Erfahrung lernen** — Extrahiert und wiederverwendet automatisch Problemlösungsmuster
- **Echtzeit-Sichtbarkeit** — HUD statusline zeigt, was im Hintergrund passiert

---

## Funktionen

### Orchestrierungsmodi

Mehrere Strategien für verschiedene Anwendungsfälle — von Team-gestützter Orchestrierung bis token-effizientem Refactoring. [Mehr erfahren →](https://yeachan-heo.github.io/oh-my-gemini-cli-website/docs.html#execution-modes)

| Modus                             | Beschreibung                                                                               | Verwendung                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Team (empfohlen)**              | Kanonische gestufte Pipeline (`team-plan → team-prd → team-exec → team-verify → team-fix`) | Koordinierte Agenten mit gemeinsamer Aufgabenliste                                   |
| **Autopilot**                     | Autonome Ausführung (einzelner Leitagent)                                                  | End-to-End-Feature-Arbeit mit minimalem Aufwand                                      |
| **Ultrawork**                     | Maximale Parallelität (ohne Team)                                                          | Parallele Fixes/Refactorings, wenn Team nicht nötig ist                              |
| **Ralph**                         | Beharrlicher Modus mit Verify/Fix-Schleifen                                                | Aufgaben, die vollständig abgeschlossen werden müssen (keine stillen Teilergebnisse) |
| **Ecomode**                       | Token-effizientes Routing                                                                  | Budget-bewusste Iteration                                                            |
| **Pipeline**                      | Sequentielle, gestufte Verarbeitung                                                        | Mehrstufige Transformationen mit strikter Reihenfolge                                |
| **Swarm / Ultrapilot (veraltet)** | Kompatibilitätsfassaden, die an **Team** weiterleiten                                      | Bestehende Workflows und ältere Dokumentation                                        |

### Intelligente Orchestrierung

- **32 spezialisierte Agenten** für Architektur, Forschung, Design, Tests, Data Science
- **Intelligentes Model-Routing** — Haiku für einfache Aufgaben, Opus für komplexes Reasoning
- **Automatische Delegation** — Immer der richtige Agent für die richtige Aufgabe

### Entwicklererfahrung

- **Magische Schlüsselwörter** — `ralph`, `ulw`, `eco`, `plan` für explizite Steuerung
- **HUD statusline** — Echtzeit-Orchestrierungsmetriken in Ihrer Statusleiste
- **Skill-Lernen** — Wiederverwendbare Muster aus Ihren Sitzungen extrahieren
- **Analytik & Kostenverfolgung** — Token-Nutzung über alle Sitzungen verstehen

### Benutzerdefinierte Skills

Einmal lernen, für immer wiederverwenden. OMC extrahiert hart erarbeitetes Debugging-Wissen in portable Skill-Dateien, die bei Bedarf automatisch injiziert werden.

| | Projektbereich | Benutzerbereich |
|---|---|---|
| **Pfad** | `.omg/skills/` | `~/.omg/skills/` |
| **Geteilt mit** | Team (versionskontrolliert) | Alle Ihre Projekte |
| **Priorität** | Höher (überschreibt Benutzerbereich) | Niedriger (Fallback) |

```yaml
# .omg/skills/fix-proxy-crash.md
---
name: Fix Proxy Crash
description: aiohttp proxy crashes on ClientDisconnectedError
triggers: ["proxy", "aiohttp", "disconnected"]
source: extracted
---
Umschließen Sie den Handler bei server.py:42 mit try/except ClientDisconnectedError...
```

**Skill-Verwaltung:** `/skill list | add | remove | edit | search`
**Auto-Lernen:** `/learner` extrahiert wiederverwendbare Muster mit strengen Qualitätskriterien
**Auto-Injektion:** Passende Skills werden automatisch in den Kontext geladen — kein manueller Aufruf nötig

[Vollständige Feature-Liste →](docs/REFERENCE.md)

---

## Magische Schlüsselwörter

Optionale Abkürzungen für Power-User. Natürliche Sprache funktioniert auch ohne sie.

| Schlüsselwort | Effekt                                           | Beispiel                                                        |
| ------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `team`        | Kanonische Team-Orchestrierung                   | `/oh-my-gemini-cli:team 3:executor "fix all TypeScript errors"` |
| `autopilot`   | Vollständig autonome Ausführung                  | `autopilot: build a todo app`                                   |
| `ralph`       | Beharrlichkeitsmodus                             | `ralph: refactor auth`                                          |
| `ulw`         | Maximale Parallelität                            | `ulw fix all errors`                                            |
| `eco`         | Token-effiziente Ausführung                      | `eco: migrate database`                                         |
| `plan`        | Planungsinterview                                | `plan the API`                                                  |
| `ralplan`     | Iterativer Planungskonsens                       | `ralplan this feature`                                          |
| `swarm`       | Veraltetes Schlüsselwort (leitet an Team weiter) | `swarm 5 agents: fix lint errors`                               |
| `ultrapilot`  | Veraltetes Schlüsselwort (leitet an Team weiter) | `ultrapilot: build a fullstack app`                             |

**Hinweise:**

- **ralph beinhaltet ultrawork**: Wenn Sie den ralph-Modus aktivieren, beinhaltet er automatisch die parallele Ausführung von ultrawork.
- Die Syntax `swarm N agents` wird weiterhin für die Agentenanzahl-Extraktion erkannt, aber die Laufzeitumgebung basiert in v4.1.7+ auf Team.

## Hilfsprogramme

### Rate Limit Wartezeit

Automatische Wiederaufnahme von Gemini Code Sitzungen, wenn Rate Limits zurückgesetzt werden.

```bash
omg wait          # Status prüfen, Anleitung erhalten
omg wait --start  # Auto-Resume-Daemon aktivieren
omg wait --stop   # Daemon deaktivieren
```

**Voraussetzung:** tmux (für Sitzungserkennung)

### Benachrichtigungs-Tags (Telegram/Discord)

Sie können konfigurieren, wer getaggt wird, wenn Stop-Callbacks Sitzungszusammenfassungen senden.

```bash
# Tag-Liste festlegen/ersetzen
omg config-stop-callback telegram --enable --token <bot_token> --chat <chat_id> --tag-list "@alice,bob"
omg config-stop-callback discord --enable --webhook <url> --tag-list "@here,123456789012345678,role:987654321098765432"

# Inkrementelle Aktualisierungen
omg config-stop-callback telegram --add-tag charlie
omg config-stop-callback discord --remove-tag @here
omg config-stop-callback discord --clear-tags
```

Tag-Verhalten:

- Telegram: `alice` wird zu `@alice` normalisiert
- Discord: unterstützt `@here`, `@everyone`, numerische Benutzer-IDs und `role:<id>`
- `file`-Callbacks ignorieren Tag-Optionen

### OpenClaw-Integration

Leiten Sie Gemini Code Session-Ereignisse an ein [OpenClaw](https://openclaw.ai/)-Gateway weiter, um automatisierte Antworten und Workflows über Ihren OpenClaw-Agenten zu ermöglichen.

**Schnelle Einrichtung (empfohlen):**

```bash
/oh-my-gemini-cli:configure-notifications
# → Bei der Abfrage "openclaw" eingeben → "OpenClaw Gateway" wählen
```

**Manuelle Einrichtung:** Erstellen Sie `~/.gemini/omg_config.openclaw.json`:

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

**Umgebungsvariablen:**

| Variable | Beschreibung |
|----------|-------------|
| `OMC_OPENCLAW=1` | OpenClaw aktivieren |
| `OMC_OPENCLAW_DEBUG=1` | Debug-Protokollierung aktivieren |
| `OMC_OPENCLAW_CONFIG=/path/to/config.json` | Konfigurationsdatei-Pfad überschreiben |

**Unterstützte Hook-Ereignisse (6 aktive in bridge.ts):**

| Ereignis | Auslöser | Wichtige Template-Variablen |
|----------|----------|----------------------------|
| `session-start` | Session beginnt | `{{sessionId}}`, `{{projectName}}`, `{{projectPath}}` |
| `stop` | Gemini-Antwort abgeschlossen | `{{sessionId}}`, `{{projectName}}` |
| `keyword-detector` | Bei jeder Prompt-Übermittlung | `{{prompt}}`, `{{sessionId}}` |
| `ask-user-question` | Gemini fordert Benutzereingabe an | `{{question}}`, `{{sessionId}}` |
| `pre-tool-use` | Vor Tool-Aufruf (hohe Frequenz) | `{{toolName}}`, `{{sessionId}}` |
| `post-tool-use` | Nach Tool-Aufruf (hohe Frequenz) | `{{toolName}}`, `{{sessionId}}` |

**Reply-Channel-Umgebungsvariablen:**

| Variable | Beschreibung |
|----------|-------------|
| `OPENCLAW_REPLY_CHANNEL` | Antwortkanal (z.B. `discord`) |
| `OPENCLAW_REPLY_TARGET` | Kanal-ID |
| `OPENCLAW_REPLY_THREAD` | Thread-ID |

Siehe `scripts/openclaw-gateway-demo.mjs` für ein Referenz-Gateway, das OpenClaw-Payloads über ClawdBot an Discord weiterleitet.

---

## Dokumentation

- **[Vollständige Referenz](docs/REFERENCE.md)** — Umfassende Feature-Dokumentation
- **[Performance-Monitoring](docs/PERFORMANCE-MONITORING.md)** — Agentenverfolgung, Debugging und Optimierung
- **[Website](https://yeachan-heo.github.io/oh-my-gemini-cli-website)** — Interaktive Anleitungen und Beispiele
- **[Migrationsleitfaden](docs/MIGRATION.md)** — Upgrade von v2.x
- **[Architektur](docs/ARCHITECTURE.md)** — Wie es unter der Haube funktioniert

---

## Voraussetzungen

- [Gemini Code](https://docs.anthropic.com/gemini-code) CLI
- Gemini Max/Pro-Abonnement ODER Anthropic API-Schlüssel

### Optional: Multi-AI-Orchestrierung

OMC kann optional externe AI-Anbieter für Kreuzvalidierung und Design-Konsistenz orchestrieren. Diese sind **nicht erforderlich** — OMC funktioniert vollständig ohne sie.

| Anbieter                                                  | Installation                        | Was es ermöglicht                                |
| --------------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `npm install -g @google/gemini-cli` | Design-Review, UI-Konsistenz (1M Token Kontext)  |
| [Codex CLI](https://github.com/openai/codex)              | `npm install -g @openai/codex`      | Architekturvalidierung, Code-Review-Gegenprüfung |

**Kosten:** 3 Pro-Pläne (Gemini + Gemini + ChatGPT) decken alles für ca. $60/Monat ab.

---

## Lizenz

MIT

---

<div align="center">

**Inspiriert von:** [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) • [gemini-hud](https://github.com/ryanjoachim/gemini-hud) • [Superpowers](https://github.com/NexTechFusion/Superpowers) • [everything-gemini-code](https://github.com/affaan-m/everything-gemini-code)

**Null Lernkurve. Maximale Leistung.**

</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Yeachan-Heo/oh-my-gemini-cli&type=date&legend=top-left)](https://www.star-history.com/#Yeachan-Heo/oh-my-gemini-cli&type=date&legend=top-left)

## 💖 Dieses Projekt unterstützen

Wenn Oh-My-GeminiCLI Ihren Workflow verbessert, erwägen Sie ein Sponsoring:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-❤️-red?style=for-the-badge&logo=github)](https://github.com/sponsors/Yeachan-Heo)

### Warum sponsern?

- Aktive Entwicklung aufrechterhalten
- Prioritäts-Support für Sponsoren
- Einfluss auf Roadmap & Features
- Freie und Open-Source-Wartung unterstützen

### Andere Möglichkeiten zu helfen

- ⭐ Dem Repository einen Stern geben
- 🐛 Fehler melden
- 💡 Features vorschlagen
- 📝 Code beitragen
