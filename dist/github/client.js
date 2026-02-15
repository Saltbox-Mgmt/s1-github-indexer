import { App } from '@octokit/app';
import { config } from '../config/index.js';
let app = null;
let octokit = null;
export function getGitHubApp() {
    if (!app) {
        app = new App({
            appId: config.github.appId,
            privateKey: config.github.privateKey,
        });
    }
    return app;
}
export async function getOctokit() {
    if (!octokit) {
        const app = getGitHubApp();
        octokit = await app.getInstallationOctokit(config.github.installationId);
    }
    return octokit;
}
export function resetOctokit() {
    octokit = null;
}
