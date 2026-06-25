import { getTopicId } from './modules/utils.js';
import {
  initAdUIRemoverEarly,
  loadVisitedTopics,
  persistVisitedTopics,
  markTopicAsVisited,
  removeSelectedElementsFromDOM,
  applyDynamicStyles,
} from './modules/ad-remover.js';
import {
  loadBlockerSettings,
  loadOldPostBlockerSettings,
  processAllItems,
  resetProcessedItems,
  applyVisitedOpacityStateToRoots,
  syncVisitedTopicOpacityState,
} from './modules/item-blocker.js';
import { loadWebdavSettings } from './modules/webdav.js';
import { observeThemeChanges, applyPanelTheme } from './modules/theme.js';
import { createSettingsPanel, injectBaseStyles, setupGlobalClickHandler } from './modules/ui.js';
import { ensureSettingsButtonExists, ensureSearchButtonExists } from './modules/header-buttons.js';
import { installRouteObserver } from './modules/route-observer.js';
import { observeNewItems, observeDynamicAdUiContent } from './modules/dom-observer.js';

let itemProcessingScheduled = false;
let fullReprocessRequired = false;
let domRemovalRequired = false;
let itemFilterRequired = false;
let pendingAdScanRoots = new Set();

function processItemsNow({ runDomRemoval = true, runItemFilter = true, adScanRoots = null } = {}) {
  if (runDomRemoval) {
    removeSelectedElementsFromDOM({ roots: adScanRoots });
  }
  if (runItemFilter) {
    processAllItems();
    syncVisitedTopicOpacityState();
  }
}

function scheduleItemProcessing({ fullReprocess = false, runDomRemoval = true, runItemFilter = true, adScanRoots = null } = {}) {
  if (fullReprocess) {
    fullReprocessRequired = true;
    domRemovalRequired = true;
    itemFilterRequired = true;
    pendingAdScanRoots.clear();
  } else {
    if (runDomRemoval) {
      domRemovalRequired = true;
      if (Array.isArray(adScanRoots) && adScanRoots.length > 0) {
        for (const root of adScanRoots) {
          if (root instanceof Element) {
            pendingAdScanRoots.add(root);
          }
        }
      }
    }
    if (runItemFilter) {
      itemFilterRequired = true;
      syncVisitedTopicOpacityState();
    }
  }

  if (itemProcessingScheduled) return;
  itemProcessingScheduled = true;

  const run = () => {
    itemProcessingScheduled = false;
    const shouldRunDomRemoval = domRemovalRequired;
    const shouldRunItemFilter = itemFilterRequired;
    const shouldFullReprocess = fullReprocessRequired;
    const adScanRoots = pendingAdScanRoots.size > 0 ? Array.from(pendingAdScanRoots) : null;
    domRemovalRequired = false;
    itemFilterRequired = false;
    pendingAdScanRoots.clear();

    if (shouldFullReprocess) {
      resetProcessedItems();
      fullReprocessRequired = false;
    }
    processItemsNow({
      runDomRemoval: shouldRunDomRemoval,
      runItemFilter: shouldRunItemFilter || shouldFullReprocess,
      adScanRoots: shouldFullReprocess ? null : adScanRoots,
    });
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 400 });
  } else {
    setTimeout(run, 80);
  }
}

function triggerFullReprocess() {
  scheduleItemProcessing({ fullReprocess: true });
}

function runInitialScanWhenReady() {
  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    const topicList = document.querySelector('tr.topic-list-item, div.fps-result');
    if (topicList || ++attempts > maxAttempts) {
      clearInterval(interval);
      if (topicList) scheduleItemProcessing({ runDomRemoval: true, runItemFilter: true });
    }
  }, 500);
}

function refreshPageContext() {
  applyDynamicStyles();
  const observerOptions = {
    scheduleItemProcessing,
    applyVisitedOpacityStateToRoots,
    syncVisitedTopicOpacityState,
  };
  observeNewItems(observerOptions);
  observeDynamicAdUiContent(observerOptions);
  observeThemeChanges();
  applyPanelTheme();
  ensureSettingsButtonExists();
  ensureSearchButtonExists();
}

function handleRouteChange() {
  let attempts = 0;
  const maxAttempts = 20;
  const checkAndRefresh = () => {
    attempts++;
    const hasNav = !!document.querySelector('#main-outlet .navigation-container');
    const hasTopicPost = !!document.querySelector('div.topic-post, article[data-post-id]');

    if (hasNav || hasTopicPost || attempts >= maxAttempts) {
      refreshPageContext();
      triggerFullReprocess();
    } else {
      setTimeout(checkAndRefresh, 100);
    }
  };

  setTimeout(checkAndRefresh, 100);
}

function initializeScript() {
  resetProcessedItems();
  loadVisitedTopics();
  loadBlockerSettings();
  loadOldPostBlockerSettings();
  loadWebdavSettings();
  createSettingsPanel(triggerFullReprocess);
  refreshPageContext();
  installRouteObserver(() => {
    ensureSearchButtonExists();
    setTimeout(handleRouteChange, 120);
  });
  runInitialScanWhenReady();
  setTimeout(applyPanelTheme, 200);
  triggerFullReprocess();

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      setTimeout(() => {
        triggerFullReprocess();
      }, 250);
    }
  });

  window.addEventListener('beforeunload', persistVisitedTopics);
}

initAdUIRemoverEarly();

function startScript() {
  injectBaseStyles();
  setupGlobalClickHandler(getTopicId, (topicId, itemElement) => markTopicAsVisited(topicId, itemElement, applyDynamicStyles));
  initializeScript();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startScript);
} else {
  startScript();
}
