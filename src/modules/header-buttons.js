import {
  SETTINGS_BUTTON_ID_HEADER,
  SETTINGS_BUTTON_LI_ID,
  SEARCH_BUTTON_ID_HEADER,
  SEARCH_BUTTON_LI_ID,
  UI_TOGGLE_KEYS,
} from './constants.js';
import { getSettingDefault } from './settings-schema.js';
import { isDiscoveryListRoute } from './utils.js';
import { GM_getValue } from './gm.js';
import { ICONS } from './icons.js';

let settingsButtonInjectInProgress = false;
let searchButtonRetryTimeout = null;
let settingsButtonHandler = null;

function findHeaderIconsContainer() {
  const selectors = ['ul.icons.d-header-icons', 'header.d-header .d-header-icons-end .icons'];
  for (const selector of selectors) {
    const headerIconsUl = document.querySelector(selector);
    if (headerIconsUl) return headerIconsUl;
  }
  return null;
}

function toggleNativeSearch() {
  try {
    const globalRequire = window['require'] || (typeof require !== 'undefined' && require);
    if (!globalRequire || typeof globalRequire !== 'function') {
      window.location.href = '/search?expanded=true';
      return;
    }

    const { getOwnerWithFallback } = globalRequire('discourse-common/lib/get-owner');
    const owner = getOwnerWithFallback();
    const searchService = owner.lookup('service:search');

    if (searchService) {
      searchService.set('visible', !searchService.visible);
    } else {
      window.location.href = '/search?expanded=true';
    }
  } catch (e) {
    console.error('[LD Enhanced] Failed to toggle native search:', e);
    window.location.href = '/search?expanded=true';
  }
}

function queueSearchButtonRetry() {
  if (searchButtonRetryTimeout) return;
  searchButtonRetryTimeout = setTimeout(() => {
    searchButtonRetryTimeout = null;
    ensureSearchButtonExists();
  }, 100);
}

export function setSettingsButtonHandler(handler) {
  settingsButtonHandler = handler;
}

export function ensureSettingsButtonExists() {
  if (document.getElementById(SETTINGS_BUTTON_ID_HEADER) || settingsButtonInjectInProgress) return;
  settingsButtonInjectInProgress = true;

  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    attempts++;
    const headerIconsUl = findHeaderIconsContainer();

    if (headerIconsUl) {
      clearInterval(interval);
      settingsButtonInjectInProgress = false;
      if (document.getElementById(SETTINGS_BUTTON_ID_HEADER)) return;

      const newLi = document.createElement('li');
      newLi.id = SETTINGS_BUTTON_LI_ID;
      const toggleBtn = document.createElement('button');
      toggleBtn.id = SETTINGS_BUTTON_ID_HEADER;
      toggleBtn.className = 'btn no-text btn-icon icon btn-flat';
      toggleBtn.title = '增强控制设置';
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-label', '增强控制设置');
      toggleBtn.innerHTML = ICONS.settings;
      newLi.appendChild(toggleBtn);

      const languageSwitcher = headerIconsUl.querySelector('.language-switcher-trigger');
      if (languageSwitcher) {
        headerIconsUl.insertBefore(newLi, languageSwitcher.nextSibling);
      } else {
        headerIconsUl.appendChild(newLi);
      }

      toggleBtn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          settingsButtonHandler?.();
        },
        true,
      );

      ensureSearchButtonExists();
      return;
    }

    if (attempts > maxAttempts) {
      clearInterval(interval);
      settingsButtonInjectInProgress = false;
    }
  }, 500);
}

export function ensureSearchButtonExists() {
  const checkbox = document.getElementById(`toggle-${UI_TOGGLE_KEYS.headerSearchIcon}`);
  const shouldShow = checkbox
    ? checkbox.checked
    : GM_getValue(UI_TOGGLE_KEYS.headerSearchIcon, getSettingDefault(UI_TOGGLE_KEYS.headerSearchIcon));

  const isDiscoveryList = isDiscoveryListRoute();
  const movedSearchLi = document.getElementById(SEARCH_BUTTON_LI_ID);

  if (!shouldShow || !isDiscoveryList) {
    movedSearchLi?.remove();
    return;
  }

  const nativeSearchButton = document.getElementById('search-button');
  if (nativeSearchButton) {
    movedSearchLi?.remove();
    queueSearchButtonRetry();
    return;
  }

  if (movedSearchLi) {
    movedSearchLi.style.display = '';
    return;
  }

  const headerIconsUl = findHeaderIconsContainer();
  if (!headerIconsUl) return;

  const newLi = document.createElement('li');
  newLi.id = SEARCH_BUTTON_LI_ID;

  const searchBtn = document.createElement('button');
  searchBtn.className = 'btn no-text btn-icon icon btn-flat';
  searchBtn.id = SEARCH_BUTTON_ID_HEADER;
  searchBtn.type = 'button';
  searchBtn.title = '搜索';
  searchBtn.setAttribute('aria-label', '搜索');
  searchBtn.innerHTML = ICONS.search;

  newLi.appendChild(searchBtn);

  const settingsLi = document.getElementById(SETTINGS_BUTTON_LI_ID);
  if (settingsLi?.nextSibling) {
    headerIconsUl.insertBefore(newLi, settingsLi.nextSibling);
  } else {
    const languageSwitcher = headerIconsUl.querySelector('.language-switcher-trigger');
    if (languageSwitcher?.nextSibling) {
      headerIconsUl.insertBefore(newLi, languageSwitcher.nextSibling.nextSibling || languageSwitcher.nextSibling);
    } else {
      headerIconsUl.appendChild(newLi);
    }
  }

  searchBtn.addEventListener(
    'click',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleNativeSearch();
    },
    true,
  );
}
