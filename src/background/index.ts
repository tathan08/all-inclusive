/**
 * Background service worker for All-Inclusive extension
 * Handles extension lifecycle and coordination between components
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('All-Inclusive extension installed');
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoScan: false,
        showMinorIssues: true,
        targetLevel: 'AA',
      },
    });
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // Pass through messages or handle coordination logic here
  // For now, content script directly responds to popup
  
  return true;
});

// Log when service worker starts
console.log('Background service worker started');
