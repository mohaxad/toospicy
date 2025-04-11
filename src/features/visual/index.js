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
        id: 'smartContrast',
        name: 'Smart Contrast',
        icon: 'fa-solid fa-circle-half-stroke',
        type: 'toggle'
      },
      {
        id: 'contrastBlue',
        name: 'Blue Contrast',
        icon: 'fa-solid fa-droplet',
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
        id: 'reduceMotion',
        name: 'Reduce Motion',
        icon: 'fa-solid fa-person-walking',
        type: 'toggle'
      },
      {
        id: 'bigCursor',
        name: 'Large Cursor',
        icon: 'fa-solid fa-mouse-pointer',
        type: 'toggle'
      },
      {
        id: 'xlCursor',
        name: 'XL Cursor',
        icon: 'fa-solid fa-arrow-pointer',
        type: 'toggle'
      },
      {
        id: 'focusIndicator',
        name: 'Focus Indicator',
        icon: 'fa-solid fa-bullseye',
        type: 'toggle'
      },
      {
        id: 'tooltips',
        name: 'Show Tooltips',
        icon: 'fa-solid fa-comment-dots',
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
    // Apply existing settings on page load
    Object.entries(this.settings.getAll())
      .filter(([key]) => this.features.some(f => f.id === key))
      .forEach(([key, value]) => {
        if (value) {
          this.applyVisualSetting(key, value);
        }
      });
    
    // Listen for settings changes
    this.events.on('settings:changed', (settings, changedKey) => {
      if (this.features.some(f => f.id === changedKey)) {
        this.applyVisualSetting(changedKey, settings[changedKey]);
      }
    });
    
    // Handle system color scheme preference
    this.handleColorSchemePreference();
  }
  
  /**
   * Apply visual accessibility settings to the document
   * @param {string} id - Feature ID
   * @param {boolean} enabled - Whether feature is enabled
   */
  applyVisualSetting(id, enabled) {
    const body = document.body;
    
    // Remove existing classes first for mutually exclusive features
    if (id === 'contrast' || id === 'smartContrast' || id === 'contrastBlue') {
      body.classList.remove('spicy-contrast', 'spicy-contrast-high', 'spicy-contrast-blue');
      
      if (enabled) {
        if (id === 'contrast') {
          body.classList.add('spicy-contrast-high');
        } else if (id === 'contrastBlue') {
          body.classList.add('spicy-contrast-blue');
        } else if (id === 'smartContrast') {
          body.classList.add('spicy-contrast');
        }
      }
      return;
    }
    
    // Handle cursor size options
    if (id === 'bigCursor' || id === 'xlCursor') {
      body.classList.remove('spicy-big-cursor', 'spicy-xl-cursor');
      
      if (enabled) {
        if (id === 'bigCursor') {
          body.classList.add('spicy-big-cursor');
        } else if (id === 'xlCursor') {
          body.classList.add('spicy-xl-cursor');
        }
      }
      return;
    }
    
    // Handle motion sensitivity levels
    if (id === 'pauseAnimations' || id === 'reduceMotion') {
      body.classList.remove('spicy-stop-motion', 'spicy-reduce-motion');
      
      if (enabled) {
        if (id === 'pauseAnimations') {
          body.classList.add('spicy-stop-motion');
        } else if (id === 'reduceMotion') {
          body.classList.add('spicy-reduce-motion');
        }
      }
      return;
    }
    
    // Standard class toggle for other features
    const className = `spicy-${id.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    body.classList.toggle(className, enabled);
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
    
    // Create grid for feature buttons (UserWay style with 3 columns)
    const grid = createElement('div', { className: 'spicy-grid' });
    
    // Split features into logical groups
    const contrastFeatures = ['contrast', 'smartContrast', 'contrastBlue'];
    const modeFeatures = ['darkMode', 'lightMode', 'grayscale'];
    const contentFeatures = ['highlightLinks', 'hideImages'];
    const motionFeatures = ['pauseAnimations', 'reduceMotion'];
    const cursorFeatures = ['bigCursor', 'xlCursor'];
    const focusFeatures = ['focusIndicator', 'tooltips'];
    
    // Add all features in order within their groups
    const allGroups = [
      contrastFeatures, 
      modeFeatures, 
      contentFeatures, 
      motionFeatures, 
      cursorFeatures, 
      focusFeatures
    ];
    
    allGroups.forEach(group => {
      this.enabledFeatures
        .filter(feature => group.includes(feature.id))
        .forEach(feature => {
          const button = this.createFeatureButton(feature);
          grid.appendChild(button);
        });
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
