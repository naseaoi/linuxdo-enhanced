import { CONFIG_KEY_WEBDAV_URL, CONFIG_KEY_WEBDAV_USER, CONFIG_KEY_WEBDAV_PASS, WEBDAV_PATH, WEBDAV_FILENAME } from './constants.js';
import { encodeBasicAuthUtf8 } from './utils.js';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from './gm.js';
import { BACKUP_SETTING_KEYS, normalizeRestoreSettings } from './settings-schema.js';

export let webdavUrl = '';
export let webdavUser = '';
export let webdavPass = '';

export function loadWebdavSettings() {
  webdavUrl = GM_getValue(CONFIG_KEY_WEBDAV_URL, '');
  webdavUser = GM_getValue(CONFIG_KEY_WEBDAV_USER, '');
  webdavPass = GM_getValue(CONFIG_KEY_WEBDAV_PASS, '');
}

export function saveWebdavSettings(url, user, pass) {
  webdavUrl = url.trim();
  webdavUser = user.trim();
  webdavPass = pass;
  GM_setValue(CONFIG_KEY_WEBDAV_URL, webdavUrl);
  GM_setValue(CONFIG_KEY_WEBDAV_USER, webdavUser);
  GM_setValue(CONFIG_KEY_WEBDAV_PASS, webdavPass);
}

export function webdavRequest({ method, url, user, pass, data, headers = {} }) {
  const baseHeaders = {
    Authorization: 'Basic ' + encodeBasicAuthUtf8(user, pass),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  };
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url,
      data,
      headers: { ...baseHeaders, ...headers },
      onload: (r) => ((r.status >= 200 && r.status < 300) || (method === 'MKCOL' && r.status === 405) ? resolve(r) : reject(r)),
      onerror: reject,
      onabort: reject,
      ontimeout: reject,
    });
  });
}

export function gatherAllSettingsForBackup() {
  const settings = {};
  BACKUP_SETTING_KEYS.forEach((key) => {
    settings[key] = GM_getValue(key);
  });
  return settings;
}

export async function backupToWebdav() {
  if (!webdavUrl || !webdavUser) {
    throw new Error('URL和用户名不能为空');
  }

  const settingsData = gatherAllSettingsForBackup();
  const remoteDir = webdavUrl.replace(/\/$/, '') + WEBDAV_PATH;
  const remoteFile = remoteDir + WEBDAV_FILENAME;

  try {
    await webdavRequest({ method: 'MKCOL', url: remoteDir, user: webdavUser, pass: webdavPass, headers: { Depth: '1' } });
  } catch (error) {
    if (error.status !== 405) throw new Error(`创建目录失败 (状态: ${error.status})`);
  }

  await webdavRequest({
    method: 'PUT',
    url: remoteFile,
    user: webdavUser,
    pass: webdavPass,
    data: JSON.stringify(settingsData, null, 2),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function restoreFromWebdav(applySettingsCallback) {
  if (!webdavUrl || !webdavUser) {
    throw new Error('URL和用户名不能为空');
  }

  const remoteFile = webdavUrl.replace(/\/$/, '') + WEBDAV_PATH + WEBDAV_FILENAME;
  const response = await webdavRequest({ method: 'GET', url: remoteFile, user: webdavUser, pass: webdavPass });
  const settingsData = JSON.parse(response.responseText);
  const normalizedSettings = normalizeRestoreSettings(settingsData);

  for (const key of Object.keys(normalizedSettings)) {
    GM_setValue(key, normalizedSettings[key]);
  }

  if (applySettingsCallback) {
    await applySettingsCallback();
  }
}
