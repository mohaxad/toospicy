/**
 * DOM Utilities
 * Helpers for DOM manipulation
 */

/**
 * Create an HTML element with attributes and properties
 * @param {string} tag - Tag name
 * @param {Object} options - Element options
 * @param {string} [options.id] - Element ID
 * @param {string|string[]} [options.className] - Element class(es)
 * @param {Object} [options.attributes] - Element attributes
 * @param {Object} [options.properties] - Element properties
 * @param {Object} [options.dataset] - Dataset attributes
 * @param {Object} [options.style] - Inline styles
 * @param {string} [options.textContent] - Text content
 * @param {string} [options.innerHTML] - Inner HTML
 * @param {Element[]} [options.children] - Child elements
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  // Set ID
  if (options.id) {
    element.id = options.id;
  }
  
  // Set classes
  if (options.className) {
    if (Array.isArray(options.className)) {
      element.classList.add(...options.className);
    } else {
      element.className = options.className;
    }
  }
  
  // Set attributes
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  // Set properties
  if (options.properties) {
    Object.entries(options.properties).forEach(([key, value]) => {
      element[key] = value;
    });
  }
  
  // Set dataset
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }
  
  // Set styles
  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }
  
  // Set text content
  if (options.textContent !== undefined) {
    element.textContent = options.textContent;
  }
  
  // Set HTML content
  if (options.innerHTML !== undefined) {
    element.innerHTML = options.innerHTML;
  }
  
  // Append children
  if (options.children) {
    options.children.forEach(child => {
      element.appendChild(child);
    });
  }
  
  return element;
}

/**
 * Add global styles to the document head
 * @returns {Promise} Promise that resolves when styles are loaded
 */
export function addGlobalStyles() {
  return new Promise((resolve) => {
    console.log('Adding global styles...');
    
    // Check if styles are already added
    if (document.getElementById('spicy-global-styles')) {
      console.log('Global styles already added');
      resolve();
      return;
    }
    
    // Add Font Awesome from CDN directly if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
      console.log('Loading Font Awesome from CDN...');
      
      // Create a link element for Font Awesome
      const fontAwesomeLink = document.createElement('link');
      fontAwesomeLink.rel = 'stylesheet';
      fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      fontAwesomeLink.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
      fontAwesomeLink.crossOrigin = 'anonymous';
      fontAwesomeLink.referrerPolicy = 'no-referrer';
      
      document.head.appendChild(fontAwesomeLink);
      
      // Additionally load the solid style specifically
      const fontAwesomeSolidLink = document.createElement('link');
      fontAwesomeSolidLink.rel = 'stylesheet';
      fontAwesomeSolidLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/solid.min.css';
      fontAwesomeSolidLink.integrity = 'sha512-yDUXOUWwbHH4ggxueDnC5vJv4tmfySpVdIcN1LksGZi8W8EVZv4uKGrQc0pVf66zS7LDhFJM7Zdeow1sw1/8Jw==';
      fontAwesomeSolidLink.crossOrigin = 'anonymous';
      fontAwesomeSolidLink.referrerPolicy = 'no-referrer';
      
      document.head.appendChild(fontAwesomeSolidLink);
      
      console.log('Font Awesome CSS added to document head');
    } else {
      console.log('Font Awesome already loaded');
    }
    
    // Add inline Font Awesome styles as a fallback
    const faFallbackStyle = document.createElement('style');
    faFallbackStyle.textContent = `
      .fa-universal-access:before {
        content: "♿";
      }
      .fa-xmark:before {
        content: "✕";
      }
      .fa-arrows-rotate:before {
        content: "↻";
      }
    `;
    document.head.appendChild(faFallbackStyle);
    
    // Add accessible focus styles
    const focusStyles = document.createElement('style');
    focusStyles.id = 'spicy-global-styles';
    focusStyles.textContent = `
      .keyboard-focus {
        outline: 3px solid #4265ED !important;
        outline-offset: 2px !important;
      }
      
      /* Feature icon styles */
      #spicy-access-panel i[class*="fa-"],
      #spicy-access-btn i[class*="fa-"] {
        font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important;
        font-weight: 900 !important;
        font-style: normal;
        display: inline-block;
      }
      
      /* Panel animation */
      #spicy-access-panel {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      /* Focus indicator styles */
      body.spicy-focus-indicator *:focus {
        outline: 4px solid #f00 !important;
        outline-offset: 3px !important;
        border-radius: 2px;
      }
      
      /* Big cursor styles */
      body.spicy-big-cursor {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8.652,29.21l8.364-8.4L5.594,13.414c-1.1-0.718-1.399-2.204-0.678-3.312 c0.721-1.107,2.205-1.401,3.313-0.678l11.414,7.389l8.365-8.398c0.785-0.789,2.048-0.789,2.832,0 c0.783,0.783,0.783,2.05,0,2.833l-8.364,8.397l11.414,7.388c1.107,0.721,1.409,2.205,0.68,3.313 c-0.722,1.107-2.206,1.407-3.315,0.679L19.83,22.638l-8.363,8.396c-0.786,0.786-2.048,0.786-2.832,0 C7.852,31.258,7.852,29.994,8.652,29.21z" fill="black" stroke="white" stroke-width="1.5"/></svg>') 15 15, auto !important;
      }
      
      /* Tooltip styles */
      body.spicy-tooltips [title]:not([title=""]):hover::after {
        content: attr(title);
        position: absolute;
        background: #333;
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        white-space: normal;
        max-width: 300px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(100% + 10px);
        pointer-events: none;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(focusStyles);
    
    console.log('Global styles added');
    
    // Resolve immediately without waiting for font loading
    resolve();
  });
}

/**
 * Find the first focusable element within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement|null} First focusable element or null
 */
export function findFirstFocusable(container) {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return container.querySelector(selector);
}

/**
 * Trap focus within an element (for modals and dialogs)
 * @param {HTMLElement} element - Element to trap focus within
 * @returns {Function} Function to remove the trap
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if an element is visible in the viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} [offset=0] - Offset from viewport edges
 * @returns {boolean} Whether the element is visible
 */
export function isInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 + offset &&
    rect.left >= 0 + offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) - offset
  );
}

/**
 * Generate a unique ID for DOM elements
 * @param {string} [prefix='spicy-id-'] - ID prefix
 * @returns {string} Unique ID
 */
export function uniqueId(prefix = 'spicy-id-') {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}
