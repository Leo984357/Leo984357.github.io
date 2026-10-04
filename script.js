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
  }

  // Play deterministic character frames; the static SVG is the loading/failure fallback.
  async function initializeAscii() {
    const canvas = $('#ascii-canvas');
    const stage = $('.art-stage');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    const response = await fetch('assets/starry-night-frames.json');
    if (!response.ok) return;
    const sequence = await response.json();
    const { columns, rows, cellWidth, cellHeight, width, height, fps, palette, frames } = sequence;
    const cellCount = columns * rows;
    if (width !== 1600 || height !== 560 || columns !== 160 || rows !== 28 ||
        !Number.isFinite(fps) || fps <= 0 || fps > 30 || !Array.isArray(palette) ||
        !Array.isArray(frames) || frames.length < 2 || frames.some(frame =>
          typeof frame.characters !== 'string' || frame.characters.length !== cellCount ||
          frame.colorIndices.length !== cellCount)) return;
    const colors = palette.map(color => `#${color}`);
    const font = '16px Menlo, "DejaVu Sans Mono", Consolas, monospace';
    let frameIndex = -1;
    const paintFrame = index => {
      const frame = frames[index];
      context.fillStyle = '#0d1117';
      context.fillRect(0, 0, width, height);
      context.font = font;
      for (let cell = 0; cell < cellCount; cell++) {
        const character = frame.characters[cell];
        if (character === ' ') continue;
        context.fillStyle = colors[frame.colorIndices[cell]];
        context.fillText(character, (cell % columns) * cellWidth + 1, Math.floor(cell / columns) * cellHeight + 16);
      }
      frameIndex = index;
      canvas.dataset.frame = String(index);
    };
    paintFrame(0);
    stage.classList.add('is-ready');
    const toggle = $('#motion-toggle');
    toggle.hidden = false;
    let paused = reducedMotion.matches;
    let animation = 0;
    let inView = true;
    let playhead = 0;
    let lastTime = null;
    const frameDuration = 1000 / fps;
    const refreshButton = () => {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.innerHTML = `<span class="pause-icon" aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span> ${paused ? '播放星空' : '暂停星空'}`;
      $('#art-hint').textContent = paused ? 'STARRY NIGHT / PAUSED' : 'STARRY NIGHT / IN MOTION';
    };
    const draw = time => {
      animation = 0;
      if (paused || !inView || document.hidden) return;
      if (lastTime !== null) playhead += time - lastTime;
      lastTime = time;
      const index = Math.floor(playhead / frameDuration) % frames.length;
      if (index !== frameIndex) paintFrame(index);
      animation = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!animation && !paused && inView && !document.hidden) {
        lastTime = null;
        animation = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      cancelAnimationFrame(animation);
      animation = 0;
      lastTime = null;
    };
    toggle.addEventListener('click', () => {
      paused = !paused;
      refreshButton();
      if (paused) stop(); else start();
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    reducedMotion.addEventListener('change', event => {
      paused = event.matches;
      refreshButton();
      if (paused) { stop(); playhead = 0; paintFrame(0); } else start();
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0 }).observe(stage);
    refreshButton();
    start();
  }
  initializeAscii().catch(() => { /* The original SVG remains visible on initialization failure. */ });
})();
