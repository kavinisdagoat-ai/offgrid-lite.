/* storage.js — saves the game in IndexedDB (the phone's built-in offline database).
   Everything is stored under one key, so it is easy to understand and to back up. */
const Store = (function () {
  var DB_NAME = 'offgrid-lite';
  var STORE = 'saves';
  var KEY = 'main';
  var dbPromise = null;
  var queue = Promise.resolve();   // makes sure saves happen one after another

  var api = {
    ok: true,                      // turns false if the browser refuses to save
    onStatus: function () {}
  };

  function open() {
    if (!dbPromise) {
      dbPromise = new Promise(function (resolve, reject) {
        if (!window.indexedDB) { reject(new Error('IndexedDB is not available')); return; }
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
        req.onblocked = function () { reject(new Error('Database blocked')); };
      });
    }
    return dbPromise;
  }

  function run(mode, action) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var req = action(tx.objectStore(STORE));
        tx.oncomplete = function () { resolve(req ? req.result : undefined); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error('Save aborted')); };
      });
    });
  }

  function setOk(value) {
    if (api.ok !== value) { api.ok = value; api.onStatus(); }
  }

  api.load = function () {
    return run('readonly', function (s) { return s.get(KEY); }).catch(function (e) {
      setOk(false);
      return null;
    });
  };

  api.save = function (data) {
    var snapshot = JSON.parse(JSON.stringify(data));   // copy now, write in order
    queue = queue.then(function () {
      return run('readwrite', function (s) { return s.put(snapshot, KEY); });
    }).then(function () { setOk(true); }, function () { setOk(false); });
    return queue;
  };

  api.clear = function () {
    queue = queue.then(function () {
      return run('readwrite', function (s) { return s.delete(KEY); });
    }).then(function () { setOk(true); }, function () { setOk(false); });
    return queue;
  };

  return api;
})();
