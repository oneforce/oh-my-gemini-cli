import { spawnSync } from 'child_process';
const OMC_CLI_BINARY = 'omg';
const OMC_PLUGIN_BRIDGE_PREFIX = 'node "$CLAUDE_PLUGIN_ROOT"/bridge/cli.cjs';
function commandExists(command, env) {
    const lookupCommand = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(lookupCommand, [command], {
        stdio: 'ignore',
        env,
    });
    return result.status === 0;
}
export function resolveOmcCliPrefix(options = {}) {
    const env = options.env ?? process.env;
    const omgAvailable = options.omgAvailable ?? commandExists(OMC_CLI_BINARY, env);
    if (omgAvailable) {
        return OMC_CLI_BINARY;
    }
    const pluginRoot = typeof env.CLAUDE_PLUGIN_ROOT === 'string' ? env.CLAUDE_PLUGIN_ROOT.trim() : '';
    if (pluginRoot) {
        return OMC_PLUGIN_BRIDGE_PREFIX;
    }
    return OMC_CLI_BINARY;
}
export function formatOmcCliInvocation(commandSuffix, options = {}) {
    const suffix = commandSuffix.trim().replace(/^omg\s+/, '');
    return `${resolveOmcCliPrefix(options)} ${suffix}`.trim();
}
export function rewriteOmcCliInvocations(text, options = {}) {
    const prefix = resolveOmcCliPrefix(options);
    if (prefix === OMC_CLI_BINARY || !text.includes('omg ')) {
        return text;
    }
    return text
        .replace(/`omg (?=[^`\r\n]+`)/g, `\`${prefix} `)
        .replace(/(^|\n)([ \t>*-]*)omg (?=\S)/g, `$1$2${prefix} `);
}
//# sourceMappingURL=omg-cli-rendering.js.map