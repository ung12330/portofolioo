document.addEventListener('DOMContentLoaded', () => {

  /* ── Load bar ── */
  const loadBar = document.getElementById('load-bar');
  let loadW = 0;
  const loadInt = setInterval(() => {
    loadW = Math.min(loadW + Math.random() * 18, 90);
    if (loadBar) loadBar.style.width = loadW + '%';
  }, 120);
  window.addEventListener('load', () => {
    clearInterval(loadInt);
    if (loadBar) {
      loadBar.style.width = '100%';
      setTimeout(() => loadBar.classList.add('done'), 400);
    }
  });

  /* ── Stars ── */
  const starsEl = document.getElementById('stars');
  if (starsEl) {
    for (let i = 0; i < 140; i++) {
      const s    = document.createElement('div');
      s.className = 'star';
      const size  = Math.random() * 2.2 + 0.4;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        --dur:${2 + Math.random() * 5}s;
        --delay:${Math.random() * 5}s;
        --op:${0.25 + Math.random() * 0.65};
      `;
      starsEl.appendChild(s);
    }
  }

  /* ── Custom Cursor ── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  function animCursor() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(animCursor);
  }
  animCursor();

  const hoverEls = document.querySelectorAll('a, button, .project-card, .skill-card, .lang-option');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot?.classList.add('hover');
      ring?.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      dot?.classList.remove('hover');
      ring?.classList.remove('hover');
    });
  });

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Stagger reveal for grids ── */
  const gridObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const cards = e.target.querySelectorAll('.skill-card, .project-card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 70);
      });
      gridObs.unobserve(e.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.skills-grid, .projects-grid').forEach(el => {
    el.querySelectorAll('.skill-card, .project-card').forEach(c => c.classList.add('reveal'));
    gridObs.observe(el);
  });

  /* ── Project card mouse glow ── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });
  });

  /* ── Scroll to top ── */
  const scrollBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollBtn?.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  scrollBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Smooth scroll for nav links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── Load photo from GitHub config ── */
  // ✏️ Ganti USERNAME dan REPO_NAME sesuai repo lo
  const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/sergei-ditthtzynsky/im-ditthtzy/refs/heads/main/config.json';

  async function loadConfig() {
    try {
      const res = await fetch(GITHUB_CONFIG_URL + '?t=' + Date.now()); // bypass cache
      const cfg = await res.json();

      const wrap = document.getElementById('hero-photo-wrap');
      if (!wrap) return;

      if (cfg.photo_url) {
        const img = document.createElement('img');
        img.alt    = cfg.name || 'Kingz Ditthtzy';
        img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
        img.onerror = () => _renderAvatar(wrap, cfg.name || 'KD');
        img.src    = cfg.photo_url;
        wrap.innerHTML = '';
        wrap.appendChild(img);
      } else {
        _renderAvatar(wrap, cfg.name || 'KD');
      }

      // Update music track jika ada di config
      if (cfg.music_url && cfg.music_title) {
        const a = document.querySelector('#music-player audio');
        const titleEl = document.querySelector('.music-title');
        if (titleEl) titleEl.textContent = cfg.music_title;
        // expose ke MusicPlayer kalau pakai URL-based
        window._configMusic = { url: cfg.music_url, title: cfg.music_title };
      }

    } catch (e) {
      // Fallback: render avatar inisial
      const wrap = document.getElementById('hero-photo-wrap');
      if (wrap) _renderAvatar(wrap, 'KD');
    }
  }

  function _renderAvatar(wrap, initials) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 200;
    const g = cv.getContext('2d');
    g.fillStyle = '#111114';
    g.fillRect(0, 0, 200, 200);
    g.fillStyle = '#f5c842';
    g.font = 'bold 72px Syne, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(initials.slice(0,2).toUpperCase(), 100, 108);
    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = cv.toDataURL();
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
    wrap.appendChild(img);
  }

  loadConfig();

  /* ── Skill bars + counting number ── */
  function animateCount(el, target, duration) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const card = e.target;
      const fill = card.querySelector('.skill-bar-fill');
      const numEl = card.querySelector('.pct-num');
      if (!fill || !numEl) return;

      const pct = parseInt(fill.dataset.pct) || 0;

      // Bar fill — slight delay per card for stagger
      const cards = [...document.querySelectorAll('.skill-card')];
      const delay = cards.indexOf(card) * 80;
      setTimeout(() => {
        fill.style.width = pct + '%';
        animateCount(numEl, pct, 1200);
      }, delay);

      skillObs.unobserve(card);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));

  /* ── Init modules ── */
  I18N.init();
  MusicPlayer.init();
  new PlanetScene('planet-canvas');

});

