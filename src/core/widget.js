/**
 * Widget - Core UI Component
 * Handles the accessibility panel UI and interaction
 */

import { createElement, addGlobalStyles } from '../utils/dom';

export default class Widget {
  /**
   * Creates a new Widget instance
   * @param {Object} config - Configuration options
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(config, settings, events) {
    this.config = config;
    this.settings = settings;
    this.events = events;
    this.featureModules = [];
    this.isOpen = false;
    
    // Bind methods
    this.togglePanel = this.togglePanel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    
    // Listen for settings changes
    this.events.on('settings:changed', this.updateUI.bind(this));
    
    if (document.body) {
        this.render();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            this.render();
        });
    }
  }
  
  /**
   * Register a feature module with the widget
   * @param {Object} featureModule - Feature module to register
   */
  registerFeatureModule(featureModule) {
    this.featureModules.push(featureModule);
  }
  
  /**
   * Render the accessibility widget
   */
  render() {
    console.log('Rendering widget...');
    // Add global styles
    addGlobalStyles();
    
    // Create and add toggle button
    this.createToggleButton();
    
    // Create and add panel
    this.createPanel();
    
    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeydown);
    
    // Initialize feature modules
    this.featureModules.forEach(module => module.init());
    
    // Add hover effect for keyboard users
    this.addFocusListeners();
  }
  
/**
 * Create the toggle button
 */
createToggleButton() {
  console.log('Creating toggle button...');
  this.toggleButton = createElement('button', {
    id: 'spicy-access-btn',
    innerHTML: '<i class="fa-solid fa-universal-access" aria-hidden="true"></i><span class="spicy-btn-text">A11Y</span>',
    style: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      width: 'auto',
      minWidth: '56px',
      height: '56px',
      borderRadius: '28px',
      backgroundColor: '#4361ee',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 15px'
    },
    attributes: {
      'aria-label': 'Open accessibility menu',
      'title': 'Accessibility Options (Alt+A)'
    }
  });
  
  // Position according to config
  this.applyButtonPosition();
  
  // Add click event listener
  this.toggleButton.addEventListener('click', this.togglePanel);
  
  // Add to DOM
  document.body.appendChild(this.toggleButton);
  
}
  
  /**
   * Apply position to the toggle button based on config
   */
  applyButtonPosition() {
    // Reset previous positioning
    this.toggleButton.style.top = '';
    this.toggleButton.style.bottom = '';
    this.toggleButton.style.left = '';
    this.toggleButton.style.right = '';
    
    // Apply new positioning
    const position = this.config.position || 'bottom-right';
    
    if (position.includes('top')) {
      this.toggleButton.style.top = '20px';
    } else {
      this.toggleButton.style.bottom = '20px';
    }
    
    if (position.includes('left')) {
      this.toggleButton.style.left = '20px';
    } else {
      this.toggleButton.style.right = '20px';
    }
  }
  
  /**
   * Create the accessibility panel
   */
  createPanel() {
    this.panel = createElement('div', {
      id: 'spicy-access-panel',
      attributes: {
        'aria-hidden': 'true',
        'role': 'dialog',
        'aria-labelledby': 'spicy-panel-title'
      }
    });
    
    // Create panel header
    const header = createElement('div', {
      className: 'spicy-panel-header',
      innerHTML: `
        <h2 id="spicy-panel-title">Accessibility Settings</h2>
        <button id="spicy-close-btn" aria-label="Close menu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `
    });
    
    // Create panel content container
    this.panelContent = createElement('div', {
      className: 'spicy-panel-content'
    });
    
    // Create panel footer
    const footer = createElement('div', {
      className: 'spicy-panel-footer',
      innerHTML: `
        <button class="spicy-btn spicy-reset" id="spicy-reset-all">
          <i class="fa-solid fa-arrows-rotate"></i> Reset All
        </button>
        <p class="spicy-branding">🍩 Powered by SpicyDonut</p>
      `
    });
    
    // Add sections to panel
    this.panel.appendChild(header);
    this.panel.appendChild(this.panelContent);
    this.panel.appendChild(footer);
    
    // Add event listeners
    header.querySelector('#spicy-close-btn').addEventListener('click', this.togglePanel);
    footer.querySelector('#spicy-reset-all').addEventListener('click', () => {
      this.settings.resetAll();
    });
    
    // Position panel based on button position
    this.applyPanelPosition();
    
    // Add to DOM
    document.body.appendChild(this.panel);
    
    // Populate panel with feature modules
    this.populatePanel();
  }
  
  /**
   * Apply position to the panel based on button position
   */
  applyPanelPosition() {
    // Reset previous positioning
    this.panel.style.top = '';
    this.panel.style.bottom = '';
    this.panel.style.left = '';
    this.panel.style.right = '';
    
    // Apply new positioning
    const position = this.config.position || 'bottom-right';
    
    if (position.includes('top')) {
      this.panel.style.top = '85px';
    } else {
      this.panel.style.bottom = '85px';
    }
    
    if (position.includes('left')) {
      this.panel.style.left = '20px';
    } else {
      this.panel.style.right = '20px';
    }
  }
  
  /**
   * Populate the panel with feature modules
   */
  populatePanel() {
    // Clear existing content
    this.panelContent.innerHTML = '';
    
    // Add sections from feature modules
    this.featureModules.forEach(module => {
      const section = module.renderSection();
      if (section) {
        this.panelContent.appendChild(section);
      }
    });
  }
  
  /**
   * Toggle the accessibility panel
   * @param {boolean} [show] - Explicitly set panel visibility
   */
  togglePanel(show) {
    // Determine if panel should be shown
    if (typeof show === 'boolean') {
      this.isOpen = show;
    } else {
      this.isOpen = !this.isOpen;
    }
    
    // Update panel visibility
    if (this.isOpen) {
      this.panel.classList.add('visible');
      this.panel.setAttribute('aria-hidden', 'false');
      // Focus on the first interactive element in the panel
      setTimeout(() => {
        const firstInteractive = this.panel.querySelector('button, [tabindex="0"]');
        if (firstInteractive) {
          firstInteractive.focus();
        }
      }, 100);
    } else {
      this.panel.classList.remove('visible');
      this.panel.setAttribute('aria-hidden', 'true');
      // Return focus to toggle button
      this.toggleButton.focus();
    }
    
    // Emit event
    this.events.emit('panel:' + (this.isOpen ? 'opened' : 'closed'));
  }
  
  /**
   * Open the panel
   */
  openPanel() {
    this.togglePanel(true);
  }
  
  /**
   * Close the panel
   */
  closePanel() {
    this.togglePanel(false);
  }
  
  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydown(e) {
    // Parse the keyboard shortcut from config
    const shortcut = this.config.keyboardShortcut || 'alt+a';
    const keys = shortcut.toLowerCase().split('+');
    
    // Check if the shortcut keys match
    const modifierKey = keys[0] === 'alt' ? e.altKey : 
                        keys[0] === 'ctrl' ? e.ctrlKey : 
                        keys[0] === 'shift' ? e.shiftKey : false;
    
    const actionKey = keys[1];
    
    // Toggle panel if shortcut is pressed
    if (modifierKey && e.key.toLowerCase() === actionKey) {
      e.preventDefault();
      this.togglePanel();
    }
    
    // Close panel with Escape key
    if (e.key === 'Escape' && this.isOpen) {
      this.closePanel();
    }
  }
  
  /**
   * Update UI based on current settings
   * @param {Object} settings - Current settings
   */
  updateUI(settings) {
    this.featureModules.forEach(module => {
      module.updateUI(settings);
    });
  }
  
  /**
   * Add focus event listeners for keyboard users
   */
  addFocusListeners() {
    const interactiveElements = document.querySelectorAll('#spicy-access-panel button, #spicy-access-panel input, #spicy-access-panel select');
    
    interactiveElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('keyboard-focus');
      });
      
      element.addEventListener('blur', () => {
        element.classList.remove('keyboard-focus');
      });
    });
  }
}
