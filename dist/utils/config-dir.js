import { homedir } from "node:os";
import { join } from "node:path";
export function getConfigDir() {
    return process.env.GEMINI_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".gemini");
}
//# sourceMappingURL=config-dir.js.map