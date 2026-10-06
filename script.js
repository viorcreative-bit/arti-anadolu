(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t * t * (3 - 2 * t);

  $('#yr').textContent = new Date().getFullYear();
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---- hero ---- */
  const hero = $('#top'), stage = $('#stage'), school = $('#school'), student = $('#student'),
        copy = $('#copy'), copy2 = $('#copy2'), hint = $('#hint');
  let target = 0, cur = 0, raf = 0, geo;

  const measure = () => {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const sc = { x: school.offsetLeft + school.offsetWidth * 0.5, y: school.offsetTop + school.offsetHeight * 0.92 };
    const st = { x: student.offsetLeft + student.offsetWidth / 2, y: sh };
    geo = { sw, sh, dx: sc.x - st.x, mobile: sw <= 860 };
  };

  const frame = () => {
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0003) cur = target;
    const p = cur, g = geo;

    // 1) metin çekilir
    const tc = ease(seg(p, 0.08, 0.34));
    copy.style.opacity = 1 - tc;
    copy.style.transform = `${g.mobile ? '' : 'translateY(-52%) '}translateX(${-tc * 40}px)`;

    // 2) kamera okula yaklaşır, öğrenci kapıya yürür
    const tw = ease(seg(p, 0.14, 0.7));
    const k = 1 + 0.7 * tw;
    school.style.transform = `scale(${k})`;
    const ss = 1 - 0.72 * tw;
    const lift = tw * g.sh * 0.1;
    student.style.transform = `translate(${g.dx * tw}px, ${-lift + Math.sin(tw * 22) * 3 * Math.sin(tw * Math.PI)}px) scale(${ss})`;
    student.style.opacity = 1 - ease(seg(p, 0.66, 0.74));

    // 3) kapıdan içeri: sahne açık renge geçer
    const fade = ease(seg(p, 0.72, 0.86));
    school.style.opacity = (g.mobile ? .9 : 1) * (1 - fade);
    stage.style.setProperty('--f', fade);
    copy2.style.opacity = ease(seg(p, 0.84, 0.95));
    copy2.style.transform = `translate(-50%, calc(-50% + ${(1 - seg(p, 0.84, 0.95)) * 24}px))`;
    copy2.classList.toggle('on', p > 0.9);
    hint.style.opacity = p < 0.02 ? 1 : 0;

    raf = (cur !== target) ? requestAnimationFrame(frame) : 0;
  };
  const read = () => { const r = hero.getBoundingClientRect(); target = clamp(-r.top / (r.height - innerHeight)); if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', () => { measure(); read(); });
  const start = () => { measure(); read(); cur = target; frame(); };
  if (student.complete) start(); else student.addEventListener('load', start);
  addEventListener('load', start);
})();
