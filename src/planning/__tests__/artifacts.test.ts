import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  readPlanningArtifacts,
  isPlanningComplete,
  readApprovedExecutionLaunchHint,
} from '../artifacts.js';

describe('planning/artifacts', () => {
  let testDir: string;
  let plansDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'artifacts-test-'));
    plansDir = join(testDir, '.omc', 'plans');
    mkdirSync(plansDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('readPlanningArtifacts', () => {
    it('returns empty arrays when plans dir does not exist', () => {
      const result = readPlanningArtifacts(join(testDir, 'nonexistent'));
      expect(result).toEqual({ prdPaths: [], testSpecPaths: [] });
    });

    it('returns empty arrays when plans dir is empty', () => {
      const result = readPlanningArtifacts(testDir);
      expect(result).toEqual({ prdPaths: [], testSpecPaths: [] });
    });

    it('returns prd paths for prd-*.md files', () => {
      writeFileSync(join(plansDir, 'prd-feature.md'), '# PRD');
      const result = readPlanningArtifacts(testDir);
      expect(result.prdPaths).toHaveLength(1);
      expect(result.prdPaths[0]).toContain('prd-feature.md');
    });

    it('returns test-spec paths for test-spec-*.md files', () => {
      writeFileSync(join(plansDir, 'test-spec-feature.md'), '# Test Spec');
      const result = readPlanningArtifacts(testDir);
      expect(result.testSpecPaths).toHaveLength(1);
      expect(result.testSpecPaths[0]).toContain('test-spec-feature.md');
    });

    it('ignores non-matching files', () => {
      writeFileSync(join(plansDir, 'notes.md'), '# Notes');
      writeFileSync(join(plansDir, 'README.txt'), 'readme');
      const result = readPlanningArtifacts(testDir);
      expect(result.prdPaths).toHaveLength(0);
      expect(result.testSpecPaths).toHaveLength(0);
    });

    it('returns multiple files sorted descending', () => {
      writeFileSync(join(plansDir, 'prd-aaa.md'), '# PRD A');
      writeFileSync(join(plansDir, 'prd-bbb.md'), '# PRD B');
      const result = readPlanningArtifacts(testDir);
      expect(result.prdPaths).toHaveLength(2);
      // descending order: bbb > aaa
      expect(result.prdPaths[0]).toContain('prd-bbb.md');
    });
  });

  describe('isPlanningComplete', () => {
    it('returns false when no PRDs', () => {
      expect(isPlanningComplete({ prdPaths: [], testSpecPaths: ['spec.md'] })).toBe(false);
    });

    it('returns false when no test specs', () => {
      expect(isPlanningComplete({ prdPaths: ['prd.md'], testSpecPaths: [] })).toBe(false);
    });

    it('returns true when both present', () => {
      expect(isPlanningComplete({ prdPaths: ['prd.md'], testSpecPaths: ['spec.md'] })).toBe(true);
    });
  });

  describe('readApprovedExecutionLaunchHint', () => {
    it('returns null when no plans dir', () => {
      const result = readApprovedExecutionLaunchHint(join(testDir, 'nope'), 'team');
      expect(result).toBeNull();
    });

    it('returns null when PRD has no launch command', () => {
      writeFileSync(join(plansDir, 'prd-feature.md'), '# PRD\n\nNo commands here.');
      const result = readApprovedExecutionLaunchHint(testDir, 'team');
      expect(result).toBeNull();
    });

    it('extracts team launch hint with worker count and agent type', () => {
      writeFileSync(
        join(plansDir, 'prd-feature.md'),
        '# PRD\n\nRun: omc team 3:claude "implement auth"\n'
      );
      const result = readApprovedExecutionLaunchHint(testDir, 'team');
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('team');
      expect(result!.task).toBe('implement auth');
      expect(result!.workerCount).toBe(3);
      expect(result!.agentType).toBe('claude');
      expect(result!.linkedRalph).toBe(false);
      expect(result!.sourcePath).toContain('prd-feature.md');
    });

    it('extracts team launch hint without worker spec', () => {
      writeFileSync(
        join(plansDir, 'prd-feature.md'),
        '# PRD\n\nRun: omc team "implement the feature"\n'
      );
      const result = readApprovedExecutionLaunchHint(testDir, 'team');
      expect(result).not.toBeNull();
      expect(result!.task).toBe('implement the feature');
      expect(result!.workerCount).toBeUndefined();
      expect(result!.agentType).toBeUndefined();
    });

    it('detects --linked-ralph flag', () => {
      writeFileSync(
        join(plansDir, 'prd-feature.md'),
        '# PRD\n\nomc team 2:codex "fix the bug" --linked-ralph\n'
      );
      const result = readApprovedExecutionLaunchHint(testDir, 'team');
      expect(result).not.toBeNull();
      expect(result!.linkedRalph).toBe(true);
    });

    it('extracts ralph launch hint', () => {
      writeFileSync(
        join(plansDir, 'prd-feature.md'),
        '# PRD\n\nomc ralph "do the work"\n'
      );
      const result = readApprovedExecutionLaunchHint(testDir, 'ralph');
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('ralph');
      expect(result!.task).toBe('do the work');
    });

    it('returns null for ralph mode when only team command present', () => {
      writeFileSync(
        join(plansDir, 'prd-feature.md'),
        '# PRD\n\nomc team 3:claude "implement auth"\n'
      );
      const result = readApprovedExecutionLaunchHint(testDir, 'ralph');
      expect(result).toBeNull();
    });

    it('uses the latest PRD when multiple exist', () => {
      writeFileSync(join(plansDir, 'prd-aaa.md'), '# Old PRD\n\nomc team "old task"\n');
      writeFileSync(join(plansDir, 'prd-zzz.md'), '# New PRD\n\nomc team "new task"\n');
      const result = readApprovedExecutionLaunchHint(testDir, 'team');
      expect(result!.task).toBe('new task');
    });
  });
});
