(() => {
'use strict';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const doc = document.documentElement;
if (RM) doc.classList.add('rm');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inFmt = n => Math.round(n).toLocaleString('en-IN');
const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

/* ================= smooth inertial scroll (Lenis) ================= */
let lenis = null;
if (!RM && HAS_GSAP && window.Lenis) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = $(id); if (!t) return; e.preventDefault();
  lenis ? lenis.scrollTo(t, { offset: -10, duration: 1.6 }) : t.scrollIntoView();
}));

/* ================= progress bar + nav ================= */
const bar = $('.progress span'), nav = $('.nav');
function chrome() {
  const y = scrollY, h = doc.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h ? y / h : 0})`;
  nav.classList.toggle('solid', y > 40);
}
addEventListener('scroll', chrome, { passive: true }); chrome();

/* ================= hero chakra spokes ================= */
const NS = 'http://www.w3.org/2000/svg';
const spokes = $('.hero-chakra .spokes');
for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180, l = document.createElementNS(NS, 'line');
  l.setAttribute('x1', 200 + Math.cos(a) * 40); l.setAttribute('y1', 200 + Math.sin(a) * 40);
  l.setAttribute('x2', 200 + Math.cos(a) * 150); l.setAttribute('y2', 200 + Math.sin(a) * 150); spokes.appendChild(l); }
const sp24 = $('#spokes24');
for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180, l = document.createElementNS(NS, 'line');
  l.setAttribute('x1', Math.cos(a) * 95); l.setAttribute('y1', Math.sin(a) * 95);
  l.setAttribute('x2', Math.cos(a) * 190); l.setAttribute('y2', Math.sin(a) * 190); sp24.appendChild(l); }

/* ================= split text ================= */
function split(el) {
  [...el.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const i = document.createElement('span'); i.textContent = tok; w.appendChild(i); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.classList.contains('w')) split(n);
  });
}
$$('.split').forEach(split);

/* ================= counters + reveals ================= */
function count(el) {
  if (el.done) return; el.done = 1;
  const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const fmt = el.dataset.format === 'in' ? inFmt : n => Math.round(n);
  const ring = el.closest('.ring'), target = ring ? +ring.style.getPropertyValue('--p') : 0;
  if (RM) { el.textContent = pre + fmt(end) + suf; if (ring) ring.style.setProperty('--v', target); return; }
  const o = { k: 0 };
  gsap.to(o, { k: 1, duration: 2, ease: 'power4.out', onUpdate() {
    el.textContent = pre + fmt(end * o.k) + suf; if (ring) ring.style.setProperty('--v', (target * o.k).toFixed(1)); } });
}
const showEl = el => { el.classList.add('in'); $$('[data-count]', el).forEach(count); if (el.dataset.count) count(el); };

if (RM || !HAS_GSAP) {
  $$('.reveal').forEach(showEl); $$('[data-count]').forEach(count);
} else {
  ScrollTrigger.batch('.reveal', { start: 'top 90%', once: true,
    onEnter: b => b.forEach((el, i) => setTimeout(() => showEl(el), i * 90)) });
  // split headline reveals
  $$('.split').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from($$('.w>span', el), { yPercent: 115, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  // hero intro
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from('.hero h1 .w>span', { yPercent: 120, rotate: 6, duration: 1.4, ease: 'expo.out', stagger: 0.06 })
    .from('.hero .hl', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 }, 0.2)
    .from('.hero-chakra', { scale: 0.7, opacity: 0, rotate: -40, duration: 2.4, ease: 'expo.out' }, 0);
  // parallax depth layers in hero
  $$('[data-depth]').forEach(el => gsap.to(el, { y: () => innerHeight * +el.dataset.depth, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
  gsap.to('.hero-chakra', { rotate: 120, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-copy', { y: -80, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
  gsap.to('.hero-stage', { y: -140, scale: 0.92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
  // section curtains
  $$('.curtain').forEach(sec => gsap.fromTo(sec, { clipPath: 'inset(5% 3% 0% 3% round 48px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 25%', scrub: true } }));
  // card depth parallax
  $$('.cards .card').forEach((c, i) => gsap.fromTo(c, { y: 60 + i * 40 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.cards', start: 'top bottom', end: 'center center', scrub: true } }));
}

/* ================= tilt micro-interaction ================= */
if (!RM && matchMedia('(hover:hover)').matches) $$('.tilt').forEach(c => {
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
    c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
  });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* ================= hero sorting loop (4 streams) ================= */
(function heroLoop() {
  const svg = $('#sorter'), item = $('#item'), chute = $('#chute'), beam = $('#beam'), flashc = $('#flashc'),
        tag = $('#tag'), tagtxt = $('#tagtxt'), cap = $('#caption'), lens = $('#lens'), ir = $('#ir');
  const ITEMS = [
    { k: 0, label: 'BIODEGRADABLE', name: 'banana peel → compost', svg: '<path d="M-14 4 C-10 -12 8 -14 14 -6 C6 -8 -4 -4 -8 8 Z" fill="#d9c34a" stroke="#8a7a1c"/><path d="M-8 8 C-12 12 -16 10 -14 4" fill="#6b5a18"/>' },
    { k: 1, label: 'PAPER', name: 'newspaper → pulping', svg: '<g transform="rotate(-8)"><rect x="-14" y="-10" width="28" height="20" rx="2" fill="#efe9db" stroke="#a9a28f"/><g stroke="#8d8676" stroke-width="1.2"><line x1="-10" y1="-5" x2="10" y2="-5"/><line x1="-10" y1="0" x2="6" y2="0"/><line x1="-10" y1="5" x2="8" y2="5"/></g></g>' },
    { k: 2, label: 'DRY WASTE', name: 'chips wrapper → dry', svg: '<path d="M-14 -6 L14 -8 L12 8 L-12 7 Z" fill="#c8417a" stroke="#ffb3d1"/><path d="M-14 -6 l-4 -3 M14 -8 l4 -3 M12 8 l4 3 M-12 7 l-4 3" stroke="#ffb3d1"/>' },
    { k: 3, label: 'WET WASTE', name: 'oily food box → wet', svg: '<path d="M-13 -9 h26 v18 h-26z" fill="#d8c3a0" stroke="#8b6f47"/><ellipse cx="3" cy="2" rx="7" ry="4" fill="#9a6b2f" opacity=".75"/><path d="M-13 -9 l6 -5 h26 l-6 5" fill="#e6d4b4" stroke="#8b6f47"/>' },
  ];
  const BINX = [93, 177, 263, 347], COL = ['#4caf6a', '#4a8fe0', '#e0604a', '#26a69a'];
  const ANG = BINX.map(x => Math.atan2(220 - x, 100) * 180 / Math.PI);
  const fills = [0, 0, 0, 0];
  const ease = { out: k => 1 - Math.pow(1 - k, 3), inq: k => k * k, io: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2 };
  const tween = (dur, fn, e = ease.io) => new Promise(res => { const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / dur); fn(e(k)); k < 1 ? requestAnimationFrame(f) : res(); })(t0); });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const place = (x, y, r = 0, s = 1) => item.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${s})`);
  let visible = true; new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(svg);
  async function cycle(it) {
    item.innerHTML = it.svg; item.style.opacity = 1; cap.textContent = 'item detected…';
    await tween(900, k => place(20 + 200 * k, 150 - 60 * Math.sin(Math.PI * k) + 55 * k, -120 + 120 * k), ease.out);
    ir.setAttribute('opacity', '1'); ir.setAttribute('stroke', '#ffd1cc');
    cap.textContent = 'ESP32-CAM capturing…'; lens.setAttribute('fill', '#fff');
    await tween(220, k => { flashc.setAttribute('opacity', k); beam.setAttribute('opacity', .22 * k); });
    await tween(380, k => flashc.setAttribute('opacity', 1 - k));
    lens.setAttribute('fill', '#3ad08a'); cap.textContent = 'AI classifying…';
    await wait(450);
    tagtxt.textContent = it.label; tag.querySelector('rect').setAttribute('stroke', COL[it.k]); tagtxt.style.fill = COL[it.k];
    await tween(300, k => { tag.setAttribute('opacity', k); beam.setAttribute('opacity', .22 * (1 - k)); });
    cap.textContent = 'servo routing: ' + it.name;
    chute.style.transform = `rotate(${ANG[it.k]}deg)`; ir.setAttribute('opacity', '.55'); ir.setAttribute('stroke', '#ff5a4e');
    await wait(650);
    const a = ANG[it.k] * Math.PI / 180, ex = 220 - Math.sin(a) * 66, ey = 250 + Math.cos(a) * 66;
    await tween(420, k => place(220 + (ex - 220) * k, 205 + (ey - 205) * k, 0, 1 - .1 * k), ease.inq);
    await tween(480, k => place(ex + (BINX[it.k] - ex) * k, ey + (450 - ey) * k, 90 * k, .9 - .2 * k), ease.inq);
    item.style.opacity = 0;
    fills[it.k] = fills[it.k] >= 60 ? 8 : fills[it.k] + 10;
    const f = $('#fill' + it.k), h0 = +f.getAttribute('height'), h1 = fills[it.k];
    tween(500, k => { const h = Math.max(0, h0 + (h1 - h0) * k); f.setAttribute('height', h); f.setAttribute('y', 466 - h); }, ease.out);
    cap.textContent = 'sorted ✓ — logged for our study';
    await tween(300, k => tag.setAttribute('opacity', 1 - k));
    chute.style.transform = 'rotate(0deg)';
    await wait(900);
  }
  if (RM) { place(220, 205); item.innerHTML = ITEMS[1].svg; tag.setAttribute('opacity', 1); tagtxt.textContent = 'PAPER'; cap.textContent = 'paper → pulping unit'; return; }
  (async () => { let i = 0; while (true) { if (!visible || document.hidden) { await wait(400); continue; } await cycle(ITEMS[i++ % 4]); } })();
})();

/* ================= pinned horizontal "how" ================= */
const track = $('.track'), howBar = $('.how-bar span'), steps = $$('.track .step');
if (!RM && HAS_GSAP) {
  const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 40);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
    trigger: '#how', start: 'top top', end: () => '+=' + (dist() + innerHeight * 0.6), pin: true, scrub: 1, invalidateOnRefresh: true,
    onUpdate: s => { howBar.style.transform = `scaleX(${s.progress})`; steps.forEach((st, i) => st.classList.toggle('lit', s.progress >= i / steps.length - 0.02)); } } });
  gsap.from(steps, { opacity: 0, y: 60, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#how', start: 'top 70%', once: true } });
} else steps.forEach(s => s.classList.add('lit'));

/* ================= chakra wheel ================= */
const chItems = $$('.ch-list li');
if (!RM && HAS_GSAP) {
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#chakra', start: 'top top', end: '+=180%', pin: true, scrub: 1.2,
    onUpdate: s => { const k = Math.min(3, Math.floor(s.progress * 4)); chItems.forEach((li, i) => li.classList.toggle('on', i <= k)); } } });
  const nodes = $$('#orbit .node'), orb = { a: 0 };
  const placeNodes = () => nodes.forEach((n, i) => { const a = orb.a + i * 90; n.setAttribute('transform', `rotate(${a}) translate(0,-215) rotate(${-a})`); });
  placeNodes();
  tl.to(orb, { a: 360, ease: 'none', onUpdate: placeNodes }, 0)
    .to('#spokes24', { rotation: -180, svgOrigin: '0 0', ease: 'none' }, 0)
    .fromTo('#ring-arc', { attr: { 'stroke-dasharray': '0 100' } }, { attr: { 'stroke-dasharray': '100 0' }, ease: 'none' }, 0)
    .fromTo('#phoenix', { scale: 0.85, opacity: .6, svgOrigin: '0 0' }, { scale: 1.05, opacity: 1, svgOrigin: '0 0', ease: 'sine.inOut' }, 0);
  gsap.to('#ring-outer', { rotation: 360, svgOrigin: '0 0', duration: 60, repeat: -1, ease: 'none' });
} else chItems.forEach(li => li.classList.add('on'));

/* ================= render tabs ================= */
const img = $('#renderimg');
$$('.tabbar button').forEach(b => b.addEventListener('click', () => {
  $$('.tabbar button').forEach(x => x.classList.toggle('on', x === b));
  img.classList.add('fade');
  setTimeout(() => { img.src = b.dataset.img; img.onload = () => img.classList.remove('fade'); }, 250);
}));

/* ================= three.js shared ================= */
if (!window.THREE || !window.BIN_PARTS) return;
function b64f(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Float32Array(u.buffer); }
const GEOS = BIN_PARTS.map(p => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(b64f(p.pos), 3)); g.computeVertexNormals(); return g; });
function makeRenderer(host) {
  let r; try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  r.setPixelRatio(Math.min(devicePixelRatio, 1.75)); r.outputEncoding = THREE.sRGBEncoding; host.appendChild(r.domElement); return r;
}
function buildModel(root, opts = {}) {
  const meshes = [];
  BIN_PARTS.forEach((p, i) => {
    const shell = p.id === 1;
    const m = new THREE.MeshStandardMaterial({ color: p.color, roughness: shell ? .2 : .5, metalness: p.id === 16 ? .55 : .1,
      transparent: true, opacity: shell ? .13 : Math.max(p.alpha, .8), depthWrite: !shell, side: shell ? THREE.DoubleSide : THREE.FrontSide,
      emissive: new THREE.Color(p.color), emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(GEOS[i], m); mesh.userData = p; root.add(mesh); meshes.push(mesh);
    if (shell) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(GEOS[i], 30), new THREE.LineBasicMaterial({ color: 0x5fd08f, transparent: true, opacity: .25 })));
  });
  return meshes;
}
function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xf2ecdc, 0x1a2a20, 0.85));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.0); key.position.set(800, 1500, 900); scene.add(key);
  const rim = new THREE.DirectionalLight(0x5fd08f, 0.6); rim.position.set(-1200, 400, -800); scene.add(rim);
}
const onScreen = el => { const s = { v: false }; new IntersectionObserver(([e]) => s.v = e.isIntersecting, { rootMargin: '100px' }).observe(el); return s; };

/* ================= JOURNEY: scroll-driven fly-through ================= */
(function journey() {
  const host = $('#fly'); const renderer = makeRenderer(host); if (!renderer) return;
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x070a09, 2600, 6000);
  const cam = new THREE.PerspectiveCamera(40, 1, 5, 12000);
  lights(scene);
  const hoodLight = new THREE.PointLight(0xfff3c4, 0, 600); scene.add(hoodLight);
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; root.position.y = -480; scene.add(root);
  const meshes = buildModel(root);
  const byId = id => meshes.find(m => m.userData.id === id);
  const shell = byId(1), lid = byId(15), panel = byId(16), hood = byId(14);
  const BINS = [9, 10, 11, 18].map(byId), BX = [-186, -62, 62, 186], BCOL = [0x4caf6a, 0x4a8fe0, 0xe0604a, 0x26a69a];
  // floor grid
  const grid = new THREE.GridHelper(4000, 40, 0x1d2a23, 0x121a16); grid.position.y = -482; scene.add(grid);
  // dust particles (depth layer)
  const pg = new THREE.BufferGeometry(), N = 500, pa = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pa[i * 3] = (Math.random() - .5) * 3000; pa[i * 3 + 1] = Math.random() * 1800 - 500; pa[i * 3 + 2] = (Math.random() - .5) * 3000; }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xe8b44a, size: 4, transparent: true, opacity: .35, depthWrite: false }));
  scene.add(dust);
  // the travelling item
  const item = new THREE.Mesh(new THREE.IcosahedronGeometry(26, 1), new THREE.MeshStandardMaterial({ color: 0xf2ecdc, emissive: 0xf2ecdc, emissiveIntensity: .35, roughness: .4, flatShading: true }));
  root.add(item);
  const trail = new THREE.PointLight(0xffffff, 0.8, 380); item.add(trail);

  root.updateMatrixWorld(true);
  const W = (x, y, z) => root.localToWorld(new THREE.Vector3(x, y, z));
  // keyframes: camera pos / target in CAD mm, explode, shell opacity
  const K = [
    { p: [1500, -1800, 1150], t: [0, 0, 480], ex: 0, sh: .13 },     // 0 overview
    { p: [520, -760, 1320], t: [0, 20, 820], ex: 0, sh: .1 },       // 1 drop
    { p: [260, -420, 1000], t: [0, 20, 790], ex: 0, sh: .04 },         // 2 inside hood
    { p: [300, -420, 640], t: [0, 20, 560], ex: 0, sh: .03 },       // 3 chute
    { p: [BX[0] + 520, -1150, 820], t: [BX[0], 20, 420], ex: 0, sh: .03 }, // 4 A
    { p: [BX[1] + 520, -1150, 820], t: [BX[1], 20, 420], ex: 0, sh: .03 }, // 5 B
    { p: [BX[2] + 520, -1150, 820], t: [BX[2], 20, 420], ex: 0, sh: .03 }, // 6 C
    { p: [BX[3] + 520, -1150, 820], t: [BX[3], 20, 420], ex: 0, sh: .03 }, // 7 D
    { p: [1750, -2000, 1700], t: [0, 0, 760], ex: 1, sh: .08 },     // 8 exploded
  ];
  const posCurve = new THREE.CatmullRomCurve3(K.map(k => W(...k.p)), false, 'centripetal', 0.5);
  const tgts = K.map(k => W(...k.t));
  const S = K.length - 1;
  const st = { t: 0 }, smooth = { t: 0 };
  const sm = x => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const caps = $$('.cap'), dots = $$('.j-dots i'); let curCap = -1;
  function setCap(i) {
    if (i === curCap) return; const prev = caps[curCap]; curCap = i;
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    if (RM || !HAS_GSAP) return;
    gsap.killTweensOf(caps);
    caps.forEach((c, j) => { if (j !== i && c !== prev) gsap.set(c, { opacity: 0, y: 28 }); });
    const tl = gsap.timeline();
    if (prev) tl.to(prev, { opacity: 0, y: -24, duration: .3, ease: 'power2.in' });
    tl.fromTo(caps[i], { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out' });
  }
  function frameAt(t) {
    const seg = Math.min(S - 1, Math.floor(t)), k = sm(t - seg);
    // camera along spline (map t to curve param by segment)
    const u = Math.min(1, (seg + k) / S);
    cam.position.copy(posCurve.getPoint(u));
    const tg = tgts[seg].clone().lerp(tgts[seg + 1], k);
    // portrait: pull back
    if (cam.aspect < 1) cam.position.sub(tg).multiplyScalar(1 / Math.pow(cam.aspect, .55)).add(tg);
    cam.lookAt(tg);
    const ex = lerp(K[seg].ex, K[seg + 1].ex, k), sh = lerp(K[seg].sh, K[seg + 1].sh, k);
    meshes.forEach(m => m.position.z = m.userData.tier * 240 * ex);
    shell.material.opacity = sh; shell.children[0].material.opacity = sh * 2;
    const inside = t > 1.4 && t < 7.6;
    lid.material.opacity = inside ? .12 : .8; panel.material.opacity = inside ? .15 : .95; hood.material.opacity = (t > 1.5 && t < 3) ? .3 : .7;
    // item path
    let ip = null, col = 0xf2ecdc;
    if (t < .5) ip = null;
    else if (t < 1.6) { const q = sm(Math.min(1, (t - .5) / 1.1)); ip = [0, 20, lerp(1200, 800, q)]; }
    else if (t < 2.6) ip = [0, 20, 790 + Math.sin(t * 9) * 4];
    else if (t < 3.6) { const q = sm((t - 2.6)); ip = [0, 20, lerp(790, 600, q)]; }
    else if (t < 7.6) { const b = Math.min(3, Math.floor(t - 3.6)), q = sm(Math.min(1, (t - 3.6 - b) * 1.3)); col = BCOL[b];
      ip = [lerp(0, BX[b], q), 20, lerp(600, 330, q * q)]; }
    item.visible = !!ip;
    if (ip) { item.position.set(...ip); item.rotation.set(t * 3, t * 2, 0); item.material.color.setHex(col); item.material.emissive.setHex(col); trail.color.setHex(col); }
    // flash in hood
    hoodLight.position.copy(W(0, 20, 860)); hoodLight.intensity = t > 1.9 && t < 2.4 ? 1.6 * Math.sin((t - 1.9) / .5 * Math.PI) : 0;
    // highlight active bin
    BINS.forEach((m, i) => m.material.emissiveIntensity = (t > 3.6 + i && t < 4.6 + i) ? .5 : 0);
    dust.rotation.y = t * .15;
    setCap(Math.min(S, Math.round(t)));
  }
  function size() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); frameAt(smooth.t); }
  new ResizeObserver(size).observe(host); size();
  if (RM || !HAS_GSAP) { st.t = smooth.t = S; frameAt(S); caps.forEach(c => c.style.opacity = 1); renderer.render(scene, cam); return; }
  ScrollTrigger.create({ trigger: '#journey', start: 'top top', end: () => '+=' + innerHeight * 8, pin: true, scrub: true, refreshPriority: 10,
    onUpdate: s => st.t = s.progress * S });
  setCap(0);
  const vis = onScreen(host);
  gsap.ticker.add(() => {
    if (!vis.v) return;
    smooth.t += (st.t - smooth.t) * 0.12;
    frameAt(smooth.t);
    renderer.render(scene, cam);
  });
})();

/* ================= interactive viewer ================= */
(function viewer() {
  const host = $('#three'); const renderer = makeRenderer(host);
  if (!renderer) { host.innerHTML = '<p style="padding:2rem;color:#9aa49d">3D view needs WebGL — see the renders below.</p>'; return; }
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 10, 12000);
  cam.position.set(1300, 900, 1500);
  const controls = new THREE.OrbitControls(cam, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: .08, enablePan: false, autoRotate: !RM, autoRotateSpeed: 1.1, minDistance: 700, maxDistance: 4500 });
  lights(scene);
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; root.position.y = -800; scene.add(root);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(700, 64), new THREE.MeshBasicMaterial({ color: 0x5fd08f, transparent: true, opacity: .05 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -805; scene.add(ground);
  const meshes = buildModel(root), list = $('#partlist');
  meshes.forEach(mesh => { const p = mesh.userData, li = document.createElement('li');
    li.innerHTML = `<i style="background:${p.color}"></i>${p.id}. ${p.name}`;
    li.onmouseenter = () => hi(mesh, true); li.onmouseleave = () => hi(mesh, false); list.appendChild(li); p.li = li; });
  const base = m => m.userData.id === 1 ? .13 : Math.max(m.userData.alpha, .8);
  function hi(m, on) { meshes.forEach(x => { if (x.userData.id !== 1) x.material.emissiveIntensity = (on && x === m) ? .55 : 0;
    x.material.opacity = on && x !== m && x.userData.id !== 1 ? .25 : base(x); }); m.userData.li.classList.toggle('on', on); }
  let exT = 0, exV = 0;
  $('#explode').addEventListener('input', e => exT = +e.target.value);
  $('#shell').addEventListener('change', e => meshes[0].visible = e.target.checked);
  new IntersectionObserver(([e], o) => { if (e.isIntersecting && !RM) { setTimeout(() => { exT = .6; $('#explode').value = .6; }, 900); o.disconnect(); } }, { threshold: .4 }).observe(host);
  const ray = new THREE.Raycaster(), mp = new THREE.Vector2(); let hov = null;
  renderer.domElement.addEventListener('pointermove', e => {
    const r = renderer.domElement.getBoundingClientRect(); mp.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(mp, cam); const hit = ray.intersectObjects(meshes.filter(m => m.userData.id !== 1 && m.visible))[0];
    const m = hit ? hit.object : null; if (m !== hov) { if (hov) hi(hov, false); if (m) hi(m, true); hov = m; } });
  renderer.domElement.addEventListener('pointerleave', () => { if (hov) hi(hov, false); hov = null; });
  function size() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    cam.position.setLength(3100 / Math.min(1, cam.aspect * 1.1)); }
  new ResizeObserver(size).observe(host); size();
  const vis = onScreen(host);
  (function anim() { requestAnimationFrame(anim); if (!vis.v) return;
    exV += (exT - exV) * (RM ? 1 : .07); meshes.forEach(m => m.position.z = m.userData.tier * 220 * exV);
    controls.update(); renderer.render(scene, cam); })();
})();

if (HAS_GSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }); }
})();
/* ================= companion: one peel's journey through the whole site ================= */
(function companion() {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM || !window.gsap || !window.ScrollTrigger) return;
  const el = document.getElementById('companion'), chip = el.querySelector('.chip');
  const peel = el.querySelector('.peel-art'), soil = el.querySelector('.soil-art');
  // [selector, x(vw), y(vh), scale, rotate, label, opacity, soil?]
  const CH = [
    ['#stats',   86, 62, 1,   -20, 'Ch.1 · one of 1,70,339 tonnes', 1],
    ['#problem', 88, 30, 1,    15, 'Ch.1 · tossed in unsorted', 1],
    ['#journey', 50, 20, .4,    0, 'into the intake…', 0],
    ['#how',     90, 22, .9,  -10, 'Ch.6 · sorted: biodegradable', 1],
    ['#chakra',  73, 50, 1.2,   0, 'Ch.7 · now compost → soil', 1, 1],
    ['#model',   90, 24, .9,   10, 'Ch.8 · compartment A', 1, 1],
    ['#circuit', 91, 26, .8,  -10, 'Ch.9 · solar-powered trip', 1, 1],
    ['#specs',   90, 24, .8,    0, 'Ch.10 · under ₹6,000', 1, 1],
    ['#study',   88, 24, .9,   10, 'Ch.11 · counted in our trial', 1, 1],
    ['.life',    86, 30, 1,     0, 'Ch.12 · Mission LiFE', 1, 1],
    ['#refs',    92, 20, .7,    0, 'every fact sourced', .9, 1],
  ];
  const go = (c) => {
    const [, x, y, s, r, label, o, isSoil] = c;
    gsap.to(el, { x: () => innerWidth * x / 100 - 55, y: () => innerHeight * y / 100 - 55, scale: s, rotate: r, opacity: o,
      duration: 1.3, ease: 'expo.inOut', overwrite: 'auto' });
    gsap.to(peel, { opacity: isSoil ? 0 : 1, duration: .6 }); gsap.to(soil, { opacity: isSoil ? 1 : 0, duration: .6 });
    chip.textContent = label;
  };
  gsap.set(el, { x: innerWidth * .5, y: innerHeight * .2, scale: .5, opacity: 0 });
  // hide while in hero (the hero loop has its own items)
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 60%', onEnterBack: () => gsap.to(el, { opacity: 0, scale: .5, duration: .6 }) });
  CH.forEach(c => ScrollTrigger.create({ trigger: c[0], start: 'top 55%', end: 'bottom 55%',
    onEnter: () => go(c), onEnterBack: () => go(c) }));
  // gentle idle float
  gsap.to(el.querySelector('.peel'), { y: -8, rotate: 6, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  ScrollTrigger.refresh();
})();
