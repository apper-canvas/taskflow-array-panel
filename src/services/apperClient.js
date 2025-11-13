/**
 * ApperClient singleton service
 * Ensures only one instance of ApperClient is created
 */
class ApperClientSingleton {
  constructor() {
    this._client = null;
    this._isInitializing = false;
  }

  getInstance() {
    if (this._client) {
      return this._client;
    }

    if (this._isInitializing) {
      return null;
    }

    try {
      this._isInitializing = true;
      
      // Check if SDK is loaded
      if (!window.ApperSDK) {
        console.warn('ApperSDK not loaded yet');
        this._isInitializing = false;
        return null;
      }

      const { ApperClient } = window.ApperSDK;
      
      this._client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      this._isInitializing = false;
      return this._client;
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
      this._isInitializing = false;
      return null;
    }
  }

  reset() {
    this._client = null;
    this._isInitializing = false;
  }
}

// Create singleton instance
const apperClientSingleton = new ApperClientSingleton();

/**
 * Get the singleton ApperClient instance
 * @returns {ApperClient|null} The ApperClient instance or null if not available
 */
export const getApperClient = () => {
  return apperClientSingleton.getInstance();
};

/**
 * Reset the singleton (useful for testing or reinitialization)
 */
export const resetApperClient = () => {
  apperClientSingleton.reset();
};