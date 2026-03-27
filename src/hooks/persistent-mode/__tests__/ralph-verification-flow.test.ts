import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { checkPersistentModes } from '../index.js';
import { writePrd, type PRD } from '../../ralph/prd.js';

describe('Ralph verification flow', () => {
  let testDir: string;
  let geminiConfigDir: string;
  let originalGeminiConfigDir: string | undefined;

  beforeEach(() => {
    testDir = join(tmpdir(), `ralph-verification-flow-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    geminiConfigDir = join(testDir, '.fake-gemini');
    mkdirSync(testDir, { recursive: true });
    mkdirSync(geminiConfigDir, { recursive: true });
    execSync('git init', { cwd: testDir });

    originalGeminiConfigDir = process.env.CLAUDE_CONFIG_DIR;
    process.env.CLAUDE_CONFIG_DIR = geminiConfigDir;
  });

  afterEach(() => {
    if (originalGeminiConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = originalGeminiConfigDir;
    }

    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function writeRalphState(sessionId: string, extra: Record<string, unknown> = {}): void {
    const sessionDir = join(testDir, '.omg', 'state', 'sessions', sessionId);
    mkdirSync(sessionDir, { recursive: true });
    writeFileSync(join(sessionDir, 'ralph-state.json'), JSON.stringify({
      active: true,
      iteration: 4,
      max_iterations: 10,
      session_id: sessionId,
      started_at: new Date().toISOString(),
      prompt: 'Implement issue #1496',
      ...extra,
    }));
  }

  it('enters verification instead of completing immediately when PRD is done', async () => {
    const sessionId = 'ralph-prd-complete';
    const prd: PRD = {
      project: 'Test',
      branchName: 'ralph/test',
      description: 'Test PRD',
      userStories: [{
        id: 'US-001',
        title: 'Done',
        description: 'All work complete',
        acceptanceCriteria: ['Feature is implemented'],
        priority: 1,
        passes: true,
      }],
    };

    writePrd(testDir, prd);
    writeRalphState(sessionId, { critic_mode: 'codex' });

    const result = await checkPersistentModes(sessionId, testDir);

    expect(result.shouldBlock).toBe(true);
    expect(result.mode).toBe('ralph');
    expect(result.message).toContain('CODEX CRITIC VERIFICATION REQUIRED');
    expect(result.message).toContain('ask codex --agent-prompt critic');
  });

  it('completes Ralph after generic approval marker is seen in transcript', async () => {
    const sessionId = 'ralph-approved';
    const sessionDir = join(testDir, '.omg', 'state', 'sessions', sessionId);
    mkdirSync(sessionDir, { recursive: true });

    writeRalphState(sessionId);
    writeFileSync(join(sessionDir, 'ralph-verification-state.json'), JSON.stringify({
      pending: true,
      completion_claim: 'All stories are complete',
      verification_attempts: 0,
      max_verification_attempts: 3,
      requested_at: new Date().toISOString(),
      original_task: 'Implement issue #1496',
      critic_mode: 'critic',
    }));

    const transcriptDir = join(geminiConfigDir, 'sessions', sessionId);
    mkdirSync(transcriptDir, { recursive: true });
    writeFileSync(
      join(transcriptDir, 'transcript.md'),
      '<ralph-approved critic="critic">VERIFIED_COMPLETE</ralph-approved>'
    );

    const result = await checkPersistentModes(sessionId, testDir);

    expect(result.shouldBlock).toBe(false);
    expect(result.message).toContain('Critic verified task completion');
  });
});
