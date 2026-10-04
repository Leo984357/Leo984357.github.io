(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const $ = (selector, root = document) => root.querySelector(selector);

  // Native links and all content work before these enhancements initialize.
  const filters = $$('.filters button');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    $$('.work-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visible++;
    });
    $('.filter-count').textContent = `${String(visible).padStart(2, '0')} PROJECT${visible === 1 ? '' : 'S'}`;
  }));

  const palette = $('#command-palette');
  const search = $('#command-search');
  const results = $('#command-results');
  const commands = [
    { title: '精选作品', hint: '01 / SELECTED WORK', href: '#projects', keywords: '作品 projects work' },
    { title: '研究方向', hint: '02 / RESEARCH', href: '#research', keywords: '研究 research' },
    { title: '关于李硕仁', hint: '03 / ABOUT', href: '#about', keywords: '关于 about experience' },
    { title: '上市公司委托理财分析框架', hint: 'GITHUB ↗', href: 'https://github.com/Leo984357/listed-company-wealth-framework', keywords: '数据 wealth data echarts javascript json' },
    { title: 'QMT Investment Assistant', hint: 'GITHUB ↗', href: 'https://github.com/Leo984357/qmt_investment_assistant', keywords: '量化 quant qmt 模型' },
    { title: '公募基金投研 Skill', hint: 'EXAMPLES ↗', href: 'https://github.com/Leo984357/mutual-fund-research-skill/tree/main/examples', keywords: '基金 agent skill fund' },
    { title: 'GitHub / Leo984357', hint: 'PROFILE ↗', href: 'https://github.com/Leo984357', keywords: 'github code 代码' },
    { title: '邮件联系', hint: 'EMAIL ↗', href: 'mailto:leo2974656036@foxmail.com', keywords: '联系 email contact 邮箱' }
  ];
  let selected = 0;
  let paletteOpener = null;
  const selectResult = index => {
    const links = $$('.command-result', results);
    selected = links.length ? (index + links.length) % links.length : 0;
    links.forEach((link, i) => {
      link.classList.toggle('is-selected', i === selected);
      link.setAttribute('aria-selected', String(i === selected));
    });
    if (links[selected]) search.setAttribute('aria-activedescendant', links[selected].id);
    else search.removeAttribute('aria-activedescendant');
    links[selected]?.scrollIntoView({ block: 'nearest' });
  };
  const closePalette = () => palette.close();
  const renderCommands = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = commands.filter(command => `${command.title} ${command.keywords}`.toLocaleLowerCase().includes(query));
    results.replaceChildren();
    matches.forEach((command, index) => {
      const link = document.createElement('a');
      link.className = 'command-result';
      link.id = `command-result-${index}`;
      link.setAttribute('role', 'option');
      link.href = command.href;
      const title = document.createElement('span');
      title.textContent = command.title;
      const hint = document.createElement('span');
      hint.textContent = command.hint;
      link.append(title, hint);
      link.addEventListener('click', closePalette);
      results.append(link);
    });
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = '没有找到匹配项，试试「研究」或「QMT」。';
      results.append(empty);
    }
    selectResult(0);
  };
  const openPalette = () => {
    if (palette.open) return closePalette();
    paletteOpener = document.activeElement;
    search.value = '';
    renderCommands();
    palette.showModal();
    document.body.style.overflow = 'hidden';
    search.focus();
  };
  $('.command-trigger').addEventListener('click', openPalette);
  $('.command-close').addEventListener('click', closePalette);
  palette.addEventListener('close', () => {
    document.body.style.overflow = '';
    paletteOpener?.focus({ preventScroll: true });
  });
  palette.addEventListener('click', event => {
    if (event.target === palette) {
      const rect = palette.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePalette();
    }
  });
  search.addEventListener('input', renderCommands);
  palette.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectResult(selected + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && event.target === search) {
      event.preventDefault();
      $$('.command-result', results)[selected]?.click();
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
    }
  });

  const progress = $('.reading-progress');
  let scrollQueued = false;
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${available > 0 ? scrollY / available : 0})`;
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
  if ('IntersectionObserver' in window) {
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) $$('nav a').forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-10% 0px -65% 0px' });
    ['projects', 'research', 'about'].forEach(id => navigationObserver.observe(document.getElementById(id)));
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!reducedMotion.matches) entry.target.classList.add('reveal-enter');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .08 });
    $$('.work-card, .research-notes article, .about-intro, .experience').forEach(node => revealObserver.observe(node));
  }
  $$('.work-card').forEach(card => card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
  }, { passive: true }));

  // The art remains a real character grid. Read the source SVG's colored glyphs,
  // paint one cached layer, then relight only the glyphs around the pointer.
  async function initializeAscii() {
    const canvas = $('#ascii-canvas');
    const stage = $('.art-stage');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    const response = await fetch('assets/starry-night-ascii.svg');
    if (!response.ok) return;
    const xml = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (xml.querySelector('parsererror')) return;
    const glyphs = $$('text', xml).map(node => ({ x: +node.getAttribute('x'), y: +node.getAttribute('y'), color: node.getAttribute('fill'), character: node.textContent }));
    if (!glyphs.length) return;
    const base = document.createElement('canvas');
    base.width = 1600; base.height = 560;
    const baseContext = base.getContext('2d', { alpha: false });
    if (!baseContext) return;
    const font = '16px Menlo, "DejaVu Sans Mono", Consolas, monospace';
    baseContext.fillStyle = '#0d1117';
    baseContext.fillRect(0, 0, 1600, 560);
    baseContext.font = font;
    for (const glyph of glyphs) { baseContext.fillStyle = glyph.color; baseContext.fillText(glyph.character, glyph.x, glyph.y); }
    context.font = font;
    context.drawImage(base, 0, 0);
    stage.classList.add('is-ready');
    const toggle = $('#motion-toggle');
    toggle.hidden = false;
    let paused = reducedMotion.matches;
    let pointer = { x: 800, y: 270, active: false };
    let animation = 0;
    let inView = true;
    let lastPaint = 0;
    const refreshButton = () => {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.innerHTML = `<span class="pause-icon" aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span> ${paused ? '开启星光' : '暂停星光'}`;
      $('#art-hint').textContent = paused ? '4,386 GLYPHS · ONE STARRY NIGHT' : (matchMedia('(pointer: coarse)').matches ? '轻触星空 · 点亮字符' : '移动光标 · 点亮字符');
    };
    const draw = time => {
      animation = 0;
      if (paused || !inView || document.hidden) return;
      if (time - lastPaint >= 38) {
        lastPaint = time;
        context.drawImage(base, 0, 0);
        const x = pointer.active ? pointer.x : 800 + Math.sin(time / 7000) * 570;
        const y = pointer.active ? pointer.y : 240 + Math.sin(time / 4100) * 125;
        const radius = pointer.active ? 155 : 115;
        for (const glyph of glyphs) {
          const dx = glyph.x - x, dy = glyph.y - y;
          if (Math.abs(dx) > radius || Math.abs(dy) > radius) continue;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > radius) continue;
          const light = Math.pow(1 - distance / radius, 1.3) * (pointer.active ? .82 : .35);
          context.fillStyle = `rgba(211,245,250,${light})`;
          context.fillText(glyph.character, glyph.x, glyph.y);
        }
      }
      animation = requestAnimationFrame(draw);
    };
    const start = () => { if (!animation && !paused && inView && !document.hidden) animation = requestAnimationFrame(draw); };
    const stop = () => { cancelAnimationFrame(animation); animation = 0; context.drawImage(base, 0, 0); };
    toggle.addEventListener('click', () => { paused = !paused; refreshButton(); if (paused) stop(); else start(); });
    const setPointer = event => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: (event.clientX - rect.left) * 1600 / rect.width, y: (event.clientY - rect.top) * 560 / rect.height, active: true };
    };
    stage.addEventListener('pointermove', setPointer, { passive: true });
    stage.addEventListener('pointerdown', setPointer, { passive: true });
    stage.addEventListener('pointerleave', () => { pointer.active = false; });
    stage.addEventListener('pointerup', event => { if (event.pointerType === 'touch') pointer.active = false; });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    reducedMotion.addEventListener('change', event => { paused = event.matches; refreshButton(); if (paused) stop(); else start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0 }).observe(stage);
    refreshButton();
    start();
  }
  initializeAscii().catch(() => { /* The original SVG remains visible on any initialization failure. */ });
})();
