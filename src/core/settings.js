/**
 * Settings - Manages accessibility settings and profiles
 * Handles saving, loading, and updating settings
 */

export default class Settings {
  /**
   * Creates a new Settings instance
   * @param {Storage} storage - Storage manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(storage, events) {
    this.storage = storage;
    this.events = events;
    this.settings = {};
    this.profiles = {};
    this.defaultSettings = {
      // Text settings
      fontSize: 100,
      lineHeight: false,
      letterSpacing: false,
      dyslexicFont: false,
      
      // Visual settings
      contrast: false,
      darkMode: false,
      lightMode: false,
      grayscale: false,
      
      // Reading aids
      highlightLinks: false,
      readingGuide: false,
      
      // Content display
      hideImages: false,
      pauseAnimations: false,
      bigCursor: false,
      focusIndicator: false,
      
      // Navigation
      pageStructure: false,
      textToSpeech: false
    };
  }
  
  /**
   * Load settings from storage
   */
  load() {
    // Load settings
    const savedSettings = this.storage.getItem('spicySettings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : { ...this.defaultSettings };
    
    // Load profiles
    const savedProfiles = this.storage.getItem('spicyProfiles');
    this.profiles = savedProfiles ? JSON.parse(savedProfiles) : this.getDefaultProfiles();
    
    // Emit settings loaded event
    this.events.emit('settings:loaded', this.settings);
  }
  
  /**
   * Get default profiles
   * @returns {Object} Default accessibility profiles
   */
  getDefaultProfiles() {
    return {
      default: { ...this.defaultSettings },
      highContrast: {
        ...this.defaultSettings,
        contrast: true,
        highlightLinks: true,
        focusIndicator: true
      },
      dyslexic: {
        ...this.defaultSettings,
        dyslexicFont: true,
        lineHeight: true,
        letterSpacing: true,
        fontSize: 120
      },
      senior: {
        ...this.defaultSettings,
        fontSize: 150,
        highlightLinks: true,
        bigCursor: true,
        focusIndicator: true
      },
      lowVision: {
        ...this.defaultSettings,
        fontSize: 175,
        contrast: true,
        highlightLinks: true,
        bigCursor: true
      },
      motor: {
        ...this.defaultSettings,
        bigCursor: true,
        focusIndicator: true,
        pauseAnimations: true
      },
      cognitive: {
        ...this.defaultSettings,
        readingGuide: true,
        pauseAnimations: true,
        lineHeight: true
      }
    };
  }
  
  /**
   * Save current settings to storage
   */
  save() {
    this.storage.setItem('spicySettings', JSON.stringify(this.settings));
    this.events.emit('settings:saved', this.settings);
  }
  
  /**
   * Update a single setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  updateSetting(key, value) {
    // Update setting
    this.settings[key] = value;
    
    // Save to storage
    this.save();
    
    // Emit change event
    this.events.emit('settings:changed', this.settings, { key, value });
  }
  
  /**
   * Update multiple settings at once
   * @param {Object} updates - Object with setting updates
   */
  updateSettings(updates) {
    // Update multiple settings
    Object.assign(this.settings, updates);
    
    // Save to storage
    this.save();
    
    // Emit change event
    this.events.emit('settings:changed', this.settings, { updates });
  }
  
  /**
   * Get current value of a setting
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  getSetting(key) {
    return this.settings[key];
  }
  
  /**
   * Get all current settings
   * @returns {Object} All current settings
   */
  getAll() {
    return { ...this.settings };
  }
  
  /**
   * Reset all settings to defaults
   */
  resetAll() {
    this.settings = { ...this.defaultSettings };
    this.save();
    this.events.emit('settings:reset', this.settings);
  }
  
  /**
   * Load a specific profile
   * @param {string} profileName - Name of the profile to load
   */
  loadProfile(profileName) {
    // Check if profile exists