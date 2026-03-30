import path from 'path';
import os from 'os';

export function getOpenClawHome(): string {
  return process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
}

export function getPixelOfficePath(): string {
  return path.join(getOpenClawHome(), 'pixel-office');
}

export function getAgentsDir(): string {
  return path.join(getOpenClawHome(), 'agents');
}

export function getConfigPath(): string {
  return path.join(getOpenClawHome(), 'openclaw.json');
}

export function getCronJobsPath(): string {
  return path.join(getOpenClawHome(), 'cron', 'jobs.json');
}
