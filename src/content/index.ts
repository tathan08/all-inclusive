import { ScanResult, Violation, WCAGPrinciple, MessageType, Severity } from '../types';
import perceivableRules from '../rules/perceivable';
import operableRules from '../rules/operable';
import robustRules from '../rules/robust';

// Combine all rules
const allRules = [...perceivableRules, ...operableRules, ...robustRules];

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle ping to check if content script is ready
  if (message.type === 'PING') {
    sendResponse({ status: 'ready' });
    return true;
  }
  
  if (message.type === MessageType.SCAN_PAGE) {
    const result = scanPage();
    sendResponse(result);
  }
  
  if (message.type === 'INSPECT_ELEMENT') {
    toggleSpotlight(message.selector);
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

/**
 * Scan the current page for accessibility violations
 */
function scanPage(): ScanResult {
  console.log('Starting accessibility scan...');
  
  // Clear all previous violation attributes from the last scan
  const previousViolations = document.querySelectorAll('[data-violation]');
  previousViolations.forEach(element => {
    element.removeAttribute('data-violation');
  });
  
  const violations: Violation[] = [];
  
  // Run all accessibility rules
  allRules.forEach(rule => {
    try {
      const ruleViolations = rule.check(document);
      violations.push(...ruleViolations);
      console.log(`${rule.name}: ${ruleViolations.length} violations found`);
    } catch (error) {
      console.error(`Error running rule ${rule.id}:`, error);
    }
  });
  
  // Calculate summary statistics
  const summary = {
    total: violations.length,
    critical: violations.filter(v => v.severity === Severity.CRITICAL).length,
    serious: violations.filter(v => v.severity === Severity.SERIOUS).length,
    moderate: violations.filter(v => v.severity === Severity.MODERATE).length,
    minor: violations.filter(v => v.severity === Severity.MINOR).length,
    byPrinciple: {
      [WCAGPrinciple.PERCEIVABLE]: violations.filter(v => v.principle === WCAGPrinciple.PERCEIVABLE).length,
      [WCAGPrinciple.OPERABLE]: violations.filter(v => v.principle === WCAGPrinciple.OPERABLE).length,
      [WCAGPrinciple.UNDERSTANDABLE]: violations.filter(v => v.principle === WCAGPrinciple.UNDERSTANDABLE).length,
      [WCAGPrinciple.ROBUST]: violations.filter(v => v.principle === WCAGPrinciple.ROBUST).length,
    },
  };
  
  const result: ScanResult = {
    url: window.location.href,
    timestamp: Date.now(),
    violations,
    summary,
  };
  
  console.log('Scan complete:', summary);
  
  return result;
}

/**
 * Toggle spotlight mode on an element
 */
let spotlightOverlay: HTMLDivElement | null = null;
let spotlightBoundingBox: HTMLDivElement | null = null;
let spotlightActive = false;
let currentSpotlightElement: HTMLElement | null = null;

function toggleSpotlight(selector: string) {
  try {
    // If spotlight is already active, turn it off
    if (spotlightActive) {
      cleanupSpotlight();
      return;
    }

    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
      return;
    }

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const htmlElement = element as HTMLElement;
    currentSpotlightElement = htmlElement;

    // Create dark overlay
    spotlightOverlay = document.createElement('div');
    spotlightOverlay.id = 'all-inclusive-spotlight-overlay';
    spotlightOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      pointer-events: none;
    `;

    // Get element position and dimensions
    const rect = htmlElement.getBoundingClientRect();
    
    // Create bounding box around the element
    spotlightBoundingBox = document.createElement('div');
    spotlightBoundingBox.id = 'all-inclusive-bounding-box';
    spotlightBoundingBox.style.cssText = `
      position: fixed;
      top: ${rect.top - 4}px;
      left: ${rect.left - 4}px;
      width: ${rect.width + 8}px;
      height: ${rect.height + 8}px;
      border: 3px solid #667eea;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5),
                  0 0 20px rgba(102, 126, 234, 0.8),
                  inset 0 0 20px rgba(102, 126, 234, 0.3);
      border-radius: 4px;
      z-index: 1000000;
      pointer-events: none;
      box-sizing: border-box;
    `;

    document.body.appendChild(spotlightOverlay);
    document.body.appendChild(spotlightBoundingBox);

    spotlightActive = true;

    console.log('%c🔦 All-Inclusive: Spotlight Active', 'background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    console.log('Element:', element);
    console.log('Click "Spotlight element" again to turn off spotlight mode');
  } catch (error) {
    console.error('Error toggling spotlight:', error);
  }
}

// Clean up spotlight elements when toggled off
function cleanupSpotlight() {
  if (spotlightOverlay) {
    spotlightOverlay.remove();
    spotlightOverlay = null;
  }
  
  if (spotlightBoundingBox) {
    spotlightBoundingBox.remove();
    spotlightBoundingBox = null;
  }
  
  spotlightActive = false;
  currentSpotlightElement = null;
}

// Log when content script is loaded
console.log('All-Inclusive accessibility checker loaded');
