import { App } from '@octokit/app';
type AppOctokit = Awaited<ReturnType<App['getInstallationOctokit']>>;
export declare function getGitHubApp(): App;
export declare function getOctokit(): Promise<AppOctokit>;
export declare function resetOctokit(): void;
export {};
