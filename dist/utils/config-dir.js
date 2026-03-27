import { homedir } from "node:os";
import { join } from "node:path";
export function getConfigDir() {
    return process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
}
//# sourceMappingURL=config-dir.js.map