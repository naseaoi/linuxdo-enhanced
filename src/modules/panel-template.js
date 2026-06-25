import { UI_TOGGLE_KEYS, UI_TOGGLE_LABELS } from './constants.js';
import { currentUiToggleStates } from './ad-remover.js';
import { blockOldPostsEnabled, blockOldPostsDays } from './item-blocker.js';
import { ICONS } from './icons.js';

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

export function buildPanelHtml() {
  return `
    <div class="panel-header"><h3>增强控制面板</h3><div class="panel-header-actions">
        <button id="ld-enhancer-save" class="panel-header-btn" aria-label="保存设置" title="保存设置">${ICONS.save}</button>
        <button id="ld-panel-close-btn" class="panel-header-btn" aria-label="关闭面板" title="关闭面板">${ICONS.close}</button>
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
             <div class="form-grid sync-credentials"><div><label for="ld-webdav-user" class="input-label">用户名</label><input type="text" id="ld-webdav-user" placeholder="WebDAV 用户名"></div><div><label for="ld-webdav-pass" class="input-label">密码</label><div class="password-field-wrap"><input type="password" id="ld-webdav-pass" placeholder="WebDAV 密码/应用密钥"><button type="button" id="ld-webdav-pass-toggle" class="password-toggle-btn" aria-label="显示密码" aria-pressed="false" title="显示密码">${ICONS.eye}${ICONS.eyeOff}</button></div></div></div></div>
             <div class="pane-card sync-warning">${ICONS.warning}<span>密码以明文保存在本地存储中，请仅在可信设备使用。</span></div>
             <div class="webdav-actions">
                 <button id="ld-webdav-backup" class="webdav-btn restore-btn">备份到云端</button>
                 <button id="ld-webdav-restore" class="webdav-btn">从云端恢复</button>
             </div>
        </div>
    </div></div>`;
}
