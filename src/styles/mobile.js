import { SETTINGS_PANEL_ID, PANEL_FORM_INPUT_SELECTOR } from '../modules/constants.js';

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
