/* Philip Apartment static directory. Listing facts live in data/listings.json. */
const app = document.querySelector('#app');
const header = document.querySelector('#site-header');
const footer = document.querySelector('#site-footer');
let data;
let activeMaps = [];
const money = new Intl.NumberFormat('uk-UA');
const statusOrder = { available: 0, upcoming: 1, occupied: 2 };
const unknown = 'Потрібно уточнити';
const safe = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]);
const roomRoute = room => `#/room/${room.id}`;
const byRoomId = id => data.rooms.find(room => room.id === id);
const apartmentFor = room => data.apartments.find(apartment => apartment.id === room.apartmentId);
const roomsFor = apartment => data.rooms.filter(room => room.apartmentId === apartment.id).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
const known = value => value !== null && value !== undefined && value !== '';
const display = value => known(value) ? value : unknown;
const roomPrice = room => known(room.price) ? `${money.format(room.price)} ${room.currency}` : 'Ціна уточнюється';
const amount = (value, currency) => known(value) ? `${money.format(value)} ${currency}` : unknown;
const primaryPhoto = room => room.photos?.[0] || '';
const photoMarkup = (room, alt, className = '') => {
  const photo = primaryPhoto(room);
  return photo ? `<img class="${className}" src="${safe(photo)}" alt="${safe(alt)}" loading="lazy">` : '<div class="photo-pending" aria-label="Фото очікується">Фото очікується</div>';
};
const resetMaps = () => { activeMaps.forEach(map => map.remove()); activeMaps = []; };
function statusLabel(room) { if (room.status === 'available') return 'Доступна'; if (room.status === 'upcoming') return `Вільна з ${room.availableFrom}`; return 'Зайнято'; }
function bool(value) { return value === null || value === undefined ? unknown : value ? 'Так' : 'Ні'; }
function contactCard(compact = false) {
  const contact = data.site.contact;
  const portrait = contact.photo ? `<img src="${safe(contact.photo)}" alt="${safe(contact.photoAlt)}">` : '<span class="portrait-fallback" aria-label="Фото Філіпа буде додано">Ф</span>';
  return `<section class="contact-card ${compact ? 'compact' : ''}"><div class="portrait">${portrait}</div><div><p class="contact-kicker">Звʼязок щодо кімнати</p><h2>${safe(contact.name)}</h2><a class="contact-phone" href="${safe(contact.phoneHref)}">${safe(contact.phone)}</a></div><a class="button" href="${safe(contact.phoneHref)}">Подзвонити</a></section>`;
}
function renderShell() {
  const contact = data.site.contact;
  header.innerHTML = `<nav class="nav" aria-label="Головна навігація"><a class="brand" href="#/" aria-label="Філіп Апартмент, головна"><span class="brand-symbol">⌂</span><span>Філіп<br><b>Апартмент</b></span></a><button class="menu-toggle" aria-expanded="false" aria-label="Відкрити меню">☰</button><div class="nav-links"><a href="#/" class="nav-link">Кімнати</a><a href="#/" data-scroll="locations" class="nav-link">Локації</a><a href="${safe(contact.phoneHref)}" class="nav-call">${safe(contact.phone)}</a></div></nav>`;
  footer.innerHTML = `<div class="footer-inner"><a class="brand brand-footer" href="#/"><span class="brand-symbol">⌂</span><span>Філіп<br><b>Апартмент</b></span></a>${contactCard(true)}<p class="map-credit">Карта: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a></p></div>`;
  header.querySelector('.menu-toggle').addEventListener('click', event => { const links = header.querySelector('.nav-links'); const open = links.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(open)); });
  header.querySelectorAll('[data-scroll]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); const go = () => document.querySelector(`#${link.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' }); if (location.hash !== '#/') { location.hash = '#/'; setTimeout(go, 80); } else go(); }));
}
function roomCard(room) {
  return `<article class="room-card"><a href="${roomRoute(room)}" aria-label="Відкрити ${safe(room.title)}"><div class="room-photo">${photoMarkup(room, `Фото кімнати: ${room.title}`)}<span class="room-status ${safe(room.status)}">${safe(statusLabel(room))}</span></div><div class="room-body"><h2>${safe(room.title)}</h2><dl class="room-summary"><div><dt>Вбиральня</dt><dd>${safe(display(room.bathroomType))}</dd></div><div><dt>Поверх</dt><dd>${safe(display(room.floor))}</dd></div><div><dt>Вулиця</dt><dd>${safe(room.address)}</dd></div><div><dt>Ціна</dt><dd>${safe(roomPrice(room))}</dd></div></dl></div></a></article>`;
}
function home() {
  const rooms = [...data.rooms].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  app.innerHTML = `<section class="intro"><p class="eyebrow">Кімнати для довгострокової оренди в Лісабоні</p><h1>Філіп Апартмент</h1><p>Оберіть кімнату, перегляньте відомі умови та звʼяжіться з Філіпом напряму.</p><p class="demo-notice">${safe(data.site.notice)}</p></section><section class="inventory" aria-labelledby="rooms-title"><div class="section-heading"><div><p class="eyebrow">Усі кімнати</p><h2 id="rooms-title">Вільні та майбутні варіанти</h2></div><div class="status-key" aria-label="Позначення статусів"><span><i class="key-dot available"></i>Доступна</span><span><i class="key-dot upcoming"></i>Вільна з дати</span><span><i class="key-dot occupied"></i>Зайнято</span></div></div><div class="room-grid">${rooms.map(roomCard).join('')}</div></section><section class="locations" id="locations"><div class="section-heading"><div><p class="eyebrow">Локації</p><h2>Кімнати на мапі</h2></div><p>Натисніть на точку, щоб переглянути кімнати за цією адресою. Вони впорядковані: доступні, вільні з дати, зайняті.</p></div><div class="map-wrap"><div id="home-map" class="map" aria-label="Мапа кімнат у Лісабоні"></div><div class="map-demo-label">Лісабон, Португалія</div></div></section><section class="contact-section">${contactCard()}</section>`;
  createApartmentMap('home-map');
}
function popupMarkup(apartment, index = 0) {
  const rooms = roomsFor(apartment); const room = rooms[index];
  return `<div class="map-popup" data-apartment="${safe(apartment.id)}" data-index="${index}"><div class="popup-photo">${photoMarkup(room, `Фото кімнати: ${room.title}`)}<span class="popup-count">${index + 1}/${rooms.length} кімнат</span></div><div class="popup-body"><span class="room-status ${safe(room.status)}">${safe(statusLabel(room))}</span><strong>${safe(room.title)}</strong><span class="popup-price">${safe(roomPrice(room))}</span><p>${safe(room.bathroomType)} · ${safe(room.floor)}</p><div class="popup-actions">${rooms.length > 1 ? '<button type="button" class="popup-arrow" data-popup-step="-1" aria-label="Попередня кімната">←</button><button type="button" class="popup-arrow" data-popup-step="1" aria-label="Наступна кімната">→</button>' : ''}<a href="${roomRoute(room)}" class="popup-link">Детальніше</a></div></div></div>`;
}
function createApartmentMap(targetId) {
  const target = document.getElementById(targetId); if (!target) return;
  if (!window.L) { target.parentElement.insertAdjacentHTML('beforeend', '<p class="map-error">Карта зараз недоступна. Спробуйте оновити сторінку.</p>'); return; }
  try {
    const map = L.map(target, { scrollWheelZoom: false }).setView([38.725, -9.143], 13); activeMaps.push(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>' }).addTo(map);
    data.apartments.forEach(apartment => L.marker(apartment.coordinates).addTo(map).bindPopup(() => popupMarkup(apartment), { maxWidth: 264 }));
    map.on('popupopen', event => bindPopupControls(event.popup.getElement(), map));
    setTimeout(() => map.invalidateSize(), 100);
  } catch (error) { console.warn(error); target.parentElement.insertAdjacentHTML('beforeend', '<p class="map-error">Карта зараз недоступна. Спробуйте оновити сторінку.</p>'); }
}
function bindPopupControls(element, map) {
  element.querySelectorAll('[data-popup-step]').forEach(button => button.addEventListener('click', () => { const popup = button.closest('[data-apartment]'); const apartment = data.apartments.find(item => item.id === popup.dataset.apartment); const rooms = roomsFor(apartment); const next = (Number(popup.dataset.index) + Number(button.dataset.popupStep) + rooms.length) % rooms.length; map.closePopup(); L.popup({ maxWidth: 264 }).setLatLng(apartment.coordinates).setContent(popupMarkup(apartment, next)).openOn(map); }));
}
function detail(id) {
  const room = byRoomId(id); if (!room) return notFound(); const apartment = apartmentFor(room); const related = roomsFor(apartment).filter(item => item.id !== room.id);
  const facts = [
    ['Ціна за місяць', roomPrice(room)], ['Задаток', amount(room.deposit, room.currency)], ['Комунальні входять у вартість', bool(room.utilitiesIncluded)], ['Договір підписується', bool(room.contract)], ['Пральна машина', display(room.washingMachine)], ['Холодильник', display(room.fridge)], ['Ванна чи душ', display(room.bathroomFixture)], ['Кількість вбиралень у квартирі', display(room.bathrooms)], ['Кімнат у квартирі', display(apartment.roomsForRent)], ['Підходить для курців', bool(room.smokingAllowed)], ['Можна з тваринами', bool(room.petsAllowed)]
  ];
  const gallery = room.photos.length ? room.photos.map((photo, index) => `<button type="button" class="${index === 0 ? 'gallery-main' : ''}" data-photo="${safe(photo)}" aria-label="Відкрити фото ${index + 1}"><img src="${safe(photo)}" alt="Фото ${index + 1}: ${safe(room.title)}"></button>`).join('') : '<div class="gallery-empty">Фото цієї кімнати очікується</div>';
  app.innerHTML = `<nav class="breadcrumbs"><a href="#/">Кімнати</a><span>›</span><span>${safe(room.title)}</span></nav><article class="room-detail"><div class="detail-title"><div><p class="eyebrow">${safe(statusLabel(room))}</p><h1>${safe(room.title)}</h1><p>${safe(room.description)}</p></div><a href="${safe(data.site.contact.phoneHref)}" class="button">Звʼязатися з Філіпом</a></div><div class="gallery">${gallery}</div><div class="detail-layout"><section class="facts"><h2>Деталі кімнати</h2><dl>${facts.map(([label, value]) => `<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join('')}</dl></section><aside><div class="detail-map-wrap"><div id="detail-map" class="map"></div><span>Точна локація</span></div>${contactCard()}</aside></div>${related.length ? `<section class="other-rooms"><div class="section-heading"><div><p class="eyebrow">Ця ж квартира</p><h2>Інші кімнати</h2></div></div><div class="room-grid">${related.map(roomCard).join('')}</div></section>` : ''}</article>`;
  createDetailMap('detail-map', room);
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => photoModal(button.dataset.photo, room.title)));
}
function createDetailMap(id, room) {
  const target = document.getElementById(id); if (!target || !window.L) return;
  const map = L.map(target, { scrollWheelZoom: false }).setView(room.coordinates, 15); activeMaps.push(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>' }).addTo(map); L.marker(room.coordinates).addTo(map).bindPopup(safe(room.title)).openPopup(); setTimeout(() => map.invalidateSize(), 100);
}
function photoModal(photo, title) { document.body.insertAdjacentHTML('beforeend', `<div class="modal" role="dialog" aria-modal="true" aria-label="Фото кімнати"><div><button type="button" class="modal-close" aria-label="Закрити">×</button><img src="${safe(photo)}" alt="Фото: ${safe(title)}"></div></div>`); const modal = document.querySelector('.modal'); modal.querySelector('button').focus(); modal.addEventListener('click', event => { if (event.target === modal || event.target.matches('button')) modal.remove(); }); }
function notFound() { app.innerHTML = '<section class="not-found"><p class="eyebrow">404</p><h1>Кімнату не знайдено</h1><a class="button" href="#/">До всіх кімнат</a></section>'; }
function render() { resetMaps(); renderShell(); const path = location.hash.slice(1) || '/'; const match = path.match(/^\/room\/([^?]+)/); if (match) detail(match[1]); else home(); document.querySelector('#main-content').focus({ preventScroll: true }); }
async function init() { try { const response = await fetch('data/listings.json'); if (!response.ok) throw new Error(); data = await response.json(); render(); addEventListener('hashchange', render); } catch { app.innerHTML = '<section class="not-found"><h1>Не вдалося завантажити дані кімнат.</h1></section>'; } }
init();
