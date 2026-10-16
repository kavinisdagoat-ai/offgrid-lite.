/* app.js — starts everything: loads the save, draws the first screen,
   and registers the service worker that makes the game work offline. */
(function () {
  function start(saved) {
    Game.init(saved);
    Game.onChange = function (state) { Store.save(state); };
    Store.onStatus = function () { UI.renderBanner(); };
    UI.init();
    UI.go('home');

    // Save once more whenever the app is hidden or closed.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') Store.save(Game.state);
    });
    window.addEventListener('pagehide', function () { Store.save(Game.state); });

    // Ask the browser to keep our data (harmless if it says no).
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(function () {});
    }

    // Offline support (only works on a secure web address or localhost).
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  Store.load().then(start, function () { start(null); });
})();
