/**
 * Storage - Handles data persistence
 * Abstracts storage mechanisms (localStorage)
 */

export default class Storage {
  /**
   * Creates a new Storage instance
   * @param {boolean} autoSave - Whether to automatically save settings
   */
  constructor(autoSave = true) {
    this.prefix = 'spicy-';
    this.autoSave = autoSave;
    this.isAvailable = this.checkAvailability();
  }
  
  /**
   * Check if storage is available
   * @returns {boolean} Whether storage is available
   */
  checkAvailability() {
    try {
      const testKey = `${this.prefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('Local storage is not available:', e);
      return false;
    }
  }
  
  /**
   * Get an item from storage
   * @param {string} key - Storage key (without prefix)
   * @returns {string|null} Stored value or null if not found
   */
  getItem(key) {
    if (!this.isAvailable) return null;
    
    try {
      return localStorage.getItem(`${this.prefix}${key}`);
    } catch (e) {
      console.error(`Error retrieving ${key} from storage:`, e);
      return null;
    }
  }
  
  /**
   * Set an item in storage
   * @param {string} key - Storage key (without prefix)
   * @param {string} value - Value to store
   * @returns {boolean} Success indicator
   */
  setItem(key, value) {
    if (!this.isAvailable || !this.autoSave) return false;
    
    try {
      localStorage.setItem(`${this.prefix}${key}`, value);
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      return false;
    }
  }
  
  /**
   * Remove an item from storage
   * @param {string} key - Storage key (without prefix)
   * @returns {boolean} Success indicator
   */
  removeItem(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
      return false;
    }
  }
  
  /**
   * Clear all items with the storage prefix
   * @returns {boolean} Success indicator
   */
  clear() {
    if (!this.isAvailable) return false;
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Error clearing storage:', e);
      return false;
    }
  }
}
