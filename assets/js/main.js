document.addEventListener('DOMContentLoaded', () => {
  // Elementos do Menu Mobile
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navDrawer = document.getElementById('navDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  // ==========================================================================
  // SCROLL LOCK (DESKTOP) - Preserva a Scrollbar Nativa
  // ==========================================================================
  let lockedScrollX = 0;
  let lockedScrollY = 0;

  const preventDefault = (e) => {
    if (navDrawer && navDrawer.contains(e.target)) return;
    e.preventDefault();
  };

  const keys = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
  const preventDefaultForScrollKeys = (e) => {
    if (navDrawer && navDrawer.contains(e.target)) return;
    
    // Acessibilidade: permite que botões e links fora do menu (ex: Header CTA, Hamburger) 
    // sejam ativados via teclado (Space/Enter) sem que o preventDefault bloqueie a ação.
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === 'button' || tagName === 'a' || tagName === 'input') return;

    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  };

  let supportsPassive = false;
  try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: () => { supportsPassive = true; }
    }));
  } catch(e) {}
  
  const wheelOpt = supportsPassive ? { passive: false } : false;
  const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

  const lockScrollHandler = () => {
    if (window.scrollX !== lockedScrollX || window.scrollY !== lockedScrollY) {
      window.scrollTo(lockedScrollX, lockedScrollY);
    }
  };

  const enableScrollLock = () => {
    lockedScrollX = window.scrollX;
    lockedScrollY = window.scrollY;
    window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.addEventListener(wheelEvent, preventDefault, wheelOpt);
    window.addEventListener('touchmove', preventDefault, wheelOpt);
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    window.addEventListener('scroll', lockScrollHandler, wheelOpt);
  };

  const disableScrollLock = () => {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    window.removeEventListener('scroll', lockScrollHandler, wheelOpt);
  };

  // ==========================================================================
  // FUNÇÕES DO MENU
  // ==========================================================================
  const openMenu = () => {
    if (navDrawer && drawerOverlay && hamburgerBtn) {
      navDrawer.classList.add('is-active');
      drawerOverlay.classList.add('is-active');
      hamburgerBtn.classList.add('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      
      if (window.innerWidth >= 1024) {
        enableScrollLock();
      } else {
        document.body.style.overflow = 'hidden';
      }
    }
  };

  const closeMenu = () => {
    if (navDrawer && drawerOverlay && hamburgerBtn) {
      navDrawer.classList.remove('is-active');
      drawerOverlay.classList.remove('is-active');
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      
      if (window.innerWidth >= 1024) {
        disableScrollLock();
      } else {
        document.body.style.overflow = '';
      }
    }
  };

  // Event Listeners
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (navDrawer.classList.contains('is-active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeMenu);
  }

  // Tecla ESC fecha o menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('is-active')) {
      closeMenu();
    }
  });

  // Fecha o menu ao clicar em qualquer link
  if (navDrawer) {
    const drawerLinks = navDrawer.querySelectorAll('.drawer-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ==========================================================================
  // CARROSSEL DA SEÇÃO 5 (PROVA SOCIAL / DEPOIMENTOS)
  // ==========================================================================
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevTestimonialBtn');
  const nextBtn = document.getElementById('nextTestimonialBtn');
  const indicatorsContainer = document.getElementById('testimonialIndicators');

  if (track && prevBtn && nextBtn && indicatorsContainer) {
    const cards = Array.from(track.children);
    let currentIndex = 0;

    // Determina o número de cards visíveis por tela
    const getVisibleCardsCount = () => {
      const width = window.innerWidth;
      if (width <= 767) return 1;
      if (width <= 1023) return 2;
      return 3;
    };

    // Determina o número máximo de posições navegáveis
    const getMaxIndex = () => {
      const visible = getVisibleCardsCount();
      return Math.max(0, cards.length - visible);
    };

    // Renderiza a quantidade REAL de indicadores (dots)
    const renderIndicators = () => {
      const maxIndex = getMaxIndex();
      indicatorsContainer.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentIndex ? 'is-active' : ''}`;
        dot.setAttribute('aria-label', `Ir para o depoimento ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(dot);
      }
    };

    // Atualiza a posição da pista e estados dos botões/dots
    const updateCarousel = () => {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const card = cards[0];
      if (!card) return;

      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseInt(window.getComputedStyle(track).gap) || 0;
      const moveDistance = currentIndex * (cardWidth + gap);

      track.style.transform = `translateX(-${moveDistance}px)`;

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;

      const dots = Array.from(indicatorsContainer.children);
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === currentIndex);
      });
    };

    const goToSlide = (index) => {
      currentIndex = index;
      updateCarousel();
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateCarousel();
      }
    });

    // Suporte a Swipe / Gestos no Touch/Mobile
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isSwiping) return;
      const diff = startX - currentX;
      if (Math.abs(diff) > 40 && currentX !== 0) {
        if (diff > 0 && currentIndex < getMaxIndex()) {
          currentIndex++;
        } else if (diff < 0 && currentIndex > 0) {
          currentIndex--;
        }
        updateCarousel();
      }
      isSwiping = false;
      startX = 0;
      currentX = 0;
    });

    // Recalcula responsivamente no resize da tela
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderIndicators();
        updateCarousel();
      }, 100);
    });

    // Inicialização
    renderIndicators();
    updateCarousel();
  }

  // ==========================================================================
  // ACCORDION DA SEÇÃO 7 (FAQ / DÚVIDAS FREQUENTES)
  // ==========================================================================
  const faqAccordion = document.getElementById('faqAccordion');
  if (faqAccordion) {
    const faqItems = Array.from(faqAccordion.querySelectorAll('.faq-item'));

    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      const answerPanel = item.querySelector('.faq-answer');

      if (questionBtn && answerPanel) {
        questionBtn.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');

          // Comportamento Exclusivo (Single Expand): fecha todos os outros itens
          faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.classList.remove('is-open');
              const otherBtn = otherItem.querySelector('.faq-question');
              const otherPanel = otherItem.querySelector('.faq-answer');
              if (otherBtn && otherPanel) {
                otherBtn.setAttribute('aria-expanded', 'false');
                otherPanel.setAttribute('hidden', '');
              }
            }
          });

          // Toggle do item clicado
          if (isOpen) {
            item.classList.remove('is-open');
            questionBtn.setAttribute('aria-expanded', 'false');
            answerPanel.setAttribute('hidden', '');
          } else {
            item.classList.add('is-open');
            questionBtn.setAttribute('aria-expanded', 'true');
            answerPanel.removeAttribute('hidden');
          }
        });
      }
    });
  }
});


