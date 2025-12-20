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
let spotlightActive = false;

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

    const htmlElement = element as HTMLElement;

    // Check if element is already in view
    const rect = htmlElement.getBoundingClientRect();
    const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

    // Function to create the spotlight
    const createSpotlight = () => {
      // Clean up any existing spotlight elements first
      cleanupSpotlight();
      
      // Create dark overlay
      const overlay = document.createElement('div');
      overlay.id = 'all-inclusive-spotlight-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);

      // Get element position and dimensions after scroll
      const currentRect = htmlElement.getBoundingClientRect();
      
      // Create bounding box around the element
      const boundingBox = document.createElement('div');
      boundingBox.id = 'all-inclusive-bounding-box';
      boundingBox.style.cssText = `
        position: fixed;
        top: ${currentRect.top - 4}px;
        left: ${currentRect.left - 4}px;
        width: ${currentRect.width + 8}px;
        height: ${currentRect.height + 8}px;
        border: 3px solid #667eea;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5),
                    0 0 20px rgba(102, 126, 234, 0.8),
                    inset 0 0 20px rgba(102, 126, 234, 0.3);
        border-radius: 4px;
        z-index: 1000000;
        pointer-events: none;
        box-sizing: border-box;
      `;

      document.body.appendChild(boundingBox);
      spotlightActive = true;
    };

    // If element is already in view, create spotlight immediately
    if (isInView) {
      createSpotlight();
    } else {
      // Scroll element into view first
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Track if spotlight has been created
      let spotlightCreated = false;

      // Listen for scrollend event (modern browsers)
      const scrollEndHandler = () => {
        if (!spotlightCreated) {
          spotlightCreated = true;
          createSpotlight();
        }
        document.removeEventListener('scrollend', scrollEndHandler);
      };

      // Fallback timeout in case scrollend doesn't fire
      const timeoutId = setTimeout(() => {
        if (!spotlightCreated) {
          spotlightCreated = true;
          createSpotlight();
        }
      }, 800);

      // Check if scrollend is supported
      if ('onscrollend' in window) {
        document.addEventListener('scrollend', scrollEndHandler);
      } else {
        // Fallback: use multiple requestAnimationFrame to ensure scroll is done
        let lastScrollTop = (window as Window).pageYOffset || document.documentElement.scrollTop;
        let stableCount = 0;
        
        const checkScroll = () => {
          if (spotlightCreated) return;
          
          const currentScrollTop = (window as Window).pageYOffset || document.documentElement.scrollTop;
          
          if (Math.abs(currentScrollTop - lastScrollTop) < 1) {
            stableCount++;
            if (stableCount >= 3) {
              clearTimeout(timeoutId);
              spotlightCreated = true;
              createSpotlight();
              return;
            }
          } else {
            stableCount = 0;
          }
          
          lastScrollTop = currentScrollTop;
          requestAnimationFrame(checkScroll);
        };
        
        requestAnimationFrame(checkScroll);
      }
    }

    console.log('%c🔦 All-Inclusive: Spotlight Active', 'background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    console.log('Element:', element);
    console.log('Click "Spotlight element" again to turn off spotlight mode');
  } catch (error) {
    console.error('Error toggling spotlight:', error);
  }
}

// Clean up spotlight elements when toggled off
function cleanupSpotlight() {
  // Remove overlay by ID
  const overlay = document.getElementById('all-inclusive-spotlight-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Remove bounding box by ID
  const boundingBox = document.getElementById('all-inclusive-bounding-box');
  if (boundingBox) {
    boundingBox.remove();
  }
  
  spotlightActive = false;
}

// Log when content script is loaded
console.log('All-Inclusive accessibility checker loaded');
