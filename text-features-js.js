/**
 * TextFeatures - Text-related accessibility features
 * Handles font size, dyslexia font, spacing, etc.
 */

import { createElement } from '../../utils/dom';
import { loadFont } from '../../utils/fonts';

export default class TextFeatures {
  /**
   * Creates a new TextFeatures instance
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(settings, events) {
    this.settings = settings;
    this.events = events;
    this.features = [
      {
        id: 'fontSize',
        name: 'Text Size',
        icon: 'fa-solid fa-text-height',
        type: 'slider',
        min: 80,
        max: 200,
        step: 10,
        default: 100
      },
      {
        id: 'dyslexicFont',
        name: 'Dyslexia Font',
        icon: 'fa-solid fa-font',
        type: 'toggle'
      },
      {
        id: 'lineHeight',
        name: 'Line Spacing',
        icon: 'fa-solid fa-arrows-up-down',
        type: 'toggle'
      },
      {
        id: 'letterSpacing',
        name: 'Letter Spacing',
        icon: 'fa-solid fa-arrows-left-right',
        type: 'toggle'
      }
    ];
    
    // All features are enabled by default
    this.enabledFeatures = [...this.features];
  }
  
  /**
   * Initialize text features
   */
  init() {
    // Preload dyslexia font
    loadFont('OpenDyslexic', 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.woff');
    
    // Apply current settings
    this.applySettings(this.settings.getAll());
    
    // Listen for settings changes
    this.events.on('settings:changed', this.applySettings.bind(this));
  }
  
  /**
   * Apply text settings to the page
   * @param {Object} settings - Current settings
   */
  applySettings(settings) {
    // Apply font size
    document.documentElement.style.setProperty('--spicy-font-size', `${settings.fontSize}%`);
    
    // Apply dyslexic font
    document.body.classList.toggle('spicy-dyslexic', settings.dyslexicFont);
    
    // Apply line height
    document.body.classList.toggle('spicy-line-height', settings.lineHeight);
    
    // Apply letter spacing
    document.body.classList.toggle('spicy-letter-spacing', settings.letterSpacing);
  }
  
  /**
   * Render text features section in the panel
   * @returns {HTMLElement} Section element
   */
  renderSection() {
    // Don't render if no features are enabled
    if (this.enabledFeatures.length === 0) return null;
    
    // Create section container
    const section = createElement('div', {
      className: 'spicy-section',
      innerHTML: `<h3><i class="fa-solid fa-book-open-reader"></i> Text & Reading</h3>`
    });
    
    // Font size slider
    const fontSizeFeature = this.enabledFeatures.find(f => f.id === 'fontSize');
    if (fontSizeFeature) {
      const fontSizeControl = this.createFontSizeControl(fontSizeFeature);
      section.appendChild(fontSizeControl);
    }
    
    // Create grid for toggle buttons
    const grid = createElement('div', { className: 'spicy-grid' });
    
    // Add toggle features
    this.enabledFeatures
      .filter(feature => feature.type === 'toggle')
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
   * Create font size control with slider and buttons
   * @param {Object} feature - Feature configuration
   * @returns {HTMLElement} Control element
   */
  createFontSizeControl(feature) {
    const container = createElement('div', { className: 'spicy-control-group' });
    
    // Decrease button
    const decreaseBtn = createElement('button', {
      className: 'spicy-btn spicy-icon-btn',
      id: 'spicy-font-decrease',
      innerHTML: '<i class="fa-solid fa-minus"></i>',
      attributes: {
        'aria-label': 'Decrease font size'
      }
    });
    
    // Slider container
    const sliderContainer = createElement('div', {
      className: 'spicy-slider-container'
    });
    
    // Slider
    const slider = createElement('input', {
      id: 'spicy-font-slider',
      attributes: {
        type: 'range',
        min: feature.min,
        max: feature.max,
        step: feature.step,
        value: this.settings.getSetting('fontSize'),
        'aria-labelledby': 'spicy-font-size-label'
      }
    });
    
    // Size label
    const sizeLabel = createElement('span', {
      id: 'spicy-font-size-label',
      textContent: `${this.settings.getSetting('fontSize')}%`
    });
    
    // Increase button
    const increaseBtn = createElement('button', {
      className: 'spicy-btn spicy-icon-btn',
      id: 'spicy-font-increase',
      innerHTML: '<i class="fa-solid fa-plus"></i>',
      attributes: {
        'aria-label': 'Increase font size'
      }
    });
    
    // Add elements to container
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(sizeLabel);
    container.appendChild(decreaseBtn);
    container.appendChild(sliderContainer);
    container.appendChild(increaseBtn);
    
    // Add event listeners
    slider.addEventListener('input', () => {
      const size = slider.value;
      this.settings.updateSetting('fontSize', parseInt(size));
      sizeLabel.textContent = `${size}%`;
    });
    
    decreaseBtn.addEventListener('click', () => {
      const newSize = Math.max(feature.min, parseInt(slider.value) - feature.step);
      slider.value = newSize;
      this.settings.updateSetting('fontSize', newSize);
      sizeLabel.textContent = `${newSize}%`;
    });
    
    increaseBtn.addEventListener('click', () => {
      const newSize = Math.min(feature.max, parseInt(slider.value) + feature.step);
      slider.value = newSize;
      this.settings.updateSetting('fontSize', newSize);
      sizeLabel.textContent = `${newSize}%`;
    });
    
    return container;
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
      this.settings.updateSetting(feature.id, isActive);
    });
    
    return button;
  }
  
  /**
   * Update UI based on current settings
   * @param {Object} settings - Current settings
   */
  updateUI(settings) {
    // Update font size slider
    const slider = document.getElementById('spicy-font-slider');
    const sizeLabel = document.getElementById('spicy-font-size-label');
    
    if (slider && sizeLabel) {
      slider.value = settings.fontSize;
      sizeLabel.textContent = `${settings.fontSize}%`;
    }
    
    // Update toggle buttons
    this.features
      .filter(feature => feature.type === 'toggle')
      .forEach(feature => {
        const button = document.getElementById(`spicy-${feature.id}`);
        if (button) {
          button.classList.toggle('active', settings[feature.id]);
        }
      });
  }
}
