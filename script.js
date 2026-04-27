/* ============================================================
   NENE LP — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Elements ---
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');
  const contactForm = document.getElementById('contactForm');
  const thankYou = document.getElementById('thankYou');
  const fadeElements = document.querySelectorAll('.fade-in');

  // --- Header Scroll Shrink ---
  let lastScroll = 0;
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    lastScroll = currentScroll;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Hamburger Menu ---
  const toggleMenu = () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  };

  hamburger.addEventListener('click', toggleMenu);

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  });

  // --- Smooth Scroll (nav links) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Service Card → Contact auto-select ---
  document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceType = btn.getAttribute('data-service');
      const typeSelect = document.getElementById('type');

      // Set the value after scroll
      setTimeout(() => {
        if (typeSelect) {
          typeSelect.value = serviceType;
        }
      }, 800);
    });
  });

  // --- Contact Form (mailto方式 → nenedance0612@gmail.com) ---
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const type = document.getElementById('type').value;
      const message = document.getElementById('message').value;
      const date = document.getElementById('date').value || '未指定';
      const location = document.getElementById('location').value || '未指定';
      const budget = document.getElementById('budget').value || '未指定';

      // Build mailto
      const subject = encodeURIComponent(`【NENE LP】お問い合わせ（${type}）`);
      const body = encodeURIComponent(
        `【お問い合わせ内容】\n\n` +
        `お名前: ${name}\n` +
        `メールアドレス: ${email}\n` +
        `お問い合わせ種別: ${type}\n` +
        `内容:\n${message}\n\n` +
        `希望日程: ${date}\n` +
        `場所: ${location}\n` +
        `予算感: ${budget}\n`
      );

      // Open mailto
      window.location.href = `mailto:nenedance0612@gmail.com?subject=${subject}&body=${body}`;

      // Show thank you after a short delay
      setTimeout(() => {
        contactForm.style.display = 'none';
        thankYou.classList.add('is-visible');
        thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    });
  }

  // --- Intersection Observer (Fade-in) ---
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // --- Voice Slider / Carousel ---
  const voiceTrack = document.getElementById('voiceTrack');
  const voiceDotsContainer = document.getElementById('voiceDots');
  const btnPrev = document.getElementById('voicePrev');
  const btnNext = document.getElementById('voiceNext');

  if (voiceTrack) {
    const cards = Array.from(voiceTrack.children);
    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let animationID = 0;

    // Calculate dynamic card width + gap
    const getCardWidth = () => {
      if (cards.length === 0) return 0;
      const cardRect = cards[0].getBoundingClientRect();
      // Add gap (20px) to the card width
      return cardRect.width + 20;
    };

    // Calculate max index depending on viewport
    const getMaxIndex = () => {
      const containerWidth = voiceTrack.parentElement.getBoundingClientRect().width;
      const cardW = getCardWidth();
      const visibleCards = Math.floor(containerWidth / cardW) || 1;
      return Math.max(0, cards.length - visibleCards);
    };

    // Init Dots
    const initDots = () => {
      if (!voiceDotsContainer) return;
      voiceDotsContainer.innerHTML = '';
      const maxIdx = getMaxIndex();
      for (let i = 0; i <= maxIdx; i++) {
        const dot = document.createElement('div');
        dot.classList.add('voice-dot');
        if (i === currentIndex) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateSliderPosition();
        });
        voiceDotsContainer.appendChild(dot);
      }
    };

    const updateDots = () => {
      if (!voiceDotsContainer) return;
      const dots = Array.from(voiceDotsContainer.children);
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
      });
    };

    const updateSliderPosition = () => {
      const cardW = getCardWidth();
      const maxIdx = getMaxIndex();
      // clamp bounds
      if (currentIndex < 0) currentIndex = 0;
      if (currentIndex > maxIdx) currentIndex = maxIdx;

      currentTranslate = currentIndex * -cardW;
      prevTranslate = currentTranslate;
      voiceTrack.style.transform = `translateX(${currentTranslate}px)`;
      updateDots();
    };

    // Nav Buttons
    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => {
        currentIndex -= 1;
        updateSliderPosition();
      });
      btnNext.addEventListener('click', () => {
        currentIndex += 1;
        updateSliderPosition();
      });
    }

    // Drag / Touch Events
    const touchStart = (index) => (event) => {
      isDragging = true;
      startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
      animationID = requestAnimationFrame(animation);
      voiceTrack.style.transition = 'none'; // disable CSS transition while dragging
    };

    const touchMove = (event) => {
      if (isDragging) {
        const currentPosition = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        currentTranslate = prevTranslate + currentPosition - startX;
      }
    };

    const touchEnd = () => {
      isDragging = false;
      cancelAnimationFrame(animationID);
      voiceTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; // re-enable CSS transition

      const movedBy = currentTranslate - prevTranslate;
      const cardW = getCardWidth();

      if (movedBy < -100 && currentIndex < getMaxIndex()) currentIndex += 1;
      if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

      updateSliderPosition();
    };

    const animation = () => {
      voiceTrack.style.transform = `translateX(${currentTranslate}px)`;
      if (isDragging) requestAnimationFrame(animation);
    };

    // Add event listeners (assuming modern browsers support Touch & Mouse matching)
    const trackContainer = voiceTrack.parentElement;
    trackContainer.addEventListener('mousedown', touchStart(currentIndex));
    trackContainer.addEventListener('mousemove', touchMove);
    trackContainer.addEventListener('mouseleave', () => { if (isDragging) touchEnd(); });
    trackContainer.addEventListener('mouseup', touchEnd);

    trackContainer.addEventListener('touchstart', touchStart(currentIndex), { passive: true });
    trackContainer.addEventListener('touchmove', touchMove, { passive: true });
    trackContainer.addEventListener('touchend', touchEnd);

    // Initialize
    window.addEventListener('resize', () => {
      // Recalculate on resize
      initDots();
      updateSliderPosition();
    });

    // Initial setup (setTimeout ensures layout is calculated if fonts load late)
    setTimeout(() => {
      initDots();
      updateSliderPosition();
    }, 100);
  }

  // --- FAQ Accordion ---
  const faqButtons = document.querySelectorAll('.faq-q-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // 他を開いた時に閉じる仕様にする場合は以下を有効化
      // faqButtons.forEach(b => b.setAttribute('aria-expanded', 'false'));

      btn.setAttribute('aria-expanded', !isExpanded);
    });
  });

  // --- Floating CTA (Mobile) ---
  const floatingCta = document.getElementById('floatingCta');
  const heroSection = document.getElementById('home');

  if (floatingCta && heroSection) {
    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        floatingCta.classList.add('is-visible');
      } else {
        floatingCta.classList.remove('is-visible');
      }
    }, { passive: true });
  }

  // --- Active nav link highlight ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header-nav a');

  const highlightNav = () => {
    const scrollPos = window.scrollY + header.offsetHeight + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('is-active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // --- Hero Slideshow ---
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSlides.length > 1 && !prefersReducedMotion) {
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('is-active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('is-active');
    }, 5000);
  }
});
