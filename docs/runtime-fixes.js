(() => {
  window.renderRigs = function () {
    const root = document.getElementById('rigList');
    if (!root) return;
    root.innerHTML = rigs.map((r, i) => {
      const c = rigCost(i);
      return `<div class="row"><div><h3>${r.n}</h3><p>${r.d}</p><div class="owned">${s.rigs[i]} owned · +${fmt(r.h * globalMult() * pool().hash)} H/s each</div></div><button class="buy pressable" data-buy-rig="${i}" ${s.credits < c ? 'disabled' : ''}><b>BUY</b><span>${fmt(c)} cr</span></button></div>`;
    }).join('');
    root.querySelectorAll('[data-buy-rig]').forEach(b => b.onclick = () => buyRig(+b.dataset.buyRig));
  };

  let lastAffordabilityBucket = -1;
  setInterval(() => {
    const active = document.querySelector('.page.active')?.id;
    const bucket = Math.floor(Math.log10(Math.max(1, Number(s.credits) || 0)) * 20);
    if (active === 'rigs') {
      renderRigs();
      renderAutomation();
      renderMilestones();
    } else if (active === 'research' && bucket !== lastAffordabilityBucket) {
      renderResearch();
    }
    lastAffordabilityBucket = bucket;
  }, 350);
})();
