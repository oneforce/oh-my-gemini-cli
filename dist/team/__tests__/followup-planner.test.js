import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { isShortTeamFollowupRequest, isShortRalphFollowupRequest, isApprovedExecutionFollowupShortcut, resolveApprovedTeamFollowupContext, } from '../followup-planner.js';
describe('followup-planner', () => {
    describe('isShortTeamFollowupRequest', () => {
        it('matches "team"', () => {
            expect(isShortTeamFollowupRequest('team')).toBe(true);
        });
        it('matches "team please"', () => {
            expect(isShortTeamFollowupRequest('team please')).toBe(true);
        });
        it('matches "/team"', () => {
            expect(isShortTeamFollowupRequest('/team')).toBe(true);
        });
        it('matches "run team"', () => {
            expect(isShortTeamFollowupRequest('run team')).toBe(true);
        });
        it('matches "start team"', () => {
            expect(isShortTeamFollowupRequest('start team')).toBe(true);
        });
        it('matches "team으로 해줘"', () => {
            expect(isShortTeamFollowupRequest('team으로 해줘')).toBe(true);
        });
        it('matches with surrounding whitespace', () => {
            expect(isShortTeamFollowupRequest('  team  ')).toBe(true);
        });
        it('does not match long team descriptions', () => {
            expect(isShortTeamFollowupRequest('team run this big task for me now')).toBe(false);
        });
        it('does not match ralph', () => {
            expect(isShortTeamFollowupRequest('ralph')).toBe(false);
        });
        it('does not match empty string', () => {
            expect(isShortTeamFollowupRequest('')).toBe(false);
        });
    });
    describe('isShortRalphFollowupRequest', () => {
        it('matches "ralph"', () => {
            expect(isShortRalphFollowupRequest('ralph')).toBe(true);
        });
        it('matches "ralph please"', () => {
            expect(isShortRalphFollowupRequest('ralph please')).toBe(true);
        });
        it('matches "/ralph"', () => {
            expect(isShortRalphFollowupRequest('/ralph')).toBe(true);
        });
        it('matches "run ralph"', () => {
            expect(isShortRalphFollowupRequest('run ralph')).toBe(true);
        });
        it('matches "start ralph"', () => {
            expect(isShortRalphFollowupRequest('start ralph')).toBe(true);
        });
        it('does not match long descriptions', () => {
            expect(isShortRalphFollowupRequest('ralph do this big task')).toBe(false);
        });
        it('does not match team', () => {
            expect(isShortRalphFollowupRequest('team')).toBe(false);
        });
    });
    describe('isApprovedExecutionFollowupShortcut', () => {
        it('returns true when all conditions met for team mode', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                planningComplete: true,
                priorSkill: 'ralplan',
            })).toBe(true);
        });
        it('returns true when all conditions met for ralph mode', () => {
            expect(isApprovedExecutionFollowupShortcut('ralph', 'ralph', {
                planningComplete: true,
                priorSkill: 'ralplan',
            })).toBe(true);
        });
        it('returns false when planningComplete is false', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                planningComplete: false,
                priorSkill: 'ralplan',
            })).toBe(false);
        });
        it('returns false when planningComplete is undefined', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                priorSkill: 'ralplan',
            })).toBe(false);
        });
        it('returns false when priorSkill is not ralplan', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                planningComplete: true,
                priorSkill: 'ralph',
            })).toBe(false);
        });
        it('returns false when priorSkill is null', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                planningComplete: true,
                priorSkill: null,
            })).toBe(false);
        });
        it('returns false when priorSkill is undefined', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team', {
                planningComplete: true,
            })).toBe(false);
        });
        it('returns false when text is not a short follow-up', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'please run this big task for me', {
                planningComplete: true,
                priorSkill: 'ralplan',
            })).toBe(false);
        });
        it('returns true for "team please" pattern', () => {
            expect(isApprovedExecutionFollowupShortcut('team', 'team please', {
                planningComplete: true,
                priorSkill: 'ralplan',
            })).toBe(true);
        });
    });
    describe('resolveApprovedTeamFollowupContext', () => {
        let testDir;
        let plansDir;
        beforeEach(() => {
            testDir = mkdtempSync(join(tmpdir(), 'followup-planner-test-'));
            plansDir = join(testDir, '.omc', 'plans');
            mkdirSync(plansDir, { recursive: true });
        });
        afterEach(() => {
            rmSync(testDir, { recursive: true, force: true });
        });
        it('returns null when no plans exist', () => {
            const result = resolveApprovedTeamFollowupContext(testDir, 'do the task');
            expect(result).toBeNull();
        });
        it('returns null when only PRD exists (no test spec)', () => {
            writeFileSync(join(plansDir, 'prd-feature.md'), '# PRD\n\nomc team 3:claude "implement auth"\n');
            const result = resolveApprovedTeamFollowupContext(testDir, 'do the task');
            expect(result).toBeNull();
        });
        it('returns null when PRD has no launch hint', () => {
            writeFileSync(join(plansDir, 'prd-feature.md'), '# PRD\n\nNo commands.');
            writeFileSync(join(plansDir, 'test-spec-feature.md'), '# Test Spec');
            const result = resolveApprovedTeamFollowupContext(testDir, 'do the task');
            expect(result).toBeNull();
        });
        it('returns context with hint when planning is complete and hint exists', () => {
            writeFileSync(join(plansDir, 'prd-feature.md'), '# PRD\n\nomc team 3:claude "implement auth"\n');
            writeFileSync(join(plansDir, 'test-spec-feature.md'), '# Test Spec');
            const result = resolveApprovedTeamFollowupContext(testDir, 'do the task');
            expect(result).not.toBeNull();
            expect(result.hint.mode).toBe('team');
            expect(result.hint.task).toBe('implement auth');
            expect(result.hint.workerCount).toBe(3);
            expect(result.launchCommand).toContain('omc team');
        });
    });
});
//# sourceMappingURL=followup-planner.test.js.map