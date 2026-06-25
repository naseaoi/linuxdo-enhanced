import {
  SETTINGS_PANEL_ID,
  SETTINGS_BUTTON_ID_HEADER,
  SETTINGS_BUTTON_LI_ID,
  GLOBAL_TOAST_ID,
  SEARCH_BUTTON_LI_ID,
  UI_TOGGLE_KEYS,
  UI_TOGGLE_LABELS,
  DEFAULT_UI_TOGGLE_STATES,
  BLOCKER_INPUT_IDS,
  WEBDAV_INPUT_IDS,
  CONFIG_KEY_PANEL_POS
} from './constants.js';
import { getInputValue, setInputValue, parseListInputValue, log } from './utils.js';
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

let settingsButtonInjectInProgress = false;
let panelJustOpened = false;
let toastTimeout;

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

function buildUiTogglesHtml() {
  return Object.values(UI_TOGGLE_KEYS).map((gmKey) => {
    const labelText = UI_TOGGLE_LABELS[gmKey] || gmKey;
    const isChecked = currentUiToggleStates[gmKey];
    return `<div class="setting-item"><span class="setting-item-label">${labelText}</span><label class="switch"><input type="checkbox" id="toggle-${gmKey}" ${isChecked ? 'checked' : ''}><span class="slider"></span></label></div>`;
  }).join('');
}

function buildOldPostBlockerHtml() {
  return `<div class="setting-item-complex"><div class="label-group"><span>屏蔽</span><input type="number" id="ld-block-days-input" min="1" value="${blockOldPostsDays}"><span>天前的帖子</span></div><label class="switch"><input type="checkbox" id="toggle-block-old-posts" ${blockOldPostsEnabled ? 'checked' : ''}><span class="slider"></span></label></div>`;
}

function buildPanelHtml() {
  return `
    <div class="panel-header"><h3>增强控制面板</h3><div class="panel-header-actions">
        <button id="ld-enhancer-save" class="panel-header-btn" aria-label="保存设置" title="保存设置"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 21V13H6V21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H17L21 7V20C21 20.5523 20.5523 21 20 21H18ZM16 21H8V15H16V21Z"></path></svg></button>
        <button id="ld-panel-close-btn" class="panel-header-btn" aria-label="关闭面板" title="关闭面板"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path></svg></button>
    </div></div>
    <div class="panel-body"><div class="panel-sidebar"><ul>
        <li data-tab="blocking" class="active">屏蔽功能</li><li data-tab="removal">功能开关</li><li data-tab="sync">云端同步</li>
    </ul></div><div class="panel-main-content">
        <div class="content-pane active" data-pane="blocking"><div class="blocking-stack">
            <div class="pane-card blocking-section"><label for="ld-blocked-users" class="input-label">屏蔽用户</label><textarea id="ld-blocked-users" rows="4"></textarea></div>
            <div class="pane-card blocking-section"><label for="ld-blocked-categories" class="input-label">屏蔽分区/标签</label><textarea id="ld-blocked-categories" rows="4"></textarea></div>
            <div class="pane-card blocking-section"><label for="ld-blocked-keywords" class="input-label">屏蔽标题关键词</label><textarea id="ld-blocked-keywords" rows="4"></textarea></div>
        </div></div>
        <div class="content-pane" data-pane="removal"><div class="pane-card">${buildUiTogglesHtml()}${buildOldPostBlockerHtml()}</div></div>
        <div class="content-pane" data-pane="sync">
             <div class="pane-card"><label for="ld-webdav-url" class="input-label">WebDAV URL</label><input type="url" id="ld-webdav-url" placeholder="例如: https://dav.example.com/dav">
             <div class="form-grid sync-credentials"><div><label for="ld-webdav-user" class="input-label">用户名</label><input type="text" id="ld-webdav-user" placeholder="WebDAV 用户名"></div><div><label for="ld-webdav-pass" class="input-label">密码</label><div class="password-field-wrap"><input type="password" id="ld-webdav-pass" placeholder="WebDAV 密码/应用密钥"><button type="button" id="ld-webdav-pass-toggle" class="password-toggle-btn" aria-label="显示密码" aria-pressed="false" title="显示密码"><svg class="icon-eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12C3.114 8.649 7.195 6 12 6s8.886 2.649 9.938 6c-1.052 3.351-5.133 6-9.938 6s-8.886-2.649-9.938-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg class="icon-eye-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18"></path><path d="M10.584 10.587a2 2 0 0 0 2.828 2.828"></path><path d="M9.363 5.365A10.954 10.954 0 0 1 12 5c4.805 0 8.886 2.649 9.938 6a11.817 11.817 0 0 1-4.226 5.198"></path><path d="M6.228 6.228A11.817 11.817 0 0 0 2.062 12c1.052 3.351 5.133 6 9.938 6 1.772 0 3.446-.36 4.934-1.002"></path></svg></button></div></div></div></div>
             <div class="pane-card sync-warning"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg><span>密码以明文保存在本地存储中，请仅在可信设备使用。</span></div>
             <div class="webdav-actions">
                 <button id="ld-webdav-backup" class="webdav-btn restore-btn">备份到云端</button>
                 <button id="ld-webdav-restore" class="webdav-btn">从云端恢复</button>
             </div>
        </div>
    </div></div>`;
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
      toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path></svg>`;
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

  const isHomepage = location.pathname === '/' || location.pathname === '/latest' || location.pathname.startsWith('/latest');

  let movedSearchLi = document.getElementById(SEARCH_BUTTON_LI_ID);

  if (!shouldShow) {
    if (movedSearchLi) {
      movedSearchLi.style.display = 'none';
    }
    return;
  }

  if (!isHomepage) {
    if (movedSearchLi) {
      movedSearchLi.style.display = 'none';
    }
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
  searchBtn.id = 'search-button';
  searchBtn.type = 'button';
  searchBtn.title = '搜索';
  searchBtn.setAttribute('aria-label', '搜索');
  searchBtn.setAttribute('aria-haspopup', 'true');
  searchBtn.innerHTML = `<svg class="fa d-icon d-icon-magnifying-glass svg-icon fa-width-auto svg-string" width="1em" height="1em" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="#magnifying-glass"></use></svg><span aria-hidden="true">​</span>`;

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
