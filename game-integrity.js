(() => {
  const FORK_BASE = 2500000;
  const MIN_MINE_INTERVAL = 100;
  const OVERDRIVE_CHARGE = 1.25;
  const POOL_SWITCH_COOLDOWN = 20000;
  let lastMineInput = 0;

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clampInt = (value, min, max) => Math.max(min, Math.min(max, Math.floor(finite(value, min))));

  // Harden legacy/local saves against NaN/Infinity and invalid progression levels.
  for (const key of ['credits','total','runEarned','shards','keys','rep','contractsDone','forks','genesis','od','odUntil','combo','bestCombo','comboAt','runStarted','last']) {
    s[key] = Math.max(0, finite(s[key], 0));
  }
  s.rigs = rigs.map((_, i) => clampInt(s.rigs?.[i], 0, 1000000));
  s.research = [...new Set((Array.isArray(s.research) ? s.research : []).filter(id => research.some(r => r.id === id)))];
  s.automation = [...new Set((Array.isArray(s.automation) ? s.automation : []).filter(id => automation.some(a => a.id === id)))];
  s.pool = pools.some(p => p.id === s.pool) ? s.pool : 'solo';
  s.shardLevels ||= {};
  s.genLevels ||= {};
  for (const u of shardUpgrades) s.shardLevels[u.id] = clampInt(s.shardLevels[u.id], 0, u.max);
  for (const u of genesisUpgrades) s.genLevels[u.id] = clampInt(s.genLevels[u.id], 0, u.max);
  s.poolSwitchAt = Math.max(0, finite(s.poolSwitchAt, 0));

  const estimatedSpentShards = shardUpgrades.reduce((sum, u) => {
    const L = clampInt(s.shardLevels[u.id], 0, u.max);
    for (let i = 0; i < L; i++) sum += Math.ceil(u.base * Math.pow(1.65, i));
    return sum;
  }, 0);
  s.shardsEarned = Math.max(0, finite(s.shardsEarned, s.shards + estimatedSpentShards));

  // Percent research bonuses were accidentally multiplied together (10.4M+ at full tree).
  // Treat their +X% descriptions literally: bonuses add to a single global research multiplier.
  researchMult = function () {
    let bonus = 0;
    for (const r of research) if (s.research.includes(r.id)) bonus += Math.max(0, r.m - 1);
    return 1 + bonus;
  };

  buyResearch = function (id) {
    const i = research.findIndex(x => x.id === id);
    const r = research[i];
    if (!r || s.research.includes(id) || s.credits < r.c) return;
    if (i > 0 && !s.research.includes(research[i - 1].id)) {
      toast('RESEARCH PREREQUISITE REQUIRED');
      return;
    }
    s.credits -= r.c;
    s.research.push(id);
    pushEvent(`${r.n} research completed.`);
    toast('RESEARCH COMPLETE');
    save();
    render();
  };

  mine = function (ev) {
    const now = Date.now();
    if (now - lastMineInput < MIN_MINE_INTERVAL) return;
    lastMineInput = now;

    s.combo = now - s.comboAt < 900 ? Math.min(40, s.combo + 1) : 1;
    s.comboAt = now;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    const comboM = 1 + s.combo * .045;
    const crit = Math.random() < critChance();
    const gain = manualBase() * comboM * (crit ? 5 : 1);
    s.credits += gain;
    s.total += gain;
    s.runEarned += gain;

    // No pre-charging/refreshing Overdrive while it is active.
    if (now >= s.odUntil) s.od = Math.min(100, s.od + OVERDRIVE_CHARGE);

    const r = ev?.currentTarget?.getBoundingClientRect();
    spawnDelta(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + 24 : innerHeight / 2, '+' + fmt(gain) + (crit ? ' CRIT' : ''), crit);
    press(document.getElementById('mineBtn'), .9);
    animateSafe(document.getElementById('core'), [{filter:'brightness(1)'},{filter:'brightness(1.55)'},{filter:'brightness(1)'}], {duration:240});
    if (crit) {
      toast('CRITICAL HASH ×5');
      pushEvent('Critical hash burst multiplied active output.');
    }
    updateContracts(0, 1);
    save();
    if (typeof renderHud === 'function') renderHud();
  };

  fireOverdrive = function () {
    const now = Date.now();
    if (now < s.odUntil || s.od < 100) return;
    s.od = 0;
    s.odUntil = now + 30000;
    toast('OVERDRIVE // 30 SECONDS');
    pushEvent(`Overdrive engaged at x${odPower().toFixed(2)} passive output.`);
    press(document.getElementById('overdrive'), .97);
    save();
    if (typeof renderHud === 'function') renderHud();
  };

  switchPool = function (id) {
    const now = Date.now();
    if (!pools.some(p => p.id === id) || s.pool === id) return;
    if (now < s.poolSwitchAt) {
      toast(`ROUTING LOCK ${Math.ceil((s.poolSwitchAt - now) / 1000)}s`);
      return;
    }
    s.pool = id;
    s.poolSwitchAt = now + POOL_SWITCH_COOLDOWN;
    pushEvent(`Mining pool switched to ${pool().n}. Routing locked for 20 seconds.`);
    toast(pool().n.toUpperCase());
    save();
    render();
    staggerCards();
  };

  // Contracts used absolute Unix half-hour count as difficulty, overflowing targets to Infinity.
  contractSeed = function (epoch, slot) {
    const types = ['earn','hash','rigs','active'];
    const type = types[Math.abs((epoch + slot * 7) % types.length)];
    const currentHps = Math.max(1, passiveHps());
    const currentRigs = totalRigs();
    const depth = Math.max(0, Math.floor(Math.log10(Math.max(10, s.runEarned + 1))) - 3);
    const reward = 2 + Math.min(18, depth + Math.floor(s.genesis / 2));
    if (type === 'earn') {
      const target = Math.max(5000, Math.ceil(currentHps * (120 + slot * 20)));
      return {id:`${epoch}-${slot}`,type,target,progress:0,reward,label:`Generate ${fmt(target)} credits`};
    }
    if (type === 'hash') {
      const target = Math.max(50, Math.ceil(currentHps * (1.45 + slot * .12)));
      return {id:`${epoch}-${slot}`,type,target,progress:0,reward,label:`Reach ${fmt(target)} H/s`};
    }
    if (type === 'rigs') {
      const target = currentRigs + Math.max(5, Math.ceil(Math.sqrt(currentRigs + 1) * (2 + slot * .25)));
      return {id:`${epoch}-${slot}`,type,target,progress:0,reward:reward + 1,label:`Operate ${target} rigs`};
    }
    const target = 100 + depth * 35 + slot * 25;
    return {id:`${epoch}-${slot}`,type,target,progress:0,reward,label:`Land ${target} active hashes`};
  };

  ensureContracts = function () {
    const epoch = Math.floor(Date.now() / 1800000);
    const invalid = !Array.isArray(s.contracts) || s.contracts.length !== 4 || s.contracts.some(c => !Number.isFinite(Number(c.target)) || Number(c.target) <= 0 || !Number.isFinite(Number(c.progress)));
    if (s.contractEpoch !== epoch || invalid) {
      s.contractEpoch = epoch;
      s.contracts = [0,1,2,3].map(slot => contractSeed(epoch, slot));
      save();
    }
  };

  // Prestige used sqrt(run output), allowing one explosive run to mint dozens/hundreds of shards.
  // Each doubling beyond the fork threshold now adds one base shard: deep runs help, but cannot skip the loop.
  nextShardGain = function () {
    const ratio = Math.max(0, s.runEarned) / FORK_BASE;
    if (ratio < 1) return 0;
    const base = 1 + Math.floor(Math.log2(ratio));
    const contractBoost = 1 + Math.min(.25, Math.max(0, s.contractsDone) * .005);
    return Math.max(1, Math.floor(base * contractBoost * (1 + lvl('genShard', true) * .35)));
  };

  const genesisRequirementsMet = () => s.forks >= 5 && s.shardsEarned >= 40 && s.research.length >= 6 && totalRigs() >= 75;

  nextKeyGain = function () {
    if (!genesisRequirementsMet()) return 0;
    const depth = Math.max(1, s.shardsEarned / 40);
    return 1 + Math.floor(Math.log2(depth));
  };

  fork = function () {
    const gain = nextShardGain();
    if (gain < 1) return;
    s.shards += gain;
    s.shardsEarned += gain;
    s.forks++;
    const start = lvl('genStart', true);
    s.credits = start ? Math.pow(10, start) * 25 : 0;
    s.runEarned = 0;
    s.total = 0;
    s.rigs = Array(rigs.length).fill(0);
    if (start) {
      s.rigs[0] = start * 2;
      s.rigs[1] = Math.max(0, start - 1);
    }
    s.research = [];
    s.combo = 0;
    s.od = 0;
    s.odUntil = 0;
    s.contracts = [];
    s.runStarted = Date.now();
    pushEvent(`Network fork minted ${gain} Satoshi Shards.`);
    toast(`+${gain} SATOSHI SHARDS`);
    save();
    render();
    switchPage('fork');
  };

  genesis = function () {
    const gain = nextKeyGain();
    if (gain < 1) {
      toast('GENESIS REQUIREMENTS NOT MET');
      return;
    }
    s.keys += gain;
    s.genesis++;
    s.shards = 0;
    s.shardsEarned = 0;
    s.shardLevels = {};
    s.forks = 0;
    s.rep = 0;
    s.contractsDone = 0;
    s.automation = [];
    const start = lvl('genStart', true);
    s.credits = start ? Math.pow(10, start) * 25 : 0;
    s.runEarned = 0;
    s.total = 0;
    s.rigs = Array(rigs.length).fill(0);
    if (start) {
      s.rigs[0] = start * 2;
      s.rigs[1] = Math.max(0, start - 1);
    }
    s.research = [];
    s.contracts = [];
    s.combo = 0;
    s.od = 0;
    s.odUntil = 0;
    s.runStarted = Date.now();
    pushEvent(`Genesis initiated. +${gain} Genesis Keys.`);
    toast(`GENESIS +${gain} KEYS`);
    save();
    render();
    switchPage('genesis');
  };

  objectiveText = function () {
    if (totalRigs() < 1) return 'Build your first Browser Miner.';
    if (hps() < 100) return 'Reach 100 H/s to establish a stable node.';
    if (s.research.length < 2) return 'Complete the first two research upgrades.';
    if (totalRigs() < 25) return 'Operate 25 rigs to unlock Smart Autobuy.';
    if (nextShardGain() < 1) return `Grow this run to ${fmt(FORK_BASE)} output for a Network Fork.`;
    if (s.forks < 5) return `Build a durable shard economy: ${s.forks}/5 forks this Genesis cycle.`;
    if (s.shardsEarned < 40) return `Earn ${40 - Math.floor(s.shardsEarned)} more lifetime Shards this Genesis cycle.`;
    if (s.research.length < 6) return `Install ${6 - s.research.length} more research nodes to stabilize Genesis.`;
    if (totalRigs() < 75) return `Operate ${75 - totalRigs()} more rigs to stabilize Genesis.`;
    return nextKeyGain() > 0 ? `Genesis is stable: ${nextKeyGain()} Key${nextKeyGain() === 1 ? '' : 's'} available.` : 'Push deeper into the network.';
  };

  ensureContracts();
  save();
})();
