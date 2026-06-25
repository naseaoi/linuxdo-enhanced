let routeObserverInstalled = false;
let lastNotifiedUrl = location.href;

function wrapHistoryMethod(methodName, notifyRouteChange) {
  const originalMethod = history[methodName];
  history[methodName] = function(...args) {
    const result = originalMethod.apply(this, args);
    notifyRouteChange();
    return result;
  };
}

export function installRouteObserver(onRouteChange) {
  if (routeObserverInstalled) return;
  routeObserverInstalled = true;

  const notifyRouteChange = () => {
    const currentUrl = location.href;
    if (currentUrl === lastNotifiedUrl) return;
    lastNotifiedUrl = currentUrl;
    onRouteChange(currentUrl);
  };

  wrapHistoryMethod('pushState', notifyRouteChange);
  wrapHistoryMethod('replaceState', notifyRouteChange);
  window.addEventListener('popstate', notifyRouteChange);
  window.addEventListener('hashchange', notifyRouteChange);
}
