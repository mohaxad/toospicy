/**
 * NavigationFeatures - Navigation accessibility features
 * Handles page structure, reading guide, tooltips, etc.
 */

import { createElement, trapFocus } from '../../utils/dom';

export default class NavigationFeatures {
  /**
   * Creates a new NavigationFeatures instance
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(settings, events) {
    this.settings = settings;
    this.events = events;
    this.features = [
      {
        id: 'pageStructure',
        name: 'Page Structure',
        icon: 'fa-solid fa-sitemap',
        type: 'toggle'
      },
      {
        id: 'readingGuide',
        name: 'Reading Guide',
        icon: 'fa-solid fa-ruler-horizontal',
        type: 'toggle'
      },
      {
        id: 'tooltips',
        name: 'Show Tooltips',
        icon: 'fa-solid fa-comment',
        type: 'toggle'
      }
    ];
    
    // All features are enabled by default
    this.enabledFeatures = [...this.features];
    
    // Store reference to handlers for cleaning up
    this.handlers = {};
  }
  
  /**
   * Initialize navigation features
   */
  init() {
    // Apply current settings
    this.applySettings(this.settings.getAll());
    
    // Listen for settings changes
    this.events.on('settings:changed', this.applySettings.bind(this));
  }
  
  /**
   * Apply navigation settings to the page
   * @param {Object} settings - Current settings
   */
  applySettings(settings) {
    // Apply page structure
    if (settings.pageStructure !== this.lastSettings?.pageStructure) {
      if (settings.pageStructure) {
        this.showPageStructure();
      } else {
        this.hidePageStructure();
      }
    }
    
    // Apply reading guide
    if (settings.readingGuide !== this.lastSettings?.readingGuide) {
      if (settings.readingGuide) {
        this.createReadingGuide();
      } else {
        this.removeReadingGuide();
      }
    }
    
    // Apply tooltips
    document.body.classList.toggle('spicy-tooltips', settings.tooltips);
    
    // Update last settings
    this.lastSettings = { ...settings };
  }
  
  /**
   * Render navigation features section in the panel
   * @returns {HTMLElement} Section element
   */
  renderSection() {
    // Don't render if no features are enabled
    if (this.enabledFeatures.length === 0) return null;
    
    // Create section container
    const section = createElement('div', {
      className: 'spicy-section',
      innerHTML: `<h3><i class="fa-solid fa-sitemap"></i> Navigation</h3>`
    });
    
    // Create grid for feature buttons
    const grid = createElement('div', { className: 'spicy-grid' });
    
    // Add toggle features
    this.enabledFeatures.forEach(feature => {
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
  
  /**
   * Show page structure panel
   */
  showPageStructure() {
    // Don't create another panel if it already exists
    if (document.getElementById('spicy-structure-panel')) {
      document.getElementById('spicy-structure-panel').style.display = 'block';
      return;
    }
    
    // Create panel
    const structurePanel = createElement('div', {
      id: 'spicy-structure-panel',
      innerHTML: `
        <h3>Page Structure</h3>
        <div class="spicy-panel-header">
          <button id="spicy-structure-close" aria-label="Close structure panel">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <ul id="spicy-structure-list"></ul>
      `
    });
    
    // Add close button handler
    structurePanel.querySelector('#spicy-structure-close').addEventListener('click', () => {
      this.settings.updateSetting('pageStructure', false);
      const button = document.getElementById('spicy-pageStructure');
      if (button) {
        button.classList.remove('active');
      }
    });
    
    // Add trap focus to the panel
    this.handlers.structureFocusTrap = trapFocus(structurePanel);
    
    // Add to DOM
    document.body.appendChild(structurePanel);
    
    // Populate with headings
    this.populateStructurePanel();
  }
  
  /**
   * Populate structure panel with page headings
   */
  populateStructurePanel() {
    const structureList = document.getElementById('spicy-structure-list');
    if (!structureList) return;
    
    // Clear existing list
    structureList.innerHTML = '';
    
    // Find all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
      // No headings found
      structureList.innerHTML = '<li class="spicy-no-headings">No headings found on this page</li>';
      return;
    }
    
    // Add headings to list
    headings.forEach((heading, index) => {
      const level = heading.tagName.charAt(1);
      const item = createElement('li', {
        className: `heading-level-${level}`,
        textContent: heading.textContent.trim() || `[Empty heading ${index + 1}]`
      });
      
      // Add click event to scroll to heading
      item.addEventListener('click', () => {
        // Add temporary ID if heading doesn't have one
        let headingId = heading.id;
        if (!headingId) {
          headingId = `spicy-heading-${index}`;
          heading.id = headingId;
        }
        
        // Scroll to heading
        heading.scrollIntoView({ behavior: 'smooth' });
        
        // Set focus to heading
        heading.setAttribute('tabindex', '-1');
        heading.focus();
        
        // Remove temporary ID after a delay
        if (!heading.hasAttribute('id')) {
          setTimeout(() => {
            heading.removeAttribute('id');
          }, 1000);
        }
      });
      
      structureList.appendChild(item);
    });
  }
  
  /**
   * Hide page structure panel
   */
  hidePageStructure() {
    const structurePanel = document.getElementById('spicy-structure-panel');
    if (structurePanel) {
      structurePanel.style.display = 'none';
    }
    
    // Remove focus trap
    if (this.handlers.structureFocusTrap) {
      this.handlers.structureFocusTrap();
      delete this.handlers.structureFocusTrap;
    }
  }
  
  /**
   * Create reading guide
   */
  createReadingGuide() {
    // Don't create another guide if it already exists
    if (document.getElementById('spicy-reading-guide')) {
      document.getElementById('spicy-reading-guide').style.display = 'block';
      return;
    }
    
    // Create guide element
    const guide = createElement('div', {
      id: 'spicy-reading-guide'
    });
    
    // Add to DOM
    document.body.appendChild(guide);
    
    // Add mousemove handler
    this.handlers.readingGuideHandler = (e) => {
      if (!guide) return;
      guide.style.display = 'block';
      guide.style.top = `${e.clientY - 20}px`;
    };
    
    document.addEventListener('mousemove', this.handlers.readingGuideHandler);
  }
  
  /**
   * Remove reading guide
   */
  removeReadingGuide() {
    const guide = document.getElementById('spicy-reading-guide');
    if (guide) {
      guide.style.display = 'none';
    }
    
    // Remove mousemove handler
    if (this.handlers.readingGuideHandler) {
      document.removeEventListener('mousemove', this.handlers.readingGuideHandler);
      delete this.handlers.readingGuideHandler;
    }
  }
}
