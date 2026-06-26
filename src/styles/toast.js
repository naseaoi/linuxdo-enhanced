import { GLOBAL_TOAST_ID } from '../modules/constants.js';

export function buildToastCss() {
  return `#${GLOBAL_TOAST_ID} {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background-color: rgba(23, 23, 23, 0.85); color: #ffffff;
    padding: 14px 28px; border-radius: 8px; font-size: 15px; z-index: 20000;
    backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3); opacity: 0; visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.3s, color 0.3s;
    max-width: 450px; text-align: center;
  }
  #${GLOBAL_TOAST_ID}.visible { opacity: 1; visibility: visible; transform: translate(-50%, -60%); }
  #${GLOBAL_TOAST_ID}.light-theme { background-color: rgba(255, 255, 255, 0.9); color: #222222; box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
  #${GLOBAL_TOAST_ID}.toast-success { background-color: rgba(34, 197, 94, 0.9); color: #ffffff; }
  #${GLOBAL_TOAST_ID}.toast-error { background-color: rgba(239, 68, 68, 0.9); color: #ffffff; }
  #${GLOBAL_TOAST_ID}.toast-info { background-color: rgba(59, 130, 246, 0.9); color: #ffffff; }
  #${GLOBAL_TOAST_ID} a { color: inherit; text-decoration: underline; font-weight: 600; }
  #${GLOBAL_TOAST_ID} a:hover { opacity: 0.8; }`;
}
