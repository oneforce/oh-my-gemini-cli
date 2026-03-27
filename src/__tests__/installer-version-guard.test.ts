import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { install, CLAUDE_CONFIG_DIR, VERSION_FILE } from '../installer/index.js';

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);

function withUnixPaths(pathLike: Parameters<typeof existsSync>[0] | Parameters<typeof readFileSync>[0]): string {
  return String(pathLike).replace(/\\/g, '/');
}

describe('install downgrade protection (issue #1382)', () => {
  const geminiMdPath = join(CLAUDE_CONFIG_DIR, 'GEMINI.md');
  const homeGeminiMdPath = join(homedir(), 'GEMINI.md');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips syncing when installed version metadata is newer than the CLI package version', () => {
    mockedExistsSync.mockImplementation((pathLike) => {
      const path = withUnixPaths(pathLike);
      return path === withUnixPaths(VERSION_FILE) || path === withUnixPaths(geminiMdPath);
    });

    mockedReadFileSync.mockImplementation((pathLike) => {
      const path = withUnixPaths(pathLike);
      if (path === withUnixPaths(VERSION_FILE)) {
        return JSON.stringify({ version: '4.7.5' });
      }
      if (path === withUnixPaths(geminiMdPath)) {
        return '<!-- OMC:START -->\n<!-- OMC:VERSION:4.7.5 -->\n# OMC\n<!-- OMC:END -->\n';
      }
      throw new Error(`Unexpected read: ${path}`);
    });

    const result = install({
      version: '4.5.1',
      skipGeminiCheck: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Skipping install');
    expect(result.message).toContain('4.7.5');
    expect(result.message).toContain('4.5.1');
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it('falls back to the existing GEMINI.md version marker when metadata is missing', () => {
    mockedExistsSync.mockImplementation((pathLike) => {
      const path = withUnixPaths(pathLike);
      return path === withUnixPaths(homeGeminiMdPath);
    });

    mockedReadFileSync.mockImplementation((pathLike) => {
      const path = withUnixPaths(pathLike);
      if (path === withUnixPaths(homeGeminiMdPath)) {
        return '<!-- OMC:START -->\n<!-- OMC:VERSION:4.7.5 -->\n# OMC\n<!-- OMC:END -->\n';
      }
      throw new Error(`Unexpected read: ${path}`);
    });

    const result = install({
      version: '4.5.1',
      skipGeminiCheck: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Skipping install');
    expect(result.message).toContain('4.7.5');
    expect(result.message).toContain('4.5.1');
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });
});
