const I18N = (() => {
  const LANGS = {
    id: { label: 'Indonesia', flag: '🇮🇩' },
    en: { label: 'English',   flag: '🇺🇸' },
    ja: { label: '日本語',     flag: '🇯🇵' },
  };

  let current = localStorage.getItem('lang') || 'id';
  let data     = {};

  const PROJECT_DATA = [
    {
      tag_id: 'Telegram Bot', tag_en: 'Telegram Bot', tag_ja: 'Telegramボット',
      name: 'Void Xotion',
      desc_id: 'Premium Telegram bot dengan payload menu, inline keyboard navigation, token validation, group registration, dan timezone-aware date display.',
      desc_en: 'Premium Telegram bot with payload menu, inline keyboard navigation, token validation, group registration, and timezone-aware date display.',
      desc_ja: 'ペイロードメニュー、インラインキーボードナビゲーション、トークン検証、グループ登録、タイムゾーン対応日時表示を備えたプレミアムTelegramボット。',
      stack: ['Node.js', 'node-telegram-bot-api', 'PM2'],
    },
    {
      tag_id: 'Web Tool', tag_en: 'Web Tool', tag_ja: 'Webツール',
      name: 'SHESH.DB GEN',
      desc_id: 'Client-side SHA-512 hash generator dengan dark luxury UI. Zero backend, instant hashing langsung di browser.',
      desc_en: 'Client-side SHA-512 hash generator with dark luxury UI. Zero backend, instant hashing directly in browser.',
      desc_ja: 'ダークラグジュアリーUIを備えたクライアントサイドSHA-512ハッシュジェネレーター。バックエンドなし、ブラウザで即時ハッシュ生成。',
      stack: ['HTML', 'CSS', 'Vanilla JS'],
    },
    {
      tag_id: 'Dashboard', tag_en: 'Dashboard', tag_ja: 'ダッシュボード',
      name: 'Vault Manager',
      desc_id: 'Admin dashboard berbasis GitHub API untuk manage token, role, grup, log, dan announcement. Role hierarchy 7 level.',
      desc_en: 'GitHub API-based admin dashboard to manage tokens, roles, groups, logs, and announcements. 7-level role hierarchy.',
      desc_ja: 'トークン、ロール、グループ、ログ、お知らせを管理するGitHub APIベースの管理ダッシュボード。7段階のロール階層。',
      stack: ['GitHub API', 'HTML/CSS/JS', 'Canvas'],
    },
    {
      tag_id: 'WhatsApp Bot', tag_en: 'WhatsApp Bot', tag_ja: 'WhatsAppボット',
      name: 'Void Xotion',
      desc_id: 'WhatsApp automation bot via Baileys dengan multi-session support, connection bug fixes, dan command routing yang stabil.',
      desc_en: 'WhatsApp automation bot via Baileys with multi-session support, connection bug fixes, and stable command routing.',
      desc_ja: 'Baileysを使用したマルチセッション対応WhatsApp自動化ボット。接続バグ修正と安定したコマンドルーティング。',
      stack: ['Baileys', 'Node.js', 'In-Memory Store'],
    },
    {
      tag_id: 'Security', tag_en: 'Security', tag_ja: 'セキュリティ',
      name: 'File Integrity System',
      desc_id: 'Node.js file integrity checker dengan SHA-256 chain hash, XOR obfuscation, HMAC-SHA256, dan randomized check intervals.',
      desc_en: 'Node.js file integrity checker with SHA-256 chain hash, XOR obfuscation, HMAC-SHA256, and randomized check intervals.',
      desc_ja: 'SHA-256チェーンハッシュ、XOR難読化、HMAC-SHA256、ランダム化チェック間隔を備えたNode.jsファイル整合性チェッカー。',
      stack: ['Node.js', 'Crypto', 'HMAC'],
    },
    {
      tag_id: 'AI Interface', tag_en: 'AI Interface', tag_ja: 'AIインターフェース',
      name: 'DitthtzyOpenAi',
      desc_id: 'Personal AI chat interface dengan Gemini 2.0 Flash, multi-turn history, custom system prompt, dan Groq backend di Vercel.',
      desc_en: 'Personal AI chat interface with Gemini 2.0 Flash, multi-turn history, custom system prompt, and Groq backend on Vercel.',
      desc_ja: 'Gemini 2.0 Flash、マルチターン履歴、カスタムシステムプロンプト、VercelのGroqバックエンドを備えた個人用AIチャットインターフェース。',
      stack: ['Gemini API', 'Groq', 'Vercel'],
    },
  ];

  const SKILL_ICONS = ['🤖', '💬', '🌐', '🛡️', '⚙️', '🔐'];

  async function load(lang) {
    try {
      const res = await fetch(`assets/lang/${lang}.json`);
      data = await res.json();
      current = lang;
      localStorage.setItem('lang', lang);
      apply();
    } catch (e) {
      console.warn('i18n load failed:', e);
    }
  }

  function apply() {
    const t = data;
    if (!t) return;

    // Nav
    _setText('[data-i18n="nav.skills"]',   t.nav?.skills);
    _setText('[data-i18n="nav.projects"]', t.nav?.projects);
    _setText('[data-i18n="nav.contact"]',  t.nav?.contact);
    _setText('[data-i18n="nav.hire"]',     t.nav?.hire);

    // Hero
    _setText('[data-i18n="hero.greeting"]',    t.hero?.greeting);
    _setText('[data-i18n="hero.desc"]',        t.hero?.desc);
    _setText('[data-i18n="hero.cta_work"]',    t.hero?.cta_work);
    _setText('[data-i18n="hero.cta_tg"]',      t.hero?.cta_tg);
    _setText('[data-i18n="hero.stat_bots"]',   t.hero?.stat_bots);
    _setText('[data-i18n="hero.stat_exp"]',    t.hero?.stat_exp);
    _setText('[data-i18n="hero.stat_coffee"]', t.hero?.stat_coffee);

    // Skills section
    _setText('[data-i18n="skills.label"]', t.skills?.label);
    _setText('[data-i18n="skills.title"]', t.skills?.title);
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, i) => {
      const item = t.skills?.items?.[i];
      if (!item) return;
      card.querySelector('.skill-name').textContent = item.name;
      card.querySelector('.skill-desc').textContent = item.desc;
    });

    // Projects section
    _setText('[data-i18n="projects.label"]', t.projects?.label);
    _setText('[data-i18n="projects.title"]', t.projects?.title);
    const projCards = document.querySelectorAll('.project-card');
    projCards.forEach((card, i) => {
      const proj = PROJECT_DATA[i];
      if (!proj) return;
      const tagKey  = `tag_${current}`;
      const descKey = `desc_${current}`;
      card.querySelector('.project-tag').textContent  = proj[tagKey]  || proj.tag_en;
      card.querySelector('.project-desc').textContent = proj[descKey] || proj.desc_en;
    });

    // Contact
    _setText('[data-i18n="contact.label"]', t.contact?.label);
    const ct = document.querySelector('[data-i18n="contact.title"]');
    if (ct) ct.textContent = t.contact?.title?.replace('\\n', '\n') || '';
    _setText('[data-i18n="contact.desc"]',  t.contact?.desc);
    _setText('[data-i18n="contact.tg"]',    t.contact?.tg);
    _setText('[data-i18n="contact.ig"]',    t.contact?.ig);

    // Footer
    _setText('[data-i18n="footer.copy"]', t.footer?.copy);

    // Music
    _updateMusicLabel();

    // Lang button label
    const langBtn = document.querySelector('.lang-current-label');
    if (langBtn) langBtn.textContent = LANGS[current]?.label || current;
    const langFlag = document.querySelector('.lang-current-flag');
    if (langFlag) langFlag.textContent = LANGS[current]?.flag || '';

    // Mark active
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === current);
    });
  }

  function _setText(sel, val) {
    if (!val) return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = val; });
  }

  function _updateMusicLabel() {
    const t = data;
    const isPlaying = window.MusicPlayer?.isPlaying?.() ?? false;
    const statusEl  = document.querySelector('.music-status');
    if (statusEl) statusEl.textContent = isPlaying ? t.music?.playing : t.music?.paused;
  }

  function buildLangOptions() {
    const dropdown = document.querySelector('.lang-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    Object.entries(LANGS).forEach(([code, meta]) => {
      const div = document.createElement('div');
      div.className = 'lang-option' + (code === current ? ' active' : '');
      div.dataset.lang = code;
      div.innerHTML = `<span class="lang-flag">${meta.flag}</span>${meta.label}`;
      div.addEventListener('click', () => { load(code); closeLang(); });
      dropdown.appendChild(div);
    });
  }

  function closeLang() {
    document.querySelector('.lang-btn')?.classList.remove('open');
    document.querySelector('.lang-dropdown')?.classList.remove('open');
  }

  return {
    init() {
      buildLangOptions();
      load(current);

      const btn      = document.querySelector('.lang-btn');
      const dropdown = document.querySelector('.lang-dropdown');
      btn?.addEventListener('click', e => {
        e.stopPropagation();
        btn.classList.toggle('open');
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', closeLang);
    },
    get current()   { return current; },
    get data()      { return data; },
    updateMusicLabel: () => { if (data) _updateMusicLabel(); },
    LANGS,
    PROJECT_DATA,
    SKILL_ICONS,
  };
})();
