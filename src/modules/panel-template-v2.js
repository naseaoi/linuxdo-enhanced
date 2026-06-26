import {
  UI_TOGGLE_KEYS,
  UI_TOGGLE_LABELS,
  SCRIPT_VERSION,
  GITHUB_REPO,
  UPDATE_CHECK_INTERVAL_DAYS,
  UPDATE_CHECK_INTERVAL_LABELS,
} from './constants.js';
import { currentUiToggleStates } from './ad-remover.js';
import { blockOldPostsEnabled, blockOldPostsDays } from './item-blocker.js';
import { updateCheckInterval } from './version-checker.js';
import { ICONS } from './icons.js';

function buildToggleRow(gmKey, labelText, isChecked) {
  return `
    <div class="setting-row">
      <span class="setting-label">${labelText}</span>
      <label class="toggle-switch">
        <input type="checkbox" id="toggle-${gmKey}" ${isChecked ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    </div>`;
}

function buildUiTogglesSection() {
  const rows = Object.values(UI_TOGGLE_KEYS)
    .map((gmKey) => {
      const labelText = UI_TOGGLE_LABELS[gmKey] || gmKey;
      const isChecked = currentUiToggleStates[gmKey];
      return buildToggleRow(gmKey, labelText, isChecked);
    })
    .join('');

  return `
    <div class="section-card expanded" data-section="ui">
      <div class="section-header">
        <div class="section-header-left">
          <svg class="section-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <span class="section-title">功能开关</span>
        </div>
        <svg class="section-expand-icon" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
      <div class="section-content">
        <div class="section-inner">
          ${rows}
          <div class="setting-row no-space-between">
            <div class="inline-field-group"><span class="setting-label">屏蔽</span><input type="number" id="ld-block-days-input" class="field-input" min="1" value="${blockOldPostsDays}"><span class="setting-label">天前的帖子</span></div>
            <label class="toggle-switch" style="flex-shrink: 0; margin-left: auto;">
              <input type="checkbox" id="toggle-block-old-posts" ${blockOldPostsEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>`;
}

function buildBlockingSection() {
  return `
    <div class="section-card expanded" data-section="blocking">
      <div class="section-header">
        <div class="section-header-left">
          <svg class="section-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>
          <span class="section-title">屏蔽规则</span>
        </div>
        <svg class="section-expand-icon" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
      <div class="section-content">
        <div class="section-inner">
          <div class="field-group">
            <label for="ld-blocked-users" class="field-label">屏蔽用户</label>
            <textarea id="ld-blocked-users" class="field-textarea" placeholder="多个用户名用逗号或换行分隔"></textarea>
          </div>
          <div class="field-group">
            <label for="ld-blocked-categories" class="field-label">屏蔽分区/标签</label>
            <textarea id="ld-blocked-categories" class="field-textarea" placeholder="多个分区用逗号或换行分隔"></textarea>
          </div>
          <div class="field-group">
            <label for="ld-blocked-keywords" class="field-label">屏蔽标题关键词</label>
            <textarea id="ld-blocked-keywords" class="field-textarea" placeholder="多个关键词用逗号或换行分隔"></textarea>
          </div>
        </div>
      </div>
    </div>`;
}

function buildSyncSection() {
  return `
    <div class="section-card" data-section="sync">
      <div class="section-header">
        <div class="section-header-left">
          <svg class="section-icon" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3h-7v-2h7c.55 0 1-.45 1-1s-.45-1-1-1h-4.5v-2.5c0-3.87-3.13-7-7-7-.91 0-1.78.18-2.58.5l1.46 1.46C7.83 5.23 8.86 5 10 5c2.76 0 5 2.24 5 5v.5H9.5c-1.66 0-3 1.34-3 3s1.34 3 3 3H11v2H9.5c-2.76 0-5-2.24-5-5 0-2.64 2.05-4.78 4.65-4.96C9.77 6.65 11.42 6 13.2 6h.3C15.62 6 17.5 7.88 17.5 10.2v.3c1.85.46 3.5 2.04 3.85 3.54z"/></svg>
          <span class="section-title">云端同步</span>
        </div>
        <svg class="section-expand-icon" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
      <div class="section-content">
        <div class="section-inner">
          <div class="field-group">
            <label for="ld-webdav-url" class="field-label">WebDAV URL</label>
            <input type="url" id="ld-webdav-url" class="field-input" placeholder="https://dav.example.com/dav">
          </div>
          <div class="field-group">
            <label for="ld-webdav-user" class="field-label">用户名</label>
            <input type="text" id="ld-webdav-user" class="field-input" placeholder="WebDAV 用户名">
          </div>
          <div class="field-group">
            <label for="ld-webdav-pass" class="field-label">密码</label>
            <div class="password-field-wrap">
              <input type="password" id="ld-webdav-pass" class="field-input" placeholder="WebDAV 密码/应用密钥">
              <button type="button" id="ld-webdav-pass-toggle" class="password-toggle-btn" aria-label="显示密码" aria-pressed="false" title="显示密码">
                ${ICONS.eye}${ICONS.eyeOff}
              </button>
            </div>
          </div>
          <div class="alert alert-warning">
            ${ICONS.warning}
            <span>密码以明文保存在本地存储中，请仅在可信设备使用。</span>
          </div>
          <div class="btn-group">
            <button id="ld-webdav-backup" class="btn btn-primary">备份到云端</button>
            <button id="ld-webdav-restore" class="btn btn-secondary">从云端恢复</button>
          </div>
        </div>
      </div>
    </div>`;
}

function buildUpdateIntervalOptions() {
  return UPDATE_CHECK_INTERVAL_DAYS.map(
    (days) => `<option value="${days}" ${days === updateCheckInterval ? 'selected' : ''}>${UPDATE_CHECK_INTERVAL_LABELS[days]}</option>`,
  ).join('');
}

function buildUpdateSection() {
  return `
    <div class="section-card" data-section="update">
      <div class="section-header">
        <div class="section-header-left">
          <svg class="section-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <span class="section-title">版本更新</span>
        </div>
        <svg class="section-expand-icon" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
      <div class="section-content">
        <div class="section-inner">
          <div class="setting-row">
            <span class="setting-label">当前版本</span>
            <span class="version-tag">v${SCRIPT_VERSION}</span>
          </div>
          <div class="setting-row" style="padding-bottom: 8px;">
            <span class="setting-label">自动检测更新</span>
            <select id="ld-update-interval" class="field-select" style="width: auto; min-width: 120px;">
              ${buildUpdateIntervalOptions()}
            </select>
          </div>
          <div class="btn-group" style="margin-top: 8px;">
            <button id="ld-check-updates" class="btn btn-primary">立即检测更新</button>
          </div>
          <div id="ld-update-result" class="update-result" hidden></div>
        </div>
      </div>
    </div>`;
}

export function buildPanelHtml() {
  return `
    <div class="panel-header">
      <h3 class="panel-title">增强控制面板</h3>
      <div class="panel-header-actions">
        <a href="https://github.com/${GITHUB_REPO}" target="_blank" rel="noopener noreferrer" id="ld-panel-github-btn" class="panel-icon-btn" aria-label="访问 GitHub" title="访问 GitHub">
          ${ICONS.github}
        </a>
        <button id="ld-enhancer-save" class="panel-icon-btn" aria-label="保存设置" title="保存设置">
          ${ICONS.save}
        </button>
        <button id="ld-panel-close-btn" class="panel-icon-btn" aria-label="关闭面板" title="关闭面板">
          ${ICONS.close}
        </button>
      </div>
    </div>
    <div class="panel-body">
      ${buildUiTogglesSection()}
      ${buildBlockingSection()}
      ${buildSyncSection()}
      ${buildUpdateSection()}
    </div>`;
}
