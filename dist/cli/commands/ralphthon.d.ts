/**
 * omc ralphthon CLI subcommand
 *
 * Autonomous hackathon lifecycle:
 *   omc ralphthon "task"                  Start new ralphthon session
 *   omc ralphthon --resume                Resume existing session
 *   omc ralphthon --skip-interview "task" Skip deep-interview, use task directly
 *   omc ralphthon --max-waves 5           Set max hardening waves
 *   omc ralphthon --poll-interval 60      Set poll interval in seconds
 */
import type { RalphthonCliOptions } from '../../ralphthon/types.js';
/**
 * Parse ralphthon CLI arguments
 */
export declare function parseRalphthonArgs(args: string[]): RalphthonCliOptions;
/**
 * Execute the ralphthon CLI command
 */
export declare function ralphthonCommand(args: string[]): Promise<void>;
//# sourceMappingURL=ralphthon.d.ts.map