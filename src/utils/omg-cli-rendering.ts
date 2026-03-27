import { spawnSync } from 'child_process';

const OMC_CLI_BINARY = 'omg';
const OMC_PLUGIN_BRIDGE_PREFIX = 'node "$CLAUDE_PLUGIN_ROOT"/bridge/cli.cjs';

export interface OmcCliRenderOptions {
  env?: NodeJS.ProcessEnv;
  omgAvailable?: boolean;
}

function commandExists(command: string, env: NodeJS.ProcessEnv): boolean {
  const lookupCommand = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(lookupCommand, [command], {
    stdio: 'ignore',
    env,
  });
  return result.status === 0;
}

export function resolveOmcCliPrefix(options: OmcCliRenderOptions = {}): string {
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

export function formatOmcCliInvocation(
  commandSuffix: string,
  options: OmcCliRenderOptions = {},
): string {
  const suffix = commandSuffix.trim().replace(/^omg\s+/, '');
  return `${resolveOmcCliPrefix(options)} ${suffix}`.trim();
}

export function rewriteOmcCliInvocations(
  text: string,
  options: OmcCliRenderOptions = {},
): string {
  const prefix = resolveOmcCliPrefix(options);
  if (prefix === OMC_CLI_BINARY || !text.includes('omg ')) {
    return text;
  }

  return text
    .replace(/`omg (?=[^`\r\n]+`)/g, `\`${prefix} `)
    .replace(/(^|\n)([ \t>*-]*)omg (?=\S)/g, `$1$2${prefix} `);
}
