const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const search = document.getElementById('search');
const filtersEl = document.getElementById('filters');
const metaEl = document.getElementById('results-meta');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');

document.getElementById('stat-count').textContent = TOOLS.length;

const groups = ['All', ...Array.from(new Set(TOOLS.map(t => t.group)))];
let activeGroup = 'All';

function renderFilters(){
  filtersEl.innerHTML = groups.map(g =>
    `<button class="chip ${g===activeGroup?'active':''}" data-group="${g}">${g}</button>`
  ).join('');
}

function matches(tool, q){
  if(!q) return true;
  const hay = [tool.name, tool.tagline, tool.category, tool.what, tool.features, tool.usedWith, tool.pros, tool.cons, tool.tips, tool.group]
    .join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(part => hay.includes(part));
}

function render(){
  const q = search.value.trim();
  const filtered = TOOLS.filter(t => (activeGroup==='All' || t.group===activeGroup) && matches(t, q));

  metaEl.textContent = `Showing ${filtered.length} of ${TOOLS.length} tools` + (activeGroup!=='All' ? ` · ${activeGroup}` : '') + (q ? ` · matching "${q}"` : '');

  if(filtered.length === 0){
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = filtered.map((t) => {
    const i = TOOLS.indexOf(t) + 1;
    return `
    <div class="card" data-idx="${i-1}">
      <div class="card-top">
        <span class="card-idx">#${String(i).padStart(2,'0')}</span>
        <span class="card-group">${t.group}</span>
      </div>
      <h3>${t.name}</h3>
      <p class="tagline">${t.tagline}</p>
      <p class="cat">${t.category}</p>
    </div>`;
  }).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(TOOLS[+card.dataset.idx]));
  });
}

function openModal(t){
  modal.innerHTML = `
    <div class="modal-head">
      <div>
        <h2>${t.name}</h2>
        <p class="tagline">${t.tagline}</p>
      </div>
      <button class="modal-close" id="closeBtn" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="field"><p class="field-label">Category</p><p class="field-value">${t.category}</p></div>
      <div class="field"><p class="field-label">What it does</p><p class="field-value">${t.what}</p></div>
      <div class="field"><p class="field-label">Key features</p><p class="field-value">${t.features}</p></div>
      <div class="field"><p class="field-label">Best for</p><p class="field-value">${t.usedWith}</p></div>
      <div class="field"><p class="field-label">How to use it</p><p class="field-value">${t.howTo}</p></div>
      <div class="field"><p class="field-label">Pricing</p><p class="field-value">${t.pricing}</p></div>
      <div class="pros-cons">
        <div class="field"><p class="field-label">Pros</p><p class="field-value">${t.pros}</p></div>
        <div class="field"><p class="field-label">Cons / Limitations</p><p class="field-value">${t.cons}</p></div>
      </div>
      <div class="field"><p class="field-label">Pro tip</p><p class="field-value">${t.tips}</p></div>
      <div class="field"><p class="field-label">Official link</p><p class="field-value"><a href="${t.link}" target="_blank" rel="noopener">${t.link}</a></p></div>
    </div>
  `;
  overlay.classList.add('open');
  document.getElementById('closeBtn').addEventListener('click', closeModal);
}
function closeModal(){ overlay.classList.remove('open'); }
overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeModal();
  if(e.key === '/' && document.activeElement !== search){ e.preventDefault(); search.focus(); }
});

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  activeGroup = btn.dataset.group;
  renderFilters();
  render();
});

search.addEventListener('input', render);

renderFilters();
render();