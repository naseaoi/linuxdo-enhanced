import {
  SETTINGS_PANEL_ID,
  SETTINGS_BUTTON_ID_HEADER,
  SEARCH_BUTTON_ID_HEADER,
  GLOBAL_TOAST_ID,
  HIDDEN_ITEM_CLASS,
  PROCESSED_ITEM_ATTR,
  LIGHT_THEME_BODY_CLASS,
  PANEL_FORM_INPUT_SELECTOR
} from '../modules/constants.js';

export function buildBasePanelCss() {
  return `
    .${HIDDEN_ITEM_CLASS},
    tr.topic-list-item[data-ld-enh-processed="blocked"],
    div.fps-result[data-ld-enh-processed="blocked"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    #${SETTINGS_PANEL_ID} {
      --ld-panel-bg: #222222;
      --ld-panel-border: #3c4043;
      --ld-panel-text: #e8eaed;
      --ld-panel-header-bg: #171717;
      --ld-sidebar-bg: #262729;
      --ld-sidebar-text: #bdc1c6;
      --ld-sidebar-hover-bg: #303134;
      --ld-sidebar-active-bg: #33383e;
      --ld-main-scrollbar: #5f6368;
      --ld-main-scroll-track: #33383e;
      --ld-input-bg: #303134;
      --ld-input-border: #5f6368;
      --ld-input-focus-border: #bdc1c6;
      --ld-input-focus-shadow: rgba(189, 193, 198, 0.3);
      --ld-webdav-bg: #3c4043;
      --ld-webdav-text: #e8eaed;
      --ld-webdav-border: #5f6368;
      --ld-webdav-hover-bg: #4d5154;
      --ld-webdav-hover-border: #bdc1c6;
      position: fixed; top: 50px; right: 50px; width: 580px;
      background-color: var(--ld-panel-bg); border: 1px solid var(--ld-panel-border); border-radius: 12px;
      padding: 0; z-index: 10001; box-shadow: 0 20px 45px rgba(0,0,0,0.25), 0 8px 15px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px; color: var(--ld-panel-text); opacity: 0; visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease, background-color 0.3s, border-color 0.3s, color 0.3s;
      max-height: calc(100vh - 100px); display: flex; flex-direction: column; overflow: hidden;
    }
    #${SETTINGS_PANEL_ID}.visible { opacity: 1; visibility: visible; }
    #${SETTINGS_PANEL_ID} .panel-header {
      display: flex; justify-content: space-between; align-items: center; padding: 12px 12px 12px 24px;
      border-bottom: 1px solid var(--ld-panel-border); background-color: var(--ld-panel-header-bg);
      flex-shrink: 0; cursor: grab; transition: background-color 0.3s, border-color 0.3s;
    }
    #${SETTINGS_PANEL_ID} .panel-header:active { cursor: grabbing; }
    #${SETTINGS_PANEL_ID} .panel-header h3 { margin: 0; font-size: 17px; font-weight: 600; color: #ffffff; transition: color 0.3s; }
    .panel-header-actions { display: flex; align-items: center; gap: 4px; }
    .panel-header-btn {
      background: none; border: none; cursor: pointer; padding: 6px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease;
    }
    .panel-header-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
    .panel-header-btn svg { width: 22px; height: 22px; fill: #bdc1c6; transition: fill 0.2s ease; }
    .panel-header-btn:hover svg { fill: #ffffff; }
    .panel-body { display: flex; flex-grow: 1; overflow: hidden; }
    .panel-sidebar {
      width: 160px; flex-shrink: 0; background-color: var(--ld-sidebar-bg);
      border-right: 1px solid var(--ld-panel-border); padding: 15px 0; transition: background-color 0.3s, border-color 0.3s;
    }
    .panel-sidebar ul { list-style: none; margin: 0; padding: 0; }
    .panel-sidebar li {
      padding: 12px 24px; cursor: pointer; color: var(--ld-sidebar-text); font-weight: 500;
      border-left: 3px solid transparent; transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }
    .panel-sidebar li:hover { background-color: var(--ld-sidebar-hover-bg); }
    .panel-sidebar li.active { background-color: var(--ld-sidebar-active-bg); color: #ffffff; font-weight: 600; border-left-color: #3b82f6; }
    .panel-main-content {
      flex-grow: 1; padding: 18px; overflow-y: auto;
      scrollbar-width: thin; scrollbar-color: var(--ld-main-scrollbar) var(--ld-panel-bg);
    }
    .panel-main-content::-webkit-scrollbar { width: 8px; }
    .panel-main-content::-webkit-scrollbar-track { background: var(--ld-main-scroll-track); border-radius: 4px; }
    .panel-main-content::-webkit-scrollbar-thumb { background-color: var(--ld-main-scrollbar); border-radius: 4px; border: 2px solid var(--ld-main-scroll-track); }
    .content-pane { display: none; }
    .content-pane.active { display: block; }
    .pane-card {
      background-color: var(--ld-input-bg);
      border: 1px solid var(--ld-panel-border);
      border-radius: 8px;
      padding: 14px;
      transition: background-color 0.3s, border-color 0.3s;
    }
    .ui-toggles-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
    .setting-item {
      display: flex; justify-content: space-between; align-items: center; padding: 10px 0;
      border-bottom: 1px solid var(--ld-panel-border);
    }
    .setting-item:last-child, .setting-item-complex:last-child { border-bottom: none; }
    .setting-item-label { font-size: 14px; color: #e8eaed; margin-right: 15px; flex-grow: 1; transition: color 0.3s; }
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: #5f6368; transition: .3s; border-radius: 24px;
    }
    .slider:before {
      position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
      background-color: #e8eaed; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    input:checked + .slider { background-color: #3b82f6; }
    input:focus + .slider { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4); }
    input:checked + .slider:before { transform: translateX(20px); background-color: #ffffff; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-grid .full-width { grid-column: 1 / -1; }
    .form-field:not(:first-child) { margin-top: 15px; }
    .sync-credentials { margin-top: 12px; }
    .sync-credentials .input-label { margin-bottom: 6px; }
    .password-field-wrap {
      position: relative;
    }
    .password-field-wrap input {
      width: 100%;
      min-width: 0;
      padding-right: 38px;
    }
    .password-field-wrap input::-ms-reveal,
    .password-field-wrap input::-ms-clear {
      display: none;
    }
    .password-toggle-btn {
      position: absolute;
      top: calc(50% - 1px);
      right: 10px;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      padding: 0;
      border: none;
      background-color: transparent;
      color: var(--ld-sidebar-text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      box-shadow: none !important;
      transition: color 0.2s;
      outline: none;
      z-index: 1;
    }
    .password-toggle-btn:hover {
      color: var(--ld-panel-text);
    }
    .password-toggle-btn:focus,
    .password-toggle-btn:focus-visible {
      outline: none;
      box-shadow: none !important;
    }
    .password-toggle-btn svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      fill: none;
      display: block;
    }
    .password-toggle-btn .icon-eye-off {
      display: none;
    }
    .password-toggle-btn[aria-pressed="true"] .icon-eye {
      display: none;
    }
    .password-toggle-btn[aria-pressed="true"] .icon-eye-off {
      display: block;
    }
    .sync-warning {
      display: flex; align-items: center; gap: 8px; margin-top: 10px;
      padding: 10px 14px !important; font-size: 12px; color: #f59e0b;
    }
    .sync-warning svg { flex-shrink: 0; fill: #f59e0b; }
    .content-pane[data-pane="sync"] .webdav-actions { margin-top: 10px; }
    #${SETTINGS_PANEL_ID} .content-pane[data-pane="blocking"] {
      height: 100%;
    }
    #${SETTINGS_PANEL_ID} .blocking-stack {
      display: grid;
      grid-template-rows: repeat(3, auto);
      gap: 10px;
    }
    #${SETTINGS_PANEL_ID} .blocking-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    #${SETTINGS_PANEL_ID} .blocking-section .input-label {
      margin-bottom: 6px;
    }
    #${SETTINGS_PANEL_ID} .blocking-section textarea {
      height: 100px;
      min-height: 100px;
      margin: 0;
    }
    label.input-label {
      display: block; margin-bottom: 8px; font-weight: 500; color: #bdc1c6; font-size: 13px; transition: color 0.3s;
    }
    ${PANEL_FORM_INPUT_SELECTOR} {
      width: 100%; padding: 10px; border: 1px solid var(--ld-input-border); border-radius: 6px !important;
      font-size: 14px; line-height: 1.5; background-color: var(--ld-input-bg); color: var(--ld-panel-text);
      box-sizing: border-box; transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, color 0.3s;
    }
    #${SETTINGS_PANEL_ID} textarea { resize: none; }
    #${SETTINGS_PANEL_ID} textarea:focus,
    #${SETTINGS_PANEL_ID} input:focus {
      border-color: var(--ld-input-focus-border); box-shadow: 0 0 0 3px var(--ld-input-focus-shadow); outline: none;
    }
    .setting-item-complex {
      display: flex; justify-content: space-between; align-items: center; padding: 10px 0;
      border-bottom: 1px solid var(--ld-panel-border);
    }
    .setting-item-complex .label-group {
      flex-grow: 1; display: flex; align-items: center; gap: 8px;
    }
    .label-group .setting-item-label { flex-grow: 0; margin-right: 0; }
    #${SETTINGS_PANEL_ID} .setting-item-complex input[type="number"] {
      width: 70px; text-align: center; margin: 0 5px; padding: 6px;
    }
    .webdav-actions { display: flex; gap: 10px; margin-top: 10px; }
    .webdav-btn {
      flex-grow: 1; padding: 10px; font-size: 14px; font-weight: 500; border: 1px solid var(--ld-webdav-border);
      border-radius: 6px; background-color: var(--ld-webdav-bg); color: var(--ld-webdav-text);
      cursor: pointer; transition: background-color 0.2s, border-color 0.2s, color 0.3s;
    }
    .webdav-btn:hover { background-color: var(--ld-webdav-hover-bg); border-color: var(--ld-webdav-hover-border); }
    .webdav-btn.restore-btn { background-color: #3b82f6; border-color: #3b82f6; color: #ffffff; }
    .webdav-btn.restore-btn:hover { background-color: #2563eb; border-color: #2563eb; }
    #${SETTINGS_BUTTON_ID_HEADER} svg {
      width: 35px; height: 35px; vertical-align: -11px; transition: fill 0.2s ease;
    }
    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SETTINGS_BUTTON_ID_HEADER} svg { fill: #8B8B8B; }
    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SETTINGS_BUTTON_ID_HEADER}:hover svg { fill: #e8eaed; }
    body.${LIGHT_THEME_BODY_CLASS} #${SETTINGS_BUTTON_ID_HEADER} svg { fill: #D0D0D0; }
    body.${LIGHT_THEME_BODY_CLASS} #${SETTINGS_BUTTON_ID_HEADER}:hover svg { fill: #909090; }
    #${SEARCH_BUTTON_ID_HEADER} svg {
      width: 20px; height: 20px; vertical-align: middle; transition: fill 0.2s ease;
    }
    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SEARCH_BUTTON_ID_HEADER} svg { fill: #8B8B8B; }
    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SEARCH_BUTTON_ID_HEADER}:hover svg { fill: #e8eaed; }
    body.${LIGHT_THEME_BODY_CLASS} #${SEARCH_BUTTON_ID_HEADER} svg { fill: #D0D0D0; }
    body.${LIGHT_THEME_BODY_CLASS} #${SEARCH_BUTTON_ID_HEADER}:hover svg { fill: #909090; }
    #${SETTINGS_PANEL_ID}.light-theme {
      --ld-panel-bg: #ffffff;
      --ld-panel-border: #dcdcdc;
      --ld-panel-text: #222222;
      --ld-panel-header-bg: #f5f5f5;
      --ld-sidebar-bg: #f7f7f7;
      --ld-sidebar-text: #5f6368;
      --ld-sidebar-hover-bg: #eeeeee;
      --ld-sidebar-active-bg: #e8e8e8;
      --ld-main-scrollbar: #aaaaaa;
      --ld-main-scroll-track: #f0f0f0;
      --ld-input-bg: #ffffff;
      --ld-input-border: #cccccc;
      --ld-input-focus-border: #888888;
      --ld-input-focus-shadow: rgba(136, 136, 136, 0.25);
      --ld-webdav-bg: #f0f0f0;
      --ld-webdav-text: #333333;
      --ld-webdav-border: #dcdcdc;
      --ld-webdav-hover-bg: #e0e0e0;
      --ld-webdav-hover-border: #bbbbbb;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.08);
    }
    #${SETTINGS_PANEL_ID}.light-theme .panel-header h3 { color: #222222; }
    #${SETTINGS_PANEL_ID}.light-theme .panel-header-btn:hover { background-color: rgba(0, 0, 0, 0.08); }
    #${SETTINGS_PANEL_ID}.light-theme .panel-header-btn svg { fill: #5f6368; }
    #${SETTINGS_PANEL_ID}.light-theme .panel-header-btn:hover svg { fill: #222222; }
    #${SETTINGS_PANEL_ID}.light-theme .panel-sidebar li.active { background-color: #e8e8e8; color: #000000; border-left-color: #3b82f6; }
    #${SETTINGS_PANEL_ID}.light-theme .setting-item-label { color: #333333; }
    #${SETTINGS_PANEL_ID}.light-theme .slider { background-color: #cccccc; }
    #${SETTINGS_PANEL_ID}.light-theme .slider:before { background-color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    #${SETTINGS_PANEL_ID}.light-theme label.input-label { color: #555555; }
    #${SETTINGS_PANEL_ID}.light-theme .password-toggle-btn { background-color: transparent; color: #777777; }
    #${SETTINGS_PANEL_ID}.light-theme .password-toggle-btn:hover { background-color: rgba(0, 0, 0, 0.06); color: #222222; }
    #${SETTINGS_PANEL_ID}.light-theme input:checked + .slider { background-color: #3b82f6; }
    #${SETTINGS_PANEL_ID}.light-theme .webdav-btn.restore-btn { background-color: #3b82f6; border-color: #3b82f6; color: #ffffff; }
    #${SETTINGS_PANEL_ID}.light-theme .webdav-btn.restore-btn:hover { background-color: #2563eb; border-color: #2563eb; }`;
}

export function buildToastCss() {
  return `#${GLOBAL_TOAST_ID} {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background-color: rgba(23, 23, 23, 0.85); color: #ffffff;
    padding: 14px 28px; border-radius: 8px; font-size: 15px; z-index: 20000;
    backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3); opacity: 0; visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.3s, color 0.3s;
  }
  #${GLOBAL_TOAST_ID}.visible { opacity: 1; visibility: visible; transform: translate(-50%, -60%); }
  #${GLOBAL_TOAST_ID}.light-theme { background-color: rgba(255, 255, 255, 0.9); color: #222222; box-shadow: 0 6px 20px rgba(0,0,0,0.15); }`;
}

export function buildMobileCss() {
  return `@media (max-width: 700px) {
    #${SETTINGS_PANEL_ID} {
      width: 90vw !important;
      max-width: 500px !important;
      left: 50% !important;
      right: auto !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      max-height: 90vh !important;
    }
    #${SETTINGS_PANEL_ID}.visible {
      transform: translate(-50%, -50%) !important;
    }
    .panel-body { flex-direction: column; }
    .panel-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #3c4043;
      padding: 5px 0;
    }
    #${SETTINGS_PANEL_ID}.light-theme .panel-sidebar {
      border-bottom-color: #dcdcdc;
    }
    .panel-sidebar ul {
      display: flex;
      justify-content: space-around;
    }
    .panel-sidebar li {
      border-left: none;
      border-bottom: 3px solid transparent;
      padding: 10px;
    }
    .panel-sidebar li.active {
      border-bottom-color: #3b82f6;
    }
    .panel-main-content {
      padding: 15px;
    }

    .form-grid {
      grid-template-columns: 1fr !important;
    }

    #${SETTINGS_PANEL_ID} .content-pane[data-pane="blocking"] {
      height: auto;
    }

    #${SETTINGS_PANEL_ID} .blocking-stack {
      height: auto;
      grid-template-rows: none;
    }

    #${SETTINGS_PANEL_ID} .blocking-section {
      flex: 0 0 auto;
    }

    #${SETTINGS_PANEL_ID} .blocking-section textarea {
      height: auto;
      min-height: 96px;
    }

    ${PANEL_FORM_INPUT_SELECTOR} {
      width: 100% !important;
      box-sizing: border-box !important;
    }

    #${SETTINGS_PANEL_ID} .setting-item-complex {
      align-items: flex-start;
    }

    #${SETTINGS_PANEL_ID} .setting-item-complex .label-group {
      flex-wrap: wrap;
      gap: 6px;
      margin-right: 10px;
    }

    #${SETTINGS_PANEL_ID} .setting-item-complex .label-group span {
      white-space: nowrap;
    }

    #${SETTINGS_PANEL_ID} #ld-block-days-input {
      width: 64px !important;
      min-width: 64px;
      flex: 0 0 64px;
      margin: 0 2px;
    }

    .webdav-actions {
      flex-direction: column;
      gap: 10px;
    }
    .webdav-btn {
      width: 100%;
    }
  }`;
}
