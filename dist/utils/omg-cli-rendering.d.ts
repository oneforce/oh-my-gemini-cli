export interface OmcCliRenderOptions {
    env?: NodeJS.ProcessEnv;
    omgAvailable?: boolean;
}
export declare function resolveOmcCliPrefix(options?: OmcCliRenderOptions): string;
export declare function formatOmcCliInvocation(commandSuffix: string, options?: OmcCliRenderOptions): string;
export declare function rewriteOmcCliInvocations(text: string, options?: OmcCliRenderOptions): string;
//# sourceMappingURL=omg-cli-rendering.d.ts.map