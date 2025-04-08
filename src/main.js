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
      this.config = { ...DEFAULT_CONFIG, ...config };
      
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
      
      // Initialize UI
      this.widget = new Widget(this.config, this.settings, this.events);
      console.log('Widget initialized');
      
      // Register feature modules
      this._registerFeatures();
      console.log('Features registered');
      
      // Initialize UI and render
      this.widget.render();
      console.log('Widget rendered');
      
      // Apply initial profile if specified
      if (this.config.initialProfile !== 'default') {
        this.settings.loadProfile(this.config.initialProfile);
        console.log(`Applied initial profile: ${this.config.initialProfile}`);
      }
      
      console.log('SpicyAccessibility initialization completed');
      
      // Create an emergency fallback button if the widget button doesn't appear
      setTimeout(() => {
        const existingButton = document.getElementById('spicy-access-btn');
        if (!existingButton) {
          console.warn('Accessibility button not found - creating emergency fallback');
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
            background-color: #4361ee !important;
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
              this.widget.togglePanel();
            } else {
              alert('Accessibility panel would open here, but there was an issue with the widget initialization.');
            }
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing SpicyAccessibility:', error);
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
   * Open the accessibility panel
   */
  open() {
    this.widget.openPanel();
  },
  
  /**
   * Close the accessibility panel
   */
  close() {
    this.widget.closePanel();
  },
  
  /**
   * Toggle the accessibility panel
   */
  toggle() {
    this.widget.togglePanel();
  },
  
  /**
   * Apply a specific accessibility profile
   * @param {string} profileName - The name of the profile to apply
   */
  applyProfile(profileName) {
    this.settings.loadProfile(profileName);
  },
  
  /**
   * Enable a specific accessibility feature
   * @param {string} featureId - The ID of the feature to enable
   */
  enableFeature(featureId) {
    this.settings.updateSetting(featureId, true);
  },
  
  /**
   * Disable a specific accessibility feature
   * @param {string} featureId - The ID of the feature to disable
   */
  disableFeature(featureId) {
    this.settings.updateSetting(featureId, false);
  },
  
  /**
   * Reset all accessibility settings to defaults
   */
  reset() {
    this.settings.resetAll();
  },
  
  /**
   * Get the current settings
   * @returns {Object} The current settings
   */
  getSettings() {
    return this.settings.getAll();
  }
};

// Export the SpicyAccessibility object
export default SpicyAccessibility;