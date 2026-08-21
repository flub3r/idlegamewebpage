(() => {
  window.renderRigs = function () {
    const root = document.getElementById('rigList');
    if (!root) return;
    root.innerHTML = rigs.map((r, i) => {
      const c = rigCost(i);
      return `<div class="row" data-rig-row="${i}"><div><h3>${r.n}</h3><p>${r.d}</p><div class="owned">${s.rigs[i]} owned · +${fmt(r.h * globalMult() * pool().hash)} H/s each</div></div><button class="buy pressable" data-buy-rig="${i}" ${s.credits < c ? 'disabled' : ''}><b>BUY</b><span>${fmt(c)} cr</span></button></div>`;
    }).join('');
    root.querySelectorAll('[data-buy-rig]').forEach(b => b.onclick = () => buyRig(+b.dataset.buyRig));
  };

  window.renderResearch = function () {
    const root = document.getElementById('researchList');
    if (!root) return;
    root.innerHTML = research.map((r, i) => {
      const done = s.research.includes(r.id);
      const prereq = i === 0 || s.research.includes(research[i - 1].id);
      return `<button class="upgrade pressable ${done ? 'done' : ''} ${!prereq ? 'locked' : ''}" data-research="${r.id}" ${done || !prereq || s.credits < r.c ? 'disabled' : ''}><h3>${r.n}</h3><p>${r.d}</p><b>${done ? 'INSTALLED' : (!prereq ? 'PREREQUISITE REQUIRED' : fmt(r.c) + ' CREDITS')}</b></button>`;
    }).join('');
    root.querySelectorAll('[data-research]').forEach(b => b.onclick = () => buyResearch(b.dataset.research));
  };

  function refreshRigAffordability() {
    const root = document.getElementById('rigList');
    if (!root) return;
    root.querySelectorAll('[data-buy-rig]').forEach(button => {
      const i = Number(button.dataset.buyRig);
      const c = rigCost(i);
      button.disabled = s.credits < c;
      const price = button.querySelector('span');
      if (price) price.textContent = `${fmt(c)} cr`;
      const owned = root.querySelector(`[data-rig-row="${i}"] .owned`);
      if (owned) owned.textContent = `${s.rigs[i]} owned · +${fmt(rigs[i].h * globalMult() * pool().hash)} H/s each`;
    });
  }

  function refreshResearchAffordability() {
    const root = document.getElementById('researchList');
    if (!root) return;
    root.querySelectorAll('[data-research]').forEach(button => {
      const id = button.dataset.research;
      const i = research.findIndex(r => r.id === id);
      const r = research[i];
      if (!r) return;
      const done = s.research.includes(id);
      const prereq = i === 0 || s.research.includes(research[i - 1].id);
      button.disabled = done || !prereq || s.credits < r.c;
    });
  }

  const originalRenderOps = renderOps;
  window.renderOps = function () {
    const poolsRoot = document.getElementById('poolGrid');
    const contractRoot = document.getElementById('contractGrid');
    if (!poolsRoot || poolsRoot.children.length !== pools.length || !contractRoot || contractRoot.children.length !== s.contracts.length) {
      originalRenderOps();
      return;
    }
    poolsRoot.querySelectorAll('[data-pool]').forEach(button => {
      const active = button.dataset.pool === s.pool;
      button.classList.toggle('active', active);
      const small = button.querySelector('small');
      if (small) small.textContent = active ? 'ACTIVE ROUTE' : 'Tap to switch routing';
    });
    const remain = 1800 - Math.floor(Date.now() / 1000) % 1800;
    const timer = document.getElementById('contractTimer');
    if (timer) timer.textContent = `refresh ${Math.floor(remain / 60)}m ${remain % 60}s`;
    [...contractRoot.children].forEach((card, i) => {
      const c = s.contracts[i];
      if (!c) return;
      const pct = Math.min(100, c.progress / c.target * 100);
      const done = c.progress >= c.target;
      card.classList.toggle('complete', done);
      const p = card.querySelector('p'); if (p) p.textContent = `${fmt(c.progress)} / ${fmt(c.target)}`;
      const fill = card.querySelector('.fill'); if (fill) fill.style.width = `${pct}%`;
      const reward = card.querySelector('.contract-foot > b'); if (reward) reward.textContent = `+${Math.floor(c.reward * contractRewardMult())} REP`;
      const button = card.querySelector('[data-contract]');
      if (button) {
        button.disabled = !done || c.claimed;
        const b = button.querySelector('b'); if (b) b.textContent = c.claimed ? 'CLAIMED' : 'CLAIM';
        const span = button.querySelector('span'); if (span) span.textContent = done ? 'ready' : 'in progress';
      }
    });
    const telemetry = document.getElementById('opsTelemetry');
    const values = ['x' + pool().hash.toFixed(2), 'x' + pool().manual.toFixed(2), 'x' + pool().contract.toFixed(2), offlineCapHours() + 'h', s.forks, s.genesis];
    if (telemetry && telemetry.children.length === values.length) [...telemetry.children].forEach((row, i) => { const p = row.querySelector('p'); if (p) p.textContent = values[i]; });
  };

  const originalRenderPrestige = renderPrestige;
  window.renderPrestige = function () {
    const shardRoot = document.getElementById('shardShop');
    const genRoot = document.getElementById('genesisShop');
    if (!shardRoot || shardRoot.children.length !== shardUpgrades.length || !genRoot || genRoot.children.length !== genesisUpgrades.length) {
      originalRenderPrestige();
      return;
    }
    const fg = nextShardGain();
    const forkCopy = document.getElementById('forkCopy');
    const forkBtn = document.getElementById('forkBtn');
    if (forkCopy) forkCopy.textContent = fg ? `Fork now to mint ${fg} Satoshi Shards.` : 'Build deeper run output before forking; deep runs add shards logarithmically rather than exploding the prestige payout.';
    if (forkBtn) { forkBtn.disabled = fg < 1; forkBtn.textContent = fg ? `Fork for ${fg} Shards` : 'Fork locked'; }
    [...shardRoot.children].forEach((item, i) => {
      const u = shardUpgrades[i], L = lvl(u.id), c = Math.ceil(u.base * Math.pow(1.65, L));
      const level = item.querySelector('.level'); if (level) level.textContent = `LEVEL ${L} / ${u.max}`;
      const button = item.querySelector('[data-shard]'); if (button) { button.disabled = L >= u.max || s.shards < c; const b = button.querySelector('b'); if (b) b.textContent = L >= u.max ? 'MAX' : 'UPGRADE'; const span = button.querySelector('span'); if (span) span.textContent = L >= u.max ? '' : `${c} shards`; }
    });
    const kg = nextKeyGain();
    const genCopy = document.getElementById('genesisCopy');
    const genBtn = document.getElementById('genesisBtn');
    if (genCopy) genCopy.textContent = kg ? `Genesis is stable. Collapse the current shard network for ${kg} Key${kg === 1 ? '' : 's'}.` : objectiveText();
    if (genBtn) { genBtn.disabled = kg < 1; genBtn.textContent = kg ? `Genesis for ${kg} Keys` : 'Genesis locked'; }
    [...genRoot.children].forEach((item, i) => {
      const u = genesisUpgrades[i], L = lvl(u.id, true), c = Math.ceil(u.base * Math.pow(1.8, L));
      const level = item.querySelector('.level'); if (level) level.textContent = `LEVEL ${L} / ${u.max}`;
      const button = item.querySelector('[data-gen]'); if (button) { button.disabled = L >= u.max || s.keys < c; const b = button.querySelector('b'); if (b) b.textContent = L >= u.max ? 'MAX' : 'UPGRADE'; const span = button.querySelector('span'); if (span) span.textContent = L >= u.max ? '' : `${c} keys`; }
    });
  };

  let lastDirectiveSignature = '';
  window.renderDirectives = function () {
    const root = document.getElementById('directives');
    if (!root) return;
    const items = [objectiveText(), `${s.forks}|${Math.floor(s.shardsEarned || 0)}|${s.research.length}|${totalRigs()}|${s.contractsDone}`];
    const signature = items.join('::');
    if (signature === lastDirectiveSignature) return;
    lastDirectiveSignature = signature;
    root.innerHTML = `<div class="row"><div><h3>Current directive</h3><p>${objectiveText()}</p></div></div>`;
  };

  let lastEventSignature = '';
  window.renderEvents = function () {
    const root = document.getElementById('eventLog');
    if (!root) return;
    const events = s.events.length ? s.events : [{text:'Network initialized. Awaiting operator input.'}];
    const signature = events.map(e => e.text).join('|');
    if (signature === lastEventSignature) return;
    lastEventSignature = signature;
    root.innerHTML = events.map(e => `<div class="log"><b>›</b> ${e.text}</div>`).join('');
  };

  // Refresh only attributes/text in place. Replacing the DOM under the pointer caused
  // hover/focus/Motion states to restart every few hundred milliseconds.
  setInterval(() => {
    const active = document.querySelector('.page.active')?.id;
    if (active === 'rigs') refreshRigAffordability();
    else if (active === 'research') refreshResearchAffordability();
  }, 250);

  renderRigs();
  renderResearch();
  renderOps();
  renderPrestige();
  renderDirectives();
  renderEvents();
})();
