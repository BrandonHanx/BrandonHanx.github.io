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
}

// Function to update the timestamp in the footnote
document.addEventListener('DOMContentLoaded', function() {
  const timestampElement = document.getElementById('last-updated');
  if (timestampElement) {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    timestampElement.textContent = now.toLocaleDateString('en-US', options);
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
