document.addEventListener('DOMContentLoaded', () => {
  initCreativeNavbar();
  initMobileNavDrawer();
  initScrollSpy();
  initSoundFX();
  renderReelsMatrix();
  renderWeddingMatrix();
  initChannelFilterTabs();
  initContactChannels();
  initCinemaModal();
  initVideoAutoplayObserver();
});

/* ==========================================================================
   1. CREATIVE DIRECTOR NAVBAR (Live Clock, Scroll Laser, Audio Equalizer)
   ========================================================================== */
let isSoundEnabled = true;

function initCreativeNavbar() {
  // Live Indian Standard Time (IST) Clock
  const clockEl = document.getElementById('navClockDisplay');
  function updateClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      clockEl.textContent = `${timeStr} IST`;
    } catch (e) {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${hrs}:${mins} IST`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Audio Equalizer Waveform Toggle
  const soundToggle = document.getElementById('navSoundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggle.classList.toggle('muted', !isSoundEnabled);
      const label = soundToggle.querySelector('.sound-label');
      if (label) label.textContent = isSoundEnabled ? 'SFX' : 'MUTE';
      if (isSoundEnabled) playSound('click');
    });
  }
}

/* ==========================================================================
   1B. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNavDrawer() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileDrawerClose');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (typeof playSound === 'function') playSound('click');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      if (typeof playSound === 'function') playSound('whoosh');
    });
  });
}

/* ==========================================================================
   2. HIGH-PERFORMANCE UNIFIED SCROLL ENGINE (120Hz rAF THROTTLED)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link-btn');
  const progressBar = document.getElementById('navScrollProgress');
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // 1. Smooth Scroll Progress Laser
        if (progressBar && docHeight > 0) {
          const scrollPercent = (scrollTop / docHeight) * 100;
          progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        }

        // 2. Section Scroll Spy Indicator
        let current = '';
        const scrollOffset = scrollTop + 200;

        sections.forEach(section => {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollOffset >= top && scrollOffset < top + height) {
            current = section.getAttribute('id');
          }
        });

        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial run
}

/* ==========================================================================
   3. WEB AUDIO SYNTHESIZER (Tactile UI Sounds)
   ========================================================================== */
let audioCtx = null;
function getAudio() {
  if (!isSoundEnabled) return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type) {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'impact') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {}
}

function initSoundFX() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .contact-channel-strip, .reel-phone-card')) {
      playSound('click');
    }
  });
}

/* ==========================================================================
   3. RENDER 10 VIRAL SHORT-FORM REELS
   ========================================================================== */
function renderReelsMatrix() {
  const grid = document.getElementById('reelsMatrixGrid');
  if (!grid) return;

  grid.innerHTML = '';
  SUNNY_PROJECTS.reels.forEach((reel, idx) => {
    const card = document.createElement('div');
    card.className = 'reel-phone-card';

    const isDaVinci = reel.tool.includes('DaVinci');
    const logoSrc = isDaVinci ? 'assets/logos/davinci.png' : 'assets/logos/capcut.png';

    if (reel.isHighlight) {
      card.style.borderColor = 'var(--phosphor-amber)';
      card.style.boxShadow = '0 20px 50px rgba(245, 158, 11, 0.25)';
    }

    card.innerHTML = `
      <div class="reel-viewport-9-16">
        <!-- Native High-Definition Autoplay Video -->
        <video class="reel-video-autoplay" src="${reel.videoSrc}" autoplay loop muted playsinline preload="metadata"></video>
        
        <div class="reel-hud-overlay">
          <div style="display: flex; justify-content: space-between; align-items: center; z-index: 2;">
            <span class="tool-badge-pill" style="padding: 4px 8px; font-size: 10px; ${reel.isHighlight ? 'background: rgba(245, 158, 11, 0.2); color: #f59e0b; border-color: #f59e0b;' : ''}">
              <img src="${logoSrc}" alt="${reel.tool}">
              <span>${reel.isHighlight ? '⚡ INSTAGRAM HIGHLIGHT' : reel.tool}</span>
            </span>
          </div>

          <div class="reel-play-orb" title="Click to watch with sound" style="z-index: 2;">▶</div>

          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: #cbd5e1; z-index: 2;">
            <span>⏱ ${reel.duration}</span>
            <span style="color: #22c55e; font-weight: 700;">${reel.retention}</span>
          </div>
        </div>
      </div>

      <div class="reel-card-body" style="padding: 12px 14px;">
        <div style="display: flex; gap: 8px;">
          <button class="btn-reel-sound-watch">
            Watch with Sound 🔊
          </button>
          <a href="${reel.instagramUrl}" target="_blank" rel="noopener noreferrer" class="btn-nav-talk" style="padding: 10px 14px; font-size: 11px; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid var(--border-card);" onclick="event.stopPropagation();">
            IG ↗
          </a>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      playSound('impact');
      openCinemaModal(reel);
    });

    grid.appendChild(card);
  });
}

/* ==========================================================================
   4. RENDER WEDDING EDITS & CINEMATIC FILMS
   ========================================================================== */
function renderWeddingMatrix() {
  const grid = document.getElementById('weddingMatrixGrid');
  if (!grid || !SUNNY_PROJECTS.weddings) return;

  grid.innerHTML = '';
  SUNNY_PROJECTS.weddings.forEach((film) => {
    const card = document.createElement('div');
    card.className = 'reel-phone-card';
    card.style.borderColor = 'rgba(245, 158, 11, 0.35)';

    const isDaVinci = film.tool.includes('DaVinci');
    const logoSrc = isDaVinci ? 'assets/logos/davinci.png' : 'assets/logos/capcut.png';

    card.innerHTML = `
      <div class="reel-viewport-9-16">
        <!-- Native High-Definition Autoplay Video -->
        <video class="reel-video-autoplay" src="${film.videoSrc}" autoplay loop muted playsinline preload="metadata"></video>
        
        <div class="reel-hud-overlay">
          <div style="display: flex; justify-content: space-between; align-items: center; z-index: 2;">
            <span class="tool-badge-pill" style="padding: 4px 8px; font-size: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">
              <img src="${logoSrc}" alt="${film.tool}">
              <span>${film.category}</span>
            </span>
          </div>

          <div class="reel-play-orb" title="Click to watch with sound" style="z-index: 2;">▶</div>

          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: #fde68a; z-index: 2;">
            <span>⏱ ${film.duration}</span>
            <span style="color: #f59e0b; font-weight: 700;">${film.retention}</span>
          </div>
        </div>
      </div>

      <div class="reel-card-body" style="padding: 12px 14px;">
        <div style="display: flex; gap: 8px;">
          <button class="btn-nav-talk" style="flex: 1; justify-content: center; padding: 10px; font-size: 11px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000;">
            Watch Film 🔊
          </button>
          <a href="${film.instagramUrl}" target="_blank" rel="noopener noreferrer" class="btn-nav-talk" style="padding: 10px 14px; font-size: 11px; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid var(--border-card);" onclick="event.stopPropagation();">
            IG ↗
          </a>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      playSound('impact');
      openCinemaModal(film);
    });

    grid.appendChild(card);
  });
}

function initVideoAutoplayObserver() {
  const videos = document.querySelectorAll('.reel-video-autoplay');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target;
      if (entry.isIntersecting && !document.hidden) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.1, rootMargin: '120px 0px' });

  videos.forEach(vid => {
    vid.muted = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.setAttribute('disablePictureInPicture', '');
    vid.setAttribute('disableRemotePlayback', '');
    observer.observe(vid);
  });

  // Battery and CPU optimization: pause when backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      videos.forEach(v => v.pause());
    } else {
      videos.forEach(v => {
        const r = v.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          v.play().catch(() => {});
        }
      });
    }
  });
}

/* ==========================================================================
   6. VERTICAL 9:16 CINEMA MODAL
   ========================================================================== */
function initCinemaModal() {
  const modal = document.getElementById('cinemaModalFull');
  const closeBtn = document.getElementById('cinemaModalClose');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeCinemaModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCinemaModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCinemaModal();
  });
}

function openCinemaModal(reel) {
  const modal = document.getElementById('cinemaModalFull');
  const title = document.getElementById('cinemaModalTitle');
  const client = document.getElementById('cinemaModalClient');
  const videoPlayer = document.getElementById('cinemaVideoPlayer');
  const igLink = document.getElementById('cinemaInstagramLink');

  if (!modal) return;

  if (title) title.textContent = reel.isHighlight ? "⚡ Fast Highlights & Edits" : `${reel.tool} Short-Form Edit`;
  if (client) client.textContent = `// ${reel.tool} • ⏱ ${reel.duration} • ${reel.retention}`;

  if (videoPlayer && reel.videoSrc) {
    videoPlayer.src = reel.videoSrc;
    videoPlayer.currentTime = 0;
    videoPlayer.play().catch(() => {});
  }

  if (igLink && reel.instagramUrl) {
    igLink.href = reel.instagramUrl;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCinemaModal() {
  const modal = document.getElementById('cinemaModalFull');
  const videoPlayer = document.getElementById('cinemaVideoPlayer');
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.src = '';
  }
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   6. CONTACT CHANNELS & TOAST
   ========================================================================== */
function initContactChannels() {
  const copyEmail = document.getElementById('copyEmailStrip');
  const form = document.getElementById('reelsBookingForm');

  if (copyEmail) {
    copyEmail.addEventListener('click', () => {
      navigator.clipboard.writeText('gurjarsunny718@gmail.com').then(() => {
        playSound('click');
        showToast('✓ Email copied: gurjarsunny718@gmail.com');
      });
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('impact');
      const inputs = form.querySelectorAll('input, textarea');
      const name = inputs[0] ? inputs[0].value.trim() : '';
      const email = inputs[1] ? inputs[1].value.trim() : '';
      const qty = inputs[2] ? inputs[2].value.trim() : 'Project Inquiry';
      const details = inputs[3] ? inputs[3].value.trim() : '';

      const waMsg = `Hi Sunny, my name is ${name} (${email}).\nI want to discuss video editing (${qty}).\nDetails: ${details}`;
      const waUrl = `https://wa.me/917878868020?text=${encodeURIComponent(waMsg)}`;

      showToast('🚀 Launching direct WhatsApp chat with Sunny Gurjar...');
      window.open(waUrl, '_blank');
      form.reset();
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastBubble');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ==========================================================================
   7. MANAGED CHANNELS CATEGORY FILTER TABS
   ========================================================================== */
function initChannelFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const channelCards = document.querySelectorAll('#managedChannelsGrid .managed-channel-card');

  if (!filterBtns.length || !channelCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (typeof playSound === 'function') playSound('click');

      const filter = btn.getAttribute('data-filter');

      channelCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || category === 'all') {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });
}

