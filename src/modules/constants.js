export const DEBUG = false;

export const UI_TOGGLE_KEYS = {
  globalNotice: 'ld_hide_global_notice',
  homepageTopAd: 'ld_hide_homepage_top_ad',
  topicPageAds: 'ld_hide_topic_page_ads',
  homepageBanner: 'ld_hide_homepage_banner',
  visitedTopicOpacity: 'ld_visited_topic_opacity',
  headerSearchIcon: 'ld_show_header_search_icon'
};

export const DEFAULT_UI_TOGGLE_STATES = {
  [UI_TOGGLE_KEYS.globalNotice]: true,
  [UI_TOGGLE_KEYS.homepageTopAd]: true,
  [UI_TOGGLE_KEYS.topicPageAds]: true,
  [UI_TOGGLE_KEYS.homepageBanner]: false,
  [UI_TOGGLE_KEYS.visitedTopicOpacity]: true,
  [UI_TOGGLE_KEYS.headerSearchIcon]: false,
};

export const UI_TOGGLE_LABELS = {
  [UI_TOGGLE_KEYS.globalNotice]: '屏蔽全局横幅',
  [UI_TOGGLE_KEYS.homepageTopAd]: '屏蔽首页广告',
  [UI_TOGGLE_KEYS.topicPageAds]: '屏蔽帖子广告',
  [UI_TOGGLE_KEYS.homepageBanner]: '屏蔽首页标题和搜索框',
  [UI_TOGGLE_KEYS.visitedTopicOpacity]: '已读帖子降低透明度',
  [UI_TOGGLE_KEYS.headerSearchIcon]: '显示首页顶栏搜索图标'
};

export const CONFIG_KEY_USERS = 'linuxdo_blocked_users';
export const CONFIG_KEY_KEYWORDS = 'linuxdo_blocked_keywords';
export const CONFIG_KEY_CATEGORIES = 'linuxdo_blocked_categories';
export const CONFIG_KEY_PANEL_POS = 'linuxdo_panel_position';
export const CONFIG_KEY_BLOCK_OLD_POSTS_ENABLED = 'ld_block_old_posts_enabled';
export const CONFIG_KEY_BLOCK_OLD_POSTS_DAYS = 'ld_block_old_posts_days';

export const CONFIG_KEY_WEBDAV_URL = 'ld_webdav_url';
export const CONFIG_KEY_WEBDAV_USER = 'ld_webdav_user';
export const CONFIG_KEY_WEBDAV_PASS = 'ld_webdav_pass';
export const WEBDAV_PATH = '/linuxdoxx/';
export const WEBDAV_FILENAME = 'settings.json';

export const SETTINGS_PANEL_ID = 'ld-enhancer-settings-panel';
export const SETTINGS_BUTTON_ID_HEADER = 'ld-enhancer-toggle-btn-header';
export const SETTINGS_BUTTON_LI_ID = 'ld-enhancer-toggle-li';
export const GLOBAL_TOAST_ID = 'ld-enhancer-global-toast';
export const SEARCH_BUTTON_ID_HEADER = 'ld-enhancer-search-btn-header';
export const SEARCH_BUTTON_LI_ID = 'ld-enhancer-search-li';

export const HIDDEN_ITEM_CLASS = 'ld-enh-hidden';
export const PROCESSED_ITEM_ATTR = 'data-ld-enh-processed';
export const VISITED_TOPIC_CLASS = 'ld-enh-visited';
export const VISITED_TOPIC_ATTR = 'data-ld-topic-id';
export const LIGHT_THEME_BODY_CLASS = 'ld-enh-light-theme';

export const VISITED_TOPICS_KEY = 'ld_visited_topics';
export const MAX_VISITED_TOPICS = 2000;
export const VISITED_TOPICS_PERSIST_DELAY = 600;

export const PROCESSABLE_ITEM_SELECTOR = 'tr.topic-list-item, div.fps-result, div.topic-post, article[data-post-id], article[id^="post_"]';
export const UNPROCESSED_PROCESSABLE_ITEM_SELECTOR = `${PROCESSABLE_ITEM_SELECTOR.split(', ').map(selector => `${selector}:not([${PROCESSED_ITEM_ATTR}])`).join(', ')}`;

export const BLOCKER_INPUT_IDS = {
  users: 'ld-blocked-users',
  keywords: 'ld-blocked-keywords',
  categories: 'ld-blocked-categories'
};

export const WEBDAV_INPUT_IDS = {
  url: 'ld-webdav-url',
  user: 'ld-webdav-user',
  pass: 'ld-webdav-pass'
};

export const PANEL_FORM_INPUT_SELECTOR = `#${SETTINGS_PANEL_ID} textarea, #${SETTINGS_PANEL_ID} input[type="text"], #${SETTINGS_PANEL_ID} input[type="url"], #${SETTINGS_PANEL_ID} input[type="number"], #${SETTINGS_PANEL_ID} input[type="password"]`;

export const REMOVAL_CONFIG = {
  [UI_TOGGLE_KEYS.globalNotice]: [{
    selector: 'div.global-notice'
  }],
  [UI_TOGGLE_KEYS.homepageTopAd]: [{
    selector: 'span.discovery-list-container-top-outlet',
    innerCheck: 'div.house-creative.house-topic-list-top'
  }],
  [UI_TOGGLE_KEYS.topicPageAds]: [
    {
      selector: 'div.topic-above-post-stream-outlet',
      innerCheck: 'div.house-creative.house-topic-above-post-stream'
    },
    {
      selector: 'div.topic-above-suggested-outlet',
      innerCheck: 'div.house-creative.house-topic-above-suggested'
    }
  ],
  [UI_TOGGLE_KEYS.homepageBanner]: [{
    selector: 'div.welcome-banner'
  }]
};

export const DATE_TEXT_PATTERNS = [
  /(?:创建日期|创建于|created(?:\s+on)?)\D*(\d{4})\s*[\/\.\-年]\s*(\d{1,2})\s*[\/\.\-月]\s*(\d{1,2})(?:\s*日)?/i,
  /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
  /\b(\d{4})\/(\d{1,2})\/(\d{1,2})\b/,
  /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?/
];

export const RELEVANT_AD_NODE_SELECTOR = [
  ...Object.values(REMOVAL_CONFIG).flat().map(cfg => cfg.selector),
  'div.house-creative'
].join(', ');
