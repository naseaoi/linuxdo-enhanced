import {
  UI_TOGGLE_KEYS,
  DEFAULT_UI_TOGGLE_STATES,
  CONFIG_KEY_USERS,
  CONFIG_KEY_KEYWORDS,
  CONFIG_KEY_CATEGORIES,
  CONFIG_KEY_PANEL_POS,
  CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED,
  CONFIG_KEY_BLOCK_OLD_POSTS_DAYS,
  VISITED_TOPICS_KEY,
  MAX_VISITED_TOPICS,
} from './constants.js';
import { normalizeList } from './utils.js';

const SETTING_TYPES = {
  boolean: 'boolean',
  list: 'list',
  panelPosition: 'panelPosition',
  positiveInteger: 'positiveInteger',
  topicList: 'topicList',
};

const UI_TOGGLE_SETTING_DEFINITIONS = Object.values(UI_TOGGLE_KEYS).map((key) => ({
  key,
  type: SETTING_TYPES.boolean,
  defaultValue: DEFAULT_UI_TOGGLE_STATES[key],
  backup: true,
}));

export const SETTING_DEFINITIONS = [
  ...UI_TOGGLE_SETTING_DEFINITIONS,
  { key: CONFIG_KEY_USERS, type: SETTING_TYPES.list, defaultValue: [], backup: true },
  { key: CONFIG_KEY_KEYWORDS, type: SETTING_TYPES.list, defaultValue: [], backup: true },
  { key: CONFIG_KEY_CATEGORIES, type: SETTING_TYPES.list, defaultValue: [], backup: true },
  { key: CONFIG_KEY_PANEL_POS, type: SETTING_TYPES.panelPosition, defaultValue: null, backup: true },
  { key: CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED, type: SETTING_TYPES.boolean, defaultValue: false, backup: true },
  { key: CONFIG_KEY_BLOCK_OLD_POSTS_DAYS, type: SETTING_TYPES.positiveInteger, defaultValue: 90, backup: true },
  { key: VISITED_TOPICS_KEY, type: SETTING_TYPES.topicList, defaultValue: [], backup: true },
];

const SETTING_DEFINITION_MAP = new Map(SETTING_DEFINITIONS.map((definition) => [definition.key, definition]));

export const BACKUP_SETTING_KEYS = SETTING_DEFINITIONS.filter((definition) => definition.backup).map((definition) => definition.key);

export function getSettingDefault(key) {
  return SETTING_DEFINITION_MAP.get(key)?.defaultValue;
}

function normalizeBooleanSetting(value, key) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`配置 ${key} 类型无效`);
}

function normalizeListSetting(value, key) {
  if (Array.isArray(value)) {
    if (value.some((item) => typeof item !== 'string')) {
      throw new Error(`配置 ${key} 类型无效`);
    }
    return normalizeList(value);
  }
  if (typeof value === 'string') {
    return normalizeList(value.replace(/[\n,，]/g, ',').split(','));
  }
  throw new Error(`配置 ${key} 类型无效`);
}

function normalizeTopicListSetting(value, key) {
  if (!Array.isArray(value)) {
    throw new Error(`配置 ${key} 类型无效`);
  }
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))].slice(-MAX_VISITED_TOPICS);
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

function normalizePositiveIntegerSetting(value, key) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 36500) {
    throw new Error(`配置 ${key} 类型无效`);
  }
  return numberValue;
}

export function normalizeSettingValue(key, value) {
  const definition = SETTING_DEFINITION_MAP.get(key);
  if (!definition) return undefined;

  if (definition.type === SETTING_TYPES.boolean) {
    return normalizeBooleanSetting(value, key);
  }
  if (definition.type === SETTING_TYPES.list) {
    return normalizeListSetting(value, key);
  }
  if (definition.type === SETTING_TYPES.topicList) {
    return normalizeTopicListSetting(value, key);
  }
  if (definition.type === SETTING_TYPES.panelPosition) {
    return normalizePanelPositionSetting(value, key);
  }
  if (definition.type === SETTING_TYPES.positiveInteger) {
    return normalizePositiveIntegerSetting(value, key);
  }
  return undefined;
}

export function normalizeRestoreSettings(settingsData) {
  if (!settingsData || typeof settingsData !== 'object' || Array.isArray(settingsData)) {
    throw new Error('云端数据格式错误');
  }

  const normalizedSettings = {};
  for (const key of Object.keys(settingsData)) {
    if (!SETTING_DEFINITION_MAP.has(key)) continue;
    normalizedSettings[key] = normalizeSettingValue(key, settingsData[key]);
  }
  if (Object.keys(normalizedSettings).length === 0) {
    throw new Error('云端数据没有可恢复的设置');
  }
  return normalizedSettings;
}
