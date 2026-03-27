/**
 * omg ralphthon CLI subcommand
 *
 * Autonomous hackathon lifecycle:
 *   omg ralphthon "task"                  Start new ralphthon session
 *   omg ralphthon --resume                Resume existing session
 *   omg ralphthon --skip-interview "task" Skip deep-interview, use task directly
 *   omg ralphthon --max-waves 5           Set max hardening waves
 *   omg ralphthon --poll-interval 60      Set poll interval in seconds
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