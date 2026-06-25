import { GLOBAL_TOAST_ID } from './constants.js';
import { isDiscourseDarkMode } from './theme.js';

let toastTimeout;

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
