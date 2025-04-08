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
  debug: false
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
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize core components
    this.events = new EventBus();
    this.storage = new Storage(this.config.autoSave);
    this.settings = new Settings(this.storage, this.events);
    
    // Load saved settings
    this.settings.load();
    
    // Initialize UI
    this.widget = new Widget(this.config, this.settings, this.events);
    
    // Register feature modules
    this._registerFeatures();
    
    // Initialize UI and render
    this.widget.render();
    
    // Apply initial profile if specified
    if (this.config.initialProfile !== 'default') {
      this.settings.loadProfile(this.config.initialProfile);
    }
    
    // Log initialization complete
    if (this.config.debug) {
      console.log('SpicyAccessibility initialized with config:', this.config);
    }
    
    return this;
  },
  
  /**
   * Register all enabled feature modules
   * @private
   */
  _registerFeatures() {
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
