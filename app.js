const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const search = document.getElementById('search');
const filtersEl = document.getElementById('filters');
const metaEl = document.getElementById('results-meta');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');

const rootEl = document.documentElement;
const groups = ['All', ...Array.from(new Set(TOOLS.map(t => t.group)))];
let activeGroup = 'All';
let locale = localStorage.getItem('locale') || 'en';
let theme = localStorage.getItem('theme') || 'dark';

document.getElementById('stat-count').textContent = TOOLS.length;

themeToggle.addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
langToggle.addEventListener('click', () => setLocale(locale === 'en' ? 'ar' : 'en'));

function translateTool(t){
  if(locale !== 'ar' || typeof TOOLS_AR === 'undefined') return t;
  const translation = TOOLS_AR[t.name];
  return translation ? {...t, ...translation} : t;
}

function applyTranslations(){
  const strings = I18N[locale];
  if(!strings) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if(key && strings[key]) el.textContent = strings[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if(key && strings[key]) el.innerHTML = strings[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if(key && strings[key]) el.placeholder = strings[key];
  });

  langToggle.querySelector('span').textContent = strings.langSwitchLabel;
  themeToggle.setAttribute('aria-label', strings.themeToggleLabel);
  rootEl.lang = locale;
  document.body.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

function setTheme(value){
  theme = value;
  document.body.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  themeToggle.setAttribute('aria-label', I18N[locale].themeToggleLabel);
}

function setLocale(value){
  locale = value;
  localStorage.setItem('locale', locale);
  applyTranslations();
  renderFilters();
  render();
}

setTheme(theme);
setLocale(locale);

function renderFilters(){
  filtersEl.innerHTML = groups.map(g =>
    `<button class="chip ${g===activeGroup?'active':''}" data-group="${g}">${I18N[locale].groups[g] || g}</button>`
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

  metaEl.textContent = I18N[locale].resultsShowing(filtered.length, TOOLS.length)
    + (activeGroup !== 'All' ? ` · ${I18N[locale].groups[activeGroup] || activeGroup}` : '')
    + (q ? ` · "${q}"` : '');

  if(filtered.length === 0){
    grid.style.display = 'none';
    empty.style.display = 'block';
    empty.textContent = I18N[locale].emptyState;
    return;
  }

  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = filtered.map((t) => {
    const i = TOOLS.indexOf(t) + 1;
    const tool = translateTool(t);
    return `
    <div class="card" data-idx="${i-1}">
      <div class="card-top">
        <span class="card-idx">#${String(i).padStart(2,'0')}</span>
        <span class="card-group">${I18N[locale].groups[t.group] || t.group}</span>
      </div>
      <h3>${t.name}</h3>
      <p class="tagline">${tool.tagline}</p>
      <p class="cat">${tool.category}</p>
    </div>`;
  }).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(TOOLS[+card.dataset.idx]));
  });
}

function openModal(t){
  const tool = translateTool(t);
  const fields = I18N[locale].fields;
  modal.innerHTML = `
    <div class="modal-head">
      <div>
        <h2>${tool.name}</h2>
        <p class="tagline">${tool.tagline}</p>
      </div>
      <button class="modal-close" id="closeBtn" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="field"><p class="field-label">${fields.category}</p><p class="field-value">${tool.category}</p></div>
      <div class="field"><p class="field-label">${fields.what}</p><p class="field-value">${tool.what}</p></div>
      <div class="field"><p class="field-label">${fields.features}</p><p class="field-value">${tool.features}</p></div>
      <div class="field"><p class="field-label">${fields.usedWith}</p><p class="field-value">${tool.usedWith}</p></div>
      <div class="field"><p class="field-label">${fields.howTo}</p><p class="field-value">${tool.howTo}</p></div>
      <div class="field"><p class="field-label">${fields.pricing}</p><p class="field-value">${tool.pricing}</p></div>
      <div class="pros-cons">
        <div class="field"><p class="field-label">${fields.pros}</p><p class="field-value">${tool.pros}</p></div>
        <div class="field"><p class="field-label">${fields.cons}</p><p class="field-value">${tool.cons}</p></div>
      </div>
      <div class="field"><p class="field-label">${fields.tips}</p><p class="field-value">${tool.tips}</p></div>
      <div class="field"><p class="field-label">${fields.link}</p><p class="field-value"><a href="${tool.link}" target="_blank" rel="noopener">${tool.link}</a></p></div>
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