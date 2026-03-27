import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    const { join: pathJoin } = await import('path');
    const repoRoot = process.cwd();
    const sourceGeminiMdPath = pathJoin(repoRoot, 'src', 'docs', 'GEMINI.md');
    const realGeminiMdPath = pathJoin(repoRoot, 'docs', 'GEMINI.md');
    const withRedirect = (pathLike) => {
        const normalized = String(pathLike).replace(/\\/g, '/');
        if (normalized === sourceGeminiMdPath.replace(/\\/g, '/')) {
            return realGeminiMdPath;
        }
        return String(pathLike);
    };
    return {
        ...actual,
        existsSync: vi.fn((pathLike) => actual.existsSync(withRedirect(pathLike))),
        readFileSync: vi.fn((pathLike, options) => actual.readFileSync(withRedirect(pathLike), options)),
    };
});
async function loadInstallerWithEnv(geminiConfigDir, homeDir, codexHome, omgHome) {
    vi.resetModules();
    process.env.CLAUDE_CONFIG_DIR = geminiConfigDir;
    process.env.HOME = homeDir;
    process.env.CODEX_HOME = codexHome;
    process.env.OMC_HOME = omgHome;
    delete process.env.CLAUDE_MCP_CONFIG_PATH;
    delete process.env.OMC_MCP_REGISTRY_PATH;
    return import('../installer/index.js');
}
describe('installer MCP config ownership (issue #1802)', () => {
    let tempRoot;
    let homeDir;
    let geminiConfigDir;
    let codexHome;
    let omgHome;
    let originalEnv;
    beforeEach(() => {
        tempRoot = mkdtempSync(join(tmpdir(), 'omg-installer-mcp-config-'));
        homeDir = join(tempRoot, 'home');
        geminiConfigDir = join(homeDir, '.gemini');
        codexHome = join(tempRoot, '.codex');
        omgHome = join(tempRoot, '.omg');
        mkdirSync(homeDir, { recursive: true });
        mkdirSync(geminiConfigDir, { recursive: true });
        mkdirSync(codexHome, { recursive: true });
        mkdirSync(omgHome, { recursive: true });
        originalEnv = { ...process.env };
    });
    afterEach(() => {
        process.env = originalEnv;
        rmSync(tempRoot, { recursive: true, force: true });
        vi.resetModules();
    });
    it('moves legacy settings.json mcpServers into ~/.gemini.json during install', async () => {
        const settingsPath = join(geminiConfigDir, 'settings.json');
        const geminiRootConfigPath = join(homeDir, '.gemini.json');
        const codexConfigPath = join(codexHome, 'config.toml');
        const registryPath = join(omgHome, 'mcp-registry.json');
        writeFileSync(settingsPath, JSON.stringify({
            theme: 'dark',
            statusLine: {
                type: 'command',
                command: 'node hud.mjs',
            },
            mcpServers: {
                gitnexus: {
                    command: 'gitnexus',
                    args: ['mcp'],
                    timeout: 15,
                },
            },
        }, null, 2));
        const installer = await loadInstallerWithEnv(geminiConfigDir, homeDir, codexHome, omgHome);
        const result = installer.install({
            skipGeminiCheck: true,
            skipHud: true,
        });
        expect(result.success).toBe(true);
        expect(existsSync(settingsPath)).toBe(true);
        expect(existsSync(geminiRootConfigPath)).toBe(true);
        expect(existsSync(registryPath)).toBe(true);
        expect(existsSync(codexConfigPath)).toBe(true);
        const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
        expect(settings).toEqual({
            theme: 'dark',
            statusLine: {
                type: 'command',
                command: 'node hud.mjs',
            },
        });
        expect(settings).not.toHaveProperty('mcpServers');
        const geminiRootConfig = JSON.parse(readFileSync(geminiRootConfigPath, 'utf-8'));
        expect(geminiRootConfig).toEqual({
            mcpServers: {
                gitnexus: {
                    command: 'gitnexus',
                    args: ['mcp'],
                    timeout: 15,
                },
            },
        });
        expect(JSON.parse(readFileSync(registryPath, 'utf-8'))).toEqual({
            gitnexus: {
                command: 'gitnexus',
                args: ['mcp'],
                timeout: 15,
            },
        });
        const codexConfig = readFileSync(codexConfigPath, 'utf-8');
        expect(codexConfig).toContain('# BEGIN OMC MANAGED MCP REGISTRY');
        expect(codexConfig).toContain('[mcp_servers.gitnexus]');
        expect(codexConfig).toContain('command = "gitnexus"');
    });
});
//# sourceMappingURL=installer-mcp-config.test.js.map