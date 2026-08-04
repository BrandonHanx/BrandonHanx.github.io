// Check for saved theme preference or use system preference
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
  } else {
    // If no saved preference, use system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    }
  }

  // Add fade-in effect when page loads
  document.body.classList.add('fade-in');

  // Set up smooth page transitions
  setupPageTransitions();

  // Set up scroll behavior for top navigation
  setupScrollBehavior();

  // Deform the background contours in response to scroll position and speed.
  setupScrollResponsiveContours();

  // Keep the theme toggle state accessible to assistive technology.
  updateThemeToggleState();
});

// Set up smooth page transitions
function setupPageTransitions() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.top-nav a');

  // Add click event listener to each link
  navLinks.forEach(link => {
    // Skip if it's the current page
    if (link.classList.contains('current-page')) {
      return;
    }

    link.addEventListener('click', function(e) {
      // Only handle internal links
      if (this.hostname === window.location.hostname) {
        e.preventDefault();
        const targetHref = this.getAttribute('href');

        // Start fade-out animation
        document.body.classList.add('fade-out');

        // Navigate to the new page after animation completes
        setTimeout(() => {
          window.location.href = targetHref;
        }, 300); // Match this with the CSS transition duration
      }
    });
  });
}

// Function to toggle theme
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  updateThemeToggleState();
}

function updateThemeToggleState() {
  const toggle = document.querySelector('.theme-toggle');
  const isDark = document.body.classList.contains('dark-mode');
  const favicon = document.getElementById('site-favicon');

  if (toggle) {
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (favicon) {
    favicon.href = isDark
      ? 'assets/flow-mark-dark.svg'
      : 'assets/flow-mark-light.svg';
  }
}

// Function to update the timestamp in the footnote with the last modified date
document.addEventListener('DOMContentLoaded', function() {
  const timestampElement = document.getElementById('last-updated');
  if (timestampElement) {
    // Use document.lastModified to get the last modified date of the current document
    const lastModified = new Date(document.lastModified);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    timestampElement.textContent = lastModified.toLocaleDateString('en-US', options);
  }
});

// Function to handle scroll behavior for top navigation
function setupScrollBehavior() {
  const topControls = document.querySelector('.top-controls');
  if (!topControls) return; // Exit if element doesn't exist

  let lastScrollTop = 0;
  let scrollTimeout;

  // Show the top controls initially
  topControls.classList.add('visible');

  window.addEventListener('scroll', function() {
    // Clear the timeout if it exists
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show controls when scrolling up, hide when scrolling down
    if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
      // Scrolling down and not at the top
      topControls.classList.remove('visible');
      topControls.classList.add('hidden');
    } else {
      // Scrolling up or at the top
      topControls.classList.remove('hidden');
      topControls.classList.add('visible');
    }

    lastScrollTop = currentScrollTop;

    // Hide controls after 2 seconds of no scrolling
    scrollTimeout = setTimeout(function() {
      if (currentScrollTop > 100) {
        topControls.classList.remove('visible');
        topControls.classList.add('hidden');
      }
    }, 2000);
  });

  // Show controls when hovering near the top of the screen
  document.addEventListener('mousemove', function(e) {
    if (e.clientY < 60) {
      topControls.classList.remove('hidden');
      topControls.classList.add('visible');
    }
  });
}

// Generate smooth contour paths whose shape responds to scroll velocity.
function setupScrollResponsiveContours() {
  const field = document.querySelector('.contour-field');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!field) return;

  const paths = Array.from(field.children).filter(element => element.tagName.toLowerCase() === 'path');
  if (!paths.length) return;

  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let targetVelocity = 0;
  let velocity = 0;
  let momentumPhase = 0;
  let frameId = null;
  let previousFrameTime = performance.now();

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  function smoothPath(points) {
    let pathData = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)];
      const current = points[index];
      const next = points[index + 1];
      const following = points[Math.min(points.length - 1, index + 2)];
      const controlOneX = current.x + (next.x - previous.x) / 6;
      const controlOneY = current.y + (next.y - previous.y) / 6;
      const controlTwoX = next.x - (following.x - current.x) / 6;
      const controlTwoY = next.y - (following.y - current.y) / 6;

      pathData += ` C${controlOneX.toFixed(1)},${controlOneY.toFixed(1)}`;
      pathData += ` ${controlTwoX.toFixed(1)},${controlTwoY.toFixed(1)}`;
      pathData += ` ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
    }

    return pathData;
  }

  function renderContours(time) {
    const elapsed = Math.min(40, time - previousFrameTime || 16);
    previousFrameTime = time;
    const frameRatio = elapsed / 16.67;

    velocity += (targetVelocity - velocity) * (1 - Math.pow(0.7, frameRatio));
    targetVelocity *= Math.pow(0.82, frameRatio);
    momentumPhase += velocity * elapsed * 0.0022;

    const speed = Math.min(4, Math.abs(velocity));
    const direction = Math.sign(velocity);
    const mobileScale = window.innerWidth <= 760 ? 0.55 : 1;
    const speedResponse = Math.min(1, speed / 2.2);
    const scrollPhase = window.scrollY * 0.0016 + momentumPhase;
    const waistY = 505 + Math.sin(scrollPhase * 0.38) * 78;
    const middlePath = (paths.length - 1) / 2;

    paths.forEach((path, pathIndex) => {
      const points = [];
      const lane = (pathIndex - middlePath) * 70 * mobileScale;

      for (let pointIndex = 0; pointIndex <= 15; pointIndex += 1) {
        const y = -140 + pointIndex * 96;
        const distanceFromWaist = (y - waistY) / 330;
        const spread = 0.22 + 0.78 * (1 - Math.exp(-(distanceFromWaist * distanceFromWaist)));
        const sharedFlow = Math.sin(y * 0.0065 + scrollPhase) * 42 * mobileScale;
        const twist = Math.sin(y * 0.012 - scrollPhase * 0.35) * distanceFromWaist * 12 * mobileScale;
        const velocityPinch = direction * speedResponse * Math.exp(-(distanceFromWaist * distanceFromWaist)) * 18;
        const x = 470 + lane * spread + sharedFlow + twist + velocityPinch;
        points.push({ x, y });
      }

      path.setAttribute('d', smoothPath(points));
    });

    const horizontalShift = clamp(-velocity * 3, -12, 12);
    const verticalShift = clamp(-velocity * 7, -24, 24);
    const scale = 1 + speedResponse * 0.008;
    field.style.transform = `translate3d(${horizontalShift}px, ${verticalShift}px, 0) scale(${scale})`;

    if (Math.abs(targetVelocity) > 0.005 || Math.abs(velocity) > 0.005) {
      frameId = requestAnimationFrame(renderContours);
    } else {
      frameId = null;
    }
  }

  function requestContourFrame() {
    if (frameId === null) {
      previousFrameTime = performance.now();
      frameId = requestAnimationFrame(renderContours);
    }
  }

  if (!reducedMotion.matches) {
    window.addEventListener('scroll', function () {
      const now = performance.now();
      const elapsed = Math.min(50, Math.max(8, now - lastScrollTime));
      const scrollY = window.scrollY;
      targetVelocity = clamp((scrollY - lastScrollY) / elapsed, -4, 4);
      lastScrollY = scrollY;
      lastScrollTime = now;
      requestContourFrame();
    }, { passive: true });
  }

  window.addEventListener('resize', requestContourFrame);
  requestContourFrame();
}
