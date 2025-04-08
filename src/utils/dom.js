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
 */
export function addGlobalStyles() {
  // Check if styles are already added
  if (document.getElementById('spicy-global-styles')) return;
  
  // Create style element
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.rel = 'stylesheet';
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(fontAwesomeLink);
  
  // Add accessible focus styles
  const focusStyles = document.createElement('style');
  focusStyles.id = 'spicy-global-styles';
  focusStyles.textContent = `
    .keyboard-focus {
      outline: 3px solid #4361ee !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(focusStyles);
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
