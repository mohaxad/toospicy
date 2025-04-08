/**
 * VisualFeatures - Visual accessibility features
 * Handles contrast, dark mode, grayscale, etc.
 */

import { createElement } from '../../utils/dom';

export default class VisualFeatures {
  /**
   * Creates a new VisualFeatures instance
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(settings, events) {
    this.settings = settings;
    this.events = events;
    this.features = [
      {
        id: 'contrast',
        name: 'High Contrast',
        icon: 'fa-solid fa-adjust',
        type: 'toggle'
      },
      {
        id: 'darkMode',
        name: 'Dark Mode',
        icon: 'fa-solid fa-moon',
        type: 'toggle'
      },
      {
        id: 'lightMode',
        name: 'Light Mode',
        icon: 'fa-solid fa-sun',
        type: 'toggle'
      },
      {
        id: 'grayscale',
        name: 'Grayscale',
        icon: 'fa-solid fa-brush',
        type: 'toggle'
      },
      {
        id: 'highlightLinks',
        name: 'Highlight Links',
        icon: 'fa-solid fa-link',
        type: 'toggle'
      },
      {
        id: 'hideImages',
        name: 'Hide Images',
        icon: 'fa-solid fa-image-slash',
        type: 'toggle'
      },
      {
        id: 'pauseAnimations',
        name: 'Stop Animations',
        icon: 'fa-solid fa-pause',
        type: 'toggle'
      },
      {
        id: 'bigCursor',
        name: 'Large Cursor',
        icon: 'fa-solid fa-mouse-pointer',
        type: 'toggle'
      },
      {
        id: 'focusIndicator',
        name: 'Focus Indicator',
        icon: 'fa-solid fa-bullseye',
        type: 'toggle'
      }
    ];
    
    // All features are enabled by default
    this.enabledFeatures = [...this.features];
  }
  
  /**
   * Initialize visual features
   */
  init() {
    // Apply current settings
    this.applySettings(this.settings.getAll());
    
    // Listen for settings changes
    this.events.on('settings:changed', this.applySettings.bind(this));
    
    // Handle system color scheme preference
    this.handleColorSchemePreference();
  }
  
  /**
   * Apply visual settings to the page
   * @param {Object} settings - Current settings
   */
  applySettings(settings) {
    // Apply high contrast
    document.body.classList.toggle('spicy-contrast', settings.contrast);
    
    // Apply dark mode
    document.body.classList.toggle('spicy-dark-mode', settings.darkMode);
    
    // Apply light mode
    document.body.classList.toggle('spicy-light-mode', settings.lightMode);
    
    // Apply grayscale
    document.body.classList.toggle('spicy-grayscale', settings.grayscale);
    
    // Apply link highlighting
    document.body.classList.toggle('spicy-highlight-links', settings.highlightLinks);
    
    // Apply image hiding
    document.body.classList.toggle('spicy-hide-images', settings.hideImages);
    
    // Apply animation pausing
    document.body.classList.toggle('spicy-pause-animations', settings.pauseAnimations);
    
    // Apply big cursor
    document.body.classList.toggle('spicy-big-cursor', settings.bigCursor);
    
    // Apply focus indicator
    document.body.classList.toggle('spicy-focus-indicator', settings.focusIndicator);
  }
  
  /**
   * Handle system color scheme preference
   */
  handleColorSchemePreference() {
    // Check for prefers-color-scheme media query
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial check
    if (prefersDarkMode.matches && this.settings.getSetting('darkMode') === false && this.settings.getSetting('lightMode') === false) {
      this.settings.updateSetting('darkMode', true);
    }
    
    // Listen for changes
    prefersDarkMode.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't made an explicit choice
      if (this.settings.getSetting('darkMode') === false && this.settings.getSetting('lightMode') === false) {
        this.settings.updateSetting('darkMode', e.matches);
      }
    });
  }
  
  /**
   * Render visual features section in the panel
   * @returns {HTMLElement} Section element
   */
  renderSection() {
    // Don't render if no features are enabled
    if (this.enabledFeatures.length === 0) return null;
    
    // Create section container
    const section = createElement('div', {
      className: 'spicy-section',
      innerHTML: `<h3><i class="fa-solid fa-circle-half-stroke"></i> Visual Display</h3>`
    });
    
    // Create grid for feature buttons
    const grid = createElement('div', { className: 'spicy-grid' });
    
    // Split features into color & display sections
    const colorFeatures = ['contrast', 'darkMode', 'lightMode', 'grayscale'];
    const displayFeatures = ['highlightLinks', 'hideImages', 'pauseAnimations', 'bigCursor', 'focusIndicator'];
    
    // Add color features first
    this.enabledFeatures
      .filter(feature => colorFeatures.includes(feature.id))
      .forEach(feature => {
        const button = this.createFeatureButton(feature);
        grid.appendChild(button);
      });
    
    // Add display features
    this.enabledFeatures
      .filter(feature => displayFeatures.includes(feature.id))
      .forEach(feature => {
        const button = this.createFeatureButton(feature);
        grid.appendChild(button);
      });
    
    // Add grid to section if it has any children
    if (grid.children.length > 0) {
      section.appendChild(grid);
    }
    
    return section;
  }
  
  /**
   * Create a feature toggle button
   * @param {Object} feature - Feature configuration
   * @returns {HTMLElement} Button element
   */
  createFeatureButton(feature) {
    const button = createElement('button', {
      className: 'spicy-feature-btn',
      id: `spicy-${feature.id}`,
      innerHTML: `
        <i class="${feature.icon}"></i>
        <span>${feature.name}</span>
      `
    });
    
    // Set active state based on current setting
    if (this.settings.getSetting(feature.id)) {
      button.classList.add('active');
    }
    
    // Add click event
    button.addEventListener('click', () => {
      const isActive = button.classList.toggle('active');
      
      // Handle mutually exclusive settings
      if (isActive) {
        if (feature.id === 'darkMode' && this.settings.getSetting('lightMode')) {
          this.settings.updateSetting('lightMode', false);
          const lightButton = document.getElementById('spicy-lightMode');
          if (lightButton) {
            lightButton.classList.remove('active');
          }
        } else if (feature.id === 'lightMode' && this.settings.getSetting('darkMode')) {
          this.settings.updateSetting('darkMode', false);
          const darkButton = document.getElementById('spicy-darkMode');
          if (darkButton) {
            darkButton.classList.remove('active');
          }
        }
      }
      
      this.settings.updateSetting(feature.id, isActive);
    });
    
    return button;
  }
  
  /**
   * Update UI based on current settings
   * @param {Object} settings - Current settings
   */
  updateUI(settings) {
    // Update toggle buttons
    this.features.forEach(feature => {
      const button = document.getElementById(`spicy-${feature.id}`);
      if (button) {
        button.classList.toggle('active', settings[feature.id]);
      }
    });
  }
}
