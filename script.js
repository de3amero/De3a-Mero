/**
 * Wedding Invitation Script
 * Reads all data dynamically from data.json
 */

$(document).ready(function () {
  // 1. DYNAMIC DATA INITIALIZATION & BINDING
  let config = {};

  function applyData(data) {
    if (!data) return;
    config = data;

    // A. COUPLE DETAILS & PHOTO
    if (data.couple) {
      const groom = data.couple.groom || {};
      const bride = data.couple.bride || {};

      // Envelope Names
      $("#env-groom-name").text(groom.shortName || "");
      $("#env-bride-name").text(bride.shortName || "");

      // Hero Section Names
      $("#hero-groom-name").text(groom.shortName || "");
      $("#hero-bride-name").text(bride.shortName || "");

      // Ceremony Card Full Names & Roles
      $("#groom-fullname-text").text(groom.fullName || groom.shortName || "");
      $("#groom-role-text").text(groom.role || "GROOM");
      $("#bride-fullname-text").text(bride.fullName || bride.shortName || "");
      $("#bride-role-text").text(bride.role || "BRIDE");

      // Couple Photo
      if (data.couple.photo) {
        $("#couple-photo-img").attr("src", data.couple.photo);
        $('meta[property="og:image"]').attr("content", data.couple.photo);
      }

      // Page Title & Meta Tags
      const eventType = data.event?.type || "Wedding Invitation";
      const pageTitle = `${groom.shortName || ""} & ${bride.shortName || ""} | ${eventType}`;
      document.title = pageTitle;
      $('meta[property="og:title"]').attr("content", pageTitle);
    }

    // B. EVENT DATE, TIME & DAY
    if (data.event) {
      const evt = data.event;
      if (evt.formattedDate) $("#env-date-text").text(evt.formattedDate);
      if (evt.time) $("#party-time-text").text(evt.time);
      if (evt.dayName) $("#party-day-text").text(evt.dayName);
      if (evt.dayNumber !== undefined) $("#party-day-number").text(evt.dayNumber);
      if (evt.monthName) $("#party-month-text").text(evt.monthName);
      if (evt.year) $("#party-year-text").text(evt.year);

      // Dynamic Mini Calendar Render
      if (evt.calendar) {
        renderCalendar(evt.calendar);
      }

      // Google Calendar Button URL
      updateGoogleCalendarLink(data);

      // Refresh Countdown with new target date
      updateCountdown();
    }

    // C. VENUE & LOCATION
    if (data.venue) {
      const v = data.venue;
      if (v.sectionTitle) $("#venue-title").text(v.sectionTitle);
      
      const fullAddress = `${v.name || ""}${v.gate ? "<br />" + v.gate : ""}`;
      $("#venue-address").html(fullAddress);

      if (v.mapEmbedUrl) {
        $("#venue-map-iframe").attr("src", v.mapEmbedUrl);
      }
      if (v.directionsUrl) {
        $("#btn-directions").attr("href", v.directionsUrl);
      }
    }

    // D. CUSTOM TEXTS
    if (data.texts) {
      const t = data.texts;
      if (t.envelopeInvites) $("#env-invites-text").text(t.envelopeInvites);
      if (t.saveTheDate) $(".save-the-date-title").text(t.saveTheDate);
      if (t.ceremonyTitle) $("#ceremony-headline").text(t.ceremonyTitle);
      if (t.ceremonyQuote) $("#ceremony-quote-text").text(t.ceremonyQuote);
      if (t.partyTitle) $("#party-headline").text(t.partyTitle);
      if (t.partySubtitle) $("#party-subheadline").text(t.partySubtitle);
      if (t.footerNote) $("#footer-note").text(t.footerNote);
    }

    // E. AUDIO CONFIG
    if (data.audio && data.audio.file) {
      const $audio = $("#bg-music");
      if ($audio.length) {
        $audio.find("source").attr("src", data.audio.file);
        $audio[0].load();
      }
    }
  }

  // Render Mini Calendar dynamically
  function renderCalendar(cal) {
    $("#calendar-month-header").text(cal.monthYear || "");
    const $grid = $("#calendar-days-container");
    $grid.empty();

    const startOffset = cal.startDayOffset || 0; // 0=Mo, 1=Tu, etc.
    const totalDays = cal.totalDays || 30;
    const highlightDay = cal.highlightDay || 1;

    // Add empty slots before day 1
    for (let i = 0; i < startOffset; i++) {
      $grid.append("<span></span>");
    }

    // Add days
    for (let d = 1; d <= totalDays; d++) {
      if (d === highlightDay) {
        $grid.append(`
          <span class="day-highlighted">
            <svg viewBox="0 0 24 22" class="day-heart-badge">
              <path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z"></path>
            </svg>
            <span class="day-num">${d}</span>
          </span>
        `);
      } else {
        $grid.append(`<span>${d}</span>`);
      }
    }
  }

  // Build Google Calendar Link dynamically
  function updateGoogleCalendarLink(data) {
    if (!data.couple || !data.event) return;
    const groom = data.couple.groom?.fullName || data.couple.groom?.shortName || "";
    const bride = data.couple.bride?.fullName || data.couple.bride?.shortName || "";
    const eventType = data.event.type || "Wedding Party";
    const venueName = `${data.venue?.name || ""} ${data.venue?.gate || ""}`.trim();
    
    const eventTitle = encodeURIComponent(`${groom} & ${bride}'s ${eventType}`);
    const details = encodeURIComponent(`Join us to celebrate ${groom} & ${bride} at ${venueName}`);
    const location = encodeURIComponent(venueName);

    let datesParam = "20260912T173000Z/20260912T203000Z";
    if (data.event.targetCountdownDate) {
      try {
        const d = new Date(data.event.targetCountdownDate);
        const startStr = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const endDate = new Date(d.getTime() + 4 * 60 * 60 * 1000);
        const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
        datesParam = `${startStr}/${endStr}`;
      } catch (e) {}
    }

    const calUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${datesParam}&ctz=Africa/Cairo&details=${details}&location=${location}`;
    $("#btn-add-calendar").attr("href", calUrl);
  }

  // Load configuration dynamically from data.json
  function loadData() {
    const jsonUrl = "data.json?v=" + new Date().getTime();

    fetch(jsonUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        console.log("Wedding data loaded dynamically from data.json:", data);
        applyData(data);
      })
      .catch(function (fetchErr) {
        console.warn("fetch('data.json') failed directly (e.g. Chrome file:/// origin restriction):", fetchErr);
        // Fallback for file:/// protocol if fetch is blocked by browser CORS policy
        if (window.weddingData) {
          applyData(window.weddingData);
        } else {
          $.getScript("data.js")
            .done(function () {
              if (window.weddingData) {
                applyData(window.weddingData);
              }
            })
            .fail(function () {
              console.error("Could not load data. Run via localhost (start.bat or 'php -S localhost:8000') to load data.json dynamically.");
            });
        }
      });
  }

  // Initial load from data.json
  loadData();

  // 2. BACKGROUND MUSIC LOGIC
  const bgMusic = document.getElementById("bg-music");
  let isMusicPlaying = false;

  function playMusic() {
    if (!bgMusic) return;
    const startSec = config.audio?.startSeconds || 16;
    if (bgMusic.currentTime === 0) {
      bgMusic.currentTime = startSec;
    }

    bgMusic.play().then(() => {
      isMusicPlaying = true;
      $("#music-toggle-btn").addClass("playing");
    }).catch((err) => {
      console.log("Autoplay blocked:", err);
      isMusicPlaying = false;
      $("#music-toggle-btn").removeClass("playing");
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    $("#music-toggle-btn").removeClass("playing");
  }

  $("#music-toggle-btn").on("click", function (e) {
    e.stopPropagation();
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  // 3. AUTO-SCROLL DOWN SLOWLY & CLICK TO PAUSE/RESUME
  let isAutoScrolling = false;
  let autoScrollAnimId = null;
  let lastFrameTime = 0;
  const scrollSpeed = 28; // Pixels per second (very slow, gentle reading speed)
  let initialAutoScrollTimer = null;
  let hasOpened = false;

  function updateScrollPill(active) {
    const $pill = $("#scroll-pill");
    const $text = $("#scroll-pill-text");

    if (active) {
      $pill.removeClass("paused");
      $text.text("Auto scroll: On");
    } else {
      $pill.addClass("paused");
      $text.text("Auto scroll: Paused");
    }
  }

  function startAutoScroll() {
    if (isAutoScrolling) return;

    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (currentY >= maxScroll - 10) return;

    isAutoScrolling = true;
    lastFrameTime = performance.now();
    updateScrollPill(true);

    function step(currentTime) {
      if (!isAutoScrolling) return;

      const delta = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;

      const scrollNow = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollLimit = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollNow >= scrollLimit - 5) {
        stopAutoScroll();
        return;
      }

      const nextY = scrollNow + (scrollSpeed * delta);
      window.scrollTo(0, nextY);

      autoScrollAnimId = requestAnimationFrame(step);
    }

    autoScrollAnimId = requestAnimationFrame(step);
  }

  function stopAutoScroll() {
    isAutoScrolling = false;
    if (autoScrollAnimId) {
      cancelAnimationFrame(autoScrollAnimId);
      autoScrollAnimId = null;
    }
    updateScrollPill(false);
  }

  function toggleAutoScroll() {
    if (!hasOpened) return;

    if (isAutoScrolling) {
      stopAutoScroll();
    } else {
      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentY < maxScroll - 10) {
        startAutoScroll();
      }
    }
  }

  // 4. OPEN INVITATION LOGIC
  function openInvitation() {
    if (hasOpened) return;
    hasOpened = true;

    $("#envelope-screen").addClass("opened");

    setTimeout(() => {
      $("#envelope-screen").addClass("d-none");
      $("#invitation-screen").removeClass("d-none").hide().fadeIn(600);
      $("#scroll-pill").removeClass("d-none").hide().fadeIn(600);
      window.scrollTo(0, 0);

      // Start auto-scroll after a gentle 1.4s delay
      if (initialAutoScrollTimer) clearTimeout(initialAutoScrollTimer);
      initialAutoScrollTimer = setTimeout(() => {
        startAutoScroll();
      }, 1400);
    }, 450);

    // Play Background Music
    playMusic();
  }

  // Click on "Open" Button or Wax Seal
  $("#open-btn, #wax-seal").on("click", function (e) {
    e.preventDefault();
    openInvitation();
  });

  // Auto-open if URL has ?open=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("open") === "1") {
    openInvitation();
  }

  // Click anywhere on page to pause/resume auto-scroll
  $(document).on("click", function (e) {
    if (!hasOpened) return;

    // Ignore clicks on buttons/links
    if ($(e.target).closest("#music-toggle-btn, a, button, iframe").length) {
      return;
    }

    toggleAutoScroll();
  });

  // Direct click on pill
  $("#scroll-pill").on("click", function (e) {
    e.stopPropagation();
    toggleAutoScroll();
  });

  // Manual scroll detection
  window.addEventListener("wheel", function () {
    if (isAutoScrolling) stopAutoScroll();
  }, { passive: true });

  window.addEventListener("touchmove", function () {
    if (isAutoScrolling) stopAutoScroll();
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space"].includes(e.code)) {
      if (isAutoScrolling) stopAutoScroll();
    }
  });

  // 5. FLOATING PARTICLES
  function createParticles() {
    const $container = $("#particles-container");
    if (!$container.length) return;

    const colors = ["#a8323b", "#7a1f26", "#ece4d8", "#c9a24a", "#e87a82"];
    const totalParticles = 24;

    for (let i = 0; i < totalParticles; i++) {
      const left = Math.random() * 100;
      const size = 12 + Math.random() * 14;
      const duration = 16 + Math.random() * 12;
      const delay = -(Math.random() * 20);
      const sway = (Math.random() - 0.5) * 60;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const heartSvg = `
        <div class="ambient-particle" style="
          left: ${left}%;
          font-size: ${size}px;
          color: ${color};
          --sway: ${sway}px;
          animation-duration: ${duration}s;
          animation-delay: ${delay}s;
        ">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      `;
      $container.append(heartSvg);
    }
  }

  createParticles();

  // 6. LIVE COUNTDOWN TIMER
  function updateCountdown() {
    if (!config.event?.targetCountdownDate) return;
    const countdownTarget = new Date(config.event.targetCountdownDate).getTime();
    if (isNaN(countdownTarget)) return;

    const now = new Date().getTime();
    const distance = countdownTarget - now;

    if (distance < 0) {
      $("#days").text("00");
      $("#hours").text("00");
      $("#minutes").text("00");
      $("#seconds").text("00");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    $("#days").text(String(days).padStart(2, "0"));
    $("#hours").text(String(hours).padStart(2, "0"));
    $("#minutes").text(String(minutes).padStart(2, "0"));
    $("#seconds").text(String(seconds).padStart(2, "0"));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
