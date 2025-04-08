/**
 * AudioFeatures - Audio accessibility features
 * Handles screen reader, media controls, etc.
 */

import { createElement } from '../../utils/dom';

export default class AudioFeatures {
  /**
   * Creates a new AudioFeatures instance
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(settings, events) {
    this.settings = settings;
    this.events = events;
    this.features = [
      {
        id: 'textToSpeech',
        name: 'Screen Reader',
        icon: 'fa-solid fa-volume-high',
        type: 'toggle'
      }
    ];
    
    // All features are enabled by default
    this.enabledFeatures = [...this.features];
    
    // Track state
    this.isSpeaking = false;
    this.selectedVoice = null;
    this.readingRate = 1;
  }
  
  /**
   * Initialize audio features
   */
  init() {
    // Check if speech synthesis is available
    this.isSpeechAvailable = 'speechSynthesis' in window;
    
    if (!this.isSpeechAvailable) {
      console.warn('Speech synthesis not available in this browser');
      // Remove text-to-speech feature if not available
      this.enabledFeatures = this.enabledFeatures.filter(f => f.id !== 'textToSpeech');
    }
    
    // Apply current settings
    this.applySettings(this.settings.getAll());
    
    // Listen for settings changes
    this.events.on('settings:changed', this.applySettings.bind(this));
    
    // Listen for panel close to stop speech
    this.events.on('panel:closed', () => {
      if (this.isSpeaking) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
      }
    });
  }
  
  /**
   * Apply audio settings to the page
   * @param {Object} settings - Current settings
   */
  applySettings(settings) {
    // Apply text-to-speech
    if (settings.textToSpeech !== this.lastSettings?.textToSpeech) {
      if (settings.textToSpeech) {
        this.initializeScreenReader();
      } else {
        this.disableScreenReader();
      }
    }
    
    // Update last settings
    this.lastSettings = { ...settings };
  }
  
  /**
   * Render audio features section in the panel
   * @returns {HTMLElement} Section element
   */
  renderSection() {
    // Don't render if no features are enabled or speech synthesis not available
    if (this.enabledFeatures.length === 0 || !this.isSpeechAvailable) return null;
    
    // Create section container
    const section = createElement('div', {
      className: 'spicy-section',
      innerHTML: `<h3><i class="fa-solid fa-headphones"></i> Audio & Speech</h3>`
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
   * Initialize screen reader
   */
  initializeScreenReader() {
    if (!this.isSpeechAvailable) return;
    
    // Don't create controls if they already exist
    if (document.getElementById('spicy-reader-controls')) {
      document.getElementById('spicy-reader-controls').style.display = 'flex';
      return;
    }
    
    // Create reader controls
    const readerControls = createElement('div', {
      id: 'spicy-reader-controls',
      innerHTML: `
        <button id="spicy-reader-play" aria-label="Play screen reader">
          <i class="fa-solid fa-play"></i>
        </button>
        <button id="spicy-reader-pause" aria-label="Pause screen reader">
          <i class="fa-solid fa-pause"></i>
        </button>
        <button id="spicy-reader-stop" aria-label="Stop screen reader">
          <i class="fa-solid fa-stop"></i>
        </button>
        <select id="spicy-reader-voice" aria-label="Select voice"></select>
        <input type="range" id="spicy-reader-rate" aria-label="Reading speed" min="0.5" max="2" step="0.1" value="1">
      `
    });
    
    // Add to DOM
    document.body.appendChild(readerControls);
    
    // Populate voices
    this.populateVoices();
    
    // Set up event listeners
    document.getElementById('spicy-reader-play').addEventListener('click', () => {
      this.readSelectedText();
    });
    
    document.getElementById('spicy-reader-pause').addEventListener('click', () => {
      if (window.speechSynthesis.speaking) {
        if (this.isSpeaking) {
          window.speechSynthesis.pause();
          this.isSpeaking = false;
        } else {
          window.speechSynthesis.resume();
          this.isSpeaking = true;
        }
      }
    });
    
    document.getElementById('spicy-reader-stop').addEventListener('click', () => {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    });
    
    document.getElementById('spicy-reader-rate').addEventListener('input', (e) => {
      this.readingRate = parseFloat(e.target.value);
    });
    
    document.getElementById('spicy-reader-voice').addEventListener('change', (e) => {
      this.selectedVoice = e.target.value;
    });
    
    // Add selection listener for the whole page
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // Show play button
        document.getElementById('spicy-reader-play').classList.add('active');
      } else {
        // Hide play button
        document.getElementById('spicy-reader-play').classList.remove('active');
      }
    });
  }
  
  /**
   * Populate available voices in the select dropdown
   */
  populateVoices() {
    if (!this.isSpeechAvailable) return;
    
    const voiceSelect = document.getElementById('spicy-reader-voice');
    if (!voiceSelect) return;
    
    // Clear existing options
    voiceSelect.innerHTML = '';
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Add each voice as an option
    voices.forEach((voice, index) => {
      const option = createElement('option', {
        value: index,
        textContent: `${voice.name} (${voice.lang})`
      });
      
      voiceSelect.appendChild(option);
    });
    
    // Set selected voice
    if (voices.length > 0) {
      this.selectedVoice = 0;
    }
  }
  
  /**
   * Read selected text
   */
  readSelectedText() {
    if (!this.isSpeechAvailable) return;
    
    // Get selected text
    const selectedText = window.getSelection().toString();
    if (!selectedText) {
      alert('Please select text to read aloud');
      return;
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(selectedText);
    
    // Set voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && this.selectedVoice !== null) {
      utterance.voice = voices[this.selectedVoice];
    }
    
    // Set rate
    utterance.rate = this.readingRate;
    
    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isSpeaking = false;
    };
    
    // Speak
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  }
  
  /**
   * Disable screen reader
   */
  disableScreenReader() {
    // Cancel any ongoing speech
    if (this.isSpeechAvailable) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
    
    // Hide controls
    const controls = document.getElementById('spicy-reader-controls');
    if (controls) {
      controls.style.display = 'none';
    }
  }
}
