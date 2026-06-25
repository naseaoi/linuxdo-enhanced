import {
  CONFIG_KEY_USERS,
  CONFIG_KEY_KEYWORDS,
  CONFIG_KEY_CATEGORIES,
  CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED,
  CONFIG_KEY_BLOCK_OLD_POSTS_DAYS,
  HIDDEN_ITEM_CLASS,
  PROCESSED_ITEM_ATTR,
  VISITED_TOPIC_CLASS,
  UI_TOGGLE_KEYS,
  DATE_TEXT_PATTERNS,
  PROCESSABLE_ITEM_SELECTOR,
  UNPROCESSED_PROCESSABLE_ITEM_SELECTOR,
} from './constants.js';
import { log, escapeRegExp, getTopicId, parseDateFromText, isHomepageRoute, isUserActivityTopicsPage } from './utils.js';
import { currentUiToggleStates, visitedTopics, ensureTopicIdentityAttr } from './ad-remover.js';
import { GM_getValue, GM_setValue } from './gm.js';
import { getSettingDefault, normalizeSettingValue } from './settings-schema.js';

const ITEM_BLOCKER_MODULE = 'ItemBlocker';

export let blockOldPostsEnabled = false;
export let blockOldPostsDays = 90;
export let blockedUsers = [];
export let blockedKeywords = [];
export let blockedCategories = [];
export let blockedUsersSet = new Set();
export let blockedCategoriesSet = new Set();
export let blockedKeywordsRegex = null;

export function applyBlockedCollections({ users, keywords, categories }) {
  blockedUsers = users;
  blockedKeywords = keywords;
  blockedCategories = categories;
  blockedUsersSet = new Set(blockedUsers);
  blockedCategoriesSet = new Set(blockedCategories);
  rebuildBlockedKeywordsRegex();
}

function rebuildBlockedKeywordsRegex() {
  if (blockedKeywords.length === 0) {
    blockedKeywordsRegex = null;
    return;
  }
  blockedKeywordsRegex = new RegExp(blockedKeywords.map(escapeRegExp).join('|'), 'i');
}

export function loadBlockerSettings() {
  applyBlockedCollections({
    users: normalizeSettingValue(CONFIG_KEY_USERS, GM_getValue(CONFIG_KEY_USERS, getSettingDefault(CONFIG_KEY_USERS))),
    keywords: normalizeSettingValue(CONFIG_KEY_KEYWORDS, GM_getValue(CONFIG_KEY_KEYWORDS, getSettingDefault(CONFIG_KEY_KEYWORDS))),
    categories: normalizeSettingValue(CONFIG_KEY_CATEGORIES, GM_getValue(CONFIG_KEY_CATEGORIES, getSettingDefault(CONFIG_KEY_CATEGORIES))),
  });
}

export function saveBlockerSettings(getUserInput, getKeywordsInput, getCategoriesInput) {
  applyBlockedCollections({
    users: getUserInput(),
    keywords: getKeywordsInput(),
    categories: getCategoriesInput(),
  });
  GM_setValue(CONFIG_KEY_USERS, blockedUsers);
  GM_setValue(CONFIG_KEY_KEYWORDS, blockedKeywords);
  GM_setValue(CONFIG_KEY_CATEGORIES, blockedCategories);
}

export function loadOldPostBlockerSettings() {
  blockOldPostsEnabled = normalizeSettingValue(
    CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED,
    GM_getValue(CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED, getSettingDefault(CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED)),
  );
  blockOldPostsDays = normalizeSettingValue(
    CONFIG_KEY_BLOCK_OLD_POSTS_DAYS,
    GM_getValue(CONFIG_KEY_BLOCK_OLD_POSTS_DAYS, getSettingDefault(CONFIG_KEY_BLOCK_OLD_POSTS_DAYS)),
  );
}

export function saveOldPostBlockerSettings(enabled, days) {
  blockOldPostsEnabled = normalizeSettingValue(CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED, enabled);
  blockOldPostsDays = normalizeSettingValue(CONFIG_KEY_BLOCK_OLD_POSTS_DAYS, days);
  GM_setValue(CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED, blockOldPostsEnabled);
  GM_setValue(CONFIG_KEY_BLOCK_OLD_POSTS_DAYS, blockOldPostsDays);
}

function hasBlockedUserInElement(itemElement, scopeSelector = null) {
  if (blockedUsersSet.size === 0) return false;
  const scope = scopeSelector ? itemElement.querySelector(scopeSelector) : itemElement;
  if (!scope) return false;
  const userCardElements = scope.querySelectorAll('[data-user-card]');
  for (const userCardElement of userCardElements) {
    const userCard = (userCardElement.getAttribute('data-user-card') || '').toLowerCase().trim();
    if (userCard && blockedUsersSet.has(userCard)) {
      return true;
    }
  }
  return false;
}

function getPostDateFromActivityCell(activityCell) {
  if (!activityCell) return null;

  const timeElement = activityCell.querySelector('time[datetime]');
  const datetimeValue = timeElement?.getAttribute('datetime');
  if (datetimeValue) {
    const date = new Date(datetimeValue);
    if (!isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  const titleDate = parseDateFromText(activityCell.getAttribute('title') || '', DATE_TEXT_PATTERNS);
  if (titleDate) return titleDate;

  return parseDateFromText(activityCell.textContent || '', DATE_TEXT_PATTERNS);
}

function shouldApplyOldPostBlocker() {
  return isHomepageRoute() && !isUserActivityTopicsPage();
}

function shouldBlockItem(itemElement) {
  if (!itemElement) return false;
  if (itemElement.matches('div.topic-post, article[data-post-id], article[id^="post_"]')) {
    return hasBlockedUserInElement(itemElement, '.topic-avatar');
  }
  const isTopicListItem = itemElement.matches('tr.topic-list-item, div.fps-result');
  if (isTopicListItem) {
    if (hasBlockedUserInElement(itemElement)) {
      return true;
    }
    if (blockOldPostsEnabled && blockOldPostsDays > 0 && shouldApplyOldPostBlocker()) {
      const activityCell = itemElement.querySelector('td.activity');
      if (activityCell) {
        const postDate = getPostDateFromActivityCell(activityCell);
        if (postDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= blockOldPostsDays) {
            log(ITEM_BLOCKER_MODULE, `✓ Blocking old post: created ${diffDays} days ago.`);
            return true;
          }
        }
      }
    }
    if (blockedKeywordsRegex) {
      const titleElement = itemElement.querySelector(
        'a.search-link .topic-title span[dir="auto"], a.title span[dir="auto"], a.title.raw-link span[dir="auto"]',
      );
      if (titleElement) {
        const titleText = titleElement.textContent;
        if (blockedKeywordsRegex.test(titleText)) {
          return true;
        }
      }
    }
    if (blockedCategoriesSet.size > 0) {
      const categoryElement = itemElement.querySelector('.badge-category__name');
      if (categoryElement && blockedCategoriesSet.has(categoryElement.textContent.toLowerCase().trim())) {
        return true;
      }
      const tagElements = itemElement.querySelectorAll('.discourse-tags a.discourse-tag');
      for (const tagElement of tagElements) {
        if (blockedCategoriesSet.has(tagElement.textContent.toLowerCase().trim())) {
          return true;
        }
      }
    }
  }
  return false;
}

export function applyFilterToItem(itemElement) {
  if (!itemElement || itemElement.hasAttribute(PROCESSED_ITEM_ATTR)) return;
  const topicId = getTopicId(itemElement);
  ensureTopicIdentityAttr(itemElement, topicId);
  if (shouldBlockItem(itemElement)) {
    itemElement.classList.add(HIDDEN_ITEM_CLASS);
    itemElement.setAttribute(PROCESSED_ITEM_ATTR, 'blocked');
    itemElement.style.display = 'none';
  } else {
    itemElement.setAttribute(PROCESSED_ITEM_ATTR, 'visible');
  }
  if (currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity]) {
    if (topicId && visitedTopics.has(topicId)) {
      itemElement.classList.add(VISITED_TOPIC_CLASS);
    }
  } else {
    itemElement.classList.remove(VISITED_TOPIC_CLASS);
  }
}

export function processAllItems() {
  const items = document.querySelectorAll(UNPROCESSED_PROCESSABLE_ITEM_SELECTOR);
  if (items.length > 0) {
    items.forEach(applyFilterToItem);
    log(ITEM_BLOCKER_MODULE, `Processed ${items.length} new items.`);
  }
}

export function collectProcessableItemsFromRoot(root) {
  const items = [];
  if (!(root instanceof Element)) return items;
  if (root.matches(PROCESSABLE_ITEM_SELECTOR)) {
    items.push(root);
  }
  root.querySelectorAll(PROCESSABLE_ITEM_SELECTOR).forEach((item) => items.push(item));
  return items;
}

export function applyVisitedOpacityStateToItems(items) {
  if (!currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity] || !Array.isArray(items) || items.length === 0) {
    return;
  }
  items.forEach((itemElement) => {
    const topicId = getTopicId(itemElement);
    ensureTopicIdentityAttr(itemElement, topicId);
    if (topicId && visitedTopics.has(topicId)) {
      itemElement.classList.add(VISITED_TOPIC_CLASS);
    }
  });
}

export function applyVisitedOpacityStateToRoots(roots) {
  if (!Array.isArray(roots) || roots.length === 0) return;
  const uniqueItems = new Set();
  roots.forEach((root) => {
    collectProcessableItemsFromRoot(root).forEach((item) => uniqueItems.add(item));
  });
  applyVisitedOpacityStateToItems(Array.from(uniqueItems));
}

export function syncVisitedTopicOpacityState() {
  const visitedOpacityEnabled = currentUiToggleStates[UI_TOGGLE_KEYS.visitedTopicOpacity];
  const topicItems = document.querySelectorAll('tr.topic-list-item, div.fps-result');

  if (!visitedOpacityEnabled) {
    topicItems.forEach((itemElement) => itemElement.classList.remove(VISITED_TOPIC_CLASS));
    return;
  }

  topicItems.forEach((itemElement) => {
    const topicId = getTopicId(itemElement);
    if (!topicId) {
      return;
    }
    ensureTopicIdentityAttr(itemElement, topicId);
    itemElement.classList.toggle(VISITED_TOPIC_CLASS, visitedTopics.has(topicId));
  });
}

export function resetProcessedItems() {
  document.querySelectorAll(`[${PROCESSED_ITEM_ATTR}]`).forEach((item) => {
    item.removeAttribute(PROCESSED_ITEM_ATTR);
    item.classList.remove(HIDDEN_ITEM_CLASS);
  });
}
