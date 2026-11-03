// Interfaz y efectos. La lógica de la reserva vive en script.js.
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function go() { const r = $('#reservas'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }

// --- Galería ---
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=`;
const GALLERY = [
  [U('1604654894610-df63bc536371') + '600', 'Diseño elegante con detalles minimalistas', U('1604654894610-df63bc536371') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYcQEj5YmXdQIQ35eeQpYTPHQI-6WVLuIeTDEFnDdsHAKbeFogBjBzVkQ&s=10', 'Decoraciones a mano alzada', U('1522337360788-8b13dee7a37e') + '800'],
  [U('1519014816548-bf5fe059798b') + '600', 'Acrílicas esculpidas en rosado clásico', U('1519014816548-bf5fe059798b') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM0jIkc9YkhoE2O2FNo68JR5aN5y7GcCjvZs9o_5-Q-tbCxt5w_fYuo5h&s=10', 'Efecto ojo de gato con brillo', U('1632345031435-8777f6b9ae8c') + '800'],
  [U('1607779097040-26e80aa78e66') + '600', 'Tonos nude con detalles dorados', U('1607779097040-26e80aa78e66') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSac9d1EqQiq-mBRftVzAHoqzc8YP79W2LexpabpEuQCYIophe3nsGoZ9Gv&s=10', 'Manicura francesa de precisión', U('1599940824399-b87987ceb72a') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqLQ9VdqCwZOH16nhOHiciu-W0v8wfAIzHlrghwQdHQqPjtN9MXlk1TJC0&s=10', 'Uñas esculpidas con efecto encapsulado', U('1512496015851-a90fb38ba796') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqSavoG7EV_8HzeRWur8BsjWKpZThZUFfcfjJ3-0CMFw&s=10', 'Brillo con cristales profesionales', U('1583394838336-acd977736f90') + '800'],
  ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaFZ5gMbv5ShAfps9uELbJPYSsyizH9lymfuvInOywm9Md9wvGbB0UI0Dx&s=10', 'Acabado y limado profesional', U('1631729371254-42c2892f0e6e') + '800']
];
const gal = $('#gallery');
GALLERY.forEach(([thumb, cap, big]) => {
  const f = document.createElement('figure');
  f.innerHTML = `<img src="${thumb}" alt="${cap}" loading="lazy"><figcaption>Ver foto</figcaption>`;
  f.onclick = () => openGalleryModal(big, cap);
  gal.appendChild(f);
});

// --- Color de esmalte: cambia el acento de toda la página ---
document.querySelectorAll('#swatches button').forEach(b => b.addEventListener('click', () => {
  document.documentElement.style.setProperty('--accent', b.dataset.c);
  document.documentElement.style.setProperty('--accent-d', b.dataset.d);
  document.querySelectorAll('#swatches button').forEach(x => x.classList.toggle('on', x === b));
}));

// --- Cursor de esmalte (solo escritorio) ---
const cur = $('#cursor');
if (cur && matchMedia('(hover: hover)').matches && !reduce) {
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  (function loop() { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,label,figure')));
}

// --- La barra se esconde al bajar y vuelve al subir ---
const nav = $('#nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('hide', y > lastY && y > 300 && $('#mobile-menu').classList.contains('hidden'));
  lastY = y;
}, { passive: true });

// --- Aparición al hacer scroll ---
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.sec-head, .services .card, .masonry figure, .artist, .wizard, .contact .card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 4) * 80 + 'ms';
  io.observe(el);
});

// --- Calendario moderno ---
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const SLOTS = [['09:00', '9:00 AM'], ['10:30', '10:30 AM'], ['12:00', '12:00 PM'], ['14:00', '2:00 PM'], ['15:30', '3:30 PM'], ['17:00', '5:00 PM']];
const dateIn = $('#booking-date'), timeIn = $('#booking-time');
const today = new Date(); today.setHours(0, 0, 0, 0);
let view = new Date(today.getFullYear(), today.getMonth(), 1);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function renderCal() {
  $('#calTitle').textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
  $('#calPrev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
  const grid = $('#calGrid');
  grid.innerHTML = '';
  const offset = (view.getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('span'));
  const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  for (let n = 1; n <= total; n++) {
    const d = new Date(view.getFullYear(), view.getMonth(), n);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'day' + (d.getTime() === today.getTime() ? ' today' : '') + (iso(d) === dateIn.value ? ' sel' : '');
    b.textContent = n;
    b.disabled = d < today || d.getDay() === 0;
    b.onclick = () => { dateIn.value = iso(d); timeIn.value = ''; renderCal(); renderTimes(d); };
    grid.appendChild(b);
  }
}

function renderTimes(d) {
  const box = $('#times'), label = $('#pickLabel');
  box.innerHTML = '';
  if (!d) { label.textContent = 'Primero elige un día'; return; }
  label.textContent = `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  const now = new Date();
  SLOTS.forEach(([val, txt]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (timeIn.value === val ? ' sel' : '');
    b.textContent = txt;
    const [h, m] = val.split(':').map(Number);
    b.disabled = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m) < now;
    b.onclick = () => { timeIn.value = val; box.querySelectorAll('.slot').forEach(s => s.classList.toggle('sel', s === b)); };
    box.appendChild(b);
  });
}

$('#calPrev').onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); };
$('#calNext').onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); };
$('#booking-form').addEventListener('reset', () => setTimeout(() => { dateIn.value = ''; timeIn.value = ''; renderCal(); renderTimes(null); }, 0));
renderCal();
