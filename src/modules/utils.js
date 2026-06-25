import { DEBUG } from './constants.js';

export function log(module, message, ...args) {
  if (DEBUG) {
    console.log(`[LD Enhanced ${module}]`, message, ...args);
  }
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function normalizeList(items) {
  return [...new Set(items.map((s) => (s || '').toLowerCase().trim()).filter(Boolean))];
}

export function parseListInputValue(value) {
  return normalizeList((value || '').replace(/[\n,，]/g, ',').split(','));
}

export function getInputValue(id) {
  return document.getElementById(id)?.value ?? '';
}

export function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (input) {
    input.value = value;
  }
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getTopicId(itemElement) {
  const link = itemElement.querySelector('a.title, a.search-link');
  if (link && link.href) {
    const match = link.href.match(/\/t\/[^/]+\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return itemElement.dataset.topicId || null;
}

export function buildDateFromParts(yearStr, monthStr, dayStr) {
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function parseDateFromText(text, patterns) {
  if (!text) return null;
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  if (!normalizedText) return null;

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (!match) continue;
    const parsed = buildDateFromParts(match[1], match[2], match[3]);
    if (parsed) return parsed;
  }

  return null;
}

export function normalizePathname(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function isUserActivityTopicsPage(pathname = location.pathname) {
  const normalizedPath = normalizePathname(pathname);
  return /^\/u\/[^/]+\/activity\/topics$/i.test(normalizedPath);
}

export function isHomepageRoute(pathname = location.pathname) {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === '/' || normalizedPath === '/latest';
}

export function isDiscoveryListRoute(pathname = location.pathname) {
  const normalizedPath = normalizePathname(pathname);
  const discoveryRoutes = new Set(['/', '/latest', '/new', '/unseen', '/hot', '/top', '/posted', '/read', '/bookmarks', '/categories']);
  return discoveryRoutes.has(normalizedPath);
}

export function nodeMatchesOrContains(node, selector) {
  if (!(node instanceof Element)) return false;
  return node.matches(selector) || node.querySelector(selector) !== null;
}

export function encodeBasicAuthUtf8(user, pass) {
  const source = `${user}:${pass}`;
  const bytes = new TextEncoder().encode(source);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
