// Script to enhance sci-fi tech theme effects
document.addEventListener('DOMContentLoaded', function() {
    // Set data-text attribute for headings to enable glitch effect
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        if (!heading.getAttribute('data-text')) {
            heading.setAttribute('data-text', heading.textContent);
        }
    });

    // Optional: Add class for scanline effect to code blocks
    const codeBlocks = document.querySelectorAll('code');
    codeBlocks.forEach(block => {
        block.classList.add('scanline-effect');
    });
    
    // Enhance hover effects on sci-fi elements
    const techElements = document.querySelectorAll('.spotlight, .features article, .button');
    techElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            this.style.transition = 'all 0.3s ease';
            if (!this.classList.contains('button')) {
                this.style.boxShadow = 'var(--glow-green)';
            }
        });
        
        element.addEventListener('mouseout', function() {
            if (!this.classList.contains('button')) {
                this.style.boxShadow = '';
            }
        });
    });
    
    // Add entry animations to major elements
    const animatedElements = document.querySelectorAll('.spotlight, .features article, .major h1, .major h2, .major h3');
    
    animatedElements.forEach((element, index) => {
        // Pre-assign delay classes based on element position
        element.classList.add(`delay-${(index % 3) + 1}`);
    });

    // Intersection Observer for triggering animations when elements come into view
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.visibility = 'visible';
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe all major elements
        document.querySelectorAll('.spotlight, .features article, .major h1, .major h2, .major h3').forEach(element => {
            element.style.visibility = 'hidden';
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        document.querySelectorAll('.spotlight, .features article, .major h1, .major h2, .major h3').forEach(element => {
            element.classList.add('fade-in-up');
        });
    }
});

