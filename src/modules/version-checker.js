import {
  SCRIPT_VERSION,
  GITHUB_REPO,
  CONFIG_KEY_UPDATE_CHECK_INTERVAL,
  CONFIG_KEY_UPDATE_LAST_CHECK,
} from './constants.js';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from './gm.js';
import { getSettingDefault, normalizeSettingValue } from './settings-schema.js';
import { showToast } from './toast-controller.js';

export let updateCheckInterval = getSettingDefault(CONFIG_KEY_UPDATE_CHECK_INTERVAL);

function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export function loadUpdateCheckSettings() {
  updateCheckInterval = normalizeSettingValue(
    CONFIG_KEY_UPDATE_CHECK_INTERVAL,
    GM_getValue(CONFIG_KEY_UPDATE_CHECK_INTERVAL, getSettingDefault(CONFIG_KEY_UPDATE_CHECK_INTERVAL)),
  );
}

export function saveUpdateCheckInterval(value) {
  updateCheckInterval = normalizeSettingValue(CONFIG_KEY_UPDATE_CHECK_INTERVAL, value);
  GM_setValue(CONFIG_KEY_UPDATE_CHECK_INTERVAL, updateCheckInterval);
}

function fetchLatestRelease() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: apiUrl,
      headers: { Accept: 'application/vnd.github.v3+json' },
      timeout: 10000,
      onload: (response) => {
        if (response.status !== 200) {
          reject(new Error(`HTTP ${response.status}`));
          return;
        }
        try {
          resolve(JSON.parse(response.responseText));
        } catch (error) {
          reject(error);
        }
      },
      onerror: () => reject(new Error('network')),
      ontimeout: () => reject(new Error('timeout')),
    });
  });
}

function buildUpdateResult(data) {
  const latestVersion = data.tag_name.replace(/^v/, '');
  const comparison = compareVersions(latestVersion, SCRIPT_VERSION);
  const downloadUrl = data.assets?.find((asset) => asset.name.endsWith('.user.js'))?.browser_download_url || data.html_url;

  return {
    hasUpdate: comparison > 0,
    latestVersion,
    currentVersion: SCRIPT_VERSION,
    notes: (data.body || '').trim(),
    downloadUrl,
    htmlUrl: data.html_url,
  };
}

export async function checkForUpdates() {
  const data = await fetchLatestRelease();
  return buildUpdateResult(data);
}

export async function runAutoUpdateCheck() {
  if (updateCheckInterval <= 0) return;

  const lastCheck = normalizeSettingValue(
    CONFIG_KEY_UPDATE_LAST_CHECK,
    GM_getValue(CONFIG_KEY_UPDATE_LAST_CHECK, getSettingDefault(CONFIG_KEY_UPDATE_LAST_CHECK)),
  );
  const intervalMs = updateCheckInterval * 24 * 60 * 60 * 1000;
  if (Date.now() - lastCheck < intervalMs) return;

  try {
    const result = await checkForUpdates();
    GM_setValue(CONFIG_KEY_UPDATE_LAST_CHECK, Date.now());
    if (result.hasUpdate) {
      showToast(
        `发现新版本 v${result.latestVersion}！<br><a href="${result.downloadUrl}" target="_blank">点击安装</a>`,
        'success',
        8000,
      );
    }
  } catch {
    GM_setValue(CONFIG_KEY_UPDATE_LAST_CHECK, Date.now());
  }
}
