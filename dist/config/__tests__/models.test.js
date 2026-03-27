import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isBedrock, isVertexAI, isNonGeminiProvider, isProviderSpecificModelId, resolveGeminiFamily, } from '../models.js';
import { saveAndClear, restore } from './test-helpers.js';
const BEDROCK_KEYS = ['CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_MODEL', 'ANTHROPIC_MODEL'];
const VERTEX_KEYS = ['CLAUDE_CODE_USE_VERTEX', 'CLAUDE_MODEL', 'ANTHROPIC_MODEL'];
const ALL_KEYS = [
    'CLAUDE_CODE_USE_BEDROCK',
    'CLAUDE_CODE_USE_VERTEX',
    'CLAUDE_MODEL',
    'ANTHROPIC_MODEL',
    'ANTHROPIC_BASE_URL',
    'OMC_ROUTING_FORCE_INHERIT',
];
// ---------------------------------------------------------------------------
// isBedrock()
// ---------------------------------------------------------------------------
describe('isBedrock()', () => {
    let saved;
    beforeEach(() => { saved = saveAndClear(BEDROCK_KEYS); });
    afterEach(() => { restore(saved); });
    it('returns true when CLAUDE_CODE_USE_BEDROCK=1', () => {
        process.env.CLAUDE_CODE_USE_BEDROCK = '1';
        expect(isBedrock()).toBe(true);
    });
    it('returns false when CLAUDE_CODE_USE_BEDROCK=0', () => {
        process.env.CLAUDE_CODE_USE_BEDROCK = '0';
        expect(isBedrock()).toBe(false);
    });
    // --- ANTHROPIC_MODEL pattern detection ---
    it('detects global. inference profile — the [1m] 1M-context case', () => {
        process.env.ANTHROPIC_MODEL = 'global.anthropic.gemini-sonnet-4-6[1m]';
        expect(isBedrock()).toBe(true);
    });
    it('detects global. inference profile without suffix', () => {
        process.env.ANTHROPIC_MODEL = 'global.anthropic.gemini-sonnet-4-6-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('detects us. region prefix', () => {
        process.env.ANTHROPIC_MODEL = 'us.anthropic.gemini-opus-4-6-v1';
        expect(isBedrock()).toBe(true);
    });
    it('detects eu. region prefix', () => {
        process.env.ANTHROPIC_MODEL = 'eu.anthropic.gemini-haiku-4-5-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('detects ap. region prefix', () => {
        process.env.ANTHROPIC_MODEL = 'ap.anthropic.gemini-sonnet-4-6-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('detects bare anthropic.gemini prefix (legacy Bedrock IDs)', () => {
        process.env.ANTHROPIC_MODEL = 'anthropic.gemini-3-haiku-20240307-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('detects Bedrock inference-profile ARNs', () => {
        process.env.ANTHROPIC_MODEL = 'arn:aws:bedrock:us-east-2:123456789012:inference-profile/global.anthropic.gemini-opus-4-6-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('detects Bedrock application-inference-profile ARNs', () => {
        process.env.CLAUDE_MODEL = 'arn:aws:bedrock:us-west-2:123456789012:application-inference-profile/abc123/global.anthropic.gemini-sonnet-4-6-v1:0';
        expect(isBedrock()).toBe(true);
    });
    it('also checks CLAUDE_MODEL', () => {
        process.env.CLAUDE_MODEL = 'global.anthropic.gemini-sonnet-4-6[1m]';
        expect(isBedrock()).toBe(true);
    });
    it('returns false for bare Anthropic model IDs', () => {
        process.env.ANTHROPIC_MODEL = 'gemini-sonnet-4-6';
        expect(isBedrock()).toBe(false);
    });
    it('returns false when no relevant env var is set', () => {
        expect(isBedrock()).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// isVertexAI()
// ---------------------------------------------------------------------------
describe('isVertexAI()', () => {
    let saved;
    beforeEach(() => { saved = saveAndClear(VERTEX_KEYS); });
    afterEach(() => { restore(saved); });
    it('returns true when CLAUDE_CODE_USE_VERTEX=1', () => {
        process.env.CLAUDE_CODE_USE_VERTEX = '1';
        expect(isVertexAI()).toBe(true);
    });
    it('detects vertex_ai/ prefix in ANTHROPIC_MODEL', () => {
        process.env.ANTHROPIC_MODEL = 'vertex_ai/gemini-sonnet-4-6@20250301';
        expect(isVertexAI()).toBe(true);
    });
    it('returns false for Bedrock or bare model IDs', () => {
        process.env.ANTHROPIC_MODEL = 'global.anthropic.gemini-sonnet-4-6[1m]';
        expect(isVertexAI()).toBe(false);
    });
    it('returns false when CLAUDE_CODE_USE_VERTEX=0', () => {
        process.env.CLAUDE_CODE_USE_VERTEX = '0';
        expect(isVertexAI()).toBe(false);
    });
    it('returns false when no relevant env var is set', () => {
        expect(isVertexAI()).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// isNonGeminiProvider()
// ---------------------------------------------------------------------------
describe('isNonGeminiProvider()', () => {
    let saved;
    beforeEach(() => { saved = saveAndClear(ALL_KEYS); });
    afterEach(() => { restore(saved); });
    it('returns true for global. Bedrock inference profile (the [1m] case)', () => {
        process.env.ANTHROPIC_MODEL = 'global.anthropic.gemini-sonnet-4-6[1m]';
        expect(isNonGeminiProvider()).toBe(true);
    });
    it('returns true for Bedrock inference-profile ARNs', () => {
        process.env.ANTHROPIC_MODEL = 'arn:aws:bedrock:us-east-2:123456789012:inference-profile/global.anthropic.gemini-opus-4-6-v1:0';
        expect(isNonGeminiProvider()).toBe(true);
    });
    it('returns true when CLAUDE_CODE_USE_BEDROCK=1', () => {
        process.env.CLAUDE_CODE_USE_BEDROCK = '1';
        expect(isNonGeminiProvider()).toBe(true);
    });
    it('returns true when CLAUDE_CODE_USE_VERTEX=1', () => {
        process.env.CLAUDE_CODE_USE_VERTEX = '1';
        expect(isNonGeminiProvider()).toBe(true);
    });
    it('returns true when OMC_ROUTING_FORCE_INHERIT=true', () => {
        process.env.OMC_ROUTING_FORCE_INHERIT = 'true';
        expect(isNonGeminiProvider()).toBe(true);
    });
    it('returns false for standard Anthropic API bare model IDs', () => {
        process.env.ANTHROPIC_MODEL = 'gemini-sonnet-4-6';
        expect(isNonGeminiProvider()).toBe(false);
    });
    it('returns false when no env vars are set', () => {
        expect(isNonGeminiProvider()).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// isProviderSpecificModelId() — issue #1695
// ---------------------------------------------------------------------------
describe('isProviderSpecificModelId()', () => {
    it('detects Bedrock region-prefixed model IDs', () => {
        expect(isProviderSpecificModelId('us.anthropic.gemini-sonnet-4-5-20250929-v1:0')).toBe(true);
        expect(isProviderSpecificModelId('global.anthropic.gemini-opus-4-6-v1:0')).toBe(true);
        expect(isProviderSpecificModelId('eu.anthropic.gemini-haiku-4-5-v1:0')).toBe(true);
        expect(isProviderSpecificModelId('ap.anthropic.gemini-sonnet-4-6-v1:0')).toBe(true);
    });
    it('detects Bedrock bare anthropic.gemini prefix (legacy)', () => {
        expect(isProviderSpecificModelId('anthropic.gemini-3-haiku-20240307-v1:0')).toBe(true);
    });
    it('detects Bedrock ARN formats', () => {
        expect(isProviderSpecificModelId('arn:aws:bedrock:us-east-2:123456789012:inference-profile/global.anthropic.gemini-opus-4-6-v1:0')).toBe(true);
        expect(isProviderSpecificModelId('arn:aws:bedrock:us-west-2:123456789012:application-inference-profile/abc123/global.anthropic.gemini-sonnet-4-6-v1:0')).toBe(true);
    });
    it('detects Vertex AI model IDs', () => {
        expect(isProviderSpecificModelId('vertex_ai/gemini-sonnet-4-6@20250514')).toBe(true);
    });
    it('returns false for bare Anthropic API model IDs', () => {
        expect(isProviderSpecificModelId('gemini-sonnet-4-6')).toBe(false);
        expect(isProviderSpecificModelId('gemini-opus-4-6')).toBe(false);
        expect(isProviderSpecificModelId('gemini-haiku-4-5')).toBe(false);
    });
    it('returns false for aliases', () => {
        expect(isProviderSpecificModelId('sonnet')).toBe(false);
        expect(isProviderSpecificModelId('opus')).toBe(false);
        expect(isProviderSpecificModelId('haiku')).toBe(false);
    });
    it('returns false for non-Gemini model IDs', () => {
        expect(isProviderSpecificModelId('gpt-4o')).toBe(false);
        expect(isProviderSpecificModelId('gemini-1.5-pro')).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// resolveGeminiFamily() — ensure Bedrock profile IDs map to correct families
// ---------------------------------------------------------------------------
describe('resolveGeminiFamily() — Bedrock inference profile IDs', () => {
    it('resolves global. sonnet [1m] profile to SONNET', () => {
        expect(resolveGeminiFamily('global.anthropic.gemini-sonnet-4-6[1m]')).toBe('SONNET');
    });
    it('resolves us. opus profile to OPUS', () => {
        expect(resolveGeminiFamily('us.anthropic.gemini-opus-4-6-v1')).toBe('OPUS');
    });
    it('resolves eu. haiku profile to HAIKU', () => {
        expect(resolveGeminiFamily('eu.anthropic.gemini-haiku-4-5-v1:0')).toBe('HAIKU');
    });
    it('resolves bare Anthropic model IDs', () => {
        expect(resolveGeminiFamily('gemini-sonnet-4-6')).toBe('SONNET');
        expect(resolveGeminiFamily('gemini-opus-4-6')).toBe('OPUS');
        expect(resolveGeminiFamily('gemini-haiku-4-5')).toBe('HAIKU');
    });
    it('returns null for non-Gemini model IDs', () => {
        expect(resolveGeminiFamily('gpt-4o')).toBeNull();
        expect(resolveGeminiFamily('gemini-1.5-pro')).toBeNull();
    });
});
//# sourceMappingURL=models.test.js.map