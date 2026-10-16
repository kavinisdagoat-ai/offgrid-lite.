/* game.js — the rules of the game. No screens in here, only logic.
   Later sections are added below as we build each system. */
const Game = {
  state: null,
  onChange: function () {}        // app.js sets this so every change gets saved
};

/* ---------- helpers ---------- */
Game.find = function (list, id) {
  for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
  return null;
};
Game.toInt = function (v, min, max, fallback) {
  v = Number(v);
  if (!isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(v)));
};

/* ---------- the save data ---------- */
Game.newState = function () {
  return {
    version: 1,
    xp: 0,
    coins: Data.startCoins,
    completed: {},      // challengeId -> { at }
    items: {},          // itemId -> { at }
    upgrades: {},       // upgradeId -> { at }
    achievements: {},   // achievementId -> { at, claimed }
    stats: { coinsEarned: 0, coinsSpent: 0, xpEarned: 0, hintsUsed: 0, failedTries: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

/* Turns anything (a loaded save or an imported one) into a clean, safe save.
   Unknown ids are dropped and numbers are clamped. */
Game.sanitize = function (raw) {
  var s = Game.newState();
  if (!raw || typeof raw !== 'object') return s;
  s.xp = Game.toInt(raw.xp, 0, 9999999, 0);
  s.coins = Game.toInt(raw.coins, 0, 9999999, Data.startCoins);
  s.createdAt = Game.toInt(raw.createdAt, 0, 9e15, s.createdAt);
  s.updatedAt = Game.toInt(raw.updatedAt, 0, 9e15, s.updatedAt);

  function copyKnown(list, from, to, withClaim) {
    if (!from || typeof from !== 'object') return;
    list.forEach(function (entry) {
      var v = from[entry.id];
      if (!v || typeof v !== 'object') return;
      var rec = { at: Game.toInt(v.at, 0, 9e15, Date.now()) };
      if (withClaim) rec.claimed = v.claimed === true;
      to[entry.id] = rec;
    });
  }
  copyKnown(Data.challenges, raw.completed, s.completed, false);
  copyKnown(Data.items, raw.items, s.items, false);
  copyKnown(Data.upgrades, raw.upgrades, s.upgrades, false);
  copyKnown(Data.achievements, raw.achievements, s.achievements, true);

  Object.keys(s.stats).forEach(function (k) {
    s.stats[k] = Game.toInt(raw.stats && raw.stats[k], 0, 1e9, 0);
  });
  return s;
};

Game.init = function (saved) {
  Game.state = saved ? Game.sanitize(saved) : Game.newState();
};

Game.changed = function () {
  Game.state.updatedAt = Date.now();
  Game.onChange(Game.state);
};

/* ---------- levels, XP and coins ---------- */
Game.levelFor = function (xp) {
  var level = 1;
  for (var i = 0; i < Data.levelXp.length; i++) {
    if (xp >= Data.levelXp[i]) level = i + 1;
  }
  return level;
};

Game.levelInfo = function () {
  var xp = Game.state.xp;
  var level = Game.levelFor(xp);
  var isMax = level >= Data.levelXp.length;
  var start = Data.levelXp[level - 1];
  var next = isMax ? start : Data.levelXp[level];
  var pct = isMax ? 100 : Math.min(100, Math.floor(((xp - start) / (next - start)) * 100));
  return {
    level: level, title: Data.titles[level - 1], xp: xp, isMax: isMax,
    pct: pct, toNext: isMax ? 0 : next - xp
  };
};

/* Adds XP. Returns null, or { from, to, titles } if the player levelled up. */
Game.addXp = function (amount) {
  var before = Game.levelFor(Game.state.xp);
  Game.state.xp += amount;
  Game.state.stats.xpEarned += amount;
  var after = Game.levelFor(Game.state.xp);
  if (after <= before) return null;
  var titles = [];
  for (var l = before + 1; l <= after; l++) titles.push(Data.titles[l - 1]);
  return { from: before, to: after, titles: titles };
};

Game.addCoins = function (amount) {
  Game.state.coins += amount;
  Game.state.stats.coinsEarned += amount;
};

Game.spendCoins = function (amount) {
  if (Game.state.coins < amount) return false;
  Game.state.coins -= amount;
  Game.state.stats.coinsSpent += amount;
  return true;
};

Game.reset = function () {
  Game.state = Game.newState();
  Game.changed();
};

/* ---------- items ---------- */
Game.itemById = function (id) { return Game.find(Data.items, id); };
Game.hasItem = function (id) { return !!Game.state.items[id]; };
Game.itemCount = function () { return Object.keys(Game.state.items).length; };

/* Gives an item the first time only. Returns the item, or null if already owned. */
Game.grantItem = function (id) {
  var item = Game.itemById(id);
  if (!item || Game.hasItem(id)) return null;
  Game.state.items[id] = { at: Date.now() };
  return item;
};

/* Where does an item come from? Returns { type, challenge | achievement }. */
Game.itemSource = function (id) {
  var ch = Data.challenges.filter(function (c) { return c.item === id; })[0];
  if (ch) return { type: 'challenge', challenge: ch };
  var ach = Data.achievements.filter(function (a) { return a.reward && a.reward.item === id; })[0];
  if (ach) return { type: 'achievement', achievement: ach };
  return { type: 'unknown' };
};
Game.rarityCount = function (rarity) {
  var list = Data.items.filter(function (i) { return i.rarity === rarity; });
  return { owned: list.filter(function (i) { return Game.hasItem(i.id); }).length, total: list.length };
};

/* ---------- upgrade bonuses (the shop adds the buying part later) ---------- */
Game.bonus = function (key) {
  var sum = 0;
  Data.upgrades.forEach(function (u) {
    if (Game.state.upgrades[u.id] && u.effect[key]) sum += u.effect[key];
  });
  return sum;
};

/* ---------- challenges ---------- */
Game.challengeById = function (id) { return Game.find(Data.challenges, id); };
Game.isDone = function (id) { return !!Game.state.completed[id]; };
Game.totalCount = function (cat) {
  return Data.challenges.filter(function (c) { return !cat || c.cat === cat; }).length;
};
Game.doneCount = function (cat) {
  return Data.challenges.filter(function (c) { return (!cat || c.cat === cat) && Game.isDone(c.id); }).length;
};

/* What a challenge pays out RIGHT NOW, including upgrade bonuses. */
Game.rewardFor = function (ch) {
  var xpPct = Game.bonus('xpPct') + (ch.diff === 'hard' ? Game.bonus('hardXpPct') : 0);
  var coinPct = Game.bonus('coinPct');
  return {
    xp: { base: ch.xp, total: Math.round(ch.xp * (1 + xpPct / 100)) },
    coins: { base: ch.coins, total: Math.round(ch.coins * (1 + coinPct / 100)) + Game.bonus('coinFlat') }
  };
};

/* The ONLY place challenge rewards are paid. A challenge pays once, ever. */
Game.completeChallenge = function (id) {
  var ch = Game.challengeById(id);
  if (!ch) return { ok: false, reason: 'unknown' };
  if (Game.isDone(id)) return { ok: false, reason: 'already' };

  var reward = Game.rewardFor(ch);
  Game.state.completed[id] = { at: Date.now() };       // mark done FIRST
  var levelUp = Game.addXp(reward.xp.total);
  Game.addCoins(reward.coins.total);
  var item = ch.item ? Game.grantItem(ch.item) : null;
  var unlocked = Game.checkAchievements();
  Game.changed();
  return { ok: true, challenge: ch, reward: reward, levelUp: levelUp, item: item, unlocked: unlocked };
};

Game.recordFail = function () {
  Game.state.stats.failedTries += 1;
  Game.changed();
};

/* ---------- hints (puzzles) ---------- */
Game.hintCost = function () { return Game.bonus('freeHints') ? 0 : Data.hintCost; };
Game.buyHint = function () {
  var cost = Game.hintCost();
  if (cost > 0 && !Game.spendCoins(cost)) return false;
  Game.state.stats.hintsUsed += 1;
  Game.changed();
  return true;
};

/* ---------- shop ---------- */
Game.upgradeById = function (id) { return Game.find(Data.upgrades, id); };
Game.owns = function (id) { return !!Game.state.upgrades[id]; };
Game.upgradeCount = function () { return Object.keys(Game.state.upgrades).length; };

/* The Merchant's Ledger makes later purchases cheaper (it never discounts itself). */
Game.priceOf = function (u) {
  if (u.effect.shopDiscountPct) return u.cost;
  return Math.ceil(u.cost * (100 - Game.bonus('shopDiscountPct')) / 100);
};

Game.buyUpgrade = function (id) {
  var u = Game.upgradeById(id);
  if (!u) return { ok: false, reason: 'unknown' };
  if (Game.owns(id)) return { ok: false, reason: 'owned' };
  var price = Game.priceOf(u);
  if (Game.state.coins < price) return { ok: false, reason: 'coins', missing: price - Game.state.coins };
  Game.spendCoins(price);
  Game.state.upgrades[id] = { at: Date.now() };
  var unlocked = Game.checkAchievements();
  Game.changed();
  return { ok: true, upgrade: u, price: price, unlocked: unlocked };
};

/* ---------- achievements ---------- */
Game.achievementById = function (id) { return Game.find(Data.achievements, id); };

/* Marks newly-earned achievements as unlocked (not yet claimed). Returns their ids. */
Game.checkAchievements = function () {
  var fresh = [];
  Data.achievements.forEach(function (a) {
    if (Game.state.achievements[a.id]) return;
    var p = a.progress();
    if (p[0] >= p[1]) {
      Game.state.achievements[a.id] = { at: Date.now(), claimed: false };
      fresh.push(a.id);
    }
  });
  return fresh;
};

Game.unclaimedCount = function () {
  return Object.keys(Game.state.achievements).filter(function (id) {
    return !Game.state.achievements[id].claimed;
  }).length;
};

/* Pays an achievement reward. It can only ever be claimed once. */
Game.claimAchievement = function (id) {
  var a = Game.achievementById(id);
  var rec = Game.state.achievements[id];
  if (!a || !rec) return { ok: false, reason: 'locked' };
  if (rec.claimed) return { ok: false, reason: 'claimed' };
  rec.claimed = true;                                   // mark claimed FIRST
  Game.addCoins(a.reward.coins);
  var item = a.reward.item ? Game.grantItem(a.reward.item) : null;
  var unlocked = Game.checkAchievements();              // an item may unlock another achievement
  Game.changed();
  return { ok: true, achievement: a, item: item, unlocked: unlocked };
};

/* ---------- export, import and reset ---------- */
Game.exportText = function () {
  return JSON.stringify({
    app: 'offgrid-lite', version: 1, exportedAt: new Date().toISOString(), state: Game.state
  }, null, 2);
};

/* Reads save text and returns a CLEAN save, or throws an Error with a friendly message. */
Game.parseImport = function (text) {
  var obj;
  try { obj = JSON.parse(String(text).trim()); }
  catch (e) { throw new Error('That is not a complete save. Paste all of the text, or choose the save file.'); }
  if (!obj || obj.app !== 'offgrid-lite' || !obj.state || typeof obj.state !== 'object') {
    throw new Error('That does not look like an OFFGRID Lite save.');
  }
  if (typeof obj.version !== 'number' || obj.version > 1) {
    throw new Error('That save was made by a newer version of the game.');
  }
  if (typeof obj.state.xp !== 'number' || typeof obj.state.coins !== 'number') {
    throw new Error('That save is missing its XP or coins, so it cannot be used.');
  }
  return Game.sanitize(obj.state);
};

Game.replaceState = function (clean) {
  Game.state = clean;
  Game.checkAchievements();
  Game.changed();
};
