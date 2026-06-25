import {
  UI_TOGGLE_KEYS,
  DEFAULT_UI_TOGGLE_STATES,
  REMOVAL_CONFIG,
  VISITED_TOPICS_KEY,
  VISITED_TOPIC_CLASS,
  VISITED_TOPIC_ATTR,
  MAX_VISITED_TOPICS,
  VISITED_TOPICS_PERSIST_DELAY
} from './constants.js';
import { log, debounce } from './utils.js';
import { GM_getValue, GM_setValue, GM_addStyle } from './gm.js';

const AD_UI_REMOVER_MODULE = 'AdUIRemover';

export let currentUiToggleStates = {};
export let dynamicStyleElement = null;
export let visitedTopics = new Set();

let visitedTopicsPersistDebounced = null;
let visitedTopicStyleRefreshDebounced = null;

export function loadUiToggleSettings() {
  for (const key in UI_TOGGLE_KEYS) {
    const gmKey = UI_TOGGLE_KEYS[key];
    currentUiToggleStates[gmKey] = GM_getValue(gmKey, DEFAULT_UI_TOGGLE_STATES[gmKey]);
  }
}

export function saveUiToggleSettings() {
  for (const key in UI_TOGGLE_KEYS) {
    const gmKey = UI_TOGGLE_KEYS[key];
    const checkbox = document.getElementById(`toggle-${gmKey}`);
    if (checkbox) {
      currentUiToggleStates[gmKey] = checkbox.checked;
      GM_setValue(gmKey, checkbox.checked);
    }
  }
  log(AD_UI_REMOVER_MODULE, 'Saved UI toggle settings:', currentUiToggleStates);
}

export function loadVisitedTopics() {
  try {
    const topicIds = JSON.parse(localStorage.getItem(VISITED_TOPICS_KEY) || '[]');
    if (Array.isArray(topicIds)) {
      visitedTopics = new Set(topicIds.slice(-MAX_VISITED_TOPICS));
      if (topicIds.length !== visitedTopics.size) {
        persistVisitedTopics();
      }
    } else {
      visitedTopics = new Set();
    }
  } catch (e) {
    console.error('[LD Enhanced] Failed to load visited topics:', e);
    visitedTopics = new Set();
  }
}

export function persistVisitedTopics() {
  while (visitedTopics.size > MAX_VISITED_TOPICS) {
    const oldestTopicId = visitedTopics.values().next().value;
    if (!oldestTopicId) break;
    visitedTopics.delete(oldestTopicId);
  }
  localStorage.setItem(VISITED_TOPICS_KEY, JSON.stringify([...visitedTopics]));
}

function queuePersistVisitedTopics() {
  if (!visitedTopicsPersistDebounced) {
    visitedTopicsPersistDebounced = debounce(persistVisitedTopics, VISITED_TOPICS_PERSIST_DELAY);
  }
  visitedTopicsPersistDebounced();
}

function queueRefreshVisitedTopicStyles(applyDynamicStylesFn) {
  if (!visitedTopicStyleRefreshDebounced) {
    visitedTopicStyleRefreshDebounced = debounce(() => applyDynamicStylesFn(), 150);
  }
  visitedTopicStyleRefreshDebounced();
}

export function ensureTopicIdentityAttr(itemElement, topicId) {
  if (!itemElement || !topicId) return;
  itemElement.setAttribute(VISITED_TOPIC_ATTR, topicId);
}

export function markTopicAsVisited(topicId, itemElement, applyDynamicStylesFn) {
  if (!topicId) return;
  if (visitedTopics.has(topicId)) {
    visitedTopics.delete(topicId);
  }
  visitedTopics.add(topicId);
  queuePersistVisitedTopics();
  queueRefreshVisitedTopicStyles(applyDynamicStylesFn);
  if (itemElement && currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity]) {
    ensureTopicIdentityAttr(itemElement, topicId);
    itemElement.classList.add(VISITED_TOPIC_CLASS);
  }
}

export function removeSelectedElementsFromDOM({ roots = null } = {}) {
  let elementsRemovedThisScan = 0;
  for (const toggleKey in currentUiToggleStates) {
    if (currentUiToggleStates[toggleKey] && REMOVAL_CONFIG[toggleKey]) {
      REMOVAL_CONFIG[toggleKey].forEach(target => {
        const candidates = new Set();
        if (Array.isArray(roots) && roots.length > 0) {
          for (const root of roots) {
            if (!(root instanceof Element)) continue;
            if (root.matches(target.selector)) {
              candidates.add(root);
            }
            root.querySelectorAll(target.selector).forEach(element => candidates.add(element));
          }
        } else {
          document.querySelectorAll(target.selector).forEach(element => candidates.add(element));
        }
        candidates.forEach(element => {
          if (element.offsetParent !== null) {
            const innerCheckSelector = target.innerCheck;
            let isConfirmedAd = !innerCheckSelector || element.querySelector(innerCheckSelector);
            if (!isConfirmedAd && element.classList.contains('discourse-cnpkv') && element.querySelector('div.house-creative')) {
              isConfirmedAd = true;
            }
            if (isConfirmedAd) {
              element.remove();
              elementsRemovedThisScan++;
            }
          }
        });
      });
    }
  }
  if (elementsRemovedThisScan > 0) {
    log(AD_UI_REMOVER_MODULE, `Removed ${elementsRemovedThisScan} element(s) from DOM in this scan.`);
  }
}

export function applyDynamicStyles() {
  let cssToInject = '';
  for (const toggleKey in currentUiToggleStates) {
    if (currentUiToggleStates[toggleKey] && REMOVAL_CONFIG[toggleKey]) {
      REMOVAL_CONFIG[toggleKey].forEach(target => {
        cssToInject += `${target.selector} { display: none !important; visibility: hidden !important; }`;
      });
    }
  }

  if (currentUiToggleStates[UI_TOGGLE_KEYS.headerSearchIcon]) {
    cssToInject += `
      .welcome-banner .search-menu.welcome-banner__search-menu,
      .welcome-banner .search-menu.welcome-banner__search-menu * {
        visibility: visible !important;
      }
    `;
  }

  if (currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity]) {
    const visitedTopicSelectors = [];
    visitedTopics.forEach((topicId) => {
      if (!topicId) return;
      visitedTopicSelectors.push(`tr.topic-list-item[data-topic-id="${topicId}"]`);
      visitedTopicSelectors.push(`div.fps-result[data-topic-id="${topicId}"]`);
      visitedTopicSelectors.push(`tr.topic-list-item[${VISITED_TOPIC_ATTR}="${topicId}"]`);
      visitedTopicSelectors.push(`div.fps-result[${VISITED_TOPIC_ATTR}="${topicId}"]`);
    });
    cssToInject += `
      tr.topic-list-item.${VISITED_TOPIC_CLASS},
      div.fps-result.${VISITED_TOPIC_CLASS} {
        opacity: 0.5 !important;
        transition: none !important;
      }
    `;
    if (visitedTopicSelectors.length > 0) {
      cssToInject += `${visitedTopicSelectors.join(',')} { opacity: 0.5 !important; transition: none !important; }`;
    }
  }

  if (dynamicStyleElement && dynamicStyleElement.parentNode) {
    dynamicStyleElement.parentNode.removeChild(dynamicStyleElement);
  }
  if (cssToInject.trim() !== '') {
    dynamicStyleElement = GM_addStyle(cssToInject);
  }
}

export function initAdUIRemoverEarly() {
  loadUiToggleSettings();
  applyDynamicStyles();
}
