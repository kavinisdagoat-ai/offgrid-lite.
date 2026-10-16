/* data.js — all the game content lives here. Edit freely; no other file holds content. */
const Data = {};

Data.startCoins = 100;
Data.hintCost = 10;

/* Total XP needed to REACH each level (level 1 = 0 XP). Level 10 is the top. */
Data.levelXp = [0, 40, 110, 210, 340, 500, 700, 950, 1250, 1600];

/* Level N unlocks the title at position N. */
Data.titles = [
  'Wanderer', 'Trail Walker', 'Camp Keeper', 'Pathfinder', 'Ridge Runner',
  'Wilderness Scout', 'Storm Chaser', 'Summit Seeker', 'Frontier Warden', 'Off-Grid Legend'
];

Data.rarities = {
  common:    { name: 'Common',    order: 1 },
  uncommon:  { name: 'Uncommon',  order: 2 },
  rare:      { name: 'Rare',      order: 3 },
  epic:      { name: 'Epic',      order: 4 },
  legendary: { name: 'Legendary', order: 5 }
};

Data.categories = {
  puzzle:  { name: 'Puzzles',     icon: '🧩' },
  memory:  { name: 'Memory',      icon: '🧠' },
  trivia:  { name: 'Trivia',      icon: '❓' },
  explore: { name: 'Exploration', icon: '🧭' }
};

/* These lists are filled in as we add each system. */
/* ---------- 30 collectible items ----------
   Every item is handed out exactly once: 25 by challenges, 5 by achievements. */
Data.items = [
  // Common (10)
  { id: 'acorn',        icon: '🌰', name: 'Fat Acorn',          rarity: 'common',    desc: 'Heavy, smooth and perfect for a squirrel emergency fund.' },
  { id: 'feather',      icon: '🪶', name: 'Hawk Feather',       rarity: 'common',    desc: 'Dropped mid-flight, still holding the shape of the wind.' },
  { id: 'flint',        icon: '🪨', name: 'Flint Stone',        rarity: 'common',    desc: 'Strike it just right and it throws sparks.' },
  { id: 'pine_sprig',   icon: '🌲', name: 'Pine Sprig',         rarity: 'common',    desc: 'Smells like every good morning outdoors.' },
  { id: 'amber_leaf',   icon: '🍂', name: 'Amber Leaf',         rarity: 'common',    desc: 'Dried to a perfect gold. Crinkles when you look at it.' },
  { id: 'river_shell',  icon: '🐚', name: 'River Shell',        rarity: 'common',    desc: 'Polished by a thousand slow currents.' },
  { id: 'waxed_twine',  icon: '🧵', name: 'Waxed Twine',        rarity: 'common',    desc: 'Ties tents, packs and promises.' },
  { id: 'brown_cap',    icon: '🍄', name: 'Brown Cap Mushroom', rarity: 'common',    desc: 'Beautiful. Do not eat it.' },
  { id: 'candle_stub',  icon: '🕯️', name: 'Candle Stub',        rarity: 'common',    desc: 'Half an hour of light left in it.' },
  { id: 'trail_scarf',  icon: '🧣', name: 'Trail Scarf',        rarity: 'common',    desc: 'Faded red, and warmer than it looks.' },
  // Uncommon (8)
  { id: 'crank_torch',  icon: '🔦', name: 'Crank Torch',        rarity: 'uncommon',  desc: 'No batteries needed, only a strong wrist.' },
  { id: 'torn_map',     icon: '🗺️', name: 'Torn Trail Map',     rarity: 'uncommon',  desc: 'One corner missing, with a question mark where it used to be.' },
  { id: 'camp_hatchet', icon: '🪓', name: 'Camp Hatchet',       rarity: 'uncommon',  desc: 'Balanced, sharp and well looked after.' },
  { id: 'canvas_tent',  icon: '⛺', name: 'Canvas Tent',        rarity: 'uncommon',  desc: 'Patched twice, never leaked.' },
  { id: 'resoled_boots',icon: '🥾', name: 'Resoled Boots',      rarity: 'uncommon',  desc: 'They have walked further than you have.' },
  { id: 'field_scope',  icon: '🔭', name: 'Field Scope',        rarity: 'uncommon',  desc: 'Brings the far ridge close enough to count its trees.' },
  { id: 'tin_of_beans', icon: '🥫', name: 'Tin of Beans',       rarity: 'uncommon',  desc: 'The most valuable thing in camp at dinnertime.' },
  { id: 'patched_rucksack', icon: '🎒', name: 'Patched Rucksack', rarity: 'uncommon', desc: 'Every patch is a story.' },
  // Rare (6)
  { id: 'brass_compass',     icon: '🧭', name: 'Brass Compass',      rarity: 'rare', desc: 'Its needle swings back to north every single time.' },
  { id: 'frontier_doubloon', icon: '🪙', name: 'Frontier Doubloon',  rarity: 'rare', desc: 'Stamped with a face nobody can name.' },
  { id: 'antler_carving',    icon: '🦌', name: 'Antler Carving',     rarity: 'rare', desc: 'A tiny stag, carved by someone patient.' },
  { id: 'storm_glass',       icon: '🔮', name: 'Storm Glass',        rarity: 'rare', desc: 'The liquid inside clouds up before the weather turns.' },
  { id: 'rusted_key',        icon: '🗝️', name: 'Rusted Key',         rarity: 'rare', desc: 'It fits no lock you have found yet.' },
  { id: 'pocket_watch',      icon: '🕰️', name: 'Pocket Watch',       rarity: 'rare', desc: 'Stopped at a quarter past four.' },
  // Epic (4)
  { id: 'eagle_totem',     icon: '🦅', name: 'Skyward Eagle Totem', rarity: 'epic', desc: 'Carved from one piece of cedar. Watches the horizon for you.' },
  { id: 'aurora_shard',    icon: '🌌', name: 'Aurora Shard',        rarity: 'epic', desc: 'A sliver of green light that never quite fades.' },
  { id: 'sunken_amphora',  icon: '🏺', name: 'Sunken Amphora',      rarity: 'epic', desc: 'Lifted from a lake bed. Still sealed.' },
  { id: 'glacier_heart',   icon: '💠', name: 'Glacier Heart',       rarity: 'epic', desc: 'Cold enough to frost the air around it.' },
  // Legendary (2)
  { id: 'trailblazer_crown', icon: '👑', name: "Trailblazer's Crown", rarity: 'legendary', desc: 'Worn by whoever walks every trail to its end.' },
  { id: 'polaris_fragment',  icon: '🌟', name: 'Polaris Fragment',    rarity: 'legendary', desc: 'A piece of the star that every traveller steers by.' }
];
/* ---------- 10 upgrades ----------
   "effect" is read by the game rules (Game.bonus). Percent values add together. */
Data.upgrades = [
  { id: 'boots',       icon: '🥾', name: 'Sturdy Boots',       cost: 100, effect: { xpPct: 10 },
    desc: 'Earn 10% more XP from every challenge.' },
  { id: 'pouch',       icon: '👝', name: 'Coin Pouch',         cost: 100, effect: { coinPct: 15 },
    desc: 'Earn 15% more coins from every challenge.' },
  { id: 'sharp_eyes',  icon: '👁️', name: 'Sharp Eyes',         cost: 90,  effect: { memoryTimePct: 50 },
    desc: 'Memory symbols stay lit 50% longer.' },
  { id: 'field_guide', icon: '📖', name: 'Field Guide',        cost: 120, effect: { triviaEliminate: 1 },
    desc: 'Crosses out one wrong answer on every trivia question.' },
  { id: 'surveyor',    icon: '📐', name: "Surveyor's Kit",     cost: 120, effect: { exploreExtra: 2 },
    desc: 'Get 2 extra searches in every exploration challenge.' },
  { id: 'lantern',     icon: '🏮', name: 'Brass Lantern',      cost: 100, effect: { freeHints: 1 },
    desc: 'Puzzle hints are free.' },
  { id: 'pick',        icon: '⛏️', name: "Prospector's Pick",  cost: 150, effect: { coinFlat: 5 },
    desc: 'Earn 5 extra coins from every challenge.' },
  { id: 'mentor',      icon: '📜', name: "Mentor's Notes",     cost: 200, effect: { hardXpPct: 20 },
    desc: 'Earn 20% more XP from hard challenges.' },
  { id: 'ledger',      icon: '📒', name: "Merchant's Ledger",  cost: 150, effect: { shopDiscountPct: 10 },
    desc: 'Every upgrade you buy after this costs 10% less.' },
  { id: 'steady',      icon: '🧤', name: 'Steady Hands',       cost: 160, effect: { memoryMistakes: 1 },
    desc: 'Memory challenges forgive one wrong tap.' }
];
/* ---------- 25 challenges ----------
   Each one can be completed once. Rewards depend on difficulty. */
function tier(diff) {
  return { easy: { diff: 'easy', xp: 40, coins: 20 },
           medium: { diff: 'medium', xp: 70, coins: 35 },
           hard: { diff: 'hard', xp: 110, coins: 60 } }[diff];
}
function challenge(base, diff, extra) {
  var out = {};
  [base, tier(diff), extra].forEach(function (part) { for (var k in part) out[k] = part[k]; });
  return out;
}

Data.challenges = [
  /* ===== Easy (8) ===== */
  challenge({ id: 'p_fire', cat: 'puzzle', format: 'text', title: 'The Silent Fire', item: 'acorn',
    blurb: 'A riddle whispered around the campfire.' }, 'easy', {
    prompt: 'I dance without legs. I eat but never drink. Feed me and I grow; starve me and I vanish. What am I?',
    answers: ['fire', 'a fire', 'campfire', 'a campfire', 'flame', 'a flame'],
    hint: 'You are probably sitting beside one.' }),

  challenge({ id: 'm_embers', cat: 'memory', title: 'Ember Dance', item: 'flint',
    blurb: 'Watch the sparks, then repeat their dance.' }, 'easy', {
    pad: ['🔥', '🌲', '⭐', '🌙'], seq: [0, 2, 1, 3], showMs: 800 }),

  challenge({ id: 't_basics', cat: 'trivia', title: 'Campcraft Basics', item: 'amber_leaf',
    blurb: 'Three quick questions on staying alive outdoors.' }, 'easy', {
    need: 2,
    questions: [
      { q: 'In which direction does the sun rise?', options: ['East', 'West', 'North', 'South'], answer: 0 },
      { q: 'A fire needs three things to burn. Which three?', options: ['Heat, fuel and oxygen', 'Smoke, wood and wind', 'Flame, ash and spark', 'Water, heat and wood'], answer: 0 },
      { q: 'About how long can a person survive without water?', options: ['About 3 days', 'About 3 weeks', 'About 3 hours', 'About 30 days'], answer: 0 }
    ] }),

  challenge({ id: 'e_creek', cat: 'explore', title: 'Cache by the Creek', item: 'waxed_twine',
    blurb: 'A supply cache is buried somewhere near the water.' }, 'easy', {
    scene: 'Soft mud, flat stones and reeds. Someone buried a cache here.',
    terrain: '🌿', rows: 3, cols: 3, target: [1, 2], attempts: 5 }),

  challenge({ id: 'p_scramble', cat: 'puzzle', format: 'text', title: 'Scrambled Trail Sign', item: 'feather',
    blurb: 'The letters on a weathered sign have been shuffled.' }, 'easy', {
    prompt: 'The trail sign reads NTMIOUAN. Rearrange the letters to find the word.',
    answers: ['mountain', 'a mountain'],
    hint: 'It is big, rocky and you are about to climb it.' }),

  challenge({ id: 'm_starchart', cat: 'memory', title: 'Star Chart', item: 'pine_sprig',
    blurb: 'Memorise the order the sky lights up.' }, 'easy', {
    pad: ['⭐', '🌙', '☀️', '☁️'], seq: [1, 3, 0, 2, 1], showMs: 800 }),

  challenge({ id: 't_creatures', cat: 'trivia', title: 'Creatures of the Wild', item: 'river_shell',
    blurb: 'Test what you know about animals.' }, 'easy', {
    need: 2,
    questions: [
      { q: 'Which animal is the largest living land animal?', options: ['Elephant', 'Giraffe', 'Hippo', 'Rhino'], answer: 0 },
      { q: 'What do bees collect from flowers to make honey?', options: ['Nectar', 'Sap', 'Dew', 'Seeds'], answer: 0 },
      { q: 'Which of these birds lives in Antarctica and cannot fly?', options: ['Penguin', 'Ostrich', 'Kiwi', 'Emu'], answer: 0 }
    ] }),

  challenge({ id: 'e_log', cat: 'explore', title: 'Hollow Log Hunt', item: 'brown_cap',
    blurb: 'Something is tucked away in the old forest floor.' }, 'easy', {
    scene: 'Fallen logs, damp leaves and spiderwebs. Search the forest floor.',
    terrain: '🍂', rows: 3, cols: 4, target: [2, 0], attempts: 5 }),

  /* ===== Medium (10) ===== */
  challenge({ id: 'p_cairn', cat: 'puzzle', format: 'choice', title: 'Next in the Cairn', item: 'crank_torch',
    blurb: 'Stones are stacked in a pattern. What comes next?' }, 'medium', {
    prompt: 'A trail marker counts stones in stacks of 2, 6, 12, 20, 30 and then stops. How many stones belong in the next stack?',
    options: ['36', '40', '42', '44'], answer: 2,
    hint: 'Look at the gaps between the numbers. They grow by the same amount each time.' }),

  challenge({ id: 'm_tracks', cat: 'memory', title: 'Animal Tracks', item: 'camp_hatchet',
    blurb: 'Follow the tracks in the exact order you saw them.' }, 'medium', {
    pad: ['🦌', '🐻', '🦊', '🐺', '🦉', '🐇'], seq: [2, 0, 4, 4, 1, 5], showMs: 650 }),

  challenge({ id: 't_mapsky', cat: 'trivia', title: 'Map and Sky', item: 'resoled_boots',
    blurb: 'Navigation facts every traveller should know.' }, 'medium', {
    need: 2,
    questions: [
      { q: 'Which is the longest river in Africa?', options: ['Nile', 'Congo', 'Niger', 'Zambezi'], answer: 0 },
      { q: 'Which star is known as the North Star?', options: ['Polaris', 'Sirius', 'Vega', 'Betelgeuse'], answer: 0 },
      { q: 'Which line of latitude is at 0 degrees?', options: ['The Equator', 'The Prime Meridian', 'Tropic of Cancer', 'Arctic Circle'], answer: 0 }
    ] }),

  challenge({ id: 'e_boulders', cat: 'explore', title: 'Boulder Field', item: 'tin_of_beans',
    blurb: 'Dozens of boulders and one hiding place.' }, 'medium', {
    scene: 'A wide slope of grey boulders. The cache is wedged between two of them.',
    terrain: '🪨', rows: 4, cols: 4, target: [0, 3], attempts: 4 }),

  challenge({ id: 'p_camper_logic', cat: 'puzzle', format: 'choice', title: 'Who Carries the Rope?', item: 'torn_map',
    blurb: 'Three campers, three items, and a few clues.' }, 'medium', {
    prompt: 'Ash, Birch and Cedar each carry one item: a map, a rope or a lantern. Ash carries neither the rope nor the lantern. Birch does not carry the lantern. Who carries the rope?',
    options: ['Ash', 'Birch', 'Cedar', 'It cannot be worked out'], answer: 1,
    hint: 'Start with Ash. Ash only has one item left to carry.' }),

  challenge({ id: 'm_flags', cat: 'memory', title: 'Signal Flags', item: 'canvas_tent',
    blurb: 'Seven coloured flags wave across the valley.' }, 'medium', {
    pad: ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'], seq: [3, 1, 5, 0, 2, 4, 1], showMs: 650 }),

  challenge({ id: 't_weather', cat: 'trivia', title: 'Weather Watcher', item: 'field_scope',
    blurb: 'Read the sky before it reads you.' }, 'medium', {
    need: 2,
    questions: [
      { q: 'Which type of cloud is linked to thunderstorms?', options: ['Cumulonimbus', 'Cirrus', 'Stratus', 'Altocumulus'], answer: 0 },
      { q: 'Sound takes roughly how long to travel one kilometre?', options: ['About 3 seconds', 'About 1 second', 'About 10 seconds', 'About 30 seconds'], answer: 0 },
      { q: 'What is a rotating column of air that touches the ground called?', options: ['Tornado', 'Monsoon', 'Blizzard', 'Drizzle'], answer: 0 }
    ] }),

  challenge({ id: 'e_fog', cat: 'explore', title: 'Fog on the Ridge', item: 'patched_rucksack',
    blurb: 'Thick fog hides the path and what lies on it.' }, 'medium', {
    scene: 'You can barely see your own boots. A rucksack was left somewhere on this ridge.',
    terrain: '🌫️', rows: 4, cols: 5, target: [3, 1], attempts: 4 }),

  challenge({ id: 'p_echo', cat: 'puzzle', format: 'text', title: 'Voice of the Canyon', item: 'candle_stub',
    blurb: 'The canyon walls seem to answer you back.' }, 'medium', {
    prompt: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    answers: ['echo', 'an echo', 'the echo'],
    hint: 'Shout into a canyon and listen.' }),

  challenge({ id: 'e_cave', cat: 'explore', title: 'Mouth of the Cave', item: 'trail_scarf',
    blurb: 'A damp cave floor with something shiny in the dark.' }, 'medium', {
    scene: 'Drip, drip. Your torch only lights a few steps at a time.',
    terrain: '🕳️', rows: 5, cols: 5, target: [2, 4], attempts: 4 }),

  /* ===== Hard (7) ===== */
  challenge({ id: 'p_cipher', cat: 'puzzle', format: 'text', title: 'The Cipher Stone', item: 'brass_compass',
    blurb: 'A message carved in a shifted alphabet.' }, 'hard', {
    prompt: 'A stone is carved with JURXQG. Each letter was moved 3 places forward in the alphabet. Decode the word.',
    answers: ['ground'],
    hint: 'Move each letter back 3 places. J becomes G.' }),

  challenge({ id: 'm_beacons', cat: 'memory', title: 'Summit Beacons', item: 'antler_carving',
    blurb: 'Eight beacons flare across nine peaks.' }, 'hard', {
    pad: ['⛰️', '🌲', '🌊', '🔥', '❄️', '🌩️', '🌵', '🍄', '🪨'], seq: [4, 7, 1, 8, 0, 3, 6, 2], showMs: 500 }),

  challenge({ id: 't_mountains', cat: 'trivia', title: 'Mountain Lore', item: 'rusted_key',
    blurb: 'Questions for those who look up at the peaks.' }, 'hard', {
    need: 2,
    questions: [
      { q: 'Which is the highest mountain above sea level?', options: ['Mount Everest', 'K2', 'Kangchenjunga', 'Denali'], answer: 0 },
      { q: 'In which US state is Denali?', options: ['Alaska', 'Colorado', 'Washington', 'Wyoming'], answer: 0 },
      { q: 'Roughly how much does air temperature fall for every 1,000 metres you climb?', options: ['About 6.5°C', 'About 1°C', 'About 15°C', 'About 25°C'], answer: 0 }
    ] }),

  challenge({ id: 'e_storm', cat: 'explore', title: 'Storm Pass', item: 'eagle_totem',
    blurb: 'A narrow pass, a rising storm and one spot worth finding.' }, 'hard', {
    scene: 'Wind howls through a wide, rocky pass. You will not get long out here.',
    terrain: '🌩️', rows: 5, cols: 6, target: [4, 1], attempts: 4 }),

  challenge({ id: 'p_lanterns', cat: 'puzzle', format: 'choice', title: 'The Heavy Lantern', item: 'frontier_doubloon',
    blurb: 'One lantern is heavier than the others.' }, 'hard', {
    prompt: 'Eight lanterns look identical, but one is heavier. You have a balance scale. What is the fewest weighings that always finds the heavy one?',
    options: ['1', '2', '3', '4'], answer: 1,
    hint: 'Split the lanterns into three groups, not two.' }),

  challenge({ id: 'm_nightwatch', cat: 'memory', title: 'Night Watch', item: 'storm_glass',
    blurb: 'Nine lights, nine turns, no second chances.' }, 'hard', {
    pad: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '✨'], seq: [8, 2, 5, 0, 7, 3, 3, 6, 1], showMs: 500 }),

  challenge({ id: 't_deepwild', cat: 'trivia', title: 'The Deep Wilds', item: 'pocket_watch',
    blurb: 'The biggest, deepest and driest places on Earth.' }, 'hard', {
    need: 2,
    questions: [
      { q: 'Which is the largest hot desert in the world?', options: ['Sahara', 'Gobi', 'Arabian', 'Kalahari'], answer: 0 },
      { q: 'Which is the deepest lake in the world?', options: ['Lake Baikal', 'Lake Superior', 'Lake Victoria', 'Lake Erie'], answer: 0 },
      { q: 'Which is the largest rainforest in the world?', options: ['Amazon', 'Congo', 'Daintree', 'Tongass'], answer: 0 }
    ] })
];
/* ---------- 15 achievements ----------
   progress() returns [current, target]. It unlocks when current reaches target.
   Each reward can be claimed once. */
Data.achievements = [
  { id: 'first_steps',  icon: '👣', name: 'First Steps',     desc: 'Complete your first challenge.',        reward: { coins: 20 },
    progress: function () { return [Game.doneCount(), 1]; } },
  { id: 'warming_up',   icon: '🔥', name: 'Warming Up',      desc: 'Complete 5 challenges.',                reward: { coins: 30 },
    progress: function () { return [Game.doneCount(), 5]; } },
  { id: 'wayfarer',     icon: '🥾', name: 'Wayfarer',        desc: 'Complete 15 challenges.',               reward: { coins: 60 },
    progress: function () { return [Game.doneCount(), 15]; } },
  { id: 'trails_end',   icon: '🏁', name: "Trail's End",     desc: 'Complete all 25 challenges.',           reward: { coins: 150, item: 'trailblazer_crown' },
    progress: function () { return [Game.doneCount(), Game.totalCount()]; } },
  { id: 'puzzle_master', icon: '🧩', name: 'Puzzle Master',  desc: 'Complete every puzzle.',                reward: { coins: 50 },
    progress: function () { return [Game.doneCount('puzzle'), Game.totalCount('puzzle')]; } },
  { id: 'memory_master', icon: '🧠', name: 'Memory Master',  desc: 'Complete every memory challenge.',      reward: { coins: 50 },
    progress: function () { return [Game.doneCount('memory'), Game.totalCount('memory')]; } },
  { id: 'trivia_master', icon: '❓', name: 'Trivia Master',  desc: 'Complete every trivia challenge.',      reward: { coins: 50 },
    progress: function () { return [Game.doneCount('trivia'), Game.totalCount('trivia')]; } },
  { id: 'pathfinder',   icon: '🧭', name: 'Pathfinder',      desc: 'Complete every exploration challenge.', reward: { coins: 50, item: 'glacier_heart' },
    progress: function () { return [Game.doneCount('explore'), Game.totalCount('explore')]; } },
  { id: 'level_5',      icon: '⛰️', name: 'Ridge Runner',    desc: 'Reach level 5.',                        reward: { coins: 40 },
    progress: function () { return [Game.levelInfo().level, 5]; } },
  { id: 'level_10',     icon: '🌟', name: 'Off-Grid Legend', desc: 'Reach level 10.',                       reward: { coins: 100, item: 'polaris_fragment' },
    progress: function () { return [Game.levelInfo().level, 10]; } },
  { id: 'first_purchase', icon: '🛍️', name: 'Well Equipped', desc: 'Buy your first upgrade.',               reward: { coins: 20 },
    progress: function () { return [Game.upgradeCount(), 1]; } },
  { id: 'fully_geared', icon: '🎒', name: 'Fully Geared',    desc: 'Own all 10 upgrades.',                  reward: { coins: 100, item: 'aurora_shard' },
    progress: function () { return [Game.upgradeCount(), Data.upgrades.length]; } },
  { id: 'collector_10', icon: '🗃️', name: 'Pocket Museum',   desc: 'Collect 10 items.',                     reward: { coins: 40 },
    progress: function () { return [Game.itemCount(), 10]; } },
  { id: 'collector_20', icon: '🏛️', name: 'Curator',         desc: 'Collect 20 items.',                     reward: { coins: 80, item: 'sunken_amphora' },
    progress: function () { return [Game.itemCount(), 20]; } },
  { id: 'gold_hoarder', icon: '💰', name: 'Gold Hoarder',    desc: 'Hold 500 coins at once.',               reward: { coins: 50 },
    progress: function () { return [Game.state.coins, 500]; } }
];
