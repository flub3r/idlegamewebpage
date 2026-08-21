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

  // Refresh only attributes/text in place. Replacing the DOM under the pointer caused
  // hover/focus/Motion states to restart every few hundred milliseconds.
  setInterval(() => {
    const active = document.querySelector('.page.active')?.id;
    if (active === 'rigs') refreshRigAffordability();
    else if (active === 'research') refreshResearchAffordability();
  }, 250);

  renderRigs();
  renderResearch();
})();
