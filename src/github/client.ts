import { App } from '@octokit/app';
import { config } from '../config/index.js';

type AppOctokit = Awaited<ReturnType<App['getInstallationOctokit']>>;

let app: App | null = null;
let octokit: AppOctokit | null = null;

export function getGitHubApp(): App {
  if (!app) {
    app = new App({
      appId: config.github.appId,
      privateKey: config.github.privateKey,
    });
  }
  return app;
}

export async function getOctokit(): Promise<AppOctokit> {
  if (!octokit) {
    const app = getGitHubApp();
    octokit = await app.getInstallationOctokit(config.github.installationId);
  }
  return octokit;
}

export function resetOctokit(): void {
  octokit = null;
}
