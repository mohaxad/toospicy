/**
 * Profiles - Manages accessibility profiles
 * Allows users to save and load different accessibility configurations
 */

import { createElement } from '../../utils/dom';

export default class Profiles {
  /**
   * Creates a new Profiles instance
   * @param {Settings} settings - Settings manager instance
   * @param {EventBus} events - Event bus instance
   */
  constructor(settings, events) {
    this.settings = settings;
    this.events = events;
    this.features = []; // No toggleable features, just a control panel
  }
  
  /**
   * Initialize profiles feature
   */
  init() {
    // Listen for profile events
    this.events.on('settings:profile:loaded', this.handleProfileLoaded.bind(this));
    this.events.on('settings:profile:saved', this.handleProfileSaved.bind(this));
    this.events.on('settings:profile:deleted', this.handleProfileDeleted.bind(this));
  }
  
  /**
   * Render profiles section in the panel
   * @returns {HTMLElement} Section element
   */
  renderSection() {
    // Create section container
    const section = createElement('div', {
      className: 'spicy-section',
      innerHTML: `<h3><i class="fa-solid fa-user-gear"></i> Profiles</h3>`
    });
    
    // Create profiles control
    const profileControls = createElement('div', { className: 'spicy-profile-controls' });
    
    // Create profile select
    const profileSelect = createElement('select', {
      id: 'spicy-profile-select',
      attributes: {
        'aria-label': 'Select accessibility profile'
      }
    });
    
    // Populate profiles
    this.populateProfileSelect(profileSelect);
    
    // Create save button
    const saveButton = createElement('button', {
      className: 'spicy-btn',
      id: 'spicy-save-profile',
      innerHTML: '<i class="fa-solid fa-floppy-disk"></i> Save'
    });
    
    // Create delete button
    const deleteButton = createElement('button', {
      className: 'spicy-btn spicy-reset',
      id: 'spicy-delete-profile',
      innerHTML: '<i class="fa-solid fa-trash"></i>',
      style: {
        padding: '8px 12px'
      }
    });
    
    // Add event listeners
    profileSelect.addEventListener('change', () => {
      const selectedProfile = profileSelect.value;
      this.settings.loadProfile(selectedProfile);
    });
    
    saveButton.addEventListener('click', () => {
      this.saveCurrentProfile();
    });
    
    deleteButton.addEventListener('click', () => {
      this.deleteCurrentProfile();
    });
    
    // Add elements to container
    profileControls.appendChild(profileSelect);
    profileControls.appendChild(saveButton);
    profileControls.appendChild(deleteButton);
    
    // Add custom profile input
    const customProfileContainer = createElement('div', {
      style: {
        marginTop: '10px',
        display: 'flex',
        gap: '8px'
      }
    });
    
    const customProfileInput = createElement('input', {
      id: 'spicy-custom-profile-name',
      attributes: {
        type: 'text',
        placeholder: 'Create new profile...',
        'aria-label': 'New profile name'
      },
      style: {
        flexGrow: '1',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--spicy-border)',
        fontSize: '14px'
      }
    });
    
    const createButton = createElement('button', {
      className: 'spicy-btn',
      id: 'spicy-create-profile',
      innerHTML: '<i class="fa-solid fa-plus"></i> Create',
      style: {
        whiteSpace: 'nowrap'
      }
    });
    
    createButton.addEventListener('click', () => {
      this.createNewProfile();
    });
    
    customProfileContainer.appendChild(customProfileInput);
    customProfileContainer.appendChild(createButton);
    
    // Add everything to section
    section.appendChild(profileControls);
    section.appendChild(customProfileContainer);
    
    return section;
  }
  
  /**
   * Populate the profile select dropdown
   * @param {HTMLSelectElement} selectElement - Select element to populate
   */
  populateProfileSelect(selectElement) {
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Get all profiles
    const profiles = this.settings.getProfiles();
    
    // Add each profile as an option
    Object.keys(profiles).forEach(profileName => {
      const option = createElement('option', {
        value: profileName,
        textContent: this.formatProfileName(profileName)
      });
      
      selectElement.appendChild(option);
    });
    
    // Set current profile as selected
    const currentProfile = this.getCurrentProfileName();
    if (currentProfile) {
      selectElement.value = currentProfile;
    } else {
      selectElement.value = 'default';
    }
  }
  
  /**
   * Format profile name for display
   * @param {string} profileName - Profile name
   * @returns {string} Formatted profile name
   */
  formatProfileName(profileName) {
    // Special handling for built-in profiles
    const specialProfiles = {
      default: 'Default',
      highContrast: 'High Contrast',
      dyslexic: 'Dyslexia-friendly',
      senior: 'Senior-friendly',
      lowVision: 'Low Vision',
      motor: 'Motor Disabilities',
      cognitive: 'Cognitive Support'
    };
    
    if (profileName in specialProfiles) {
      return specialProfiles[profileName];
    }
    
    // Regular formatting for custom profiles
    return profileName
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }
  
  /**
   * Get the name of the current profile
   * @returns {string|null} Current profile name or null if none matches
   */
  getCurrentProfileName() {
    const currentSettings = this.settings.getAll();
    const profiles = this.settings.getProfiles();
    
    // Look for a profile that matches current settings
    for (const [profileName, profileSettings] of Object.entries(profiles)) {
      // Check if all settings match
      const allMatch = Object.entries(profileSettings).every(([key, value]) => {
        return currentSettings[key] === value;
      });
      
      if (allMatch) {
        return profileName;
      }
    }
    
    return null;
  }
  
  /**
   * Save current settings as a profile
   */
  saveCurrentProfile() {
    const profileSelect = document.getElementById('spicy-profile-select');
    const selectedProfile = profileSelect.value;
    
    // Check for default profile
    if (selectedProfile === 'default') {
      // Prompt for a new name instead
      const newName = prompt('Cannot overwrite the default profile. Enter a name for your custom profile:');
      if (!newName) return;
      
      // Save as new profile
      const success = this.settings.saveProfile(newName);
      if (success) {
        // Update select element
        this.updateProfileSelect(newName);
        return;
      }
    } else {
      // Confirm overwrite
      const confirm = window.confirm(`Are you sure you want to overwrite the "${this.formatProfileName(selectedProfile)}" profile?`);
      if (!confirm) return;
      
      // Save profile
      this.settings.saveProfile(selectedProfile);
    }
  }
  
  /**
   * Create a new profile
   */
  createNewProfile() {
    const nameInput = document.getElementById('spicy-custom-profile-name');
    const profileName = nameInput.value.trim();
    
    if (!profileName) {
      alert('Please enter a name for your profile');
      return;
    }
    
    // Save as new profile
    const success = this.settings.saveProfile(profileName);
    if (success) {
      // Clear input field
      nameInput.value = '';
      
      // Update select element
      this.updateProfileSelect(profileName);
    }
  }
  
  /**
   * Delete the current profile
   */
  deleteCurrentProfile() {
    const profileSelect = document.getElementById('spicy-profile-select');
    const selectedProfile = profileSelect.value;
    
    // Prevent deleting built-in profiles
    const builtInProfiles = ['default', 'highContrast', 'dyslexic', 'senior', 'lowVision', 'motor', 'cognitive'];
    if (builtInProfiles.includes(selectedProfile)) {
      alert(`Cannot delete the built-in "${this.formatProfileName(selectedProfile)}" profile`);
      return;
    }
    
    // Confirm deletion
    const confirm = window.confirm(`Are you sure you want to delete the "${this.formatProfileName(selectedProfile)}" profile?`);
    if (!confirm) return;
    
    // Delete profile
    const success = this.settings.deleteProfile(selectedProfile);
    if (success) {
      // Update select element and load default profile
      this.settings.loadProfile('default');
      this.updateProfileSelect('default');
    }
  }
  
  /**
   * Update the profile select dropdown
   * @param {string} selectedProfile - Profile to select
   */
  updateProfileSelect(selectedProfile) {
    const profileSelect = document.getElementById('spicy-profile-select');
    
    // Repopulate the dropdown
    this.populateProfileSelect(profileSelect);
    
    // Select the specified profile
    profileSelect.value = selectedProfile;
  }
  
  /**
   * Handle profile loaded event
   * @param {string} profileName - Name of the loaded profile
   */
  handleProfileLoaded(profileName) {
    // Update profile select if it exists
    const profileSelect = document.getElementById('spicy-profile-select');
    if (profileSelect) {
      profileSelect.value = profileName;
    }
  }
  
  /**
   * Handle profile saved event
   * @param {string} profileName - Name of the saved profile
   */
  handleProfileSaved(profileName) {
    // Update profile select if it exists
    const profileSelect = document.getElementById('spicy-profile-select');
    if (profileSelect) {
      this.updateProfileSelect(profileName);
    }
  }
  
  /**
   * Handle profile deleted event
   */
  handleProfileDeleted() {
    // Update profile select if it exists
    const profileSelect = document.getElementById('spicy-profile-select');
    if (profileSelect) {
      this.updateProfileSelect('default');
    }
  }
}