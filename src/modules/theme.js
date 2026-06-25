import { LIGHT_THEME_BODY_CLASS, SETTINGS_PANEL_ID } from './constants.js';
import { log } from './utils.js';

const THEME_MODULE = 'ThemeManager';
let themeObserver = null;
let systemThemeMediaQuery = null;

export function isDiscourseDarkMode() {
  const themeButton = document.querySelector('button[data-identifier="interface-color-selector"] svg use');
  if (themeButton) {
    const href = themeButton.getAttribute('href');
    if (href === '#moon') return true;
    if (href === '#sun') return false;
    if (href === '#circle-half-stroke') return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const html = document.documentElement;
  const body = document.body;
  if (html?.classList.contains('dark-scheme') || body?.classList.contains('dark-scheme')) {
    return true;
  }
  if (html?.dataset?.themeScheme === 'dark' || body?.dataset?.themeScheme === 'dark') {
    return true;
  }

  const sampleElement = body || html;
  if (sampleElement) {
    const styles = window.getComputedStyle(sampleElement);
    const colorScheme = styles.colorScheme || '';
    if (colorScheme.includes('dark')) {
      return true;
    }
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyPanelTheme() {
  const panel = document.getElementById(SETTINGS_PANEL_ID);
  const isDark = isDiscourseDarkMode();

  log(THEME_MODULE, `Applying panel theme. Detected dark mode: ${isDark}`);

  if (isDark) {
    document.body.classList.remove(LIGHT_THEME_BODY_CLASS);
    if (panel) {
      panel.classList.remove('light-theme');
      log(THEME_MODULE, 'Applied dark theme to panel.');
    }
  } else {
    document.body.classList.add(LIGHT_THEME_BODY_CLASS);
    if (panel) {
      panel.classList.add('light-theme');
      log(THEME_MODULE, 'Applied light theme to panel.');
    }
  }
}

export function observeThemeChanges() {
  if (themeObserver) themeObserver.disconnect();
  if (systemThemeMediaQuery) systemThemeMediaQuery.removeEventListener('change', applyPanelTheme);
  const targetNode = document.documentElement;
  if (!targetNode) return;
  themeObserver = new MutationObserver(applyPanelTheme);
  themeObserver.observe(targetNode, { attributes: true, attributeFilter: ['class'] });
  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeMediaQuery.addEventListener('change', applyPanelTheme);
}
