import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  const { join: pathJoin } = await import('path');
  const repoRoot = process.cwd();
  const sourceAgentsDir = pathJoin(repoRoot, 'src', 'agents');
  const sourceGeminiMdPath = pathJoin(repoRoot, 'src', 'docs', 'GEMINI.md');
  const realAgentsDir = pathJoin(repoRoot, 'agents');
  const realGeminiMdPath = pathJoin(repoRoot, 'docs', 'GEMINI.md');

  const withRedirect = (pathLike: unknown): string => {
    const normalized = String(pathLike).replace(/\\/g, '/');
    const normalizedSourceAgentsDir = sourceAgentsDir.replace(/\\/g, '/');
    const normalizedRealAgentsDir = realAgentsDir.replace(/\\/g, '/');

    if (normalized === normalizedSourceAgentsDir) {
      return realAgentsDir;
    }
    if (normalized.startsWith(`${normalizedSourceAgentsDir}/`)) {
      return normalized.replace(normalizedSourceAgentsDir, normalizedRealAgentsDir);
    }
    if (normalized === sourceGeminiMdPath.replace(/\\/g, '/')) {
      return realGeminiMdPath;
    }
    return String(pathLike);
  };

  return {
    ...actual,
    existsSync: vi.fn((pathLike: Parameters<typeof actual.existsSync>[0]) =>
      actual.existsSync(withRedirect(pathLike))
    ),
    readFileSync: vi.fn((pathLike: Parameters<typeof actual.readFileSync>[0], options?: Parameters<typeof actual.readFileSync>[1]) =>
      actual.readFileSync(withRedirect(pathLike), options as never)
    ),
    readdirSync: vi.fn((pathLike: Parameters<typeof actual.readdirSync>[0], options?: Parameters<typeof actual.readdirSync>[1]) =>
      actual.readdirSync(withRedirect(pathLike), options as never)
    ),
  };
});

async function loadInstallerWithEnv(geminiConfigDir: string, homeDir: string) {
  vi.resetModules();
  process.env.CLAUDE_CONFIG_DIR = geminiConfigDir;
  process.env.HOME = homeDir;
  return import('../installer/index.js');
}

describe('installer legacy agent sync gating (issue #1502)', () => {
  let tempRoot: string;
  let homeDir: string;
  let geminiConfigDir: string;
  let originalGeminiConfigDir: string | undefined;
  let originalHome: string | undefined;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'omg-installer-plugin-agents-'));
    homeDir = join(tempRoot, 'home');
    geminiConfigDir = join(homeDir, '.gemini');
    mkdirSync(homeDir, { recursive: true });
    mkdirSync(geminiConfigDir, { recursive: true });

    originalGeminiConfigDir = process.env.CLAUDE_CONFIG_DIR;
    originalHome = process.env.HOME;
  });

  afterEach(() => {
    if (originalGeminiConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = originalGeminiConfigDir;
    }

    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }

    rmSync(tempRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('skips recreating ~/.gemini/agents when installed plugin agent files already exist', async () => {
    const pluginInstallPath = join(
      geminiConfigDir,
      'plugins',
      'cache',
      'omg',
      'oh-my-gemini-cli',
      '9.9.9'
    );
    const pluginAgentsDir = join(pluginInstallPath, 'agents');
    mkdirSync(pluginAgentsDir, { recursive: true });
    writeFileSync(join(pluginAgentsDir, 'executor.md'), '---\nname: executor\ndescription: test\n---\n');

    const installedPluginsPath = join(geminiConfigDir, 'plugins', 'installed_plugins.json');
    mkdirSync(join(geminiConfigDir, 'plugins'), { recursive: true });
    writeFileSync(installedPluginsPath, JSON.stringify({
      plugins: {
        'oh-my-gemini-cli@omg': [
          { installPath: pluginInstallPath }
        ]
      }
    }, null, 2));

    const installer = await loadInstallerWithEnv(geminiConfigDir, homeDir);
    const result = installer.install({
      skipGeminiCheck: true,
      skipHud: true,
    });

    expect(result.success).toBe(true);
    expect(result.installedAgents).toEqual([]);
    expect(installer.hasPluginProvidedAgentFiles()).toBe(true);
    expect(existsSync(join(geminiConfigDir, 'agents'))).toBe(false);
    expect(installer.isInstalled()).toBe(true);
  });

  it('still installs legacy agent files when no plugin-provided agent files are available', async () => {
    const installer = await loadInstallerWithEnv(geminiConfigDir, homeDir);
    const result = installer.install({
      skipGeminiCheck: true,
      skipHud: true,
    });

    expect(result.success).toBe(true);
    expect(result.installedAgents.length).toBeGreaterThan(0);
    expect(existsSync(join(geminiConfigDir, 'agents'))).toBe(true);
    expect(readdirSync(join(geminiConfigDir, 'agents')).some(file => file.endsWith('.md'))).toBe(true);
    expect(installer.hasPluginProvidedAgentFiles()).toBe(false);
    expect(installer.isInstalled()).toBe(true);
  });
});
