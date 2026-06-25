import {
  SETTINGS_PANEL_ID,
  SETTINGS_BUTTON_ID_HEADER,
  SETTINGS_BUTTON_LI_ID,
  GLOBAL_TOAST_ID,
  SEARCH_BUTTON_ID_HEADER,
  SEARCH_BUTTON_LI_ID,
  UI_TOGGLE_KEYS,
  DEFAULT_UI_TOGGLE_STATES,
  BLOCKER_INPUT_IDS,
  WEBDAV_INPUT_IDS,
  CONFIG_KEY_PANEL_POS
} from './constants.js';
import { getInputValue, setInputValue, parseListInputValue, log, isDiscoveryListRoute } from './utils.js';
import { currentUiToggleStates, saveUiToggleSettings, applyDynamicStyles } from './ad-remover.js';
import {
  blockOldPostsEnabled,
  blockOldPostsDays,
  blockedUsers,
  blockedKeywords,
  blockedCategories,
  saveBlockerSettings,
  saveOldPostBlockerSettings,
  loadBlockerSettings,
  loadOldPostBlockerSettings
} from './item-blocker.js';
import { webdavUrl, webdavUser, webdavPass, saveWebdavSettings, backupToWebdav, restoreFromWebdav } from './webdav.js';
import { applyPanelTheme, isDiscourseDarkMode } from './theme.js';
import { buildBasePanelCss, buildToastCss, buildMobileCss } from '../styles/panel.js';
import { GM_getValue, GM_setValue, GM_addStyle } from './gm.js';
import { ICONS } from './icons.js';
import { buildPanelHtml } from './panel-template.js';

let settingsButtonInjectInProgress = false;
let panelJustOpened = false;
let toastTimeout;
let searchButtonRetryTimeout = null;

function toggleNativeSearch() {
  try {
    const { getOwnerWithFallback } = window.require('discourse-common/lib/get-owner');
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

export function togglePanelVisibility(show) {
  log('UI', `Toggling panel visibility to: ${show ? 'SHOW' : 'HIDE'}`);
  const panel = document.getElementById(SETTINGS_PANEL_ID);
  if (!panel) {
    log('UI', 'Settings panel element not found.');
    return;
  }

  if (show) {
    applyPanelTheme();

    const isMobile = window.innerWidth <= 700;
    if (isMobile) {
      panel.style.left = '';
      panel.style.top = '';
      panel.style.right = '';
      log('UI', 'Mobile detected: Cleared inline position styles.');

      setTimeout(() => {
        log('UI', 'Re-applying theme for mobile after delay.');
        applyPanelTheme();
      }, 50);
    }

    panel.classList.add('visible');
    log('UI', "Added 'visible' class to panel.");
  } else {
    panel.classList.remove('visible');
    log('UI', "Removed 'visible' class from panel.");
  }
}

export function ensureSettingsButtonExists() {
  if (document.getElementById(SETTINGS_BUTTON_ID_HEADER) || settingsButtonInjectInProgress) return;
  settingsButtonInjectInProgress = true;

  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    attempts++;
    const selectors = [
      'ul.icons.d-header-icons',
      'header.d-header .d-header-icons-end .icons'
    ];
    let headerIconsUl = null;
    for (const selector of selectors) {
      headerIconsUl = document.querySelector(selector);
      if (headerIconsUl) {
        break;
      }
    }

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

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const panel = document.getElementById(SETTINGS_PANEL_ID);
        if (!panel) return;
        const isOpening = !panel.classList.contains('visible');

        if (isOpening) {
          panelJustOpened = true;
          togglePanelVisibility(true);
          setTimeout(() => {
            panelJustOpened = false;
          }, 500);
        } else {
          togglePanelVisibility(false);
        }
      }, true);

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
  let shouldShow;
  if (checkbox) {
    shouldShow = checkbox.checked;
  } else {
    shouldShow = GM_getValue(UI_TOGGLE_KEYS.headerSearchIcon, DEFAULT_UI_TOGGLE_STATES[UI_TOGGLE_KEYS.headerSearchIcon]);
  }

  const isDiscoveryList = isDiscoveryListRoute();

  let movedSearchLi = document.getElementById(SEARCH_BUTTON_LI_ID);

  if (!shouldShow) {
    if (movedSearchLi) {
      movedSearchLi.remove();
    }
    return;
  }

  if (!isDiscoveryList) {
    if (movedSearchLi) {
      movedSearchLi.remove();
    }
    return;
  }

  const nativeSearchButton = document.getElementById('search-button');
  if (nativeSearchButton) {
    if (movedSearchLi) {
      movedSearchLi.remove();
    }
    queueSearchButtonRetry();
    return;
  }

  if (movedSearchLi) {
    movedSearchLi.style.display = '';
    return;
  }

  const selectors = [
    'ul.icons.d-header-icons',
    'header.d-header .d-header-icons-end .icons'
  ];
  let headerIconsUl = null;
  for (const selector of selectors) {
    headerIconsUl = document.querySelector(selector);
    if (headerIconsUl) break;
  }
  if (!headerIconsUl) return;

  const newLi = document.createElement('li');
  newLi.id = SEARCH_BUTTON_LI_ID;
  newLi.className = 'header-dropdown-toggle search-dropdown';

  const searchBtn = document.createElement('button');
  searchBtn.className = 'btn no-text btn-icon icon btn-flat';
  searchBtn.id = SEARCH_BUTTON_ID_HEADER;
  searchBtn.type = 'button';
  searchBtn.title = '搜索';
  searchBtn.setAttribute('aria-label', '搜索');
  searchBtn.setAttribute('aria-haspopup', 'true');
  searchBtn.innerHTML = ICONS.search;

  newLi.appendChild(searchBtn);

  const settingsLi = document.getElementById(SETTINGS_BUTTON_LI_ID);
  if (settingsLi && settingsLi.nextSibling) {
    headerIconsUl.insertBefore(newLi, settingsLi.nextSibling);
  } else {
    const languageSwitcher = headerIconsUl.querySelector('.language-switcher-trigger');
    if (languageSwitcher && languageSwitcher.nextSibling) {
      headerIconsUl.insertBefore(newLi, languageSwitcher.nextSibling.nextSibling || languageSwitcher.nextSibling);
    } else {
      headerIconsUl.appendChild(newLi);
    }
  }

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNativeSearch();
  });
}

function makePanelDraggable(panel, handle) {
  if (window.innerWidth <= 700) {
    return;
  }
  let offsetX, offsetY, isDragging = false;
  const onMouseDown = (e) => {
    if (e.target.closest('.panel-header-actions')) return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
  };
  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    GM_setValue(CONFIG_KEY_PANEL_POS, { x: panel.style.left, y: panel.style.top });
  };
  handle.addEventListener('mousedown', onMouseDown);
}

function updatePanelInputs() {
  setInputValue(BLOCKER_INPUT_IDS.users, blockedUsers.join(', '));
  setInputValue(BLOCKER_INPUT_IDS.keywords, blockedKeywords.join(', '));
  setInputValue(BLOCKER_INPUT_IDS.categories, blockedCategories.join(', '));
  setInputValue(WEBDAV_INPUT_IDS.url, webdavUrl);
  setInputValue(WEBDAV_INPUT_IDS.user, webdavUser);
  setInputValue(WEBDAV_INPUT_IDS.pass, webdavPass);
  for (const key in UI_TOGGLE_KEYS) {
    const checkbox = document.getElementById(`toggle-${UI_TOGGLE_KEYS[key]}`);
    if (checkbox) checkbox.checked = currentUiToggleStates[UI_TOGGLE_KEYS[key]];
  }
  const oldPostToggle = document.getElementById('toggle-block-old-posts');
  if (oldPostToggle) oldPostToggle.checked = blockOldPostsEnabled;
  const oldPostDaysInput = document.getElementById('ld-block-days-input');
  if (oldPostDaysInput) oldPostDaysInput.value = blockOldPostsDays;
}

export function showGlobalToast(message, { duration = 2000, persistent = false } = {}) {
  let toastElement = document.getElementById(GLOBAL_TOAST_ID);
  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.id = GLOBAL_TOAST_ID;
    document.body.appendChild(toastElement);
  }
  toastElement.className = isDiscourseDarkMode() ? '' : 'light-theme';
  clearTimeout(toastTimeout);
  toastElement.textContent = message;
  toastElement.classList.add('visible');
  if (!persistent) {
    toastTimeout = setTimeout(() => toastElement.classList.remove('visible'), duration);
  }
}

function saveAllSettingsAndApply(triggerFullReprocessFn) {
  saveBlockerSettings(
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.users)),
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.keywords)),
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.categories))
  );
  saveUiToggleSettings();
  const toggle = document.getElementById('toggle-block-old-posts');
  const daysInput = document.getElementById('ld-block-days-input');
  saveOldPostBlockerSettings(toggle?.checked || false, parseInt(daysInput?.value, 10) || 90);
  applyDynamicStyles();
  ensureSearchButtonExists();
  showGlobalToast('所有设置已保存并应用！');
  triggerFullReprocessFn();
}

async function handleBackup() {
  showGlobalToast("正在备份...", { persistent: true });
  saveWebdavSettings(
    getInputValue(WEBDAV_INPUT_IDS.url),
    getInputValue(WEBDAV_INPUT_IDS.user),
    getInputValue(WEBDAV_INPUT_IDS.pass)
  );

  try {
    await backupToWebdav();
    showGlobalToast("备份成功！", { duration: 2500 });
  } catch (error) {
    showGlobalToast(`备份失败! ${error.status ? `(状态: ${error.status})` : error.message || ''}`, { duration: 4000 });
  }
}

async function handleRestore(triggerFullReprocessFn) {
  showGlobalToast("正在恢复...", { persistent: true });
  saveWebdavSettings(
    getInputValue(WEBDAV_INPUT_IDS.url),
    getInputValue(WEBDAV_INPUT_IDS.user),
    getInputValue(WEBDAV_INPUT_IDS.pass)
  );

  try {
    await restoreFromWebdav(async () => {
      loadBlockerSettings();
      loadOldPostBlockerSettings();
      updatePanelInputs();
      saveAllSettingsAndApply(triggerFullReprocessFn);
    });
    showGlobalToast("恢复成功并已应用！", { duration: 2500 });
  } catch (error) {
    let errorMsg = "恢复失败!";
    if (error instanceof SyntaxError) {
      errorMsg = "恢复失败: 云端数据格式错误。";
    } else if (error.status) {
      errorMsg += ` (状态: ${error.status})`;
    } else if (error.message) {
      errorMsg = `恢复失败: ${error.message}`;
    }
    showGlobalToast(errorMsg, { duration: 4000 });
    console.error("WebDAV Restore failed:", error);
  }
}

function bindPanelEvents(panel, triggerFullReprocessFn) {
  panel.querySelector('#ld-enhancer-save').addEventListener('click', () => saveAllSettingsAndApply(triggerFullReprocessFn));
  panel.querySelector('#ld-panel-close-btn').addEventListener('click', () => togglePanelVisibility(false));
  panel.querySelector('#ld-webdav-backup').addEventListener('click', handleBackup);
  panel.querySelector('#ld-webdav-restore').addEventListener('click', () => handleRestore(triggerFullReprocessFn));
  panel.querySelector('#ld-webdav-pass-toggle')?.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  panel.querySelector('#ld-webdav-pass-toggle')?.addEventListener('click', () => {
    const passInput = panel.querySelector('#ld-webdav-pass');
    const toggleBtn = panel.querySelector('#ld-webdav-pass-toggle');
    if (!passInput || !toggleBtn) return;
    const shouldShowPassword = passInput.type === 'password';
    passInput.type = shouldShowPassword ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', shouldShowPassword ? '隐藏密码' : '显示密码');
    toggleBtn.setAttribute('aria-pressed', shouldShowPassword ? 'true' : 'false');
    toggleBtn.setAttribute('title', shouldShowPassword ? '隐藏密码' : '显示密码');
    passInput.focus({ preventScroll: true });
  });
  panel.querySelector('.panel-sidebar').addEventListener('click', (e) => {
    const targetLi = e.target.closest('li[data-tab]');
    if (!targetLi) return;
    const tabId = targetLi.dataset.tab;
    panel.querySelectorAll('.panel-sidebar li').forEach(li => li.classList.remove('active'));
    targetLi.classList.add('active');
    panel.querySelectorAll('.content-pane').forEach(pane => pane.classList.remove('active'));
    panel.querySelector(`.content-pane[data-pane="${tabId}"]`).classList.add('active');
  });
}

function lockPanelHeight(panel) {
  if (!panel || window.innerWidth <= 700) return;
  const blockingPane = panel.querySelector('.content-pane[data-pane="blocking"]');
  const activePanes = panel.querySelectorAll('.content-pane.active');
  activePanes.forEach((pane) => pane.classList.remove('active'));
  if (blockingPane) {
    blockingPane.classList.add('active');
  }

  const fixedHeight = panel.offsetHeight;

  if (blockingPane) {
    blockingPane.classList.remove('active');
  }
  activePanes.forEach((pane) => pane.classList.add('active'));

  if (fixedHeight > 0) {
    panel.style.height = `${fixedHeight}px`;
  }
}

export function createSettingsPanel(triggerFullReprocessFn) {
  if (document.getElementById(SETTINGS_PANEL_ID)) return;
  const panel = document.createElement('div');
  panel.id = SETTINGS_PANEL_ID;

  const isMobile = window.innerWidth <= 700;
  if (!isMobile) {
    const savedPosition = GM_getValue(CONFIG_KEY_PANEL_POS, null);
    if (savedPosition?.x && savedPosition?.y) {
      panel.style.left = savedPosition.x;
      panel.style.top = savedPosition.y;
    }
  } else {
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
  }
  panel.innerHTML = buildPanelHtml();
  document.body.appendChild(panel);
  lockPanelHeight(panel);
  updatePanelInputs();
  applyPanelTheme();
  bindPanelEvents(panel, triggerFullReprocessFn);
  makePanelDraggable(panel, panel.querySelector('.panel-header'));
  ensureSettingsButtonExists();
  ensureSearchButtonExists();
}

export function injectBaseStyles() {
  GM_addStyle(`${buildBasePanelCss()}${buildToastCss()}${buildMobileCss()}`);
}

export function setupGlobalClickHandler(getTopicIdFn, markTopicAsVisitedFn) {
  document.addEventListener('click', function(event) {
    log('UI', 'Global click event fired.', { target: event.target, panelJustOpened });

    const toggleButton = document.getElementById(SETTINGS_BUTTON_ID_HEADER);
    if (toggleButton?.contains(event.target)) {
      log('UI', 'Click on toggle button, returning early.');
      return;
    }

    if (panelJustOpened) {
      log('UI', 'panelJustOpened is true, returning early.');
      return;
    }

    const panel = document.getElementById(SETTINGS_PANEL_ID);

    if (panel?.classList.contains('visible')) {
      if (!panel.contains(event.target)) {
        log('UI', 'Closing panel due to click outside.');
        togglePanelVisibility(false);
      }
    }

    if (currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity]) {
      const clickedLink = event.target.closest('a.title, a.search-link');
      if (clickedLink) {
        const topicItem = clickedLink.closest('tr.topic-list-item, div.fps-result');
        if (topicItem) {
          const topicId = getTopicIdFn(topicItem);
          markTopicAsVisitedFn(topicId, topicItem);
        }
      }
    }
  }, false);
}
