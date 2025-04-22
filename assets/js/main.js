// Main application entry point

/**
 * Main JavaScript Entry Point
 * Minimal implementation that handles just the essentials
 */

// Get reference to jQuery (loaded from CDN in index.html)
const $ = window.jQuery;

// Apply sci-fi theme classes
function applySciThemeClasses() {
  // Add theme class to html and body
  document.documentElement.classList.add('sci-fi-theme');
  document.body.classList.add('sci-fi-theme');
  
  // Add to sections, wrappers, and other containers
  const themeElements = document.querySelectorAll('.wrapper, .section, .spotlights, .features, .content, #sidebar, #footer');
  themeElements.forEach(el => {
    el.classList.add('sci-fi-theme');
  });
}

// Initialize theme functionality
function initializeTheme() {
  console.log('Initializing sci-fi theme...');
  
  // Apply theme classes
  applySciThemeClasses();
  
  // Initialize animations with GSAP instead of AOS
  console.log('Initializing animations with GSAP...');
  
  // Initialize smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      
      window.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth'
      });
    });
  });
  
  // If jQuery and plugins are available, initialize them
  if ($ && $.fn.scrollex && $.fn.scrolly) {
    initializeJQueryPlugins();
  }
  
  // Remove preload state
  setTimeout(() => {
    document.body.classList.remove('is-preload');
  }, 100);
  
  console.log('Theme initialization complete');
}

// Initialize jQuery plugins if available
function initializeJQueryPlugins() {
  const $window = $(window);
  const $body = $('body');
  const $sidebar = $('#sidebar');
  
  // Initialize sidebar links
  if ($sidebar.length) {
    const $sidebar_a = $sidebar.find('a');
    
    $sidebar_a
      .addClass('scrolly')
      .on('click', function() {
        const $this = $(this);
        
        // External link? Behave normally
        if ($this.attr('href').charAt(0) != '#')
          return;
        
        // Deactivate all links
        $sidebar_a.removeClass('active');
        
        // Activate this link
        $this.addClass('active');
      });
  }
  
  // Initialize scrolly
  $('.scrolly').scrolly({
    speed: 1000,
    offset: function() {
      // If sidebar is visible, use its height as offset
      if ($(window).width() <= 1280 && $(window).width() > 736 && $sidebar.length > 0)
        return $sidebar.height();
      
      return 0;
    }
  });
  
  // Initialize spotlights
  $('.spotlights > section').each(function() {
    // Handle image backgrounds
    const $this = $(this);
    const $image = $this.find('.image');
    const $img = $image.find('img');
    
    // Set background image
    if ($image.length && $img.length) {
      $image.css('background-image', 'url(' + $img.attr('src') + ')');
      
      // Set background position
      if ($img.data('position'))
        $image.css('background-position', $img.data('position'));
      
      // Hide image
      $img.hide();
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...');
  
  // Initialize theme
  initializeTheme();
});

// Export theme initialization for external use
export default {
  init: initializeTheme,
  refreshAnimations: () => console.log('Animation refresh called')
};
