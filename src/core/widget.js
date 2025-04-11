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
    // Initialize core properties
    this.config = config || {};
    this.settings = settings;
    this.events = events;
    this.featureModules = [];
    this.isOpen = false;
    this._outsideClickHandler = null;
    this._justToggled = false;
    
    // Make sure all methods used in binding exist
    this.togglePanel = this.togglePanel || function() {};
    this.handleKeydown = this.handleKeydown || function() {};
    this.openPanel = this.openPanel || function() {};
    this.closePanel = this.closePanel || function() {};
    
    // Bind methods safely
    const safeBind = (fn, context) => {
      if (typeof fn === 'function') {
        return fn.bind(context);
      }
      return function() {}; // Return empty function as fallback
    };
    
    this.togglePanel = safeBind(this.togglePanel, this);
    this.handleKeydown = safeBind(this.handleKeydown, this);
    this.openPanel = safeBind(this.openPanel, this);
    this.closePanel = safeBind(this.closePanel, this);
    
    // Listen for settings changes (safely)
    if (this.events && typeof this.events.on === 'function' && typeof this.updateUI === 'function') {
      this.events.on('settings:changed', this.updateUI.bind(this));
    }
    
    // Initialize the widget
    if (document.body) {
      this.render().catch(error => {
        console.error('Error initializing widget:', error);
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.render().catch(error => {
          console.error('Error initializing widget:', error);
        });
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
  async render() {
    console.log('Rendering widget...');
    
    try {
      // Add global styles first and wait for them to load
      await addGlobalStyles();
      console.log('Global styles loaded');
    
    // Create and add toggle button
    this.createToggleButton();
      console.log('Toggle button created');
    
    // Create and add panel
    this.createPanel();
      console.log('Panel created');
    
    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeydown);
      console.log('Keyboard event listener added');
    
    // Initialize feature modules
      if (this.featureModules && this.featureModules.length > 0) {
        this.featureModules.forEach(module => {
          if (module && typeof module.init === 'function') {
            module.init();
          }
        });
        console.log('Feature modules initialized:', this.featureModules.length);
      } else {
        console.warn('No feature modules found to initialize');
      }
    
    // Add hover effect for keyboard users
    this.addFocusListeners();
      console.log('Focus listeners added');
      
      console.log('Widget rendering completed successfully');
    } catch (error) {
      console.error('Error rendering widget:', error);
    }
  }
  
  /**
   * Initialize the constructor's functionality
   * Should be called if constructor's code didn't run properly
   */
  initialize() {
    console.log('Manually initializing widget...');
    
    // Initialize properties if not already set
    this.featureModules = this.featureModules || [];
    this.isOpen = false;
    this._outsideClickHandler = null;
    this._justToggled = false;
    
    // Bind methods if not already bound
    this.togglePanel = this.togglePanel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.openPanel = this.openPanel.bind(this);
    this.closePanel = this.closePanel.bind(this);
    
    // Listen for settings changes
    if (this.events && typeof this.events.on === 'function') {
      this.events.on('settings:changed', this.updateUI.bind(this));
    }
    
    // Render the widget
    this.render().catch(error => {
      console.error('Error in manual initialization:', error);
    });
    
    // Initialize feature modules if they haven't been initialized already
    if (this.featureModules && this.featureModules.length > 0) {
      this.featureModules.forEach(module => {
        if (module && typeof module.init === 'function' && !module.initialized) {
          try {
            module.init();
            module.initialized = true;
          } catch (e) {
            console.error('Error initializing module:', e);
          }
        }
      });
    }
    
    console.log('Manual initialization complete');
  }
  
/**
 * Create the toggle button
 */
createToggleButton() {
  console.log('Creating toggle button...');
  
    // Create the button element with inline styles to ensure it works
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'spicy-access-btn';
    this.toggleButton.setAttribute('aria-label', 'Open accessibility menu');
    this.toggleButton.setAttribute('title', 'Accessibility Options (Alt+A)');
    this.toggleButton.innerHTML = '<i class="fa-solid fa-universal-access" aria-hidden="true"></i>';
    
    // Apply styles directly with enhanced modern look
    Object.assign(this.toggleButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#4265ED',
      color: 'white',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(66, 101, 237, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    // Style the icon directly
    setTimeout(() => {
  const icon = this.toggleButton.querySelector('i');
      if (icon) {
        Object.assign(icon.style, {
          fontFamily: "'Font Awesome 6 Free', 'FontAwesome', sans-serif",
          fontWeight: '900',
          fontSize: '28px',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.4)'
        });
      } else {
        // Fallback text if icon fails
        this.toggleButton.textContent = "A11Y";
        this.toggleButton.style.fontWeight = '700';
        this.toggleButton.style.letterSpacing = '0.5px';
        console.warn('Font Awesome icon not rendered, using text fallback');
      }
    }, 100);
    
    // Apply position
  this.applyButtonPosition();
  
  // Add click event listener - use capture phase to ensure it runs first
  this.toggleButton.addEventListener('click', (event) => {
    // Prevent default and stop both immediate and bubbled propagation
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log('Toggle button clicked, current state:', this.isOpen);
    
    // Set a flag on the event to identify it came from our button
    event._fromAccessibilityToggle = true;
    
    // Toggle the panel with a slight delay to prevent other handlers
    setTimeout(() => {
      this.togglePanel();
    }, 10);
  }, true); // true for capture phase
    
    // Add enhanced hover effects
    this.toggleButton.addEventListener('mouseover', () => {
      this.toggleButton.style.backgroundColor = '#3255DD';
      this.toggleButton.style.transform = 'scale(1.05)';
      this.toggleButton.style.boxShadow = '0 6px 24px rgba(66, 101, 237, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.3), 0 0 15px rgba(66, 101, 237, 0.5)';
    });
    
    this.toggleButton.addEventListener('mouseout', () => {
      this.toggleButton.style.backgroundColor = '#4265ED';
      this.toggleButton.style.transform = 'scale(1)';
      this.toggleButton.style.boxShadow = '0 4px 20px rgba(66, 101, 237, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.2)';
    });
  
  // Add to DOM
  document.body.appendChild(this.toggleButton);
    console.log('Toggle button added to DOM');
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
    console.log('Creating accessibility panel...');
    
    try {
      // Create panel element - use document.createElement for maximum compatibility
      this.panel = document.createElement('div');
      this.panel.id = 'spicy-access-panel';
      this.panel.setAttribute('aria-hidden', 'true');
      this.panel.setAttribute('role', 'dialog');
      this.panel.setAttribute('aria-labelledby', 'spicy-panel-title');
      
      // Apply enhanced modern styles directly
      Object.assign(this.panel.style, {
        position: 'fixed',
        bottom: '95px',
        right: '20px',
        zIndex: '9998',
        width: '420px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(66, 101, 237, 0.1)',
        border: 'none',
        overflowY: 'auto',
        display: 'none', // Start hidden
        transition: 'opacity 0.3s ease, transform 0.3s ease'
    });
    
    // Create panel header
      const header = document.createElement('div');
      header.className = 'spicy-panel-header';
      Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 22px',
        backgroundColor: '#20408E',
        backgroundImage: 'linear-gradient(135deg, #3255DD, #20408E)',
        color: 'white',
        borderRadius: '16px 16px 0 0'
      });
      
      // Create title
      const title = document.createElement('h2');
      title.id = 'spicy-panel-title';
      title.textContent = 'Accessibility Settings';
      Object.assign(title.style, {
        margin: '0',
        fontSize: '19px',
        fontWeight: '600',
        color: 'white',
        letterSpacing: '0.3px'
      });
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.id = 'spicy-close-btn';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      Object.assign(closeBtn.style, {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        fontSize: '18px',
        color: 'white',
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.2s',
        backdropFilter: 'blur(2px)'
      });
      
      // Add header elements
      header.appendChild(title);
      header.appendChild(closeBtn);
    
    // Create panel content container
      this.panelContent = document.createElement('div');
      this.panelContent.className = 'spicy-panel-content';
      Object.assign(this.panelContent.style, {
        padding: '24px',
        maxHeight: 'calc(80vh - 140px)',
        overflowY: 'auto'
      });
      
      // Create panel footer
      const footer = document.createElement('div');
      footer.className = 'spicy-panel-footer';
      Object.assign(footer.style, {
        padding: '20px',
        backgroundColor: '#20408E',
        backgroundImage: 'linear-gradient(135deg, #20408E, #3255DD)',
        borderRadius: '0 0 16px 16px',
        textAlign: 'center',
        color: 'white'
      });
      
      // Create reset button
      const resetBtn = document.createElement('button');
      resetBtn.id = 'spicy-reset-all';
      resetBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Reset All Accessibility Settings';
      Object.assign(resetBtn.style, {
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backdropFilter: 'blur(2px)'
      });
      
      // Add hover effect to reset button
      resetBtn.addEventListener('mouseover', () => {
        resetBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        resetBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });
      
      resetBtn.addEventListener('mouseout', () => {
        resetBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        resetBtn.style.boxShadow = 'none';
      });
      
      // Create branding
      const branding = document.createElement('p');
      branding.className = 'spicy-branding';
      branding.innerHTML = '<span aria-hidden="true">🍩</span> Powered by SpicyDonut';
      Object.assign(branding.style, {
        marginTop: '14px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)'
      });
      
      // Add footer elements
      footer.appendChild(resetBtn);
      footer.appendChild(branding);
    
    // Add sections to panel
    this.panel.appendChild(header);
    this.panel.appendChild(this.panelContent);
    this.panel.appendChild(footer);
    
    // Add event listeners
      closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('Close button clicked');
        this.togglePanel(false);
      });
      
      // Add hover effect to close button
      closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        closeBtn.style.transform = 'scale(1.05)';
      });
      
      closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'scale(1)';
      });
      
      resetBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('Reset button clicked');
        this.resetAllSettings();
      });
    
    // Populate panel with feature modules
    this.populatePanel();
      
      // Add to DOM
      document.body.appendChild(this.panel);
      console.log('Panel added to DOM');
    } catch (error) {
      console.error('Error creating panel:', error);
    }
  }
  
  /**
   * Populate the panel with feature modules
   */
  populatePanel() {
    console.log('Populating panel with feature modules...');
    
    try {
      // Clear existing content
      if (this.panelContent) {
        this.panelContent.innerHTML = '';
      } else {
        console.error('Panel content container not found');
        return;
      }
      
      // Verify feature modules
      if (!this.featureModules) {
        console.warn('No feature modules array available');
        this.panelContent.innerHTML = '<p style="text-align:center;padding:20px;">No accessibility features available.</p>';
        return;
      }
      
      // Filter out invalid modules
      const validModules = this.featureModules.filter(module => 
        module && 
        typeof module === 'object' && 
        module.features && 
        Array.isArray(module.features) &&
        module.features.length > 0
      );
      
      // Log feature modules for debugging
      console.log(`Found ${validModules.length} valid feature modules out of ${this.featureModules.length} total`);
      
      if (validModules.length === 0) {
        console.warn('No valid feature modules available to populate panel');
        this.panelContent.innerHTML = '<p style="text-align:center;padding:20px;">No accessibility features available.</p>';
        return;
      }
      
      // Add sections from feature modules
      validModules.forEach((module, index) => {
        // Create section container with proper styling
        const sectionTitle = module.constructor ? module.constructor.name.replace('Features', '') : `Feature Group ${index + 1}`;
        const sectionIcon = this.getSectionIcon(sectionTitle);
        
        console.log(`Creating section for ${sectionTitle} with ${module.features.length} features`);
        
        // Create section
        const section = document.createElement('div');
        section.className = 'spicy-section';
        Object.assign(section.style, {
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #f0f0f0'
        });
        
        // Create section header
        const header = document.createElement('h3');
        header.innerHTML = `<i class="${sectionIcon}"></i> ${sectionTitle}`;
        Object.assign(header.style, {
          fontSize: '16px',
          color: '#4265ED',
          marginBottom: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid #eee'
        });
        
        // Style the header icon
        const headerIcon = header.querySelector('i');
        if (headerIcon) {
          headerIcon.style.marginRight = '10px';
          Object.assign(headerIcon.style, {
            fontFamily: "'Font Awesome 6 Free', 'FontAwesome', sans-serif",
            fontWeight: '900',
            marginRight: '10px'
          });
        }
        
        section.appendChild(header);
        
        // Create grid for feature buttons
        const grid = document.createElement('div');
        grid.className = 'spicy-grid';
        Object.assign(grid.style, {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '16px'
        });
        
        // Add features to grid
        const enabledFeatures = Array.isArray(module.enabledFeatures) ? module.enabledFeatures : module.features;
        
        if (enabledFeatures.length === 0) {
          console.warn(`No enabled features for ${sectionTitle}`);
          return;
        }
        
        // Create special handling for text size slider if it exists
        if (sectionTitle === 'Text' && enabledFeatures.some(f => f.id === 'fontSize')) {
          const fontSizeFeature = enabledFeatures.find(f => f.id === 'fontSize');
          if (fontSizeFeature) {
            const fontSizeControl = this.createFontSizeControl(fontSizeFeature, module.settings);
            section.appendChild(fontSizeControl);
          }
        }
        
        // Add regular features
        enabledFeatures.forEach(feature => {
          // Skip fontSize if we already added it as a slider
          if (feature.id === 'fontSize' && sectionTitle === 'Text') {
            return;
          }
          
          try {
            // Create feature button
            const button = this.createFeatureButton(feature, module.settings);
            grid.appendChild(button);
          } catch (error) {
            console.error(`Error creating button for feature ${feature.id}:`, error);
          }
        });
        
        // Add grid to section if it has any children
        if (grid.children.length > 0) {
          section.appendChild(grid);
          this.panelContent.appendChild(section);
        }
      });
      
      // Add a "Move Widget" option at the bottom
      try {
        const moveWidgetSection = document.createElement('div');
        moveWidgetSection.className = 'spicy-section';
        Object.assign(moveWidgetSection.style, {
          marginBottom: '0',
          paddingBottom: '0',
          borderBottom: 'none'
        });
        
        // Create section header
        const moveHeader = document.createElement('h3');
        moveHeader.innerHTML = `<i class="fa-solid fa-arrows-up-down-left-right"></i> Widget Position`;
        Object.assign(moveHeader.style, {
          fontSize: '16px',
          color: '#4265ED',
          marginBottom: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid #eee'
        });
        
        // Style the icon
        const moveIcon = moveHeader.querySelector('i');
        if (moveIcon) {
          Object.assign(moveIcon.style, {
            fontFamily: "'Font Awesome 6 Free', 'FontAwesome', sans-serif",
            fontWeight: '900',
            marginRight: '10px'
          });
        }
        
        moveWidgetSection.appendChild(moveHeader);
        
        // Create grid for position options
        const moveGrid = document.createElement('div');
        moveGrid.className = 'spicy-grid';
        Object.assign(moveGrid.style, {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginTop: '16px'
        });
        
        // Add position options
        const positions = [
          { id: 'bottomRight', name: 'Bottom Right', icon: 'fa-solid fa-arrow-down-right' },
          { id: 'bottomLeft', name: 'Bottom Left', icon: 'fa-solid fa-arrow-down-left' }
        ];
        
        positions.forEach(position => {
          const button = this.createFeatureButton(position, {
            getSetting: () => this.config && this.config.position === position.id,
            updateSetting: () => this.moveWidget(position.id)
          });
          moveGrid.appendChild(button);
        });
        
        moveWidgetSection.appendChild(moveGrid);
        this.panelContent.appendChild(moveWidgetSection);
      } catch (error) {
        console.error('Error adding move widget section:', error);
      }
      
      // Ensure all icons are styled correctly
      this.enforceIconStyles();
      
      console.log('Panel populated successfully');
    } catch (error) {
      console.error('Error populating panel:', error);
      
      // Emergency fallback - add at least something to the panel
      try {
        this.panelContent.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h3 style="margin-bottom: 16px; color: #4265ED;">Accessibility Features</h3>
            <p>There was an error loading the accessibility features.</p>
            <button id="spicy-emergency-reset" style="margin-top: 16px; padding: 10px 16px; background: #4265ED; color: white; border: none; border-radius: 8px; cursor: pointer;">
              Reset All Settings
            </button>
          </div>
        `;
        
        const resetButton = document.getElementById('spicy-emergency-reset');
        if (resetButton && this.settings && typeof this.settings.resetAll === 'function') {
          resetButton.addEventListener('click', () => this.settings.resetAll());
        }
      } catch (e) {
        console.error('Emergency panel content failed:', e);
      }
    }
  }
  
  /**
   * Create a feature toggle button
   * @param {Object} feature - Feature configuration
   * @param {Object} settings - Settings manager
   * @returns {HTMLElement} Button element
   */
  createFeatureButton(feature, settings) {
    try {
      console.log(`Creating button for feature: ${feature.id}`);
      
      // Create button element
      const button = document.createElement('button');
      button.className = 'spicy-feature-btn';
      button.id = `spicy-${feature.id}`;
      
      // Create inner HTML with level indicator if applicable
      let buttonHTML = `<i class="${feature.icon || 'fa-solid fa-circle'}"></i><span>${feature.name}</span>`;
      
      // Add level indicator based on feature type
      if (feature.levels || feature.type === 'slider' || feature.type === 'level') {
        buttonHTML += `<div class="spicy-level-indicator"></div>`;
      }
      
      button.innerHTML = buttonHTML;
      
      // Apply enhanced modern styles
      Object.assign(button.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '22px 10px',
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        height: '100px',
        overflow: 'hidden'
      });
      
      // Style the icon
      const icon = button.querySelector('i');
      if (icon) {
        Object.assign(icon.style, {
          fontSize: '28px',
          marginBottom: '12px',
          color: '#4265ED',
          fontFamily: "'Font Awesome 6 Free', 'FontAwesome', sans-serif",
          fontWeight: '900',
          transition: 'transform 0.3s ease'
        });
      }
      
      // Style the text
      const text = button.querySelector('span');
      if (text) {
        Object.assign(text.style, {
          fontSize: '13px',
          color: '#222',
          textAlign: 'center',
          fontWeight: '600'
        });
      }
      
      // Style level indicator if present
      const levelIndicator = button.querySelector('.spicy-level-indicator');
      if (levelIndicator) {
        Object.assign(levelIndicator.style, {
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '0%', // Default width (will be updated based on level)
          height: '4px',
          backgroundColor: '#4265ED',
          transition: 'width 0.3s ease',
          borderRadius: '0 4px 4px 0'
        });
      }
      
      // Check if feature is active
      let isActive = false;
      let currentLevel = 0;
      if (settings && typeof settings.getSetting === 'function') {
        const settingValue = settings.getSetting(feature.id);
        isActive = Boolean(settingValue);
        
        // If this is a leveled feature, update the level indicator
        if (levelIndicator && typeof settingValue === 'number') {
          currentLevel = settingValue;
          const maxLevel = feature.max || 100;
          const percentage = (currentLevel / maxLevel) * 100;
          levelIndicator.style.width = `${percentage}%`;
        }
        
        if (isActive) {
          button.classList.add('active');
          
          // Add checkmark
          const checkmark = document.createElement('div');
          checkmark.className = 'spicy-checkmark';
          checkmark.innerHTML = '✓';
          Object.assign(checkmark.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#4265ED',
            color: 'white',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(66, 101, 237, 0.3)',
            zIndex: '2'
          });
          button.appendChild(checkmark);
          
          // Update button styles
          button.style.backgroundColor = '#e7f5ff';
          button.style.borderColor = '#4265ED';
          button.style.boxShadow = '0 2px 12px rgba(67, 97, 238, 0.15)';
        }
      }
      
      // Add click event with enhanced transitions
      button.addEventListener('click', () => {
        isActive = !isActive;
        
        if (isActive) {
          button.classList.add('active');
          button.style.backgroundColor = '#e7f5ff';
          button.style.borderColor = '#4265ED';
          button.style.boxShadow = '0 2px 12px rgba(67, 97, 238, 0.15)';
          
          // Scale icon for visual feedback
          if (icon) {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 300);
          }
          
          // Add checkmark if not exists
          if (!button.querySelector('.spicy-checkmark')) {
            const checkmark = document.createElement('div');
            checkmark.className = 'spicy-checkmark';
            checkmark.innerHTML = '✓';
            Object.assign(checkmark.style, {
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#4265ED',
              color: 'white',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(66, 101, 237, 0.3)',
              zIndex: '2',
              transform: 'scale(0)',
              transition: 'transform 0.2s ease'
            });
            button.appendChild(checkmark);
            
            // Animate checkmark
            setTimeout(() => { checkmark.style.transform = 'scale(1)'; }, 10);
          }
        } else {
          button.classList.remove('active');
          button.style.backgroundColor = 'white';
          button.style.borderColor = '#e9ecef';
          button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
          
          // Animate icon
          if (icon) {
            icon.style.transform = 'scale(0.9)';
            setTimeout(() => { icon.style.transform = 'scale(1)'; }, 300);
          }
          
          // Remove checkmark if exists
          const checkmark = button.querySelector('.spicy-checkmark');
          if (checkmark) {
            checkmark.style.transform = 'scale(0)';
            setTimeout(() => {
              if (checkmark.parentNode === button) {
                button.removeChild(checkmark);
              }
            }, 200);
          }
        }
        
        // Update setting
        if (settings && typeof settings.updateSetting === 'function') {
          settings.updateSetting(feature.id, isActive);
        }
      });
      
      // Add hover effects
      button.addEventListener('mouseover', () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = isActive 
          ? '0 6px 16px rgba(67, 97, 238, 0.2)' 
          : '0 6px 12px rgba(0, 0, 0, 0.08)';
        
        if (icon) {
          icon.style.transform = 'scale(1.05)';
        }
      });
      
      button.addEventListener('mouseout', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = isActive 
          ? '0 2px 12px rgba(67, 97, 238, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.04)';
        
        if (icon) {
          icon.style.transform = 'scale(1)';
        }
      });
      
      // Add info tooltip if applicable
      this.addFeatureInfo(button, feature.id);
      
      return button;
    } catch (error) {
      console.error(`Error creating button for feature ${feature.id}:`, error);
      
      // Return a minimal fallback button
      const fallbackButton = document.createElement('button');
      fallbackButton.textContent = feature.name || 'Feature';
      fallbackButton.style.padding = '10px';
      fallbackButton.style.border = '1px solid #ccc';
      fallbackButton.style.borderRadius = '5px';
      return fallbackButton;
    }
  }
  
  /**
   * Create a font size control slider
   * @param {Object} feature - Font size feature configuration
   * @param {Object} settings - Settings manager
   * @returns {HTMLElement} Control element
   */
  createFontSizeControl(feature, settings) {
    try {
      // Create container
      const container = document.createElement('div');
      container.className = 'spicy-control-group';
      Object.assign(container.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(66, 101, 237, 0.1)'
      });
      
      // Create decrease button
      const decreaseBtn = document.createElement('button');
      decreaseBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
      decreaseBtn.setAttribute('aria-label', 'Decrease font size');
      Object.assign(decreaseBtn.style, {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'white',
        color: '#4265ED',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        fontSize: '16px'
      });
      
      // Create slider container
      const sliderContainer = document.createElement('div');
      sliderContainer.className = 'spicy-slider-container';
      Object.assign(sliderContainer.style, {
        flexGrow: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
      
      // Create slider
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.id = 'spicy-font-slider';
      slider.min = feature.min || 80;
      slider.max = feature.max || 200;
      slider.step = feature.step || 10;
      
      // Custom slider styles
      Object.assign(slider.style, {
        width: '100%',
        height: '6px',
        appearance: 'none',
        backgroundColor: '#e9ecef',
        borderRadius: '3px',
        outline: 'none',
        cursor: 'pointer'
      });
      
      // Create custom styles for the slider thumb
      const thumbStyles = `
        #spicy-font-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4265ED;
          box-shadow: 0 2px 5px rgba(66, 101, 237, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        #spicy-font-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(66, 101, 237, 0.5);
        }
        #spicy-font-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: none;
          border-radius: 50%;
          background: #4265ED;
          box-shadow: 0 2px 5px rgba(66, 101, 237, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        #spicy-font-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        #spicy-font-slider::-ms-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4265ED;
          box-shadow: 0 2px 5px rgba(66, 101, 237, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
      `;
      
      // Add custom styles to document
      const styleElement = document.createElement('style');
      styleElement.textContent = thumbStyles;
      document.head.appendChild(styleElement);
      
      // Create label with level indicator
      const labelContainer = document.createElement('div');
      labelContainer.style.width = '100%';
      labelContainer.style.display = 'flex';
      labelContainer.style.justifyContent = 'space-between';
      labelContainer.style.marginTop = '10px';
      
      const label = document.createElement('div');
      label.id = 'spicy-font-size-label';
      label.textContent = '100%';
      Object.assign(label.style, {
        fontSize: '14px',
        color: '#4265ED',
        fontWeight: '600',
        padding: '2px 8px',
        backgroundColor: 'rgba(66, 101, 237, 0.1)',
        borderRadius: '4px'
      });
      
      // Add level indicators
      const levelIndicators = document.createElement('div');
      levelIndicators.className = 'spicy-level-indicators';
      Object.assign(levelIndicators.style, {
        display: 'flex',
        gap: '3px'
      });
      
      // Create 5 level dots
      const levels = [80, 100, 130, 160, 200];
      levels.forEach(level => {
        const dot = document.createElement('div');
        Object.assign(dot.style, {
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#cdd5e0',
          transition: 'all 0.2s ease'
        });
        
        // Add level as data attribute for later reference
        dot.dataset.level = level;
        
        levelIndicators.appendChild(dot);
      });
      
      labelContainer.appendChild(label);
      labelContainer.appendChild(levelIndicators);
      
      // Create increase button
      const increaseBtn = document.createElement('button');
      increaseBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
      increaseBtn.setAttribute('aria-label', 'Increase font size');
      Object.assign(increaseBtn.style, {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'white',
        color: '#4265ED',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        fontSize: '16px'
      });
      
      // Add hover effects to buttons
      [decreaseBtn, increaseBtn].forEach(btn => {
        btn.addEventListener('mouseover', () => {
          btn.style.backgroundColor = '#f0f7ff';
          btn.style.transform = 'scale(1.05)';
          btn.style.boxShadow = '0 3px 10px rgba(66, 101, 237, 0.2)';
        });
        
        btn.addEventListener('mouseout', () => {
          btn.style.backgroundColor = 'white';
          btn.style.transform = 'scale(1)';
          btn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        });
      });
      
      // Get current value from settings
      if (settings && typeof settings.getSetting === 'function') {
        const currentValue = settings.getSetting(feature.id) || 100;
        slider.value = currentValue;
        label.textContent = `${currentValue}%`;
        
        // Update level indicators
        updateLevelIndicators(currentValue);
      }
      
      // Function to update level indicators
      function updateLevelIndicators(value) {
        const dots = levelIndicators.querySelectorAll('div');
        dots.forEach(dot => {
          const dotLevel = parseInt(dot.dataset.level);
          if (value >= dotLevel) {
            dot.style.backgroundColor = '#4265ED';
            dot.style.transform = 'scale(1.2)';
          } else {
            dot.style.backgroundColor = '#cdd5e0';
            dot.style.transform = 'scale(1)';
          }
        });
      }
      
      // Add event listeners
      slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        label.textContent = `${value}%`;
        updateLevelIndicators(value);
        
        if (settings && typeof settings.updateSetting === 'function') {
          settings.updateSetting(feature.id, value);
        }
      });
      
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(slider.value);
        const step = parseInt(feature.step) || 10;
        const newValue = Math.max(parseInt(feature.min) || 80, currentValue - step);
        slider.value = newValue;
        label.textContent = `${newValue}%`;
        updateLevelIndicators(newValue);
        
        // Add visual feedback
        decreaseBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          decreaseBtn.style.transform = 'scale(1)';
        }, 150);
        
        if (settings && typeof settings.updateSetting === 'function') {
          settings.updateSetting(feature.id, newValue);
        }
      });
      
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(slider.value);
        const step = parseInt(feature.step) || 10;
        const newValue = Math.min(parseInt(feature.max) || 200, currentValue + step);
        slider.value = newValue;
        label.textContent = `${newValue}%`;
        updateLevelIndicators(newValue);
        
        // Add visual feedback
        increaseBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
          increaseBtn.style.transform = 'scale(1)';
        }, 150);
        
        if (settings && typeof settings.updateSetting === 'function') {
          settings.updateSetting(feature.id, newValue);
        }
      });
      
      // Assemble the control
      sliderContainer.appendChild(slider);
      sliderContainer.appendChild(labelContainer);
      container.appendChild(decreaseBtn);
      container.appendChild(sliderContainer);
      container.appendChild(increaseBtn);
      
      return container;
    } catch (error) {
      console.error('Error creating font size control:', error);
      
      // Return a fallback
      const fallback = document.createElement('div');
      fallback.textContent = 'Font Size Control';
      fallback.style.padding = '10px';
      fallback.style.border = '1px solid #ccc';
      fallback.style.borderRadius = '5px';
      fallback.style.marginBottom = '15px';
      return fallback;
    }
  }
  
  /**
   * Reset all settings
   */
  resetAllSettings() {
    console.log('Resetting all settings...');
    
    if (this.settings && typeof this.settings.resetAll === 'function') {
      this.settings.resetAll();
    } else if (this.featureModules && this.featureModules.length > 0) {
      this.featureModules.forEach(module => {
        if (module && typeof module.reset === 'function') {
          module.reset();
        }
      });
    } else {
      console.warn('No feature modules found to reset');
    }
    
    console.log('All settings reset');
  }
  
  /**
   * Add focus listeners for keyboard users
   * Enhances accessibility by providing visible focus indicators
   */
  addFocusListeners() {
    try {
      // Track whether user is using keyboard or mouse
      let usingKeyboard = false;
      
      // Handle keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          usingKeyboard = true;
          document.body.classList.add('keyboard-focus');
        }
      });
      
      // Handle mouse navigation
      document.addEventListener('mousedown', () => {
        usingKeyboard = false;
        document.body.classList.remove('keyboard-focus');
      });
      
      // Add special focus handling to all focusable elements in our widget
      if (this.panel) {
        const focusableElements = this.panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(el => {
          el.addEventListener('focus', () => {
            if (usingKeyboard) {
              el.classList.add('keyboard-focus');
            }
          });
          
          el.addEventListener('blur', () => {
            el.classList.remove('keyboard-focus');
          });
        });
      }
      
      // Add focus indicators to toggle button
      if (this.toggleButton) {
        this.toggleButton.addEventListener('focus', () => {
          if (usingKeyboard) {
            this.toggleButton.classList.add('keyboard-focus');
          }
        });
        
        this.toggleButton.addEventListener('blur', () => {
          this.toggleButton.classList.remove('keyboard-focus');
        });
      }
      
      console.log('Focus listeners added for keyboard navigation');
    } catch (error) {
      console.error('Error adding focus listeners:', error);
    }
  }
  
  /**
   * Get section icon based on section title
   * @param {string} sectionTitle - Title of the section
   * @returns {string} Icon class
   */
  getSectionIcon(sectionTitle) {
    // Default icon if no match is found
    let icon = 'fa-solid fa-sliders';
    
    // Map section titles to appropriate icons
    const iconMap = {
      'Text': 'fa-solid fa-font',
      'Visual': 'fa-solid fa-eye',
      'Display': 'fa-solid fa-display',
      'Navigation': 'fa-solid fa-location-arrow',
      'Content': 'fa-solid fa-file-lines',
      'Audio': 'fa-solid fa-volume-high',
      'Media': 'fa-solid fa-photo-film',
      'Advanced': 'fa-solid fa-gears',
      'Profiles': 'fa-solid fa-users'
    };
    
    // Check if we have a specific icon for this section
    if (sectionTitle && iconMap[sectionTitle]) {
      icon = iconMap[sectionTitle];
    }
    
    return icon;
  }
  
  /**
   * Add feature info
   * @param {HTMLElement} button - Feature button
   * @param {string} featureId - ID of the feature
   */
  addFeatureInfo(button, featureId) {
    // Feature info descriptions
    const featureInfo = {
      fontSize: 'Adjust the text size on the page for better readability',
      lineHeight: 'Increase the space between lines of text',
      letterSpacing: 'Adjust the space between letters for easier reading',
      dyslexiaFont: 'Use a font designed to be more readable for people with dyslexia',
      
      contrast: 'Increase contrast between text and background',
      darkMode: 'Switch to dark theme for reduced eye strain',
      lightMode: 'Switch to light theme',
      grayscale: 'Convert all colors to grayscale',
      invertColors: 'Invert all colors on the page',
      
      readingGuide: 'Show a horizontal guide that follows your cursor to help focus on text',
      focusMode: 'Highlight the element you are currently focused on',
      highlightLinks: 'Make all links on the page more visible',
      bigCursor: 'Use a larger cursor that is easier to see',
      
      stopAnimations: 'Pause all animations on the page',
      hideImages: 'Hide all images for distraction-free reading',
      
      textToSpeech: 'Read selected text aloud',
      volumeControl: 'Adjust the volume of the screen reader'
    };
    
    // Add tooltip if info is available
    if (featureInfo[featureId]) {
      button.setAttribute('title', featureInfo[featureId]);
      button.setAttribute('aria-label', `${button.textContent.trim()} - ${featureInfo[featureId]}`);
      
      // Add info icon to corner of button
      const infoIcon = document.createElement('span');
      infoIcon.className = 'spicy-info-icon';
      infoIcon.innerHTML = 'ⓘ';
      Object.assign(infoIcon.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',
        fontSize: '12px',
        color: 'rgba(66, 101, 237, 0.7)',
        fontWeight: 'bold'
      });
      
      button.appendChild(infoIcon);
    }
  }
  
  /**
   * Move widget to a different position
   * @param {string} position - New position for the widget
   */
  moveWidget(position) {
    try {
      if (!this.toggleButton) return;
      
      // Update position in config
      this.config.position = position;
      
      // Apply new position to button
      this.applyButtonPosition();
      
      // If panel is open, update its position too
      if (this.isOpen && this.panel) {
        // Apply position to panel
        if (position.includes('left')) {
          this.panel.style.left = '20px';
          this.panel.style.right = 'auto';
        } else {
          this.panel.style.right = '20px';
          this.panel.style.left = 'auto';
        }
        
        if (position.includes('top')) {
          this.panel.style.top = '95px';
          this.panel.style.bottom = 'auto';
        } else {
          this.panel.style.bottom = '95px';
          this.panel.style.top = 'auto';
        }
      }
      
      // Show success message
      console.log(`Widget moved to ${position}`);
      
      // Update position buttons in panel
      const bottomRightBtn = document.getElementById('spicy-bottomRight');
      const bottomLeftBtn = document.getElementById('spicy-bottomLeft');
      
      if (bottomRightBtn) {
        bottomRightBtn.classList.toggle('active', position === 'bottomRight');
      }
      
      if (bottomLeftBtn) {
        bottomLeftBtn.classList.toggle('active', position === 'bottomLeft');
      }
    } catch (error) {
      console.error('Error moving widget:', error);
    }
  }
  
  /**
   * Update UI based on current settings
   * @param {Object} settings - Current accessibility settings
   */
  updateUI(settings) {
    // Skip if panel or settings don't exist
    if (!this.panel || !settings) return;
    
    try {
      // Update feature buttons if they exist
      if (this.featureModules) {
        this.featureModules.forEach(module => {
          if (module && module.features && Array.isArray(module.features)) {
            module.features.forEach(feature => {
              const button = document.getElementById(`spicy-${feature.id}`);
              if (button) {
                const isActive = settings[feature.id];
                button.classList.toggle('active', isActive);
                
                // Update button styles based on active state
                if (isActive) {
                  button.style.backgroundColor = '#e7f5ff';
                  button.style.borderColor = '#4265ED';
                  button.style.boxShadow = '0 2px 12px rgba(67, 97, 238, 0.15)';
                  
                  // Add checkmark if not exists
                  if (!button.querySelector('.spicy-checkmark')) {
                    const checkmark = document.createElement('div');
                    checkmark.className = 'spicy-checkmark';
                    checkmark.innerHTML = '✓';
                    Object.assign(checkmark.style, {
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#4265ED',
                      color: 'white',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(66, 101, 237, 0.3)',
                      zIndex: '2'
                    });
                    button.appendChild(checkmark);
                  }
                } else {
                  button.style.backgroundColor = 'white';
                  button.style.borderColor = '#e9ecef';
                  button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  
                  // Remove checkmark if exists
                  const checkmark = button.querySelector('.spicy-checkmark');
                  if (checkmark) {
                    button.removeChild(checkmark);
                  }
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error updating UI:', error);
    }
  }

  /**
   * Toggle the accessibility panel open or closed
   * @param {boolean|undefined} forceState - Force panel to specific state (true=open, false=close)
   */
  togglePanel(forceState) {
    console.log('Toggling panel, current state:', this.isOpen);
    
    // Prevent rapid toggling with a longer lock period
    if (this._justToggled) {
      console.log('Ignoring toggle: panel was just toggled');
      return;
    }
    
    // Set lock to prevent rapid toggling
    this._justToggled = true;
    setTimeout(() => { this._justToggled = false; }, 500); // Increased from 100ms to 500ms
    
    try {
      if (!this.panel) {
        console.error('Panel element not found!');
        this.createPanel();
        if (!this.panel) {
          throw new Error('Failed to create accessibility panel');
        }
      }
      
      // Store click target to prevent immediate closing
      const clickEvent = window.event;
      const clickTarget = clickEvent ? clickEvent.target : null;
      
      // Determine new state
      const newState = forceState !== undefined ? forceState : !this.isOpen;
      this.isOpen = newState;
      
      // Update button attributes
      if (this.toggleButton) {
        if (this.isOpen) {
          this.toggleButton.setAttribute('aria-expanded', 'true');
          this.toggleButton.setAttribute('aria-label', 'Close accessibility menu');
        } else {
          this.toggleButton.setAttribute('aria-expanded', 'false');
          this.toggleButton.setAttribute('aria-label', 'Open accessibility menu');
        }
      }
      
      // Update panel
      if (this.isOpen) {
        // Position the panel correctly
        if (this.config && this.config.position) {
          const position = this.config.position;
          
          if (position.includes('left')) {
            this.panel.style.left = '20px';
            this.panel.style.right = 'auto';
          } else {
            this.panel.style.right = '20px';
            this.panel.style.left = 'auto';
          }
          
          if (position.includes('top')) {
            this.panel.style.top = '95px';
            this.panel.style.bottom = 'auto';
          } else {
            this.panel.style.bottom = '95px';
            this.panel.style.top = 'auto';
          }
        } else {
          // Default position if no config
          this.panel.style.right = '20px';
          this.panel.style.bottom = '95px';
          this.panel.style.left = 'auto';
          this.panel.style.top = 'auto';
        }
        
        // Show panel
        this.panel.style.display = 'block';
        
        // Force layout recalculation before transition
        this.panel.offsetHeight;
        
        this.panel.style.opacity = '1';
        this.panel.style.transform = 'translateY(0)';
        this.panel.setAttribute('aria-hidden', 'false');
        
        // Refresh content
        this.populatePanel();
        
        // Clear any existing click handlers first
        if (this._outsideClickHandler) {
          document.removeEventListener('click', this._outsideClickHandler);
          this._outsideClickHandler = null;
        }
        
        // Set outside click handler with longer delay to avoid capturing the same click
        setTimeout(() => {
          if (this.isOpen) {
            this._outsideClickHandler = (e) => {
              // Skip if target is null (should never happen but just in case)
              if (!e || !e.target) return;
              
              // Skip if clicking on the toggle button or within the panel
              if (!this.toggleButton || !this.panel) return;
              if (this.toggleButton.contains(e.target) || this.panel.contains(e.target)) {
                return;
              }
              
              // Skip if this is the same click that opened the panel
              if (clickTarget === e.target) {
                console.log('Skipping same click that opened panel');
                return;
              }
              
              console.log('Outside click detected, closing panel');
              this.togglePanel(false);
            };
            
            // Capture clicks at document level
            document.addEventListener('click', this._outsideClickHandler);
          }
        }, 600); // Increased delay for more reliable handling
      } else {
        // Hide panel
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translateY(20px)';
        this.panel.setAttribute('aria-hidden', 'true');
        
        // Remove outside click handler
        if (this._outsideClickHandler) {
          document.removeEventListener('click', this._outsideClickHandler);
          this._outsideClickHandler = null;
        }
        
        // Wait for transition to complete
        setTimeout(() => {
          if (!this.isOpen && this.panel) {
            this.panel.style.display = 'none';
          }
        }, 300);
      }
      
      console.log('Panel toggled, new state:', this.isOpen);
    } catch (error) {
      console.error('Error toggling panel:', error);
      
      // Emergency fallback
      this.isOpen = false;
      if (this.panel) {
        this.panel.style.display = 'none';
      }
    }
  }

  /**
   * Open the accessibility panel
   */
  openPanel() {
    this.togglePanel(true);
  }

  /**
   * Close the accessibility panel
   */
  closePanel() {
    this.togglePanel(false);
  }

  /**
   * Handle keyboard events for accessibility features
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeydown(event) {
    // Check for Alt+A to toggle the panel
    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      this.togglePanel();
    }
    
    // Check for Escape to close the panel if it's open
    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.togglePanel(false);
    }
  }

  /**
   * Enforce consistent icon styles across the panel
   * This ensures all Font Awesome icons are properly styled
   */
  enforceIconStyles() {
    try {
      if (!this.panel) return;
      
      // Find all Font Awesome icons in the panel
      const icons = this.panel.querySelectorAll('i[class*="fa-"]');
      
      // Apply consistent styling to each icon
      icons.forEach(icon => {
        Object.assign(icon.style, {
          fontFamily: "'Font Awesome 6 Free', 'FontAwesome', sans-serif",
          fontWeight: '900',
          fontStyle: 'normal',
          display: 'inline-block',
          textRendering: 'auto',
          lineHeight: '1'
        });
      });
      
      console.log(`Applied consistent styling to ${icons.length} icons`);
    } catch (error) {
      console.error('Error enforcing icon styles:', error);
    }
  }
}