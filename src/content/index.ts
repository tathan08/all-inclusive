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
    inspectElement(message.selector);
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
 * Inspect an element by scrolling to it and highlighting it
 */
let currentHighlightedElement: HTMLElement | null = null;
let currentHighlightInterval: NodeJS.Timeout | null = null;

function inspectElement(selector: string) {
  try {
    // Clear previous highlights
    if (currentHighlightedElement) {
      currentHighlightedElement.style.outline = '';
      currentHighlightedElement.style.outlineOffset = '';
    }
    if (currentHighlightInterval) {
      clearInterval(currentHighlightInterval);
      currentHighlightInterval = null;
    }
    
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
      return;
    }

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const htmlElement = element as HTMLElement;
    currentHighlightedElement = htmlElement;
    
    // Add highlight
    htmlElement.style.outline = '3px solid #667eea';
    htmlElement.style.outlineOffset = '2px';

    // Flash the highlight
    let flashCount = 0;
    currentHighlightInterval = setInterval(() => {
      if (flashCount >= 6) {
        if (currentHighlightInterval) {
          clearInterval(currentHighlightInterval);
          currentHighlightInterval = null;
        }
        htmlElement.style.outline = '';
        htmlElement.style.outlineOffset = '';
        currentHighlightedElement = null;
        return;
      }
      
      htmlElement.style.outline = flashCount % 2 === 0 ? '3px solid #667eea' : '3px solid #764ba2';
      flashCount++;
    }, 200);

    // Store element globally for DevTools access
    (window as any).__ALL_INCLUSIVE_INSPECT_TARGET__ = element;

    // Log to console with inspect capability
    console.log('%c🔍 All-Inclusive: Accessibility Issue Found', 'background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    console.log('Element:', element);
    console.log('Selector:', selector);
    console.log('To inspect in DevTools, the element is stored in: window.__ALL_INCLUSIVE_INSPECT_TARGET__');
    console.log('Or right-click the element above and select "Reveal in Elements panel"');
    console.log('Details:', {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: htmlElement.textContent?.substring(0, 100)
    });
    
    // Try to use inspect() if available (works when DevTools is open)
    if (typeof (window as any).inspect === 'function') {
      (window as any).inspect(element);
    }
  } catch (error) {
    console.error('Error inspecting element:', error);
  }
}

// Log when content script is loaded
console.log('All-Inclusive accessibility checker loaded');
