import { isCliAvailable } from '../../team/model-contract.js';
export function detectSkillRuntimeAvailability(detector = isCliAvailable) {
    return {
        claude: detector('claude'),
        codex: detector('codex'),
        gemini: detector('gemini'),
    };
}
function normalizeSkillName(skillName) {
    return skillName.trim().toLowerCase();
}
function renderDeepInterviewRuntimeGuidance(availability) {
    if (!availability.codex) {
        return '';
    }
    return [
        '## Provider-Aware Execution Recommendations',
        'When Phase 5 presents post-interview execution choices, keep the Claude-only defaults above and add these Codex variants because Codex CLI is available:',
        '',
        '- `/ralplan --architect codex "<spec or task>"` — Codex handles the architect pass; best for implementation-heavy design review; higher cost than Claude-only ralplan.',
        '- `/ralplan --critic codex "<spec or task>"` — Codex handles the critic pass; cheaper than moving the full loop off Claude; strong second-opinion review.',
        '- `/ralph --critic codex "<spec or task>"` — Ralph still executes normally, but final verification goes through the Codex critic; smallest multi-provider upgrade.',
        '',
        'If Codex becomes unavailable, briefly note that and fall back to the Claude-only recommendations already listed in Phase 5.',
    ].join('\n');
}
export function renderSkillRuntimeGuidance(skillName, availability) {
    switch (normalizeSkillName(skillName)) {
        case 'deep-interview':
            return renderDeepInterviewRuntimeGuidance(availability ?? detectSkillRuntimeAvailability());
        default:
            return '';
    }
}
//# sourceMappingURL=runtime-guidance.js.map