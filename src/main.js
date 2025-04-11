/**
 * SpicyAccessibility - Main Entry Point
 * A comprehensive web accessibility toolkit
 */

import './styles/main.css';
import Widget from './core/widget';
import Settings from './core/settings';
import Storage from './core/storage';
import EventBus from './core/events';

// Import core features
import TextFeatures from './features/text';
import VisualFeatures from './features/visual';
import NavigationFeatures from './features/navigation';
import AudioFeatures from './features/audio';
import Profiles from './features/advanced/profiles';

/**
 * Default configuration options
 */
const DEFAULT_CONFIG = {
  position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  features: 'all', // 'all' or array of feature keys
  initialProfile: 'default',
  language: 'en',
  theme: 'light', // 'light', 'dark', or 'auto'
  keyboardShortcut: 'alt+a',
  autoSave: true,
  debug: true  // Enable debug by default to see what's happening
};

/**
 * The main SpicyAccessibility object
 */
const SpicyAccessibility = {
  /**
   * Initialize the accessibility toolkit
   * @param {Object} config - Configuration options
   */
  init(config = {}) {
    console.log('SpicyAccessibility initialization started');
    
    try {
      // Make object available globally for debugging
      if (typeof window !== 'undefined') {
        window.SpicyAccessibility = this;
      }
      
      this.config = { ...DEFAULT_CONFIG, ...config };
      
      // Initialize core methods first to avoid binding errors
      this.open = this.open || function() {
        if (this.widget) this.widget.openPanel();
      };
      
      this.close = this.close || function() {
        if (this.widget) this.widget.closePanel();
      };
      
      this.toggle = this.toggle || function() {
        if (this.widget) this.widget.togglePanel();
      };
      
      // Ensure Font Awesome is loaded first
      const faPromise = new Promise((resolve) => {
        // Check if Font Awesome is already loaded
        if (document.querySelector('link[href*="font-awesome"]')) {
          resolve();
          return;
        }
        
        // Add Font Awesome
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        fontAwesomeLink.onload = resolve;
        fontAwesomeLink.onerror = () => {
          console.warn('Failed to load Font Awesome, falling back to text');
          resolve();
        };
        document.head.appendChild(fontAwesomeLink);
      });
      
      // Initialize core components
      this.events = new EventBus();
      console.log('EventBus initialized');
      
      this.storage = new Storage(this.config.autoSave);
      console.log('Storage initialized');
      
      this.settings = new Settings(this.storage, this.events);
      console.log('Settings initialized');
      
      // Load saved settings
      this.settings.load();
      console.log('Settings loaded');
      
      // Initialize UI with proper error handling
      try {
        this.widget = new Widget(this.config, this.settings, this.events);
        console.log('Widget initialized');
      } catch (widgetError) {
        console.error('Error initializing widget:', widgetError);
        this.createEmergencyButton();
      }
      
      // Register feature modules if widget was created successfully
      if (this.widget) {
        try {
          this._registerFeatures();
          console.log('Features registered');
        } catch (featuresError) {
          console.error('Error registering features:', featuresError);
        }
      }
      
      // Wait for Font Awesome to load before rendering
      faPromise.then(() => {
        // Initialize UI and render only if widget exists
        if (this.widget) {
          this.widget.render().catch(error => {
            console.error('Error rendering widget:', error);
            this.createEmergencyButton();
          });
          console.log('Widget render called');
          
          // Apply initial profile if specified
          if (this.config.initialProfile !== 'default') {
            this.settings.loadProfile(this.config.initialProfile);
            console.log(`Applied initial profile: ${this.config.initialProfile}`);
          }
        }
        
        console.log('SpicyAccessibility initialization completed');
        
        // Check if the widget was created successfully
        setTimeout(() => {
          const existingButton = document.getElementById('spicy-access-btn');
          if (!existingButton) {
            console.warn('Widget button not found after initialization');
            this.createEmergencyButton();
          }
        }, 2000);
      });
      
    } catch (error) {
      console.error('Error initializing SpicyAccessibility:', error);
      this.createEmergencyButton();
    }
    
    return this;
  },
  
  /**
   * Register all enabled feature modules
   * @private
   */
  _registerFeatures() {
    try {
      const features = [
        new TextFeatures(this.settings, this.events),
        new VisualFeatures(this.settings, this.events),
        new NavigationFeatures(this.settings, this.events),
        new AudioFeatures(this.settings, this.events),
        new Profiles(this.settings, this.events)
      ];
      
      // Filter features if specific ones are requested
      if (Array.isArray(this.config.features) && this.config.features !== 'all') {
        features.forEach(featureModule => {
          featureModule.enabledFeatures = featureModule.features.filter(
            feature => this.config.features.includes(feature.id)
          );
        });
      }
      
      // Register all features with the widget
      features.forEach(featureModule => {
        this.widget.registerFeatureModule(featureModule);
      });
    } catch (error) {
      console.error('Error registering features:', error);
    }
  },
  
  /**
   * Apply a specific accessibility profile
   * @param {string} profileName - The name of the profile to apply
   */
  applyProfile(profileName) {
    if (this.settings) {
      this.settings.loadProfile(profileName);
    }
  },
  
  /**
   * Enable a specific accessibility feature
   * @param {string} featureId - The ID of the feature to enable
   */
  enableFeature(featureId) {
    if (this.settings) {
      this.settings.updateSetting(featureId, true);
    }
  },
  
  /**
   * Disable a specific accessibility feature
   * @param {string} featureId - The ID of the feature to disable
   */
  disableFeature(featureId) {
    if (this.settings) {
      this.settings.updateSetting(featureId, false);
    }
  },
  
  /**
   * Reset all accessibility settings to defaults
   */
  reset() {
    if (this.settings) {
      this.settings.resetAll();
    }
  },
  
  /**
   * Get the current settings
   * @returns {Object} The current settings
   */
  getSettings() {
    return this.settings ? this.settings.getAll() : {};
  },
  
  /**
   * Create an emergency fallback button if the regular widget fails
   */
  createEmergencyButton() {
    // Don't create if it already exists or if the regular button exists
    if (document.getElementById('emergency-a11y-btn') || document.getElementById('spicy-access-btn')) {
      return;
    }
    
    console.warn('Creating emergency accessibility button');
    
    const fallbackButton = document.createElement('button');
    fallbackButton.id = 'emergency-a11y-btn';
    fallbackButton.innerHTML = '<span style="font-weight:bold;">A11Y</span>';
    fallbackButton.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 10000 !important;
      width: auto !important;
      min-width: 56px !important;
      height: 56px !important;
      padding: 0 15px !important;
      background-color: #4265ED !important;
      color: white !important;
      border: none !important;
      border-radius: 28px !important;
      font-size: 16px !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
    `;
    document.body.appendChild(fallbackButton);
    
    // Make the fallback button functional
    fallbackButton.addEventListener('click', () => {
      if (this.widget && typeof this.widget.togglePanel === 'function') {
        try {
          this.widget.togglePanel();
        } catch (error) {
          console.error('Error toggling panel:', error);
          alert('Accessibility panel would open here, but there was an issue with the widget implementation.');
          
          // Try to reinitialize
          if (this.widget && typeof this.widget.initialize === 'function') {
            try {
              this.widget.initialize();
              setTimeout(() => this.widget.togglePanel(), 500);
            } catch (e) {
              console.error('Failed to reinitialize widget:', e);
            }
          }
        }
      } else {
        alert('Accessibility panel would open here, but there was an issue with the widget initialization.');
      }
    });
  }
};

// Export the SpicyAccessibility object
export default SpicyAccessibility;

/**
 * Debug function to help diagnose and fix widget issues
 */
function debugWidget() {
  console.log('Running accessibility widget debug...');
  
  // Check if the main widget object exists
  if (!window.SpicyAccessibility) {
    console.error('SpicyAccessibility object not found in window.');
    return;
  }
  
  console.log('SpicyAccessibility found:', window.SpicyAccessibility);
  
  // Check main components
  const { widget, settings, events, storage } = window.SpicyAccessibility;
  
  // Check widget
  if (!widget) {
    console.error('Widget not found in SpicyAccessibility');
    return;
  }
  
  // Reinitialize widget if needed
  if (!document.getElementById('spicy-access-btn')) {
    console.warn('Widget button not found in DOM, attempting to reinitialize...');
    
    if (typeof widget.initialize === 'function') {
      widget.initialize();
    } else {
      console.error('Cannot reinitialize widget - initialize method not found');
    }
  } else {
    console.log('Widget button found in DOM');
  }
  
  // Check for Font Awesome
  if (!document.querySelector('link[href*="font-awesome"]')) {
    console.warn('Font Awesome not loaded, attempting to load...');
    
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
    
    console.log('Font Awesome link added to head');
  } else {
    console.log('Font Awesome is loaded');
  }
  
  // Check for feature modules
  if (widget.featureModules && widget.featureModules.length > 0) {
    console.log(`Found ${widget.featureModules.length} feature modules`);
  } else {
    console.warn('No feature modules found, widget may not function correctly');
  }
  
  // Force recreate the toggle button if it exists but is not working
  const existingButton = document.getElementById('spicy-access-btn');
  if (existingButton && !existingButton.innerHTML.includes('fa-')) {
    console.warn('Toggle button found but icon may be missing, recreating...');
    
    if (existingButton.parentNode) {
      existingButton.parentNode.removeChild(existingButton);
    }
    
    widget.createToggleButton();
    console.log('Toggle button recreated');
  }
  
  console.log('Debug complete - check console for any errors');
  
  return 'Debug complete. If the widget is still not working, please refresh the page and try again.';
}

// Add debug function to global object
if (typeof window !== 'undefined') {
  window.debugSpicyAccessibility = debugWidget;
}