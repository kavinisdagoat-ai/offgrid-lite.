/* ui.js — navigation, shared helpers and the screens.
   Each screen is a function that returns HTML. Buttons carry data-act="name"
   and the matching function in UI.actions runs when they are tapped. */
const UI = { screen: 'home', params: {}, screens: {}, actions: {} };

UI.$ = function (id) { return document.getElementById(id); };
UI.num = function (n) { return Number(n).toLocaleString('en-US'); };
UI.esc = function (s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
UI.pct = function (cur, max) { return max > 0 ? Math.min(100, Math.round((cur / max) * 100)) : 0; };

/* ---------- tabs ---------- */
UI.tabList = [
  { id: 'home', label: 'Home', icon: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>' },
  { id: 'challenges', label: 'Challenges', icon: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>' },
  { id: 'shop', label: 'Shop', icon: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 016 0"/>' },
  { id: 'items', label: 'Items', icon: '<path d="M8 6a4 4 0 018 0"/><rect x="5" y="6" width="14" height="15" rx="4"/><path d="M9 14h6"/>' },
  { id: 'me', label: 'Profile', icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>' }
];
/* Screens that live "inside" a tab, so the right tab stays highlighted. */
UI.tabOf = { play: 'challenges', achievements: 'me', backup: 'me', reset: 'me' };

UI.renderTabs = function () {
  var active = UI.tabOf[UI.screen] || UI.screen;
  var alert = Game.unclaimedCount ? Game.unclaimedCount() : 0;
  UI.$('tabs').innerHTML = UI.tabList.map(function (t) {
    return '<button data-act="go" data-to="' + t.id + '"' + (t.id === active ? ' class="on" aria-current="page"' : '') + '>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + t.icon + '</svg>' +
      '<span>' + t.label + '</span>' +
      (t.id === 'me' && alert > 0 ? '<i class="dot" aria-label="Rewards to claim"></i>' : '') +
      '</button>';
  }).join('');
};

UI.renderBar = function () {
  var L = Game.levelInfo();
  UI.$('bar').innerHTML =
    '<span class="brand">OFFGRID</span>' +
    '<span class="wallet"><span class="lvchip">Level ' + L.level + '</span>' +
    '<span><i class="coin"></i>' + UI.num(Game.state.coins) + '</span></span>';
};

UI.renderBanner = function () {
  var b = UI.$('banner');
  if (Store.ok) { b.hidden = true; return; }
  b.hidden = false;
  b.textContent = 'This browser is not letting the game save. Progress will be lost when you close it. Use Export on the Profile tab to keep a backup.';
};

/* ---------- navigation and drawing ---------- */
UI.go = function (screen, params) {
  if (screen !== 'play' && typeof Play !== 'undefined') Play.clear();
  UI.screen = screen;
  UI.params = params || {};
  UI.render(true);
};

UI.render = function (toTop) {
  var main = UI.$('screen');
  var y = main.scrollTop;
  var fn = UI.screens[UI.screen] || UI.screens.home;
  main.innerHTML = fn(UI.params);
  main.scrollTop = toTop ? 0 : y;
  UI.renderBar();
  UI.renderTabs();
  UI.renderBanner();
};

UI.init = function () {
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var fn = UI.actions[el.dataset.act];
    if (fn) fn(el.dataset, el, e);
  });
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'fileIn') UI.readSaveFile(e.target);
  });
};

/* ---------- modal and toast ---------- */
UI.modal = function (html, dismissible) {
  var m = UI.$('modal');
  m.innerHTML = '<div class="backdrop"' + (dismissible ? ' data-act="backdrop"' : '') + '><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>';
  m.hidden = false;
};
UI.closeModal = function () {
  var m = UI.$('modal');
  m.hidden = true;
  m.innerHTML = '';
};

var toastTimer = null;
UI.toast = function (msg) {
  var t = UI.$('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.hidden = true; }, 2400);
};

UI.actions.go = function (d) { UI.go(d.to, d.id ? { id: d.id } : {}); };
UI.actions.close = function () { UI.closeModal(); };
UI.actions.backdrop = function (d, el, e) { if (e.target === el) UI.closeModal(); };

/* ---------- Home: compass and progress dashboard ---------- */
UI.compass = function (L) {
  var ticks = '';
  for (var i = 0; i < 72; i++) {
    var big = i % 18 === 0, mid = i % 6 === 0;
    var len = big ? 14 : (mid ? 9 : 5);
    ticks += '<line x1="130" y1="8" x2="130" y2="' + (8 + len) + '" transform="rotate(' + (i * 5) + ' 130 130)" class="tk' + (big ? ' big' : '') + '"/>';
  }
  var arc = L.pct > 0
    ? '<circle cx="130" cy="130" r="84" class="arc" pathLength="100" stroke-dasharray="' + L.pct + ' 100" transform="rotate(-90 130 130)"/>'
    : '';
  return '<svg class="compass" viewBox="0 0 260 260" role="img" aria-label="Level ' + L.level + ', ' + L.pct + ' percent of the way to the next level">' +
    '<circle cx="130" cy="130" r="122" class="bezel"/>' + ticks +
    '<text x="130" y="36" class="cardinal n" text-anchor="middle">N</text>' +
    '<text x="228" y="134" class="cardinal" text-anchor="middle">E</text>' +
    '<text x="130" y="232" class="cardinal" text-anchor="middle">S</text>' +
    '<text x="32" y="134" class="cardinal" text-anchor="middle">W</text>' +
    '<circle cx="130" cy="130" r="84" class="track"/>' + arc +
    '<g transform="rotate(' + (L.pct * 3.6) + ' 130 130)"><circle cx="130" cy="46" r="7" class="knob"/></g>' +
    '<text x="130" y="100" class="lv-label" text-anchor="middle">Level</text>' +
    '<text x="130" y="152" class="lv-n" text-anchor="middle">' + L.level + '</text>' +
    '<text x="130" y="178" class="lv-title" text-anchor="middle">' + UI.esc(L.title) + '</text>' +
    '</svg>';
};

UI.progressRow = function (label, cur, max, to) {
  return '<button class="prow" data-act="go" data-to="' + to + '">' +
    '<span class="plabel">' + label + '</span>' +
    '<span class="bar"><i style="width:' + UI.pct(cur, max) + '%"></i></span>' +
    '<span class="pnum">' + cur + '/' + max + '</span></button>';
};

UI.screens.home = function () {
  var L = Game.levelInfo();
  var st = Game.state;
  var line = L.isMax ? 'Top level reached' : UI.num(L.toNext) + ' XP to level ' + (L.level + 1);
  var cats = Object.keys(Data.categories).map(function (c) {
    return UI.progressRow(Data.categories[c].name, Game.doneCount(c), Game.totalCount(c), 'challenges');
  }).join('');
  return '<section class="hero">' + UI.compass(L) +
    '<p class="xpline">' + line + '</p>' +
    '<p class="xpsub">' + UI.num(L.xp) + ' XP earned in total</p></section>' +
    '<h2 class="sect">Your progress</h2>' +
    UI.progressRow('Challenges completed', Game.doneCount(), Game.totalCount(), 'challenges') +
    UI.progressRow('Items collected', Game.itemCount(), Data.items.length, 'items') +
    UI.progressRow('Upgrades bought', Object.keys(st.upgrades).length, Data.upgrades.length, 'shop') +
    UI.progressRow('Achievements unlocked', Object.keys(st.achievements).length, Data.achievements.length, 'achievements') +
    '<h2 class="sect">By challenge type</h2>' + cats;
};

/* ---------- Challenges list ---------- */
UI.filter = 'all';
UI.diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

UI.screens.challenges = function () {
  var chips = ['all'].concat(Object.keys(Data.categories)).map(function (c) {
    var label = c === 'all' ? 'All' : Data.categories[c].name;
    return '<button class="chip' + (UI.filter === c ? ' on' : '') + '" data-act="filter" data-c="' + c + '">' + label + '</button>';
  }).join('');
  var rows = Data.challenges.filter(function (ch) {
    return UI.filter === 'all' || ch.cat === UI.filter;
  }).map(function (ch) {
    var done = Game.isDone(ch.id);
    var r = Game.rewardFor(ch);
    return '<button class="crow' + (done ? ' done' : '') + '" data-act="play" data-id="' + ch.id + '"' + (done ? ' aria-disabled="true"' : '') + '>' +
      '<span class="cglyph">' + Data.categories[ch.cat].icon + '</span>' +
      '<span class="cbody"><span class="ctitle">' + ch.title + '</span>' +
      '<span class="cblurb">' + ch.blurb + '</span>' +
      '<span class="cmeta"><span class="diff ' + ch.diff + '">' + UI.diffLabel[ch.diff] + '</span>' +
      '<span>+' + r.xp.total + ' XP</span><span>+' + r.coins.total + ' coins</span></span></span>' +
      '<span class="cstate">' + (done ? 'Done' : 'Start') + '</span></button>';
  }).join('');
  return '<h1 class="title">Challenges</h1><p class="muted">' + Game.doneCount() + ' of ' + Game.totalCount() + ' complete. Each challenge pays out once.</p>' +
    '<div class="chips">' + chips + '</div><div class="clist">' + rows + '</div>';
};
UI.actions.filter = function (d) { UI.filter = d.c; UI.render(); };

/* ---------- small shared pieces ---------- */
UI.tileInner = function (item) {
  return '<span class="ticon">' + item.icon + '</span><span class="tname">' + UI.esc(item.name) + '</span>' +
    '<span class="trar">' + Data.rarities[item.rarity].name + '</span>';
};

/* ---------- Shop ---------- */
UI.screens.shop = function () {
  var discount = Game.bonus('shopDiscountPct');
  var rows = Data.upgrades.map(function (u) {
    var owned = Game.owns(u.id), price = Game.priceOf(u);
    var action = owned
      ? '<span class="owned">Owned</span>'
      : '<button class="btn small buy' + (Game.state.coins < price ? ' poor' : '') + '" data-act="buy" data-id="' + u.id + '"><i class="coin"></i>' + price + '</button>';
    var was = !owned && price < u.cost ? '<span class="was">' + u.cost + '</span>' : '';
    return '<div class="srow' + (owned ? ' has' : '') + '">' +
      '<span class="sicon">' + u.icon + '</span>' +
      '<span class="sbody"><span class="sname">' + UI.esc(u.name) + '</span><span class="sdesc">' + u.desc + '</span></span>' +
      '<span class="sbuy">' + was + action + '</span></div>';
  }).join('');
  return '<h1 class="title">Shop</h1><p class="muted">' + Game.upgradeCount() + ' of ' + Data.upgrades.length + ' upgrades owned. Each can be bought once.</p>' +
    (discount > 0 ? '<p class="deal">Merchant\'s Ledger: ' + discount + '% off.</p>' : '') +
    '<div class="slist">' + rows + '</div>';
};

UI.actions.buy = function (d) {
  var u = Game.upgradeById(d.id);
  if (!u || Game.owns(u.id)) return;
  var price = Game.priceOf(u);
  if (Game.state.coins < price) { UI.toast('You need ' + (price - Game.state.coins) + ' more coins'); return; }
  UI.modal('<h2>' + UI.esc(u.name) + '</h2><p>' + u.desc + '</p>' +
    '<p class="muted" style="margin-top:10px">Cost: ' + price + ' coins. You will have ' + (Game.state.coins - price) + ' left.</p>' +
    '<button class="btn" data-act="buyConfirm" data-id="' + u.id + '">Buy for ' + price + ' coins</button>' +
    '<button class="btn ghost" data-act="close">Cancel</button>', true);
};

UI.actions.buyConfirm = function (d) {
  var res = Game.buyUpgrade(d.id);
  UI.closeModal();
  if (res.ok) {
    UI.toast(res.upgrade.name + ' is yours');
    UI.render();
  } else if (res.reason === 'coins') {
    UI.toast('You need ' + res.missing + ' more coins');
  }
};

/* ---------- Items: inventory and collection book ---------- */
UI.itemsTab = 'inventory';
UI.catSingular = { puzzle: 'Puzzle', memory: 'Memory', trivia: 'Trivia', explore: 'Exploration' };

UI.screens.items = function () {
  var seg = '<div class="seg" role="tablist">' +
    '<button role="tab" class="' + (UI.itemsTab === 'inventory' ? 'on' : '') + '" data-act="itemsTab" data-t="inventory">Inventory</button>' +
    '<button role="tab" class="' + (UI.itemsTab === 'book' ? 'on' : '') + '" data-act="itemsTab" data-t="book">Collection book</button></div>';
  return '<h1 class="title">Items</h1>' + seg + (UI.itemsTab === 'inventory' ? UI.inventoryView() : UI.bookView());
};

UI.inventoryView = function () {
  var st = Game.state;
  var owned = Data.items.filter(function (i) { return Game.hasItem(i.id); })
    .sort(function (a, b) { return st.items[b.id].at - st.items[a.id].at; });
  var items = owned.length
    ? '<div class="tiles">' + owned.map(function (i) {
        return '<button class="tile r-' + i.rarity + '" data-act="item" data-id="' + i.id + '">' + UI.tileInner(i) + '</button>';
      }).join('') + '</div>'
    : '<p class="empty">Your pack is empty. Complete challenges to find items.</p><button class="btn ghost" data-act="go" data-to="challenges">Go to challenges</button>';
  var gear = Data.upgrades.filter(function (u) { return Game.owns(u.id); });
  var gearHtml = gear.length
    ? gear.map(function (u) {
        return '<div class="grow"><span class="sicon">' + u.icon + '</span><span class="sbody"><span class="sname">' + UI.esc(u.name) + '</span><span class="sdesc">' + u.desc + '</span></span></div>';
      }).join('')
    : '<p class="empty">No upgrades yet. The shop has ' + Data.upgrades.length + ' to buy.</p>';
  return '<h2 class="sect">Items carried (' + owned.length + ')</h2>' + items +
         '<h2 class="sect">Gear in use (' + gear.length + ')</h2>' + gearHtml;
};

UI.bookView = function () {
  var total = Data.items.length, have = Game.itemCount();
  var html = '<p class="muted">' + have + ' of ' + total + ' items collected.</p><div class="bookbar"><div class="bar"><i style="width:' + UI.pct(have, total) + '%"></i></div></div>';
  Object.keys(Data.rarities).sort(function (a, b) { return Data.rarities[a].order - Data.rarities[b].order; }).forEach(function (r) {
    var rc = Game.rarityCount(r);
    html += '<h2 class="sect rar r-' + r + '">' + Data.rarities[r].name + ' <small>' + rc.owned + '/' + rc.total + '</small></h2><div class="tiles">' +
      Data.items.filter(function (i) { return i.rarity === r; }).map(function (i) {
        return Game.hasItem(i.id)
          ? '<button class="tile r-' + r + '" data-act="item" data-id="' + i.id + '">' + UI.tileInner(i) + '</button>'
          : '<button class="tile locked r-' + r + '" data-act="item" data-id="' + i.id + '" aria-label="Locked ' + Data.rarities[r].name + ' item"><span class="ticon">?</span><span class="tname">Not found</span><span class="trar">' + Data.rarities[r].name + '</span></button>';
      }).join('') + '</div>';
  });
  return html;
};

UI.actions.itemsTab = function (d) { UI.itemsTab = d.t; UI.render(); };

UI.actions.item = function (d) {
  var item = Game.itemById(d.id);
  if (!item) return;
  var src = Game.itemSource(item.id);
  var rar = Data.rarities[item.rarity].name;
  var html;
  if (Game.hasItem(item.id)) {
    var from = src.type === 'challenge' ? 'Found by completing "' + src.challenge.title + '".'
             : src.type === 'achievement' ? 'Claimed as the reward for "' + src.achievement.name + '".' : '';
    html = '<div class="tile big r-' + item.rarity + '">' + UI.tileInner(item) + '</div>' +
      '<p class="idesc">' + item.desc + '</p><p class="muted">' + from + '</p>' +
      '<p class="muted small">Collected ' + new Date(Game.state.items[item.id].at).toLocaleDateString() + '.</p>';
  } else {
    var hint = src.type === 'challenge' ? 'Reward for a ' + UI.catSingular[src.challenge.cat].toLowerCase() + ' challenge (' + UI.diffLabel[src.challenge.diff].toLowerCase() + ').'
             : src.type === 'achievement' ? 'Reward for completing an achievement.' : '';
    html = '<div class="tile big locked r-' + item.rarity + '"><span class="ticon">?</span><span class="tname">Not found yet</span><span class="trar">' + rar + '</span></div>' +
      '<p class="idesc">' + hint + '</p>';
  }
  UI.modal(html + '<button class="btn ghost" data-act="close">Close</button>', true);
};

/* ---------- Achievements ---------- */
UI.screens.achievements = function () {
  var st = Game.state;
  var rows = Data.achievements.map(function (a) {
    var rec = st.achievements[a.id], p = a.progress();
    var cur = Math.min(p[0], p[1]);
    var reward = '+' + a.reward.coins + ' coins' + (a.reward.item ? ' and ' + Data.rarities[Game.itemById(a.reward.item).rarity].name.toLowerCase() + ' item' : '');
    var right = !rec ? '<span class="pnum">' + cur + '/' + p[1] + '</span>'
      : rec.claimed ? '<span class="owned">Claimed</span>'
      : '<button class="btn small" data-act="claim" data-id="' + a.id + '">Claim</button>';
    return '<div class="arow' + (rec ? ' got' : '') + (rec && !rec.claimed ? ' ready' : '') + '">' +
      '<span class="sicon">' + a.icon + '</span>' +
      '<span class="sbody"><span class="sname">' + UI.esc(a.name) + '</span><span class="sdesc">' + a.desc + '</span>' +
      '<span class="sdesc rw">' + reward + '</span>' +
      (rec ? '' : '<span class="bar thin"><i style="width:' + UI.pct(cur, p[1]) + '%"></i></span>') + '</span>' +
      '<span class="sbuy">' + right + '</span></div>';
  }).join('');
  return '<div class="phead"><button class="btn ghost small" data-act="go" data-to="me">Back</button><h1 class="title">Achievements</h1></div>' +
    '<p class="muted">' + Object.keys(st.achievements).length + ' of ' + Data.achievements.length + ' unlocked. ' + Game.unclaimedCount() + ' waiting to be claimed.</p>' +
    '<div class="slist">' + rows + '</div>';
};

UI.actions.claim = function (d) {
  var res = Game.claimAchievement(d.id);
  if (!res.ok) return;
  var html = '<h2>' + UI.esc(res.achievement.name) + '</h2><p class="muted">Reward claimed</p>' +
    '<div class="rewards"><div><b>+' + res.achievement.reward.coins + '</b><span>coins</span></div></div>';
  if (res.item) html += '<div class="found"><div class="tile big r-' + res.item.rarity + '">' + UI.tileInner(res.item) + '</div><p>You found a new item.</p></div>';
  if (res.unlocked.length) html += '<p class="muted">' + res.unlocked.length + ' more achievement' + (res.unlocked.length > 1 ? 's' : '') + ' unlocked.</p>';
  html += '<button class="btn" data-act="close">Nice</button>';
  UI.render();
  UI.modal(html, false);
};

/* ---------- Profile ---------- */
UI.screens.me = function () {
  var L = Game.levelInfo(), st = Game.state, s = st.stats;
  var stat = function (k, v) { return '<div class="stat"><span>' + k + '</span><b>' + v + '</b></div>'; };
  var ladder = Data.titles.map(function (t, i) {
    var has = L.level >= i + 1;
    return '<div class="lrow' + (has ? ' has' : '') + '"><span>Level ' + (i + 1) + '</span><span class="lt">' + t + '</span><span>' + (has ? 'Unlocked' : 'Locked') + '</span></div>';
  }).join('');
  var unclaimed = Game.unclaimedCount();
  return '<section class="pcard"><p class="muted">Explorer</p><h1 class="ptitle">' + UI.esc(L.title) + '</h1>' +
    '<p>Level ' + L.level + (L.isMax ? ', top level' : ', ' + UI.num(L.toNext) + ' XP to the next') + '</p>' +
    '<div class="bookbar"><div class="bar"><i style="width:' + L.pct + '%"></i></div></div></section>' +
    '<h2 class="sect">Stats</h2>' +
    stat('Total XP', UI.num(L.xp)) + stat('Coins on hand', UI.num(st.coins)) +
    stat('Coins earned', UI.num(s.coinsEarned)) + stat('Coins spent', UI.num(s.coinsSpent)) +
    stat('Challenges completed', Game.doneCount() + ' of ' + Game.totalCount()) +
    stat('Items collected', Game.itemCount() + ' of ' + Data.items.length) +
    stat('Upgrades owned', Game.upgradeCount() + ' of ' + Data.upgrades.length) +
    stat('Achievements claimed', Object.keys(st.achievements).filter(function (id) { return st.achievements[id].claimed; }).length + ' of ' + Data.achievements.length) +
    stat('Hints used', s.hintsUsed) + stat('Failed attempts', s.failedTries) +
    stat('Playing since', new Date(st.createdAt).toLocaleDateString()) +
    '<h2 class="sect">Titles</h2>' + ladder +
    '<h2 class="sect">More</h2>' +
    '<button class="lrow link" data-act="go" data-to="achievements"><span>Achievements</span><span>' + (unclaimed ? unclaimed + ' to claim' : Object.keys(st.achievements).length + ' of ' + Data.achievements.length) + '</span></button>' +
    '<button class="lrow link" data-act="go" data-to="backup"><span>Export and import save</span><span></span></button>' +
    '<button class="lrow link" data-act="go" data-to="reset"><span>Reset save</span><span></span></button>';
};

/* ---------- Export and import ---------- */
UI.saveSummary = function (st) {
  var level = Game.levelFor(st.xp);
  return 'Level ' + level + ' (' + Data.titles[level - 1] + '), ' + UI.num(st.xp) + ' XP, ' + UI.num(st.coins) + ' coins, ' +
    Object.keys(st.completed).length + ' challenges, ' + Object.keys(st.items).length + ' items, ' + Object.keys(st.upgrades).length + ' upgrades.';
};

UI.screens.backup = function () {
  return '<div class="phead"><button class="btn ghost small" data-act="go" data-to="me">Back</button><h1 class="title">Save backup</h1></div>' +
    '<p class="muted">Your progress is stored on this phone. Export a copy to keep it safe or move it to another device.</p>' +
    '<h2 class="sect">Export</h2>' +
    '<textarea id="exportBox" class="field box" readonly rows="5" aria-label="Your save text">' + UI.esc(Game.exportText()) + '</textarea>' +
    '<div class="two"><button class="btn" data-act="copySave">Copy save text</button>' +
    '<button class="btn ghost" data-act="saveFile">Save as file</button></div>' +
    '<h2 class="sect">Import</h2>' +
    '<p class="muted small">Importing replaces your current progress.</p>' +
    '<textarea id="importBox" class="field box" rows="4" placeholder="Paste save text here" aria-label="Paste save text" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>' +
    '<div class="two"><button class="btn" data-act="importText">Import pasted text</button>' +
    '<button class="btn ghost" data-act="chooseFile">Choose save file</button></div>' +
    '<input id="fileIn" type="file" accept=".json,.txt,application/json,text/plain" hidden>';
};

UI.actions.copySave = function () {
  var box = UI.$('exportBox'), text = box.value;
  function fallback() {
    box.focus(); box.select(); box.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    UI.toast(ok ? 'Save copied' : 'Press and hold the text, then tap Copy');
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { UI.toast('Save copied'); }, fallback);
  } else { fallback(); }
};

UI.actions.saveFile = function () {
  var text = Game.exportText();
  var name = 'offgrid-lite-save-' + new Date().toISOString().slice(0, 10) + '.json';
  var blob = new Blob([text], { type: 'application/json' });
  try {
    var file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'OFFGRID Lite save' }).catch(function () {});
      return;
    }
  } catch (e) {}
  try {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    UI.toast('Save file created');
  } catch (e) {
    UI.toast('Could not make a file. Use Copy save text instead.');
  }
};

UI.actions.chooseFile = function () { UI.$('fileIn').click(); };

UI.readSaveFile = function (input) {
  var f = input.files && input.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function () { UI.confirmImport(String(reader.result)); input.value = ''; };
  reader.onerror = function () { UI.modal('<h2>Could not read that file</h2><button class="btn" data-act="close">OK</button>', true); };
  reader.readAsText(f);
};

UI.actions.importText = function () {
  var box = UI.$('importBox');
  UI.confirmImport(box ? box.value : '');
};

UI.confirmImport = function (text) {
  var clean;
  try { clean = Game.parseImport(text); }
  catch (e) {
    UI.modal('<h2>Cannot import</h2><p>' + UI.esc(e.message) + '</p><button class="btn" data-act="close">OK</button>', true);
    return;
  }
  UI.pendingImport = clean;
  UI.modal('<h2>Replace your progress?</h2><p class="muted">This save contains:</p><p>' + UI.saveSummary(clean) + '</p>' +
    '<p class="muted" style="margin-top:10px">Your current progress (' + UI.saveSummary(Game.state) + ') will be lost.</p>' +
    '<button class="btn danger" data-act="importConfirm">Replace my progress</button>' +
    '<button class="btn ghost" data-act="importCancel">Keep my progress</button>', false);
};

UI.actions.importCancel = function () { UI.pendingImport = null; UI.closeModal(); };
UI.actions.importConfirm = function () {
  if (!UI.pendingImport) return;
  Game.replaceState(UI.pendingImport);
  UI.pendingImport = null;
  Play.clear(); Play.session = null;
  UI.closeModal();
  UI.go('home');
  UI.toast('Save imported');
};

/* ---------- Reset (with its own confirmation screen) ---------- */
UI.screens.reset = function () {
  return '<div class="phead"><button class="btn ghost small" data-act="go" data-to="me">Back</button><h1 class="title">Reset save</h1></div>' +
    '<div class="lost"><h2>This erases everything</h2>' +
    '<p>You will lose: ' + UI.saveSummary(Game.state) + '</p>' +
    '<p>You will start again at level 1 with 0 XP and ' + Data.startCoins + ' coins. This cannot be undone.</p></div>' +
    '<p class="muted" style="margin:14px 0">Want a copy first? Export your save from the backup screen.</p>' +
    '<button class="btn ghost" data-act="go" data-to="backup">Export a backup first</button>' +
    '<button class="btn" style="margin-top:10px" data-act="go" data-to="me">Cancel, keep my progress</button>' +
    '<button class="btn danger" style="margin-top:28px" data-act="resetConfirm">Erase everything and start over</button>';
};

UI.actions.resetConfirm = function () {
  Play.clear(); Play.session = null;
  Game.reset();
  UI.filter = 'all'; UI.itemsTab = 'inventory';
  UI.go('home');
  UI.toast('Save reset. Good luck out there.');
};
