import { PROCESSABLE_ITEM_SELECTOR, RELEVANT_AD_NODE_SELECTOR } from './modules/constants.js';
import { getTopicId, nodeMatchesOrContains } from './modules/utils.js';
import {
  initAdUIRemoverEarly,
  loadVisitedTopics,
  persistVisitedTopics,
  markTopicAsVisited,
  removeSelectedElementsFromDOM,
  applyDynamicStyles
} from './modules/ad-remover.js';
import {
  loadBlockerSettings,
  loadOldPostBlockerSettings,
  processAllItems,
  resetProcessedItems,
  applyVisitedOpacityStateToRoots,
  syncVisitedTopicOpacityState
} from './modules/item-blocker.js';
import { loadWebdavSettings } from './modules/webdav.js';
import { observeThemeChanges, applyPanelTheme } from './modules/theme.js';
import { createSettingsPanel, injectBaseStyles, setupGlobalClickHandler, ensureSettingsButtonExists, ensureSearchButtonExists } from './modules/ui.js';
import { installRouteObserver } from './modules/route-observer.js';

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
      adScanRoots: shouldFullReprocess ? null : adScanRoots
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

function classifyMutations(mutations) {
  const state = { hasProcessable: false, hasAdNode: false, adRoots: [], processableRoots: [] };
  const adRootSet = new Set();
  const processableRootSet = new Set();
  for (const mutation of mutations) {
    if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) continue;
    for (const node of mutation.addedNodes) {
      if (!state.hasProcessable && nodeMatchesOrContains(node, PROCESSABLE_ITEM_SELECTOR)) {
        state.hasProcessable = true;
      }
      if (nodeMatchesOrContains(node, PROCESSABLE_ITEM_SELECTOR) && node instanceof Element) {
        processableRootSet.add(node);
      }
      if (!state.hasAdNode && nodeMatchesOrContains(node, RELEVANT_AD_NODE_SELECTOR)) {
        state.hasAdNode = true;
      }
      if (nodeMatchesOrContains(node, RELEVANT_AD_NODE_SELECTOR) && node instanceof Element) {
        adRootSet.add(node);
      }
      if (state.hasProcessable && state.hasAdNode) {
        continue;
      }
    }
  }
  state.adRoots = Array.from(adRootSet);
  state.processableRoots = Array.from(processableRootSet);
  return state;
}

let itemObserver = null;
function observeNewItems() {
  if (itemObserver) itemObserver.disconnect();
  const targetNode = document.querySelector('#main-outlet');
  if (!targetNode) { setTimeout(observeNewItems, 500); return; }
  itemObserver = new MutationObserver((mutations) => {
    const mutationState = classifyMutations(mutations);
    if (!mutationState.hasProcessable && !mutationState.hasAdNode) return;
    if (mutationState.hasProcessable) {
      applyVisitedOpacityStateToRoots(mutationState.processableRoots);
      syncVisitedTopicOpacityState();
    }
    scheduleItemProcessing({
      runDomRemoval: mutationState.hasAdNode,
      runItemFilter: mutationState.hasProcessable,
      adScanRoots: mutationState.adRoots
    });
  });
  itemObserver.observe(targetNode, { childList: true, subtree: true });
}

let adUiObserver = null;
function observeDynamicAdUiContent() {
  if (adUiObserver) adUiObserver.disconnect();
  adUiObserver = new MutationObserver((mutations) => {
    const mutationState = classifyMutations(mutations);
    if (!mutationState.hasAdNode) return;
    if (mutationState.hasProcessable) {
      applyVisitedOpacityStateToRoots(mutationState.processableRoots);
      syncVisitedTopicOpacityState();
    }
    scheduleItemProcessing({ runDomRemoval: true, runItemFilter: mutationState.hasProcessable, adScanRoots: mutationState.adRoots });
  });
  const observeBody = () => adUiObserver.observe(document.body, { childList: true, subtree: true });
  if (document.body) observeBody();
  else new MutationObserver(function() { if (document.body) { observeBody(); this.disconnect(); } }).observe(document.documentElement, { childList: true });
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
  observeNewItems();
  observeDynamicAdUiContent();
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

  window.addEventListener('pageshow', function(event) {
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
