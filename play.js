/* play.js — the four kinds of challenge (puzzle, memory, trivia, exploration).
   Play.session holds the attempt in progress. Nothing here is saved until the
   challenge is WON, and then Game.completeChallenge pays the reward once. */
const Play = { session: null, timers: [] };

Play.challenge = function () { return Game.challengeById(Play.session.id); };
Play.later = function (fn, ms) { Play.timers.push(setTimeout(fn, ms)); };
Play.clear = function () { Play.timers.forEach(clearTimeout); Play.timers = []; };

/* ---------- starting ---------- */
Play.newSession = function (ch, phase) {
  var s = { id: ch.id, phase: phase, hint: false, note: '' };
  if (ch.cat === 'memory') { s.sub = 'watch'; s.pos = 0; s.step = 0; s.lit = -1; s.bad = -1; s.mistakes = Game.bonus('memoryMistakes'); }
  if (ch.cat === 'trivia') { s.q = 0; s.right = 0; s.chosen = -1; s.locked = false; }
  if (ch.cat === 'explore') {
    s.left = ch.attempts + Game.bonus('exploreExtra');
    s.tiles = [];
    for (var i = 0; i < ch.rows * ch.cols; i++) s.tiles.push('hidden');
    s.msg = '';
  }
  return s;
};

Play.open = function (id) {
  var ch = Game.challengeById(id);
  if (!ch) return;
  if (Game.isDone(id)) { UI.toast('You already completed that one'); return; }
  Play.clear();
  Play.session = Play.newSession(ch, 'intro');
  UI.go('play', { id: id });
};

Play.begin = function () {
  var s = Play.session, ch = Play.challenge();
  s.phase = 'play';
  UI.render(true);
  if (ch.cat === 'memory') Play.showSequence();
};

Play.retry = function () {
  var ch = Play.challenge();
  Play.clear();
  Play.session = Play.newSession(ch, 'play');
  UI.render(true);
  if (ch.cat === 'memory') Play.showSequence();
};

/* ---------- finishing ---------- */
Play.win = function () {
  var s = Play.session;
  if (s.phase === 'won') return;
  s.phase = 'won';
  Play.clear();
  var res = Game.completeChallenge(s.id);
  UI.render();
  if (res.ok) UI.showResult(res);
};

Play.lose = function (reason) {
  var s = Play.session;
  if (s.phase !== 'play') return;
  s.phase = 'lost';
  s.reason = reason;
  Play.clear();
  Game.recordFail();
  UI.render();
};

/* ---------- memory ---------- */
Play.showSequence = function () {
  var s = Play.session, ch = Play.challenge();
  s.sub = 'watch'; s.pos = 0; s.step = 0; s.lit = -1; s.note = '';
  UI.render();
  var on = Math.round(ch.showMs * (1 + Game.bonus('memoryTimePct') / 100));
  var gap = 250, t = 700;
  ch.seq.forEach(function (idx, i) {
    Play.later(function () { s.lit = idx; s.step = i + 1; UI.render(); }, t);
    t += on;
    Play.later(function () { s.lit = -1; UI.render(); }, t);
    t += gap;
  });
  Play.later(function () { s.sub = 'input'; s.lit = -1; UI.render(); }, t);
};

Play.padTap = function (i) {
  var s = Play.session, ch = Play.challenge();
  if (s.phase !== 'play' || s.sub !== 'input') return;
  if (i === ch.seq[s.pos]) {
    s.pos += 1;
    s.note = '';
    if (s.pos >= ch.seq.length) { Play.win(); return; }
    UI.render();
    return;
  }
  if (s.mistakes > 0) {
    s.mistakes -= 1;
    s.bad = i;
    s.note = 'Not that one. Steady Hands saved you, with no mistakes left.';
    UI.render();
    Play.later(function () { s.bad = -1; UI.render(); }, 350);
    return;
  }
  Play.lose('That was the wrong symbol.');
};

/* ---------- trivia ---------- */
Play.eliminated = function (q) {
  var n = Game.bonus('triviaEliminate'), out = [];
  for (var i = 0; i < q.options.length && out.length < n; i++) {
    if (i !== q.answer) out.push(i);
  }
  return out;
};

Play.answer = function (i) {
  var s = Play.session, ch = Play.challenge();
  var q = ch.questions[s.q];
  if (s.phase !== 'play' || s.locked || Play.eliminated(q).indexOf(i) !== -1) return;
  s.locked = true;
  s.chosen = i;
  if (i === q.answer) s.right += 1;
  UI.render();
};

Play.nextQuestion = function () {
  var s = Play.session, ch = Play.challenge();
  if (s.phase !== 'play' || !s.locked) return;
  s.q += 1; s.locked = false; s.chosen = -1;
  if (s.q < ch.questions.length) { UI.render(); return; }
  if (s.right >= ch.need) Play.win();
  else Play.lose('You got ' + s.right + ' of ' + ch.questions.length + ' right and needed ' + ch.need + '.');
};

/* ---------- puzzles ---------- */
Play.norm = function (t) { return String(t).toLowerCase().replace(/[^a-z0-9]/g, ''); };

Play.puzzleCheck = function () {
  var s = Play.session, ch = Play.challenge();
  var box = UI.$('answer');
  if (!box || s.phase !== 'play') return;
  var v = Play.norm(box.value);
  if (!v) return;
  if (ch.answers.some(function (a) { return Play.norm(a) === v; })) { Play.win(); return; }
  UI.$('note').textContent = 'Not quite. Try again.';
  box.classList.remove('shake');
  void box.offsetWidth;           // restart the shake animation
  box.classList.add('shake');
};

Play.pick = function (i) {
  var ch = Play.challenge();
  if (Play.session.phase !== 'play') return;
  if (i === ch.answer) Play.win();
  else Play.lose('That was not the answer.');
};

Play.hint = function () {
  var s = Play.session;
  if (s.hint) return;
  if (Game.hintCost() > Game.state.coins) { UI.toast('A hint costs ' + Game.hintCost() + ' coins'); return; }
  Game.buyHint();
  s.hint = true;
  var box = UI.$('answer'), typed = box ? box.value : '';
  UI.render();
  if (box && UI.$('answer')) UI.$('answer').value = typed;   // keep what they typed
};

/* ---------- exploration ---------- */
Play.dig = function (i) {
  var s = Play.session, ch = Play.challenge();
  if (s.phase !== 'play' || s.tiles[i] !== 'hidden') return;
  var r = Math.floor(i / ch.cols), c = i % ch.cols;
  var d = Math.max(Math.abs(r - ch.target[0]), Math.abs(c - ch.target[1]));
  s.left -= 1;
  if (d === 0) { s.tiles[i] = 'found'; s.msg = 'You found the cache.'; Play.win(); return; }
  s.tiles[i] = d === 1 ? 'hot' : (d === 2 ? 'warm' : 'cold');
  s.msg = d === 1 ? 'Hot. The cache is right next to this tile.'
        : d === 2 ? 'Warm. The cache is two tiles away.'
        : 'Cold. The cache is three or more tiles away.';
  if (s.left <= 0) { Play.lose('You ran out of searches.'); return; }
  UI.render();
};

/* ---------- drawing the play screen ---------- */
Play.rules = function (ch) {
  var hintLine = Game.hintCost() > 0 ? 'A hint costs ' + Game.hintCost() + ' coins.' : 'Hints are free thanks to your Lantern.';
  if (ch.cat === 'puzzle' && ch.format === 'text') return ['Type your answer and tap Check.', 'You can try as many times as you like.', hintLine];
  if (ch.cat === 'puzzle') return ['Pick one answer.', 'A wrong pick ends the attempt, and you can try again.', hintLine];
  if (ch.cat === 'memory') {
    var m = Game.bonus('memoryMistakes');
    return ['Watch the symbols light up, then tap them in the same order.',
            m > 0 ? 'You may make ' + m + ' mistake.' : 'A wrong tap ends the attempt.'];
  }
  if (ch.cat === 'trivia') return ['Answer ' + ch.questions.length + ' questions.', 'Get at least ' + ch.need + ' right to pass.']
    .concat(Game.bonus('triviaEliminate') > 0 ? ['Your Field Guide crosses out one wrong answer for you.'] : []);
  return ['Tap a tile to search it. You have ' + (ch.attempts + Game.bonus('exploreExtra')) + ' searches.',
          'Hot means the cache is next to that tile, warm means two tiles away, and cold means further.'];
};

Play.viewPuzzle = function (ch, s) {
  var h = '<div class="prompt">' + ch.prompt + '</div>';
  var locked = s.phase !== 'play';
  if (ch.format === 'text') {
    h += '<input id="answer" class="field" type="text" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Type your answer" aria-label="Your answer"' + (locked ? ' disabled' : '') + '>' +
      '<p id="note" class="note" role="status"></p>' +
      '<button class="btn" data-act="puzzleCheck"' + (locked ? ' disabled' : '') + '>Check answer</button>';
  } else {
    h += '<div class="options">' + ch.options.map(function (o, i) {
      return '<button class="opt" data-act="pick" data-i="' + i + '"' + (locked ? ' disabled' : '') + '>' + o + '</button>';
    }).join('') + '</div>';
  }
  if (s.hint) h += '<div class="hint"><b>Hint:</b> ' + ch.hint + '</div>';
  else if (!locked) h += '<button class="btn ghost" data-act="hint">Show a hint' + (Game.hintCost() > 0 ? ' (' + Game.hintCost() + ' coins)' : ' (free)') + '</button>';
  return h;
};

Play.viewMemory = function (ch, s) {
  var cols = ch.pad.length === 4 ? 2 : 3;
  var pad = ch.pad.map(function (sym, i) {
    var cls = 'padkey' + (s.lit === i ? ' lit' : '') + (s.bad === i ? ' bad' : '');
    var live = s.phase === 'play' && s.sub === 'input';
    return '<button class="' + cls + '" data-act="padTap" data-i="' + i + '"' + (live ? '' : ' disabled') + ' aria-label="Symbol ' + (i + 1) + '">' + sym + '</button>';
  }).join('');
  var dots = ch.seq.map(function (x, i) { return '<i class="' + (i < s.pos ? 'on' : '') + '"></i>'; }).join('');
  var status = s.phase !== 'play' ? '' :
    s.sub === 'watch' ? (s.step > 0 ? 'Watch carefully. Step ' + s.step + ' of ' + ch.seq.length + '.' : 'Get ready…') :
    'Your turn. Tap the symbols in order.';
  return '<p class="status" role="status">' + status + '</p><div class="pad" style="grid-template-columns:repeat(' + cols + ',1fr)">' + pad + '</div>' +
    '<div class="dots" aria-label="Progress">' + dots + '</div><p class="note">' + (s.note || '') + '</p>';
};

Play.viewTrivia = function (ch, s) {
  var qi = Math.min(s.q, ch.questions.length - 1);
  var q = ch.questions[qi];
  var gone = Play.eliminated(q);
  var opts = q.options.map(function (o, i) {
    var cls = 'opt';
    if (gone.indexOf(i) !== -1) cls += ' gone';
    if (s.locked && i === q.answer) cls += ' right';
    if (s.locked && i === s.chosen && i !== q.answer) cls += ' wrong';
    var dis = (s.phase !== 'play' || s.locked || gone.indexOf(i) !== -1) ? ' disabled' : '';
    return '<button class="' + cls + '" data-act="answer" data-i="' + i + '"' + dis + '>' + o + '</button>';
  }).join('');
  var last = qi === ch.questions.length - 1;
  return '<p class="status">Question ' + (qi + 1) + ' of ' + ch.questions.length + '. Correct so far: ' + s.right + '.</p>' +
    '<div class="prompt">' + q.q + '</div><div class="options">' + opts + '</div>' +
    (s.locked && s.phase === 'play' ? '<p class="note">' + (s.chosen === q.answer ? 'Correct.' : 'Not this time.') + '</p><button class="btn" data-act="nextQ">' + (last ? 'See result' : 'Next question') + '</button>' : '');
};

Play.viewExplore = function (ch, s) {
  var labels = { hot: 'Hot', warm: 'Warm', cold: 'Cold', found: 'Cache' };
  var icons = { hot: '🔥', warm: '☀️', cold: '❄️', found: '🎁' };
  var tiles = s.tiles.map(function (st, i) {
    var inner = st === 'hidden' ? '<span class="terrain">' + ch.terrain + '</span>' : '<span>' + icons[st] + '</span><small>' + labels[st] + '</small>';
    return '<button class="gtile ' + st + '" data-act="dig" data-i="' + i + '"' + (st !== 'hidden' || s.phase !== 'play' ? ' disabled' : '') + ' aria-label="Tile ' + (i + 1) + (st !== 'hidden' ? ', ' + labels[st] : '') + '">' + inner + '</button>';
  }).join('');
  return '<p class="scene">' + ch.scene + '</p>' +
    '<p class="status" role="status">Searches left: <b>' + Math.max(0, s.left) + '</b></p>' +
    '<div class="grid" style="grid-template-columns:repeat(' + ch.cols + ',1fr)">' + tiles + '</div>' +
    '<p class="note" role="status">' + (s.msg || 'Tap a tile to search it.') + '</p>';
};

UI.screens.play = function (params) {
  var s = Play.session, ch = s && Game.challengeById(params.id);
  if (!s || !ch || s.id !== params.id) {
    return '<p class="muted">That challenge is not open.</p><button class="btn" data-act="go" data-to="challenges">Back to challenges</button>';
  }
  var head = '<div class="phead"><button class="btn ghost small" data-act="playLeave">Leave</button>' +
    '<div><h1 class="title">' + ch.title + '</h1><p class="muted">' + Data.categories[ch.cat].name + ', ' + UI.diffLabel[ch.diff].toLowerCase() + '</p></div></div>';

  if (s.phase === 'intro') {
    var r = Game.rewardFor(ch);
    return head + '<p class="blurb">' + ch.blurb + '</p>' +
      '<ul class="rules">' + Play.rules(ch).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      '<p class="muted">Reward: +' + r.xp.total + ' XP and +' + r.coins.total + ' coins, once only.</p>' +
      '<button class="btn" data-act="playBegin">Begin</button>';
  }
  var body = ch.cat === 'puzzle' ? Play.viewPuzzle(ch, s)
           : ch.cat === 'memory' ? Play.viewMemory(ch, s)
           : ch.cat === 'trivia' ? Play.viewTrivia(ch, s)
           : Play.viewExplore(ch, s);
  var lost = s.phase === 'lost'
    ? '<div class="lost"><h2>Not this time</h2><p>' + s.reason + '</p>' +
      '<button class="btn" data-act="playRetry">Try again</button>' +
      '<button class="btn ghost" data-act="playLeave">Back to challenges</button></div>' : '';
  return head + body + lost;
};

/* ---------- the reward sheet ---------- */
UI.showResult = function (res) {
  var r = res.reward;
  var extraXp = r.xp.total - r.xp.base, extraCoins = r.coins.total - r.coins.base;
  var html = '<h2>Challenge complete</h2><p class="muted">' + res.challenge.title + '</p>' +
    '<div class="rewards"><div><b>+' + r.xp.total + '</b><span>XP</span></div><div><b>+' + r.coins.total + '</b><span>coins</span></div></div>';
  if (extraXp > 0 || extraCoins > 0) {
    html += '<p class="muted small">Your upgrades added +' + extraXp + ' XP and +' + extraCoins + ' coins.</p>';
  }
  if (res.levelUp) {
    html += '<div class="levelup"><p>Level ' + res.levelUp.to + ' reached</p><h3>New title: ' + res.levelUp.titles[res.levelUp.titles.length - 1] + '</h3></div>';
  }
  if (res.item) {
    html += '<div class="found"><div class="tile big r-' + res.item.rarity + '">' + UI.tileInner(res.item) + '</div><p>You found a new item.</p></div>';
  }
  if (res.unlocked && res.unlocked.length) {
    html += '<p class="muted">' + res.unlocked.length + ' achievement' + (res.unlocked.length > 1 ? 's' : '') + ' ready to claim on the Profile tab.</p>';
  }
  html += '<button class="btn" data-act="resultDone">Continue</button>';
  UI.modal(html, false);
};

/* ---------- buttons ---------- */
UI.actions.play = function (d) { Play.open(d.id); };
UI.actions.playBegin = function () { Play.begin(); };
UI.actions.playRetry = function () { Play.retry(); };
UI.actions.playLeave = function () { Play.clear(); UI.go('challenges'); };
UI.actions.padTap = function (d) { Play.padTap(Number(d.i)); };
UI.actions.answer = function (d) { Play.answer(Number(d.i)); };
UI.actions.nextQ = function () { Play.nextQuestion(); };
UI.actions.pick = function (d) { Play.pick(Number(d.i)); };
UI.actions.puzzleCheck = function () { Play.puzzleCheck(); };
UI.actions.hint = function () { Play.hint(); };
UI.actions.dig = function (d) { Play.dig(Number(d.i)); };
UI.actions.resultDone = function () { UI.closeModal(); UI.go('challenges'); };

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target && e.target.id === 'answer') Play.puzzleCheck();
});
