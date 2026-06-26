import {
  SETTINGS_PANEL_ID,
  SETTINGS_BUTTON_ID_HEADER,
  HIDDEN_ITEM_CLASS,
  PROCESSED_ITEM_ATTR,
  LIGHT_THEME_BODY_CLASS,
  PANEL_FORM_INPUT_SELECTOR,
} from '../modules/constants.js';

export function buildBasePanelCss() {
  return `
    .${HIDDEN_ITEM_CLASS},
    tr.topic-list-item[${PROCESSED_ITEM_ATTR}="blocked"],
    div.fps-result[${PROCESSED_ITEM_ATTR}="blocked"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    #${SETTINGS_PANEL_ID} {
      --panel-bg: #222222;
      --panel-surface: #303134;
      --panel-border: #3c4043;
      --panel-text: #e8eaed;
      --panel-text-muted: #bdc1c6;
      --panel-accent: #3b82f6;
      --panel-accent-hover: #2563eb;
      --panel-input-bg: #303134;
      --panel-input-border: #5f6368;
      --panel-toggle-off: #5f6368;
      --panel-toggle-on: #3b82f6;
      --panel-danger: #ef4444;
      --panel-warning: #f59e0b;
      --panel-shadow: 0 20px 60px hsla(0, 0%, 0%, 0.4), 0 8px 20px hsla(0, 0%, 0%, 0.2);

      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 520px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 80px);
      background-color: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: 16px;
      box-shadow: var(--panel-shadow);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      color: var(--panel-text);
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      overflow: hidden;
    }

    #${SETTINGS_PANEL_ID}.visible {
      opacity: 1;
      visibility: visible;
    }

    #${SETTINGS_PANEL_ID} .panel-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--panel-border);
      cursor: grab;
    }

    #${SETTINGS_PANEL_ID} .panel-header:active {
      cursor: grabbing;
    }

    #${SETTINGS_PANEL_ID} .panel-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--panel-text);
    }

    #${SETTINGS_PANEL_ID} .panel-header-actions {
      display: flex;
      gap: 4px;
    }

    #${SETTINGS_PANEL_ID} .panel-icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      padding: 0;
    }

    #${SETTINGS_PANEL_ID} .panel-icon-btn:hover {
      background-color: hsla(220, 10%, 100%, 0.08);
    }

    #${SETTINGS_PANEL_ID} .panel-icon-btn svg {
      width: 20px;
      height: 20px;
      fill: var(--panel-text-muted);
      transition: fill 0.15s ease;
    }

    #${SETTINGS_PANEL_ID} .panel-icon-btn:hover svg {
      fill: var(--panel-text);
    }

    #${SETTINGS_PANEL_ID} .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      scrollbar-width: thin;
      scrollbar-color: hsla(220, 10%, 50%, 0.4) transparent;
      overscroll-behavior: contain;
    }

    #${SETTINGS_PANEL_ID} .panel-body::-webkit-scrollbar {
      width: 8px;
    }

    #${SETTINGS_PANEL_ID} .panel-body::-webkit-scrollbar-thumb {
      background-color: hsla(220, 10%, 50%, 0.4);
      border-radius: 4px;
    }

    #${SETTINGS_PANEL_ID} .panel-body::-webkit-scrollbar-thumb:hover {
      background-color: hsla(220, 10%, 50%, 0.6);
    }

    #${SETTINGS_PANEL_ID} .section-card {
      background-color: var(--panel-surface);
      border: 1px solid var(--panel-border);
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    #${SETTINGS_PANEL_ID} .section-card:last-child {
      margin-bottom: 0;
    }

    #${SETTINGS_PANEL_ID} .section-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
    }

    #${SETTINGS_PANEL_ID} .section-header:hover {
      background-color: hsla(220, 10%, 100%, 0.03);
    }

    #${SETTINGS_PANEL_ID} .section-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    #${SETTINGS_PANEL_ID} .section-icon {
      width: 20px;
      height: 20px;
      fill: var(--panel-accent);
      flex-shrink: 0;
    }

    #${SETTINGS_PANEL_ID} .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--panel-text);
    }

    #${SETTINGS_PANEL_ID} .section-expand-icon {
      width: 16px;
      height: 16px;
      fill: var(--panel-text-muted);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    #${SETTINGS_PANEL_ID} .section-card.expanded .section-expand-icon {
      transform: rotate(180deg);
    }

    #${SETTINGS_PANEL_ID} .section-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    #${SETTINGS_PANEL_ID} .section-card.expanded .section-content {
      max-height: 2000px;
    }

    #${SETTINGS_PANEL_ID} .section-inner {
      padding: 0 20px 20px 20px;
    }

    #${SETTINGS_PANEL_ID} .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      gap: 16px;
    }

    #${SETTINGS_PANEL_ID} .setting-row.no-space-between {
      justify-content: flex-start;
    }

    #${SETTINGS_PANEL_ID} .setting-row + .setting-row {
      border-top: 1px solid var(--panel-border);
    }

    #${SETTINGS_PANEL_ID} .setting-label {
      font-size: 14px;
      color: var(--panel-text);
      flex: 1;
    }

    #${SETTINGS_PANEL_ID} .field-group {
      margin-bottom: 16px;
    }

    #${SETTINGS_PANEL_ID} .field-group:last-child {
      margin-bottom: 0;
    }

    #${SETTINGS_PANEL_ID} .field-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--panel-text-muted);
      margin-bottom: 8px;
    }

    #${SETTINGS_PANEL_ID} .field-input,
    #${SETTINGS_PANEL_ID} .field-textarea {
      width: 100%;
      padding: 10px 12px;
      background-color: var(--panel-input-bg);
      border: 1px solid var(--panel-input-border);
      border-radius: 8px;
      color: var(--panel-text);
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      outline: none;
    }

    #${SETTINGS_PANEL_ID} .field-select {
      width: 100%;
      padding: 10px 12px;
      background-color: var(--panel-input-bg);
      border: 1px solid var(--panel-input-border);
      border-radius: 8px;
      color: var(--panel-text);
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23bdc1c6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 40px;
    }

    #${SETTINGS_PANEL_ID} .field-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    #${SETTINGS_PANEL_ID} .field-input:focus,
    #${SETTINGS_PANEL_ID} .field-textarea:focus {
      border-color: var(--panel-accent);
      box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.15);
    }

    #${SETTINGS_PANEL_ID} .field-select:focus {
      border-color: var(--panel-accent);
      box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.15);
    }

    #${SETTINGS_PANEL_ID} .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    #${SETTINGS_PANEL_ID} .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    #${SETTINGS_PANEL_ID} .toggle-slider {
      position: absolute;
      inset: 0;
      background-color: var(--panel-toggle-off);
      border-radius: 24px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    #${SETTINGS_PANEL_ID} .toggle-slider::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px hsla(0, 0%, 0%, 0.3);
    }

    #${SETTINGS_PANEL_ID} .toggle-switch input:checked + .toggle-slider {
      background-color: var(--panel-toggle-on);
    }

    #${SETTINGS_PANEL_ID} .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    #${SETTINGS_PANEL_ID} .toggle-switch input:focus + .toggle-slider {
      box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.2);
    }

    #${SETTINGS_PANEL_ID} .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.15s ease, opacity 0.15s ease;
      outline: none;
    }

    #${SETTINGS_PANEL_ID} .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #${SETTINGS_PANEL_ID} .btn-primary {
      background-color: var(--panel-accent);
      color: white;
    }

    #${SETTINGS_PANEL_ID} .btn-primary:hover:not(:disabled) {
      background-color: var(--panel-accent-hover);
    }

    #${SETTINGS_PANEL_ID} .btn-secondary {
      background-color: var(--panel-input-bg);
      border: 1px solid var(--panel-input-border);
      color: var(--panel-text);
    }

    #${SETTINGS_PANEL_ID} .btn-secondary:hover:not(:disabled) {
      background-color: hsla(220, 13%, 20%, 1.3);
    }

    #${SETTINGS_PANEL_ID} .btn-group {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    #${SETTINGS_PANEL_ID} .btn-group .btn {
      flex: 1;
    }

    #${SETTINGS_PANEL_ID} .inline-field-group {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    #${SETTINGS_PANEL_ID} .inline-field-group .field-input {
      width: 70px;
      text-align: center;
      padding: 6px 8px;
      background-image: none;
      padding-right: 8px;
    }

    #${SETTINGS_PANEL_ID} .password-field-wrap {
      position: relative;
    }

    #${SETTINGS_PANEL_ID} .password-field-wrap .field-input {
      padding-right: 40px;
      background-image: none;
      display: block;
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn {
      position: absolute;
      top: 20.5px;
      right: 12px;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.15s ease;
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn:hover {
      background-color: hsla(220, 10%, 100%, 0.08);
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn svg {
      width: 18px;
      height: 18px;
      stroke: var(--panel-text-muted);
      fill: none;
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn .icon-eye-off {
      display: none;
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn[aria-pressed="true"] .icon-eye {
      display: none;
    }

    #${SETTINGS_PANEL_ID} .password-toggle-btn[aria-pressed="true"] .icon-eye-off {
      display: block;
    }

    #${SETTINGS_PANEL_ID} .alert {
      display: flex;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      margin-top: 16px;
    }

    #${SETTINGS_PANEL_ID} .alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    #${SETTINGS_PANEL_ID} .alert-warning {
      background-color: hsla(38, 92%, 50%, 0.12);
      color: hsl(38, 92%, 65%);
    }

    #${SETTINGS_PANEL_ID} .alert-warning svg {
      fill: hsl(38, 92%, 65%);
    }

    #${SETTINGS_PANEL_ID} .update-result {
      margin-top: 16px;
      padding: 14px;
      border-radius: 8px;
      background-color: var(--panel-input-bg);
      font-size: 13px;
      line-height: 1.5;
    }

    #${SETTINGS_PANEL_ID} .update-result[hidden] {
      display: none;
    }

    #${SETTINGS_PANEL_ID} .update-result-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--panel-text);
      margin-bottom: 12px;
    }

    #${SETTINGS_PANEL_ID} .update-notes-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--panel-text-muted);
      margin-top: 12px;
      margin-bottom: 8px;
    }

    #${SETTINGS_PANEL_ID} .update-notes {
      margin: 0;
      padding: 10px 12px;
      background-color: var(--panel-bg);
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--panel-text);
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
      font-family: inherit;
      scrollbar-width: thin;
      scrollbar-color: hsla(220, 10%, 50%, 0.4) transparent;
    }

    #${SETTINGS_PANEL_ID} .update-notes::-webkit-scrollbar {
      width: 6px;
    }

    #${SETTINGS_PANEL_ID} .update-notes::-webkit-scrollbar-thumb {
      background-color: hsla(220, 10%, 50%, 0.4);
      border-radius: 3px;
    }

    #${SETTINGS_PANEL_ID} .version-tag {
      display: inline-block;
      padding: 4px 10px;
      background-color: var(--panel-input-bg);
      border: 1px solid var(--panel-input-border);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--panel-text-muted);
    }

    #${SETTINGS_BUTTON_ID_HEADER} svg {
      width: 35px;
      height: 35px;
      vertical-align: -11px;
      transition: fill 0.2s ease;
    }

    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SETTINGS_BUTTON_ID_HEADER} svg {
      fill: #8B8B8B;
    }

    body:not(.${LIGHT_THEME_BODY_CLASS}) #${SETTINGS_BUTTON_ID_HEADER}:hover svg {
      fill: #e8eaed;
    }

    body.${LIGHT_THEME_BODY_CLASS} #${SETTINGS_BUTTON_ID_HEADER} svg {
      fill: #D0D0D0;
    }

    body.${LIGHT_THEME_BODY_CLASS} #${SETTINGS_BUTTON_ID_HEADER}:hover svg {
      fill: #909090;
    }

    #${SETTINGS_PANEL_ID}.light-theme {
      --panel-bg: #ffffff;
      --panel-surface: #f5f5f5;
      --panel-border: #dcdcdc;
      --panel-text: #222222;
      --panel-text-muted: #5f6368;
      --panel-accent: #3b82f6;
      --panel-accent-hover: #2563eb;
      --panel-input-bg: #ffffff;
      --panel-input-border: #cccccc;
      --panel-toggle-off: #cccccc;
      --panel-toggle-on: #3b82f6;
      --panel-danger: #ef4444;
      --panel-warning: #f59e0b;
      --panel-shadow: 0 20px 60px hsla(0, 0%, 0%, 0.12), 0 8px 20px hsla(0, 0%, 0%, 0.08);
    }

    #${SETTINGS_PANEL_ID}.light-theme .panel-icon-btn:hover {
      background-color: hsla(220, 13%, 18%, 0.06);
    }

    #${SETTINGS_PANEL_ID}.light-theme .section-header:hover {
      background-color: hsla(220, 13%, 18%, 0.03);
    }

    #${SETTINGS_PANEL_ID}.light-theme .btn-secondary:hover:not(:disabled) {
      background-color: hsl(220, 15%, 95%);
    }

    #${SETTINGS_PANEL_ID}.light-theme .password-toggle-btn:hover {
      background-color: hsla(220, 13%, 18%, 0.06);
    }

    #${SETTINGS_PANEL_ID}.light-theme .alert-warning {
      background-color: hsla(38, 92%, 50%, 0.1);
      color: hsl(38, 92%, 40%);
    }

    #${SETTINGS_PANEL_ID}.light-theme .alert-warning svg {
      fill: hsl(38, 92%, 40%);
    }
  `;
}
