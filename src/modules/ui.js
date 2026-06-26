import {
  SETTINGS_PANEL_ID,
  SETTINGS_BUTTON_ID_HEADER,
  UI_TOGGLE_KEYS,
  BLOCKER_INPUT_IDS,
  WEBDAV_INPUT_IDS,
  CONFIG_KEY_PANEL_POS,
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
  loadOldPostBlockerSettings,
} from './item-blocker.js';
import { webdavUrl, webdavUser, webdavPass, saveWebdavSettings, backupToWebdav, restoreFromWebdav } from './webdav.js';
import { applyPanelTheme } from './theme.js';
import { buildBasePanelCss } from '../styles/panel.js';
import { buildToastCss } from '../styles/toast.js';
import { buildMobileCss } from '../styles/mobile.js';
import { GM_getValue, GM_addStyle } from './gm.js';
import { buildPanelHtml } from './panel-template.js';
import { ensureSettingsButtonExists, ensureSearchButtonExists, setSettingsButtonHandler } from './header-buttons.js';
import { makePanelDraggable } from './panel-drag.js';
import { showGlobalToast } from './toast-controller.js';
import { checkForUpdates, saveUpdateCheckInterval } from './version-checker.js';

let panelJustOpened = false;

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

function saveAllSettingsAndApply(triggerFullReprocessFn) {
  saveBlockerSettings(
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.users)),
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.keywords)),
    () => parseListInputValue(getInputValue(BLOCKER_INPUT_IDS.categories)),
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
  showGlobalToast('正在备份...', { persistent: true });
  saveWebdavSettings(getInputValue(WEBDAV_INPUT_IDS.url), getInputValue(WEBDAV_INPUT_IDS.user), getInputValue(WEBDAV_INPUT_IDS.pass));

  try {
    await backupToWebdav();
    showGlobalToast('备份成功！', { duration: 2500 });
  } catch (error) {
    showGlobalToast(`备份失败! ${error.status ? `(状态: ${error.status})` : error.message || ''}`, { duration: 4000 });
  }
}

async function handleRestore(triggerFullReprocessFn) {
  showGlobalToast('正在恢复...', { persistent: true });
  saveWebdavSettings(getInputValue(WEBDAV_INPUT_IDS.url), getInputValue(WEBDAV_INPUT_IDS.user), getInputValue(WEBDAV_INPUT_IDS.pass));

  try {
    await restoreFromWebdav(async () => {
      loadBlockerSettings();
      loadOldPostBlockerSettings();
      updatePanelInputs();
      saveAllSettingsAndApply(triggerFullReprocessFn);
    });
    showGlobalToast('恢复成功并已应用！', { duration: 2500 });
  } catch (error) {
    let errorMsg = '恢复失败!';
    if (error instanceof SyntaxError) {
      errorMsg = '恢复失败: 云端数据格式错误。';
    } else if (error.status) {
      errorMsg += ` (状态: ${error.status})`;
    } else if (error.message) {
      errorMsg = `恢复失败: ${error.message}`;
    }
    showGlobalToast(errorMsg, { duration: 4000 });
    console.error('WebDAV Restore failed:', error);
  }
}

function renderUpdateResult(resultEl, { state, result }) {
  resultEl.hidden = false;
  resultEl.className = 'update-result';
  resultEl.textContent = '';

  if (state === 'checking') {
    resultEl.classList.add('is-checking');
    resultEl.textContent = '正在检测更新...';
    return;
  }
  if (state === 'error') {
    resultEl.classList.add('is-error');
    resultEl.textContent = '检测失败，请稍后重试。';
    return;
  }
  if (!result.hasUpdate) {
    resultEl.classList.add('is-latest');
    resultEl.textContent = `当前已是最新版本 v${result.currentVersion}`;
    return;
  }

  resultEl.classList.add('has-update');
  const title = document.createElement('div');
  title.className = 'update-result-title';
  title.textContent = `发现新版本 v${result.latestVersion}`;

  const installBtn = document.createElement('a');
  installBtn.className = 'webdav-btn restore-btn update-install-btn';
  installBtn.href = result.downloadUrl;
  installBtn.target = '_blank';
  installBtn.rel = 'noopener noreferrer';
  installBtn.textContent = '安装新版本';

  resultEl.append(title, installBtn);

  if (result.notes) {
    const notesLabel = document.createElement('div');
    notesLabel.className = 'update-notes-label';
    notesLabel.textContent = '更新说明';
    const notes = document.createElement('pre');
    notes.className = 'update-notes';
    notes.textContent = result.notes;
    resultEl.append(notesLabel, notes);
  }
}

async function handleManualUpdateCheck(panel) {
  const resultEl = panel.querySelector('#ld-update-result');
  const button = panel.querySelector('#ld-check-updates');
  if (!resultEl || !button) return;

  button.disabled = true;
  renderUpdateResult(resultEl, { state: 'checking' });
  try {
    const result = await checkForUpdates();
    renderUpdateResult(resultEl, { state: 'done', result });
  } catch (error) {
    renderUpdateResult(resultEl, { state: 'error' });
    console.error('[LD Enhanced] Version check error:', error);
  } finally {
    button.disabled = false;
  }
}

function bindPanelEvents(panel, triggerFullReprocessFn) {
  panel.querySelector('#ld-enhancer-save').addEventListener('click', () => saveAllSettingsAndApply(triggerFullReprocessFn));
  panel.querySelector('#ld-panel-close-btn').addEventListener('click', () => togglePanelVisibility(false));
  panel.querySelector('#ld-webdav-backup').addEventListener('click', handleBackup);
  panel.querySelector('#ld-webdav-restore').addEventListener('click', () => handleRestore(triggerFullReprocessFn));
  panel.querySelector('#ld-check-updates')?.addEventListener('click', () => handleManualUpdateCheck(panel));
  panel.querySelector('#ld-update-interval')?.addEventListener('change', (event) => saveUpdateCheckInterval(event.target.value));
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
    panel.querySelectorAll('.panel-sidebar li').forEach((li) => li.classList.remove('active'));
    targetLi.classList.add('active');
    panel.querySelectorAll('.content-pane').forEach((pane) => pane.classList.remove('active'));
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

function handleSettingsButtonToggle() {
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
  setSettingsButtonHandler(handleSettingsButtonToggle);
  ensureSettingsButtonExists();
  ensureSearchButtonExists();
}

export function injectBaseStyles() {
  GM_addStyle(`${buildBasePanelCss()}${buildToastCss()}${buildMobileCss()}`);
}

export function setupGlobalClickHandler(getTopicIdFn, markTopicAsVisitedFn) {
  document.addEventListener(
    'click',
    function (event) {
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
    },
    false,
  );
}
