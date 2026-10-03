/* Rentora static application. Edit data/listings.json to replace demo records. */
const app = document.querySelector('#app');
const header = document.querySelector('#site-header');
const footer = document.querySelector('#site-footer');
let data;
let activeMaps = [];
const money = new Intl.NumberFormat('uk-UA');

const route = (path) => `#${path}`;
const detailRoute = (item) => route(`/${item.type === 'room' ? 'room' : 'apartment'}/${item.id}`);
const byId = (id) => [...data.apartments, ...data.rooms].find(item => item.id === id);
const apartmentFor = (room) => data.apartments.find(item => item.id === room.apartmentId);
const safe = (value) => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
const statusText = (status) => status === 'available' ? 'Доступна' : 'Зайнята';
const kindText = (item) => item.type === 'room' ? 'Кімната' : 'Квартира';
const price = item => `${money.format(item.price)} ${item.currency}`;
const primaryPhoto = item => item.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85';
const resetMaps = () => { activeMaps.forEach(map => map.remove()); activeMaps = []; };

function renderShell() {
  const current = location.hash.startsWith('#/catalog') ? 'catalog' : 'home';
  header.innerHTML = `<nav class="nav-wrap" aria-label="Головна навігація">
    <a class="brand" href="#/" aria-label="Rentora, на головну"><span class="brand-mark">⌂</span>rentora</a>
    <button class="mobile-menu" type="button" aria-label="Відкрити меню" aria-expanded="false">☰</button>
    <div class="nav-links" id="nav-links">
      <a class="nav-link ${current === 'home' ? 'active' : ''}" href="#/">Головна</a>
      <a class="nav-link ${current === 'catalog' ? 'active' : ''}" href="#/catalog">Каталог</a>
      <a class="nav-link" href="#/" data-scroll="map">Карта</a>
      <a class="nav-link" href="#/" data-scroll="about">Про сервіс</a>
    </div>
    <a class="button nav-contact" href="mailto:hello@example.com?subject=Запит%20щодо%20Rentora">Звʼязатися</a>
  </nav>`;
  footer.innerHTML = `<div class="footer-wrap"><div><a class="brand" href="#/"><span class="brand-mark">⌂</span>rentora</a><p>Демонстраційний статичний каталог для GitHub Pages. Усі обʼєкти, локації та відстані є прикладами й потребують заміни перед запуском.</p></div><div class="footer-links"><a href="#/catalog">Каталог</a><a href="mailto:hello@example.com">Контакт</a><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a></div></div>`;
  header.querySelectorAll('[data-scroll]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); const section = link.dataset.scroll;
    const scroll = () => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.hash !== '#/') { location.hash = '#/'; setTimeout(scroll, 80); } else scroll();
  }));
  header.querySelector('.mobile-menu').addEventListener('click', event => {
    const nav = header.querySelector('.nav-links'); const isOpen = nav.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', isOpen);
  });
}

function listingCard(item) {
  const areaLabel = item.type === 'room' ? `${item.area} м² кімната` : `${item.area} м² квартира`;
  return `<article class="listing-card"><a href="${detailRoute(item)}" aria-label="Переглянути: ${safe(item.title)}"><div class="card-image"><img src="${safe(primaryPhoto(item))}" alt="Демонстраційне фото: ${safe(item.title)}" loading="lazy"><span class="badge">${kindText(item)}</span><span class="status ${item.status === 'occupied' ? 'occupied' : ''}">${statusText(item.status)}</span></div><div class="card-body"><div><h3 class="card-title">${safe(item.title)}</h3><div class="card-place">${safe(item.district)}</div></div><div class="price">${price(item)}</div><div class="card-meta"><span class="pill">${areaLabel}</span><span class="pill">ванна: ${safe(item.bathroomType.toLowerCase())}</span></div></div></a></article>`;
}

function filterPanel(prefix = 'catalog') {
  const districts = [...new Set([...data.apartments, ...data.rooms].map(x => x.district.split(' ·')[0]))];
  return `<form class="${prefix === 'catalog' ? 'filters' : 'search-panel'}" id="${prefix}-filters">
    ${prefix === 'catalog' ? '<h2>Фільтри</h2>' : ''}
    <div class="${prefix === 'catalog' ? 'filter-group' : 'field'}"><label for="${prefix}-type">Тип</label><select id="${prefix}-type" name="type"><option value="all">Усі оголошення</option><option value="room">Кімнати</option><option value="apartment">Квартири</option></select></div>
    <div class="${prefix === 'catalog' ? 'filter-group' : 'field'}"><label for="${prefix}-price">Ціна до, грн</label><input id="${prefix}-price" name="price" type="number" min="0" placeholder="Наприклад, 15000"></div>
    <div class="${prefix === 'catalog' ? 'filter-group' : 'field'}"><label for="${prefix}-district">Район</label><select id="${prefix}-district" name="district"><option value="all">Усі райони</option>${districts.map(d => `<option value="${safe(d)}">${safe(d)}</option>`).join('')}</select></div>
    <div class="${prefix === 'catalog' ? 'filter-group' : 'field'}"><label for="${prefix}-rooms">Кімнат у квартирі</label><select id="${prefix}-rooms" name="rooms"><option value="all">Будь-яка кількість</option><option value="2">2</option><option value="3">3</option></select></div>
    <div class="${prefix === 'catalog' ? 'filter-group' : 'field'}"><label for="${prefix}-bathroom">Ванна кімната</label><select id="${prefix}-bathroom" name="bathroom"><option value="all">Будь-який тип</option><option value="Власна">Власна</option><option value="Спільна">Спільна</option></select></div>
    <div class="filter-actions"><button class="button" type="submit">Знайти житло <span aria-hidden="true">→</span></button>${prefix === 'catalog' ? '<button class="button button-light" type="reset">Скинути</button>' : ''}</div>
  </form>`;
}

function readFilters(form) { const f = new FormData(form); return Object.fromEntries(f.entries()); }
function filtered(filters) {
  return [...data.rooms, ...data.apartments].filter(item => {
    const apartment = item.type === 'room' ? apartmentFor(item) : item;
    return (filters.type === 'all' || !filters.type || item.type === filters.type)
      && (!filters.price || item.price <= Number(filters.price))
      && (filters.district === 'all' || !filters.district || item.district.startsWith(filters.district))
      && (filters.bathroom === 'all' || !filters.bathroom || item.bathroomType === filters.bathroom)
      && (filters.rooms === 'all' || !filters.rooms || String(apartment.roomsTotal) === filters.rooms);
  });
}

function home() {
  const highlights = [data.rooms[0], data.apartments[1], data.rooms[2], data.apartments[0], data.rooms[3]];
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">Житло, що підходить тобі</p><h1>Оренда без зайвого <em>шуму.</em></h1><p class="hero-copy">Кімнати й квартири з чесною структурою: одразу видно, з ким житимеш, що входить у ціну та що є поруч.</p></div><div class="hero-art"><img src="https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1300&q=85" alt="Світла демонстраційна вітальня"><div class="hero-art-caption">Тільки демонстраційні обʼєкти. Перед запуском додайте власні фото й перевірені деталі.</div></div></section>${filterPanel('home')}
  <section class="section"><div class="section-head"><div><p class="eyebrow">Обрані варіанти</p><h2 class="section-title">Знайдіть свій простір</h2></div><p class="section-intro">Від спокійної кімнати до квартири для двох. Кожна картка веде до повного опису.</p></div><div class="carousel-wrap"><div class="carousel" id="featured-carousel">${highlights.map(listingCard).join('')}</div><div class="carousel-controls"><button class="icon-button" type="button" data-carousel="prev" aria-label="Попередні оголошення">←</button><button class="icon-button" type="button" data-carousel="next" aria-label="Наступні оголошення">→</button><div class="dots" aria-label="Позиція каруселі">${highlights.map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Перейти до слайда ${i + 1}"></button>`).join('')}</div></div></div></section>
  <section class="map-section" id="map"><div class="section"><div class="section-head"><div><p class="eyebrow">Перегляд на карті</p><h2 class="section-title">Локації без дублювання</h2></div><p class="section-intro">Один маркер на квартиру. У картці маркера доступні всі кімнати цієї квартири.</p></div><div class="map-box"><div class="map" id="home-map"></div><div class="map-legend">Дані на карті демонстраційні</div></div></div></section>
  <section class="section" id="about"><div class="stats"><div class="stat"><span class="stat-number">1</span><span class="stat-label">редагований JSON-файл з даними</span></div><div class="stat"><span class="stat-number">0</span><span class="stat-label">платних API чи серверів</span></div><div class="stat"><span class="stat-number">100%</span><span class="stat-label">готово для GitHub Pages</span></div></div></section>`;
  bindHome(highlights);
  createMap('home-map', data.apartments);
}

function bindHome(items) {
  const form = document.querySelector('#home-filters');
  form.addEventListener('submit', event => { event.preventDefault(); const q = new URLSearchParams(readFilters(form)); location.hash = `#/catalog?${q}`; });
  const carousel = document.querySelector('#featured-carousel');
  const go = direction => carousel.scrollBy({ left: direction * (carousel.clientWidth * .82), behavior: 'smooth' });
  document.querySelector('[data-carousel="prev"]').addEventListener('click', () => go(-1));
  document.querySelector('[data-carousel="next"]').addEventListener('click', () => go(1));
  carousel.addEventListener('scroll', () => { const index = Math.min(items.length - 1, Math.max(0, Math.round(carousel.scrollLeft / (carousel.clientWidth * .82)))); document.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === index)); });
  document.querySelectorAll('.dot').forEach(dot => dot.addEventListener('click', () => carousel.scrollTo({ left: Number(dot.dataset.slide) * carousel.clientWidth * .82, behavior: 'smooth' })));
}

function catalog() {
  const query = new URLSearchParams(location.hash.split('?')[1] || '');
  app.innerHTML = `<section class="catalog-hero"><p class="eyebrow">Усі доступні приклади</p><h1>Каталог житла</h1></section><div class="catalog-layout">${filterPanel('catalog')}<section><div class="catalog-toolbar"><p class="result-count" id="result-count"></p><div class="view-switch" aria-label="Вигляд каталогу"><button class="active" type="button" data-view="grid">Список</button><button type="button" data-view="map">Карта</button></div></div><div id="catalog-results"></div></section></div>`;
  const form = document.querySelector('#catalog-filters');
  for (const [key, value] of query) if (form.elements[key]) form.elements[key].value = value;
  const renderResults = (view = 'grid') => {
    const list = filtered(readFilters(form)); const results = document.querySelector('#catalog-results');
    document.querySelector('#result-count').textContent = `Знайдено: ${list.length} ${list.length === 1 ? 'варіант' : 'варіантів'}`;
    results.innerHTML = view === 'map' ? '<div class="map-box catalog-map"><div class="map" id="catalog-map"></div><div class="map-legend">Дані на карті демонстраційні</div></div>' : list.length ? `<div class="catalog-grid">${list.map(listingCard).join('')}</div>` : '<div class="empty-state"><div><h2>Нічого не знайдено</h2><p>Змініть параметри пошуку або скиньте фільтри.</p></div></div>';
    if (view === 'map') createMap('catalog-map', groupedApartments(list));
  };
  form.addEventListener('submit', event => { event.preventDefault(); renderResults(); });
  form.addEventListener('reset', () => setTimeout(() => renderResults(), 0));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b === button)); renderResults(button.dataset.view); }));
  renderResults();
}

function groupedApartments(list) {
  const ids = new Set(list.map(item => item.type === 'room' ? item.apartmentId : item.id));
  return data.apartments.filter(item => ids.has(item.id));
}

function createMap(id, apartments) {
  const target = document.getElementById(id); if (!target) return;
  if (!window.L) { target.parentElement.insertAdjacentHTML('beforeend', '<div class="map-error">Не вдалося завантажити карту. Перевірте інтернет-зʼєднання та спробуйте ще раз.</div>'); return; }
  try {
    const map = L.map(target, { scrollWheelZoom: false, attributionControl: true }).setView([50.484, 30.501], 12);
    activeMaps.push(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>' }).addTo(map);
    apartments.forEach(apartment => {
      const rooms = data.rooms.filter(room => room.apartmentId === apartment.id);
      const available = rooms.filter(room => room.status === 'available');
      const roomText = rooms.length ? `<div class="map-popup-rooms"><strong>Кімнати у квартирі:</strong>${rooms.map(room => `<a href="${detailRoute(room)}">${safe(room.title)} · ${price(room)} · ${statusText(room.status)}</a>`).join('')}</div>` : '';
      const popup = `<div class="map-popup"><img src="${safe(primaryPhoto(apartment))}" alt=""><strong>${safe(apartment.title)}</strong><p>${safe(apartment.district)} · ${apartment.area} м² · ванна: ${safe(apartment.bathroomType.toLowerCase())}</p>${roomText}<a class="button" href="${detailRoute(apartment)}">Детальніше${available.length ? ` · ${available.length} кімн.` : ''}</a></div>`;
      L.marker(apartment.coordinates).addTo(map).bindPopup(popup);
    });
    if (apartments.length === 1) map.setView(apartments[0].coordinates, 14);
    setTimeout(() => map.invalidateSize(), 50);
  } catch (error) { console.warn('Map error', error); target.parentElement.insertAdjacentHTML('beforeend', '<div class="map-error">Карта тимчасово недоступна. Дані оголошень залишаються доступними.</div>'); }
}

function detail(type, id) {
  const item = byId(id);
  if (!item || item.type !== type) return notFound();
  const apartment = item.type === 'room' ? apartmentFor(item) : item;
  const relatedRooms = data.rooms.filter(room => room.apartmentId === apartment.id);
  const utilities = [['Інтернет', item.utilities.internet], ['Електрика', item.utilities.electricity], ['Газ', item.utilities.gas]];
  const info = [
    ['Площа', `${item.area} м²${item.type === 'room' ? ' кімната' : ' квартира'}`], ['Ванна кімната', item.bathroomType],
    ...(item.bathroomType === 'Спільна' ? [['Ванних у квартирі', item.bathrooms]] : []), ['Мешканців у квартирі', item.residents], ['Поверх', item.floor],
    ...utilities.map(([name, included]) => [name, included ? 'включено' : 'окремо'])
  ];
  app.innerHTML = `<nav class="breadcrumbs" aria-label="Хлібні крихти"><a href="#/">Головна</a> / <a href="#/catalog">Каталог</a> / ${kindText(item)}</nav><article class="detail"><div class="detail-top"><div><p class="eyebrow">${kindText(item)} · демонстраційне оголошення</p><h1>${safe(item.title)}</h1><p class="detail-description">${safe(item.description)}</p></div><div class="price-panel"><div class="price">${price(item)}</div><p>${safe(item.district)} · ${safe(item.address)}</p><a class="button button-light" href="mailto:hello@example.com?subject=${encodeURIComponent('Запит: ' + item.title)}">Звʼязатися щодо оголошення</a></div></div>
  <div class="gallery" aria-label="Галерея фотографій">${item.photos.slice(0, 3).map((photo, index) => `<figure class="${index === 0 ? 'gallery-main' : ''}"><button type="button" data-photo="${safe(photo)}" aria-label="Відкрити фото ${index + 1}"><img src="${safe(photo)}" alt="Демонстраційне фото ${index + 1}: ${safe(item.title)}"></button>${index === 2 ? `<span class="gallery-more">${item.photos.length} фото ↗</span>` : ''}</figure>`).join('')}</div>
  <div class="detail-layout"><div class="detail-content"><section><h2>Основне про житло</h2><div class="info-list">${info.map(([label, value]) => `<div class="info-item"><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`).join('')}</div></section><section><h2>Зручності</h2><div class="tags">${item.amenities.map(x => `<span class="tag">${safe(x)}</span>`).join('')}</div></section><section><h2>Умови проживання</h2><div class="tags">${item.conditions.map(x => `<span class="tag">${safe(x)}</span>`).join('')}</div></section>${item.type === 'room' ? `<section><h2>Квартира, до якої належить кімната</h2><p>Ця кімната є частиною <a href="${detailRoute(apartment)}"><strong>${safe(apartment.title)}</strong></a>. Перегляньте загальні умови квартири та всі доступні кімнати.</p><a class="button button-light" href="${detailRoute(apartment)}">Перейти до квартири</a></section>` : ''}</div>
  <aside class="detail-aside"><div class="aside-card"><h3>Що поруч</h3><p>🛒 Найближчий магазин: <strong>${safe(item.nearby.store)}</strong></p><p>🏋️ Спортзал: <strong>${safe(item.nearby.gym)}</strong></p><p><small>Відстані демонстраційні, не є навігаційними даними.</small></p></div><div class="detail-map"><div class="map" id="detail-map"></div><div class="map-legend">Локація демонстраційна</div></div>${relatedRooms.length ? `<div class="aside-card"><h3>${item.type === 'room' ? 'Інші кімнати квартири' : 'Кімнати у квартирі'}</h3><div class="related-list">${relatedRooms.map(room => `<a href="${detailRoute(room)}" class="related-item"><img src="${safe(primaryPhoto(room))}" alt=""><span><strong>${safe(room.title)}</strong><small>${room.area} м² · ${statusText(room.status)}</small></span><b class="price">${money.format(room.price)}</b></a>`).join('')}</div></div>` : ''}</aside></div></article>`;
  createMap('detail-map', [apartment]);
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => modal(button.dataset.photo, item.title)));
}

function modal(photo, title) { document.body.insertAdjacentHTML('beforeend', `<div class="modal" role="dialog" aria-modal="true" aria-label="Перегляд фото"><div class="modal-content"><button class="modal-close" aria-label="Закрити">×</button><img src="${safe(photo)}" alt="Демонстраційне фото: ${safe(title)}"></div></div>`); const m = document.querySelector('.modal'); m.querySelector('button').focus(); m.addEventListener('click', e => { if (e.target === m || e.target.matches('button')) m.remove(); }); }
function notFound() { app.innerHTML = '<section class="not-found"><p class="eyebrow">404</p><h1>Це оголошення не знайдено.</h1><p>Можливо, воно було видалене або посилання застаріло.</p><a href="#/catalog" class="button">До каталогу</a></section>'; }

function render() {
  resetMaps(); renderShell(); const path = location.hash.slice(1).split('?')[0] || '/';
  if (path === '/') home(); else if (path === '/catalog') catalog(); else { const [, type, id] = path.split('/'); if (type === 'room' || type === 'apartment') detail(type, id); else notFound(); }
  document.querySelector('#main-content').focus({ preventScroll: true });
}

async function init() {
  try { const response = await fetch('data/listings.json'); if (!response.ok) throw new Error('Data request failed'); data = await response.json(); render(); window.addEventListener('hashchange', render); window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true }); }
  catch (error) { console.error(error); app.innerHTML = '<section class="not-found"><p class="eyebrow">Помилка даних</p><h1>Не вдалося завантажити оголошення.</h1><p>Перевірте файл <code>data/listings.json</code> та перезапустіть локальний сервер.</p></section>'; }
}
init();
