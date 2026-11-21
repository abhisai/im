(() => {
  const site = document.querySelector('.site');
  const main = site?.querySelector('main');
  if (!site || !main) return;

  const requestedType = new URLSearchParams(window.location.search).get('type');
  const typeSelect = site.querySelector('select[name="type"]');
  if (requestedType && typeSelect && Array.from(typeSelect.options).some(option => option.text === requestedType)) {
    typeSelect.value = requestedType;
  }

  main.id = 'main-content';
  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  site.prepend(skipLink);

  const menuButton = site.querySelector('.menu');
  const nav = site.querySelector('.nav');
  if (menuButton && nav) {
    nav.id = 'primary-navigation';
    nav.setAttribute('aria-label', 'Main navigation');
    menuButton.setAttribute('aria-controls', nav.id);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    const currentPath = window.location.pathname.endsWith('/')
      ? `${window.location.pathname}index.html`
      : window.location.pathname;

    const closeMenu = returnFocus => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      if (returnFocus) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach(link => {
      if (new URL(link.href).pathname === currentPath) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('click', event => {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
    });
  }

  const topButton = document.createElement('button');
  topButton.className = 'back-to-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '<span aria-hidden="true">↑</span> Top';
  topButton.hidden = true;
  site.append(topButton);

  const updateTopButton = () => {
    topButton.hidden = window.scrollY < 650;
  };
  window.addEventListener('scroll', updateTopButton, {passive: true});
  topButton.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  }));
  updateTopButton();

  const counterSelector = '.stats > b, .about-stat strong, .comparison-summary span b';
  const startedCounters = new WeakSet();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const startCounter = element => {
    if (startedCounters.has(element)) return;
    const statLabel = element.closest('.about-stat')?.querySelector('span')?.textContent.trim();
    if (element.matches('.about-stat strong') && statLabel !== 'Families Protected') return;

    const textNode = Array.from(element.childNodes).find(node =>
      node.nodeType === Node.TEXT_NODE && /^\s*[\d,]/.test(node.nodeValue)
    );
    if (!textNode) return;

    const match = textNode.nodeValue.trim().match(/^([\d,]+)(.*)$/);
    if (!match) return;

    const target = Number(match[1].replace(/,/g, ''));
    if (!Number.isFinite(target)) return;
    startedCounters.add(element);

    const prefix = textNode.nodeValue.match(/^\s*/)[0];
    const suffix = match[2];
    const format = value => `${prefix}${Math.round(value).toLocaleString('en-IN')}${suffix}`;
    const renderFinalValue = () => { textNode.nodeValue = format(target); };

    if (reducedMotion || !('IntersectionObserver' in window)) {
      renderFinalValue();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1200;
      const animate = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        textNode.nodeValue = format(target * eased);
        if (progress < 1) window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    }, {threshold: 0.35});

    observer.observe(element);
  };

  const scanCounters = root => {
    if (!root.isConnected) return;
    if (root instanceof Element && root.matches(counterSelector)) startCounter(root);
    root.querySelectorAll?.(counterSelector).forEach(startCounter);
  };

  const configureScrollableTables = () => {
    site.querySelectorAll('.table-wrap').forEach(table => {
      if (table.scrollWidth > table.clientWidth + 1) {
        table.tabIndex = 0;
        table.setAttribute('role', 'region');
        table.setAttribute('aria-label', 'Scrollable insurance comparison table');
      } else {
        table.removeAttribute('tabindex');
        table.removeAttribute('role');
        table.removeAttribute('aria-label');
      }
    });
  };

  scanCounters(site);
  configureScrollableTables();
  window.addEventListener('resize', configureScrollableTables, {passive: true});
  const counterMutationObserver = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node instanceof Element && node.isConnected) scanCounters(node);
      });
    });
    configureScrollableTables();
  });
  counterMutationObserver.observe(site, {childList: true, subtree: true});
})();
