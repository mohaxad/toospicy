/**
 * EventBus - Simple event system
 * Allows modules to communicate without direct dependencies
 */

export default class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const handlers = this.listeners.get(event);
    handlers.add(callback);
    
    // Return unsubscribe function
    return () => {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }
  
  /**
   * Subscribe to an event and unsubscribe after first trigger
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    
    return unsubscribe;
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   * @returns {boolean} Whether the handler was removed
   */
  off(event, callback) {
    const handlers = this.listeners.get(event);
    if (!handlers) return false;
    
    const result = handlers.delete(callback);
    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
    
    return result;
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to handlers
   */
  emit(event, ...args) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(callback => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      });
    }
    
    // Also emit for wildcard listeners
    const wildcardHandlers = this.listeners.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(callback => {
        try {
          callback(event, ...args);
        } catch (e) {
          console.error(`Error in wildcard event handler for ${event}:`, e);
        }
      });
    }
  }
  
  /**
   * Remove all event listeners
   * @param {string} [event] - Optional event name to clear only those listeners
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  
  /**
   * Get the number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    const handlers = this.listeners.get(event);
    return handlers ? handlers.size : 0;
  }
}
