import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  applyRegistryToClaudeSettings,
  getClaudeMcpConfigPath,
  getUnifiedMcpRegistryPath,
  getCodexConfigPath,
  inspectUnifiedMcpRegistrySync,
  syncCodexConfigToml,
  syncUnifiedMcpRegistryTargets,
} from '../mcp-registry.js';

describe('unified MCP registry sync', () => {
  let testRoot: string;
  let claudeDir: string;
  let codexDir: string;
  let omcDir: string;

  beforeEach(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'omc-mcp-registry-'));
    claudeDir = join(testRoot, '.claude');
    codexDir = join(testRoot, '.codex');
    omcDir = join(testRoot, '.omc');

    mkdirSync(claudeDir, { recursive: true });
    mkdirSync(codexDir, { recursive: true });
    mkdirSync(omcDir, { recursive: true });
    process.env.CLAUDE_CONFIG_DIR = claudeDir;
    process.env.CLAUDE_MCP_CONFIG_PATH = join(testRoot, '.claude.json');
    process.env.CODEX_HOME = codexDir;
    process.env.OMC_HOME = omcDir;
  });

  afterEach(() => {
    delete process.env.CLAUDE_CONFIG_DIR;
    delete process.env.CLAUDE_MCP_CONFIG_PATH;
    delete process.env.CODEX_HOME;
    delete process.env.OMC_HOME;

    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('bootstraps the registry from legacy Claude settings, migrates to .claude.json, and syncs Codex config.toml', () => {
    const settings = {
      theme: 'dark',
      mcpServers: {
        gitnexus: {
          command: 'gitnexus',
          args: ['mcp'],
          timeout: 15,
        },
      },
    };

    const { settings: syncedSettings, result } = syncUnifiedMcpRegistryTargets(settings);

    expect(result.bootstrappedFromClaude).toBe(true);
    expect(result.registryExists).toBe(true);
    expect(result.serverNames).toEqual(['gitnexus']);
    expect(syncedSettings).toEqual({ theme: 'dark' });

    const registryPath = getUnifiedMcpRegistryPath();
    expect(JSON.parse(readFileSync(registryPath, 'utf-8'))).toEqual(settings.mcpServers);
    expect(JSON.parse(readFileSync(getClaudeMcpConfigPath(), 'utf-8'))).toEqual({
      mcpServers: settings.mcpServers,
    });

    const codexConfig = readFileSync(getCodexConfigPath(), 'utf-8');
    expect(codexConfig).toContain('# BEGIN OMC MANAGED MCP REGISTRY');
    expect(codexConfig).toContain('[mcp_servers.gitnexus]');
    expect(codexConfig).toContain('command = "gitnexus"');
    expect(codexConfig).toContain('args = ["mcp"]');
    expect(codexConfig).toContain('startup_timeout_sec = 15');
  });

  it('round-trips URL-based remote MCP entries through the unified registry sync', () => {
    const settings = {
      mcpServers: {
        remoteOmc: {
          url: 'https://lab.example.com/mcp',
          timeout: 30,
        },
      },
    };

    const { settings: syncedSettings, result } = syncUnifiedMcpRegistryTargets(settings);

    expect(result.bootstrappedFromClaude).toBe(true);
    expect(result.serverNames).toEqual(['remoteOmc']);
    expect(syncedSettings).toEqual({});

    const registryPath = getUnifiedMcpRegistryPath();
    expect(JSON.parse(readFileSync(registryPath, 'utf-8'))).toEqual(settings.mcpServers);
    expect(JSON.parse(readFileSync(getClaudeMcpConfigPath(), 'utf-8'))).toEqual({
      mcpServers: settings.mcpServers,
    });

    const codexConfig = readFileSync(getCodexConfigPath(), 'utf-8');
    expect(codexConfig).toContain('[mcp_servers.remoteOmc]');
    expect(codexConfig).toContain('url = "https://lab.example.com/mcp"');
    expect(codexConfig).toContain('startup_timeout_sec = 30');
  });

  it('removes legacy mcpServers from settings.json while preserving unrelated Claude settings', () => {
    const existingSettings = {
      theme: 'dark',
      statusLine: {
        type: 'command',
        command: 'node hud.mjs',
      },
      mcpServers: {
        gitnexus: {
          command: 'old-gitnexus',
          args: ['legacy'],
        },
      },
    };

    const { settings, changed } = applyRegistryToClaudeSettings(existingSettings);
    expect(changed).toBe(true);
    expect(settings).toEqual({
      theme: 'dark',
      statusLine: existingSettings.statusLine,
    });
  });

  it('keeps unrelated Codex TOML and is idempotent across repeated syncs', () => {
    const existingToml = [
      'model = "gpt-5"',
      '',
      '[mcp_servers.custom_local]',
      'command = "custom-local"',
      'args = ["serve"]',
      '',
      '# BEGIN OMC MANAGED MCP REGISTRY',
      '',
      '[mcp_servers.old_registry]',
      'command = "legacy"',
      '',
      '# END OMC MANAGED MCP REGISTRY',
      '',
    ].join('\n');

    const registry = {
      gitnexus: {
        command: 'gitnexus',
        args: ['mcp'],
      },
    };

    const first = syncCodexConfigToml(existingToml, registry);
    expect(first.changed).toBe(true);
    expect(first.content).toContain('model = "gpt-5"');
    expect(first.content).toContain('[mcp_servers.custom_local]');
    expect(first.content).toContain('[mcp_servers.gitnexus]');
    expect(first.content).not.toContain('[mcp_servers.old_registry]');

    const second = syncCodexConfigToml(first.content, registry);
    expect(second.changed).toBe(false);
    expect(second.content).toBe(first.content);
  });

  it('removes previously managed Claude and Codex MCP entries when the registry becomes empty', () => {
    writeFileSync(join(omcDir, 'mcp-registry-state.json'), JSON.stringify({ managedServers: ['gitnexus'] }, null, 2));
    writeFileSync(getUnifiedMcpRegistryPath(), JSON.stringify({}, null, 2));
    writeFileSync(getClaudeMcpConfigPath(), JSON.stringify({
      mcpServers: {
        gitnexus: { command: 'gitnexus', args: ['mcp'] },
        customLocal: { command: 'custom-local', args: ['serve'] },
      },
    }, null, 2));
    writeFileSync(getCodexConfigPath(), [
      'model = "gpt-5"',
      '',
      '# BEGIN OMC MANAGED MCP REGISTRY',
      '',
      '[mcp_servers.gitnexus]',
      'command = "gitnexus"',
      'args = ["mcp"]',
      '',
      '# END OMC MANAGED MCP REGISTRY',
      '',
    ].join('\n'));

    const settings = {
      theme: 'dark',
      mcpServers: {
        gitnexus: { command: 'gitnexus', args: ['mcp'] },
      },
    };

    const { settings: syncedSettings, result } = syncUnifiedMcpRegistryTargets(settings);

    expect(result.registryExists).toBe(true);
    expect(result.serverNames).toEqual([]);
    expect(result.claudeChanged).toBe(true);
    expect(result.codexChanged).toBe(true);
    expect(syncedSettings).toEqual({ theme: 'dark' });
    expect(JSON.parse(readFileSync(getClaudeMcpConfigPath(), 'utf-8'))).toEqual({
      mcpServers: {
        customLocal: { command: 'custom-local', args: ['serve'] },
      },
    });
    expect(readFileSync(getCodexConfigPath(), 'utf-8')).toBe('model = "gpt-5"\n');
  });

  it('detects mismatched server definitions during doctor inspection, not just missing names', () => {
    writeFileSync(getUnifiedMcpRegistryPath(), JSON.stringify({
      gitnexus: { command: 'gitnexus', args: ['mcp'], timeout: 15 },
    }, null, 2));
    writeFileSync(getClaudeMcpConfigPath(), JSON.stringify({
      mcpServers: {
        gitnexus: { command: 'gitnexus', args: ['wrong'] },
      },
    }, null, 2));
    mkdirSync(codexDir, { recursive: true });
    writeFileSync(getCodexConfigPath(), [
      '# BEGIN OMC MANAGED MCP REGISTRY',
      '',
      '[mcp_servers.gitnexus]',
      'command = "gitnexus"',
      'args = ["wrong"]',
      '',
      '# END OMC MANAGED MCP REGISTRY',
      '',
    ].join('\n'));

    const status = inspectUnifiedMcpRegistrySync();

    expect(status.claudeMissing).toEqual([]);
    expect(status.codexMissing).toEqual([]);
    expect(status.claudeMismatched).toEqual(['gitnexus']);
    expect(status.codexMismatched).toEqual(['gitnexus']);
  });

  it('is idempotent when registry, Claude MCP root config, and Codex TOML already match', () => {
    writeFileSync(getUnifiedMcpRegistryPath(), JSON.stringify({
      remoteOmc: { url: 'https://lab.example.com/mcp', timeout: 30 },
    }, null, 2));
    writeFileSync(getClaudeMcpConfigPath(), JSON.stringify({
      mcpServers: {
        remoteOmc: { url: 'https://lab.example.com/mcp', timeout: 30 },
      },
    }, null, 2));
    writeFileSync(getCodexConfigPath(), [
      '# BEGIN OMC MANAGED MCP REGISTRY',
      '',
      '[mcp_servers.remoteOmc]',
      'url = "https://lab.example.com/mcp"',
      'startup_timeout_sec = 30',
      '',
      '# END OMC MANAGED MCP REGISTRY',
      '',
    ].join('\n'));

    const { settings, result } = syncUnifiedMcpRegistryTargets({ theme: 'dark' });

    expect(settings).toEqual({ theme: 'dark' });
    expect(result.bootstrappedFromClaude).toBe(false);
    expect(result.claudeChanged).toBe(false);
    expect(result.codexChanged).toBe(false);
  });

  it('preserves existing .claude.json server definitions when legacy settings still contain stale copies', () => {
    writeFileSync(getUnifiedMcpRegistryPath(), JSON.stringify({
      gitnexus: { command: 'gitnexus', args: ['mcp'] },
    }, null, 2));
    writeFileSync(getClaudeMcpConfigPath(), JSON.stringify({
      mcpServers: {
        gitnexus: { command: 'gitnexus', args: ['mcp'] },
        customLocal: { command: 'custom-local', args: ['serve'] },
      },
    }, null, 2));

    const { settings, result } = syncUnifiedMcpRegistryTargets({
      theme: 'dark',
      mcpServers: {
        customLocal: { command: 'stale-custom', args: ['legacy'] },
      },
    });

    expect(settings).toEqual({ theme: 'dark' });
    expect(result.bootstrappedFromClaude).toBe(false);
    expect(JSON.parse(readFileSync(getClaudeMcpConfigPath(), 'utf-8'))).toEqual({
      mcpServers: {
        customLocal: { command: 'custom-local', args: ['serve'] },
        gitnexus: { command: 'gitnexus', args: ['mcp'] },
      },
    });
  });

  it('detects mismatched URL-based remote MCP definitions during doctor inspection', () => {
    writeFileSync(getUnifiedMcpRegistryPath(), JSON.stringify({
      remoteOmc: { url: 'https://lab.example.com/mcp', timeout: 30 },
    }, null, 2));
    writeFileSync(getClaudeMcpConfigPath(), JSON.stringify({
      mcpServers: {
        remoteOmc: { url: 'https://staging.example.com/mcp', timeout: 30 },
      },
    }, null, 2));
    mkdirSync(codexDir, { recursive: true });
    writeFileSync(getCodexConfigPath(), [
      '# BEGIN OMC MANAGED MCP REGISTRY',
      '',
      '[mcp_servers.remoteOmc]',
      'url = "https://staging.example.com/mcp"',
      'startup_timeout_sec = 30',
      '',
      '# END OMC MANAGED MCP REGISTRY',
      '',
    ].join('\n'));

    const status = inspectUnifiedMcpRegistrySync();

    expect(status.claudeMissing).toEqual([]);
    expect(status.codexMissing).toEqual([]);
    expect(status.claudeMismatched).toEqual(['remoteOmc']);
    expect(status.codexMismatched).toEqual(['remoteOmc']);
  });
});
