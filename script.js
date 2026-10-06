(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t * t * (3 - 2 * t);

  /* ---------- UI helpers ---------- */
  $('#yr').textContent = new Date().getFullYear();
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Scene drawing ---------- */
  const GROUND = 790;
  const walker = id => `
  <g id="${id}"><g class="fig">
    <g class="armB"><rect x="-6" y="-196" width="12" height="74" rx="6" fill="#16203a"/><circle cx="0" cy="-124" r="7" fill="#f2c4a0"/></g>
    <g class="legB"><rect x="-8" y="-128" width="16" height="125" rx="7" fill="#2b3857"/><rect x="-8" y="-11" width="28" height="11" rx="5" fill="#e9e3d6"/></g>
    <rect x="-42" y="-206" width="30" height="72" rx="12" fill="#f26a1b"/>
    <rect x="-23" y="-208" width="46" height="88" rx="15" fill="#1f2a44"/>
    <rect x="-23" y="-134" width="46" height="8" fill="#f26a1b" opacity=".9"/>
    <rect x="-9" y="-222" width="18" height="18" rx="6" fill="#f2c4a0"/>
    <g class="legF"><rect x="-8" y="-128" width="16" height="125" rx="7" fill="#3b4a6b"/><rect x="-8" y="-11" width="28" height="11" rx="5" fill="#fff"/></g>
    <circle cx="0" cy="-246" r="27" fill="#f6cfae"/>
    <path d="M-28 -248c-2-24 14-34 30-32 18 2 28 16 24 30-8-12-20-14-30-12-10 2-18 8-24 14z" fill="#2a1e1a"/>
    <circle cx="13" cy="-243" r="3" fill="#2a1e1a"/>
    <path d="M10 -232q6 4 12 0" stroke="#c46a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g class="armF"><rect x="-6" y="-196" width="12" height="74" rx="6" fill="#26335a"/><circle cx="0" cy="-124" r="7" fill="#f6cfae"/></g>
  </g></g>`;

  const seated = (id, shirt, pants, hair, skin = '#f6cfae') => `
  <g id="${id}"><g class="fig">
    <rect x="-36" y="-122" width="8" height="74" rx="3" fill="#8a5a3a"/>
    <rect x="-30" y="-60" width="64" height="11" rx="4" fill="#8a5a3a"/>
    <rect x="-26" y="-50" width="7" height="50" fill="#6c4528"/><rect x="22" y="-50" width="7" height="50" fill="#6c4528"/>
    <rect x="-20" y="-136" width="40" height="82" rx="14" fill="${shirt}"/>
    <rect x="-20" y="-76" width="94" height="22" rx="10" fill="${pants}"/>
    <rect x="56" y="-76" width="20" height="76" rx="8" fill="${pants}"/>
    <rect x="58" y="-10" width="36" height="11" rx="5" fill="#fff"/>
    <circle cx="4" cy="-164" r="26" fill="${skin}"/>
    <path d="M-22 -166c-2-24 14-34 30-32 18 2 26 16 22 30-8-12-18-14-28-12-10 2-18 8-24 14z" fill="${hair}"/>
    <circle cx="16" cy="-161" r="3" fill="#2a1e1a"/>
    <path d="M2 -118 L66 -92" stroke="${shirt}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="68" cy="-91" r="7" fill="${skin}"/>
  </g></g>`;

  const desk = x => `
  <g>
    <rect x="${x - 50}" y="${GROUND - 92}" width="7" height="92" fill="#6c4528"/><rect x="${x + 44}" y="${GROUND - 92}" width="7" height="92" fill="#6c4528"/>
    <rect x="${x - 64}" y="${GROUND - 98}" width="128" height="12" rx="5" fill="#b98757"/>
    <rect x="${x - 40}" y="${GROUND - 112}" width="34" height="14" rx="2" fill="#f26a1b"/>
  </g>`;

  const windowsA = [0, 1, 2].map(r => [0, 1, 2, 3].map(c => {
    if (r === 2 && (c === 1 || c === 2)) return '';
    return `<rect x="${1020 + c * 130}" y="${380 + r * 110}" width="70" height="70" rx="8" fill="#a8d6ee"/><rect x="${1020 + c * 130}" y="${380 + r * 110}" width="70" height="70" rx="8" fill="url(#glare)"/>`;
  }).join('')).join('');

  const deskXs = [340, 600, 860, 1120];
  const peers = [
    ['#d4592a', '#2b3857', '#3a2a1f', '#f0c19c'],
    ['#2f7d6d', '#3b4a6b', '#1a1a1a', '#d9a47c'],
    ['#7a5bb5', '#2b3857', '#8a4b1f', '#f6cfae']
  ];

  const scene = $('#scene');
  scene.innerHTML = `
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="760"><stop offset="0" stop-color="#8fd0f1"/><stop offset="1" stop-color="#e9f6fb"/></linearGradient>
    <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>

  <!-- ===== INDOOR (classroom) ===== -->
  <g id="B">
    <rect x="-3000" y="-3000" width="7600" height="3790" fill="#f3e2c3"/>
    <rect x="-3000" y="560" width="7600" height="230" fill="#ead3ab"/>
    <rect x="-3000" y="${GROUND}" width="7600" height="3000" fill="#c58f5c"/>
    <rect x="-3000" y="${GROUND}" width="7600" height="10" fill="#a8764a"/>
    <g transform="translate(0 50)"><!-- board -->
    <rect x="110" y="190" width="520" height="250" rx="14" fill="#8a5a3a"/>
    <rect x="126" y="206" width="488" height="218" rx="8" fill="#2f5d50"/>
    <text x="370" y="290" text-anchor="middle" font-family="Fraunces,serif" font-size="46" fill="#fff" opacity=".92">Hoş geldin!</text>
    <text x="370" y="350" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-size="26" fill="#ffd2a8">Amaçla öğren, güvenle büyü</text>
    <rect x="150" y="436" width="440" height="10" rx="4" fill="#6c4528"/>
    <!-- window -->
    <rect x="740" y="170" width="300" height="270" rx="14" fill="#fff"/>
    <rect x="756" y="186" width="268" height="238" rx="8" fill="url(#sky)"/>
    <rect x="886" y="186" width="8" height="238" fill="#fff"/><rect x="756" y="300" width="268" height="8" fill="#fff"/>
    <circle cx="960" cy="240" r="26" fill="#ffd36b"/>
    </g><!-- clock -->
    <circle cx="1230" cy="250" r="44" fill="#fff" stroke="#1f2a44" stroke-width="6"/><path d="M1230 250V222M1230 250l20 12" stroke="#1f2a44" stroke-width="5" stroke-linecap="round"/>
    <!-- door (open to corridor) -->
    <rect x="1410" y="470" width="160" height="${GROUND - 470}" fill="#fff6e2"/>
    <rect x="1410" y="470" width="160" height="${GROUND - 470}" fill="none" stroke="#1f2a44" stroke-width="12"/>
    <rect x="1440" y="520" width="100" height="${GROUND - 520}" fill="#ffffff" opacity=".7"/>
    <!-- desks & peers -->
    ${deskXs.slice(0, 3).map((x, i) => `<g transform="translate(${x + 75} ${GROUND}) scale(-1 1)">${seated('peer' + i, ...peers[i])}</g>`).join('')}
    ${deskXs.map(desk).join('')}
    <!-- empty chair for the new student -->
    <g id="emptyChair" transform="translate(${deskXs[3] + 75} ${GROUND}) scale(-1 1)">
      <rect x="-36" y="-122" width="8" height="74" rx="3" fill="#8a5a3a"/><rect x="-30" y="-60" width="64" height="11" rx="4" fill="#8a5a3a"/>
      <rect x="-26" y="-50" width="7" height="50" fill="#6c4528"/><rect x="22" y="-50" width="7" height="50" fill="#6c4528"/>
    </g>
    <g id="seatWrap" opacity="0" transform="translate(${deskXs[3] + 75} ${GROUND}) scale(-1 1)">${seated('seat', '#1f2a44', '#3b4a6b', '#2a1e1a')}</g>
    <g id="wB" opacity="0"></g>
  </g>

  <!-- ===== OUTDOOR (street + school) ===== -->
  <g id="A">
    <rect x="-3000" y="-3000" width="7600" height="3790" fill="url(#sky)"/>
        <circle cx="260" cy="170" r="64" fill="#ffd36b"/><circle cx="260" cy="170" r="96" fill="#ffd36b" opacity=".25"/>
    <g id="cloud" fill="#fff" opacity=".95">
      <g transform="translate(120 230)"><ellipse cx="0" cy="0" rx="90" ry="28"/><ellipse cx="-30" cy="-22" rx="50" ry="30"/><ellipse cx="34" cy="-16" rx="40" ry="26"/></g>
      <g transform="translate(720 140)"><ellipse cx="0" cy="0" rx="110" ry="32"/><ellipse cx="-34" cy="-26" rx="56" ry="34"/><ellipse cx="40" cy="-18" rx="46" ry="28"/></g>
      <g transform="translate(1180 250)"><ellipse cx="0" cy="0" rx="80" ry="24"/><ellipse cx="-24" cy="-20" rx="42" ry="26"/></g>
      <g transform="translate(1700 170)"><ellipse cx="0" cy="0" rx="100" ry="30"/><ellipse cx="-30" cy="-24" rx="52" ry="32"/></g>
      <g transform="translate(-380 160)"><ellipse cx="0" cy="0" rx="100" ry="30"/><ellipse cx="-30" cy="-24" rx="52" ry="32"/></g>
    </g>
    <g id="city" fill="#b7cfe0">
      ${[[-200, 480, 120], [-60, 420, 150], [110, 500, 110], [240, 380, 140], [400, 450, 120], [540, 410, 160], [720, 500, 120], [850, 430, 130]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${GROUND - y}"/>`).join('')}
    </g>
    <rect x="-3000" y="730" width="7600" height="80" fill="#8fc46d"/>
    <rect x="-3000" y="${GROUND - 6}" width="7600" height="3000" fill="#ded4bf"/>
    <rect x="-3000" y="${GROUND - 6}" width="7600" height="8" fill="#cfc4ac"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${-100 + i * 200}" y="${GROUND + 70}" width="110" height="10" rx="5" fill="#fff" opacity=".7"/>`).join('')}
    <!-- trees -->
    ${[420, 760].map(x => `<g><rect x="${x - 8}" y="${GROUND - 180}" width="16" height="180" fill="#7a5233"/><circle cx="${x}" cy="${GROUND - 220}" r="70" fill="#5faa5a"/><circle cx="${x - 40}" cy="${GROUND - 190}" r="46" fill="#4f9a4d"/><circle cx="${x + 44}" cy="${GROUND - 190}" r="48" fill="#6dbb65"/></g>`).join('')}
    <!-- school -->
    <g id="school">
      <rect x="980" y="330" width="580" height="${GROUND - 330}" fill="#fff1dc"/>
      <rect x="960" y="296" width="620" height="44" rx="10" fill="#1f2a44"/>
      <rect x="1080" y="236" width="380" height="66" rx="12" fill="#f26a1b"/>
      <text x="1270" y="282" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="32" fill="#fff">ARTI ANADOLU LİSESİ</text>
      ${windowsA}
      <rect x="1199" y="486" width="162" height="${GROUND - 486 + 6}" rx="6" fill="#1f2a44"/>
      <rect x="1215" y="502" width="130" height="${GROUND - 502}" fill="#2a2f45"/>
      <rect x="1215" y="502" width="130" height="${GROUND - 502}" fill="#ffd9a6" id="doorGlow" opacity="0"/>
      <g id="doorPanel"><rect x="1215" y="502" width="130" height="${GROUND - 502}" fill="#f26a1b"/><rect x="1235" y="530" width="90" height="120" rx="6" fill="#ff8a3d"/><circle cx="1330" cy="660" r="6" fill="#fff"/></g>
      <rect x="1180" y="${GROUND - 12}" width="200" height="12" fill="#cfc4ac"/>
    </g>
    <g id="wA"></g>
  </g>`;

  const cache = {};
  const mountWalker = (host, id) => { host.innerHTML = walker(id); const g = host.querySelector('#' + id); cache[id] = { g, legF: g.querySelector('.legF'), legB: g.querySelector('.legB'), armF: g.querySelector('.armF'), armB: g.querySelector('.armB') }; };
  mountWalker($('#wA'), 'walkA');
  mountWalker($('#wB'), 'walkB');
  const wB = $('#wB');

  const pose = (id, x, y, dir, s, amp, ph) => {
    const w = cache[id], a = Math.sin(ph) * 30 * amp;
    w.g.setAttribute('transform', `translate(${x} ${y}) scale(${dir * s} ${s})`);
    w.legF.setAttribute('transform', `rotate(${a} 0 -125)`);
    w.legB.setAttribute('transform', `rotate(${-a} 0 -125)`);
    w.armF.setAttribute('transform', `rotate(${-a * .9} 0 -196)`);
    w.armB.setAttribute('transform', `rotate(${a * .9} 0 -196)`);
  };

  /* ---------- Timeline ---------- */
  const journey = $('#top'), stage = $('#stage'), caps = [...document.querySelectorAll('.cap')];
  const A = $('#A'), cloud = $('#cloud'), city = $('#city'), doorPanel = $('#doorPanel'), doorGlow = $('#doorGlow');
  const seatWrap = $('#seatWrap'), emptyChair = $('#emptyChair'), hint = $('#hint'), bar = $('#bar');
  const DOOR = { x: 1280, y: 640 };
  const X0 = 140, XDOOR = 1280, XB0 = 1490, XSEAT = deskXs[3] + 75;

  let target = 0, cur = 0, ampA = 0, ampB = 0, lastXA = X0, lastXB = XB0, camX = 0;

  const readScroll = () => {
    const r = journey.getBoundingClientRect();
    target = clamp(-r.top / (r.height - innerHeight));
  };

  const frame = () => {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0002) cur = target;
    const p = cur;

    /* viewport / camera */
    const w = stage.clientWidth, h = stage.clientHeight, a = w / h;
    const W = a >= 1.78 ? 900 * a : Math.max(700, Math.min(1600, 1600 * Math.pow(a / 1.78, .6)));
    const H = W / a;

    /* outdoor walker */
    const tw = ease(seg(p, 0.0, 0.62));
    const xA = X0 + (XDOOR - X0) * tw;
    const enter = seg(p, 0.66, 0.75);
    const dxA = Math.abs(xA - lastXA); lastXA = xA;
    ampA += (clamp(dxA * 1.2) * 1 - ampA) * .25;
    const walkingA = p < 0.66 ? ampA : (1 - enter) * 0.5;
    const sA = 0.95 * (1 - 0.22 * enter);
    pose('walkA', xA + 4 * enter, GROUND, 1, sA, p < 0.66 ? Math.min(1, ampA) : walkingA, xA * 0.055);
    cache.walkA.g.setAttribute('opacity', 1 - seg(p, 0.7, 0.76));

    /* door */
    const open = ease(seg(p, 0.56, 0.68)) * (1 - 0.0 * seg(p, 0.74, 0.8));
    doorPanel.setAttribute('transform', `translate(1215 0) scale(${1 - 0.86 * open} 1) translate(-1215 0)`);
    doorGlow.setAttribute('opacity', open * .9);

    /* parallax + zoom into door */
    cloud.setAttribute('transform', `translate(${-p * 420} 0)`);
    city.setAttribute('transform', `translate(${-p * 160} 0)`);
    const z = 1 + 1.7 * ease(seg(p, 0.7, 0.84));
    A.setAttribute('transform', `translate(${DOOR.x} ${DOOR.y}) scale(${z}) translate(${-DOOR.x} ${-DOOR.y})`);
    A.setAttribute('opacity', 1 - seg(p, 0.8, 0.87));
    A.style.display = p > 0.9 ? 'none' : '';

    /* indoor walker */
    const tB = ease(seg(p, 0.87, 0.955));
    const xB = XB0 + (XSEAT - XB0) * tB;
    const dxB = Math.abs(xB - lastXB); lastXB = xB;
    ampB += (clamp(dxB * 1.2) - ampB) * .25;
    const sit = ease(seg(p, 0.955, 0.985));
    wB.setAttribute('opacity', p > 0.87 ? clamp(seg(p, 0.87, 0.89)) * (1 - sit) : 0);
    pose('walkB', xB, GROUND, -1, 0.95, Math.min(1, ampB), xB * 0.055);
    seatWrap.setAttribute('opacity', sit);
    emptyChair.setAttribute('opacity', 1 - sit);
    stage.classList.toggle('indoor', p > 0.84);

    /* camera: follow walker, clamp to world */
    const focus = p < 0.7 ? xA : (p < 0.86 ? DOOR.x : xB);
    let cx = W >= 1600 ? (1600 - W) / 2 : clamp(focus - W / 2, 0, 1600 - W);
    camX += (cx - camX) * 0.2;
    if (Math.abs(cx - camX) < .1) camX = cx;
    scene.setAttribute('viewBox', `${camX} ${900 - H} ${W} ${H}`);

    /* captions */
    caps.forEach(c => c.classList.toggle('on', p >= +c.dataset.in && p < +c.dataset.out));
    hint.style.opacity = p < 0.015 ? 1 : 0;
    bar.style.width = (p * 100) + '%';

    if (cur !== target || Math.abs(ampA) > .01 || Math.abs(ampB) > .01) raf = requestAnimationFrame(frame); else raf = 0;
  };

  let raf = 0;
  const kick = () => { readScroll(); if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  readScroll(); cur = target; camX = 0; frame();
})();
