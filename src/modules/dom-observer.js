import { PROCESSABLE_ITEM_SELECTOR, RELEVANT_AD_NODE_SELECTOR } from './constants.js';
import { nodeMatchesOrContains } from './utils.js';

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
export function observeNewItems({ scheduleItemProcessing, applyVisitedOpacityStateToRoots, syncVisitedTopicOpacityState }) {
  if (itemObserver) itemObserver.disconnect();
  const targetNode = document.querySelector('#main-outlet');
  if (!targetNode) {
    setTimeout(() => observeNewItems({ scheduleItemProcessing, applyVisitedOpacityStateToRoots, syncVisitedTopicOpacityState }), 500);
    return;
  }
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
      adScanRoots: mutationState.adRoots,
    });
  });
  itemObserver.observe(targetNode, { childList: true, subtree: true });
}

let adUiObserver = null;
export function observeDynamicAdUiContent({ scheduleItemProcessing, applyVisitedOpacityStateToRoots, syncVisitedTopicOpacityState }) {
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
  else
    new MutationObserver(function () {
      if (document.body) {
        observeBody();
        this.disconnect();
      }
    }).observe(document.documentElement, { childList: true });
}
