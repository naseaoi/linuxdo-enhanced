import {
  CONFIG_KEY_WEBDAV_URL,
  CONFIG_KEY_WEBDAV_USER,
  CONFIG_KEY_WEBDAV_PASS,
  WEBDAV_PATH,
  WEBDAV_FILENAME,
  UI_TOGGLE_KEYS,
  CONFIG_KEY_USERS,
  CONFIG_KEY_KEYWORDS,
  CONFIG_KEY_CATEGORIES,
  CONFIG_KEY_PANEL_POS,
  CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED,
  CONFIG_KEY_BLOCK_OLD_POSTS_DAYS
} from './constants.js';
import { encodeBasicAuthUtf8, normalizeList } from './utils.js';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from './gm.js';

export let webdavUrl = '';
export let webdavUser = '';
export let webdavPass = '';

const RESTORABLE_SETTING_KEYS = [
  ...Object.values(UI_TOGGLE_KEYS),
  CONFIG_KEY_USERS,
  CONFIG_KEY_KEYWORDS,
  CONFIG_KEY_CATEGORIES,
  CONFIG_KEY_PANEL_POS,
  CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED,
  CONFIG_KEY_BLOCK_OLD_POSTS_DAYS
];

const RESTORABLE_SETTING_KEY_SET = new Set(RESTORABLE_SETTING_KEYS);

function normalizeBooleanSetting(value, key) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`配置 ${key} 类型无效`);
}

function normalizeListSetting(value, key) {
  if (Array.isArray(value)) {
    if (value.some(item => typeof item !== 'string')) {
      throw new Error(`配置 ${key} 类型无效`);
    }
    return normalizeList(value);
  }
  if (typeof value === 'string') return normalizeList(value.replace(/[\n,，]/g, ',').split(','));
  throw new Error(`配置 ${key} 类型无效`);
}

function normalizePanelPositionSetting(value, key) {
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`配置 ${key} 类型无效`);
  }
  const x = typeof value.x === 'string' ? value.x : '';
  const y = typeof value.y === 'string' ? value.y : '';
  if (x.length > 80 || y.length > 80) {
    throw new Error(`配置 ${key} 超出长度限制`);
  }
  return { x, y };
}

function normalizeOldPostDaysSetting(value, key) {
  const days = Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 36500) {
    throw new Error(`配置 ${key} 类型无效`);
  }
  return days;
}

function normalizeRestorableSetting(key, value) {
  if (Object.values(UI_TOGGLE_KEYS).includes(key) || key === CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED) {
    return normalizeBooleanSetting(value, key);
  }
  if ([CONFIG_KEY_USERS, CONFIG_KEY_KEYWORDS, CONFIG_KEY_CATEGORIES].includes(key)) {
    return normalizeListSetting(value, key);
  }
  if (key === CONFIG_KEY_PANEL_POS) {
    return normalizePanelPositionSetting(value, key);
  }
  if (key === CONFIG_KEY_BLOCK_OLD_POSTS_DAYS) {
    return normalizeOldPostDaysSetting(value, key);
  }
  return undefined;
}

function normalizeRestoreSettings(settingsData) {
  if (!settingsData || typeof settingsData !== 'object' || Array.isArray(settingsData)) {
    throw new Error('云端数据格式错误');
  }

  const normalizedSettings = {};
  for (const key of Object.keys(settingsData)) {
    if (!RESTORABLE_SETTING_KEY_SET.has(key)) continue;
    normalizedSettings[key] = normalizeRestorableSetting(key, settingsData[key]);
  }
  if (Object.keys(normalizedSettings).length === 0) {
    throw new Error('云端数据没有可恢复的设置');
  }
  return normalizedSettings;
}

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
    "Authorization": "Basic " + encodeBasicAuthUtf8(user, pass),
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
  };
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method, url, data,
      headers: { ...baseHeaders, ...headers },
      onload: r => (r.status >= 200 && r.status < 300 || (method === 'MKCOL' && r.status === 405)) ? resolve(r) : reject(r),
      onerror: reject, onabort: reject, ontimeout: reject
    });
  });
}

export function gatherAllSettingsForBackup() {
  const settings = {};
  RESTORABLE_SETTING_KEYS.forEach(key => { settings[key] = GM_getValue(key); });
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
    await webdavRequest({ method: 'MKCOL', url: remoteDir, user: webdavUser, pass: webdavPass, headers: { "Depth": "1" } });
  } catch (error) {
    if (error.status !== 405) throw new Error(`创建目录失败 (状态: ${error.status})`);
  }

  await webdavRequest({
    method: 'PUT',
    url: remoteFile,
    user: webdavUser,
    pass: webdavPass,
    data: JSON.stringify(settingsData, null, 2),
    headers: { "Content-Type": "application/json; charset=utf-8" }
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
