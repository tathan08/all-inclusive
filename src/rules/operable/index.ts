import { AccessibilityRule, Violation, WCAGPrinciple, WCAGLevel, Severity } from '../../types';
import { getElementSelector, shouldCheckElement, hasAccessibleName } from '../../utils';

/**
 * Check for keyboard accessibility
 * WCAG 2.1.1 - Keyboard (Level A)
 */
export const keyboardAccessible: AccessibilityRule = {
  id: 'keyboard-accessible',
  name: 'Interactive elements must be keyboard accessible',
  description: 'All functionality must be operable through a keyboard interface',
  principle: WCAGPrinciple.OPERABLE,
  wcagCriteria: '2.1.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Check for clickable divs/spans without keyboard support
    const clickableElements = root.querySelectorAll('[onclick], [ng-click], [v-on\\:click]');
    
    clickableElements.forEach((element, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(element)) {
        return;
      }
      
      const tagName = element.tagName.toLowerCase();
      const tabindex = element.getAttribute('tabindex');
      const role = element.getAttribute('role');
      
      // If it's not a naturally focusable element and doesn't have tabindex
      if (!['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) {
        if (tabindex === null || parseInt(tabindex) < 0) {
          const uniqueId = `violation-${Date.now()}-${index}`;
          element.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `keyboard-${index}`,
            ruleId: 'keyboard-accessible',
            principle: WCAGPrinciple.OPERABLE,
            wcagCriteria: '2.1.1',
            level: WCAGLevel.A,
            severity: Severity.SERIOUS,
            message: 'Interactive element not keyboard accessible',
            description: `This ${tagName} element has click handlers but cannot be accessed via keyboard.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: element.outerHTML.substring(0, 200),
            suggestion: `Add tabindex="0" and appropriate keyboard event handlers, or use a <button> element instead.`,
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
          });
        }
      }
    });
    
    // Also check for elements with React onClick handlers (cursor: pointer style)
    // React onClick doesn't create onclick attributes, so we detect by cursor style
    const cursorPointerElements = root.querySelectorAll('div, span');
    cursorPointerElements.forEach((element, index) => {
      // Skip if element should not be checked
      if (!shouldCheckElement(element)) {
        return;
      }
      
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const tagName = element.tagName.toLowerCase();
      const tabindex = element.getAttribute('tabindex');
      
      // Check if has pointer cursor (common for clickable React elements)
      if (computedStyle.cursor === 'pointer') {
        // If it's not naturally focusable and doesn't have proper tabindex
        if (tabindex === null || parseInt(tabindex) < 0) {
          // Avoid duplicates from the earlier check
          if (!element.hasAttribute('data-violation')) {
            const uniqueId = `violation-${Date.now()}-react-${index}`;
            element.setAttribute('data-violation', uniqueId);
            
            violations.push({
              id: `keyboard-react-${index}`,
              ruleId: 'keyboard-accessible',
              principle: WCAGPrinciple.OPERABLE,
              wcagCriteria: '2.1.1',
              level: WCAGLevel.A,
              severity: Severity.SERIOUS,
              message: 'Interactive element not keyboard accessible',
              description: `This ${tagName} element appears to be clickable (cursor: pointer) but cannot be accessed via keyboard.`,
              element: `[data-violation="${uniqueId}"]`,
              htmlSnippet: element.outerHTML.substring(0, 200),
              suggestion: `Add tabindex="0" and onKeyDown/onKeyUp handlers for Enter and Space keys, or use a <button> element instead.`,
              learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
            });
          }
        }
      }
    });

    return violations;
  },
};

/**
 * Check for proper link text
 * WCAG 2.4.4 - Link Purpose (In Context) (Level A)
 */
export const linkPurpose: AccessibilityRule = {
  id: 'link-purpose',
  name: 'Links must have descriptive text',
  description: 'Link text should clearly describe the link\'s destination or purpose',
  principle: WCAGPrinciple.OPERABLE,
  wcagCriteria: '2.4.4',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    const links = root.querySelectorAll('a[href]');
    
    const vagueTexts = ['click here', 'read more', 'more', 'here', 'link', 'this'];
    
    links.forEach((link, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(link)) {
        return;
      }
      
      const text = (link.textContent || '').trim().toLowerCase();
      
      // Skip if link already has accessible name via aria-label/aria-labelledby
      if (!text && hasAccessibleName(link)) {
        return;
      }
      
      if (!text && !hasAccessibleName(link)) {
        const uniqueId = `violation-${Date.now()}-${index}-empty`;
        link.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `link-empty-${index}`,
          ruleId: 'link-purpose',
          principle: WCAGPrinciple.OPERABLE,
          wcagCriteria: '2.4.4',
          level: WCAGLevel.A,
          severity: Severity.SERIOUS,
          message: 'Link has no text',
          description: 'This link has no visible text or aria-label, making it impossible for screen reader users to understand its purpose.',
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: link.outerHTML.substring(0, 200),
          suggestion: 'Add descriptive text inside the link or use aria-label to describe where the link leads.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
        });
      } else if (vagueTexts.includes(text) && !hasAccessibleName(link)) {
        const uniqueId = `violation-${Date.now()}-${index}-vague`;
        link.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `link-vague-${index}`,
          ruleId: 'link-purpose',
          principle: WCAGPrinciple.OPERABLE,
          wcagCriteria: '2.4.4',
          level: WCAGLevel.A,
          severity: Severity.MODERATE,
          message: 'Link has vague text',
          description: `The link text "${text}" is not descriptive enough. Users should be able to understand where the link leads from the text alone.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: link.outerHTML.substring(0, 200),
          suggestion: 'Use more descriptive link text that indicates the destination or purpose of the link.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
        });
      }
    });

    return violations;
  },
};

/**
 * Check for skip navigation links
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 */
export const bypassBlocks: AccessibilityRule = {
  id: 'bypass-blocks',
  name: 'Page should have skip navigation link',
  description: 'Pages should provide a way to skip repeated content blocks',
  principle: WCAGPrinciple.OPERABLE,
  wcagCriteria: '2.4.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Only check pages that have significant navigation structures
    // A page needs skip links when it has:
    // - A <nav> element with multiple links, OR
    // - A header with a navigation menu (multiple links in header)
    const navElement = root.querySelector('nav');
    const hasNavigation = navElement && navElement.querySelectorAll('a').length > 3;
    
    const headerElement = root.querySelector('header');
    const hasHeaderNav = headerElement && headerElement.querySelectorAll('nav, a').length > 3;
    
    if (!hasNavigation && !hasHeaderNav) {
      return violations; // No significant navigation to bypass
    }
    
    // Check for skip links
    const skipLink = root.querySelector('a[href^="#"]:first-of-type');
    const hasSkipLink = skipLink && (
      (skipLink.textContent || '').toLowerCase().includes('skip') ||
      (skipLink.getAttribute('aria-label') || '').toLowerCase().includes('skip')
    );
    
    if (!hasSkipLink) {
      violations.push({
        id: 'skip-link-missing',
        ruleId: 'bypass-blocks',
        principle: WCAGPrinciple.OPERABLE,
        wcagCriteria: '2.4.1',
        level: WCAGLevel.A,
        severity: Severity.MODERATE,
        message: 'Page is missing skip navigation link',
        description: 'The page does not appear to have a "skip to main content" link. This makes it harder for keyboard users to bypass repetitive navigation.',
        element: 'body',
        htmlSnippet: '<body>',
        suggestion: 'Add a "Skip to main content" link at the beginning of the page that links to the main content area.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html',
      });
    }

    return violations;
  },
};

/**
 * Check for proper focus order and tabindex usage
 * WCAG 2.4.3 - Focus Order (Level A)
 */
export const focusOrder: AccessibilityRule = {
  id: 'focus-order',
  name: 'Focus order must be logical and tabindex used properly',
  description: 'Tabindex should not have positive values, and focusable elements should not be hidden',
  principle: WCAGPrinciple.OPERABLE,
  wcagCriteria: '2.4.3',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Check all elements with tabindex attribute
    const elementsWithTabindex = root.querySelectorAll('[tabindex]');
    
    elementsWithTabindex.forEach((element, index) => {
      const tabindexValue = element.getAttribute('tabindex');
      const tabindexNum = parseInt(tabindexValue || '0', 10);
      const tagName = element.tagName.toLowerCase();
      const computedStyle = window.getComputedStyle(element as HTMLElement);
      
      // Check for focusable but hidden elements FIRST (before shouldCheckElement)
      // This is important because hidden elements should be flagged if they're focusable
      if (tabindexNum >= 0) {
        const isHidden = 
          computedStyle.display === 'none' || 
          computedStyle.visibility === 'hidden' ||
          parseFloat(computedStyle.opacity) === 0;
        
        if (isHidden) {
          const uniqueId = `violation-${Date.now()}-${index}-hidden`;
          element.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `focus-hidden-focusable-${index}`,
            ruleId: 'focus-order',
            principle: WCAGPrinciple.OPERABLE,
            wcagCriteria: '2.4.3',
            level: WCAGLevel.A,
            severity: Severity.MODERATE,
            message: 'Focusable element is hidden',
            description: `This ${tagName} element has tabindex="${tabindexValue}" but is visually hidden (display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}). This can confuse keyboard users who tab to invisible elements.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: element.outerHTML.substring(0, 200),
            suggestion: 'Either remove the tabindex attribute to make it unfocusable, or make the element visible. If it needs to be visually hidden but accessible, use CSS that keeps it in the accessibility tree (e.g., position: absolute with clip).',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
          });
          return; // Skip other checks for this element
        }
      }
      
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(element)) {
        return;
      }
      
      // Check for positive tabindex (bad practice)
      if (tabindexNum > 0) {
        const uniqueId = `violation-${Date.now()}-${index}-positive`;
        element.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `focus-positive-tabindex-${index}`,
          ruleId: 'focus-order',
          principle: WCAGPrinciple.OPERABLE,
          wcagCriteria: '2.4.3',
          level: WCAGLevel.A,
          severity: Severity.SERIOUS,
          message: `Element has positive tabindex="${tabindexNum}"`,
          description: `This ${tagName} element has tabindex="${tabindexNum}". Positive tabindex values disrupt the natural tab order and are considered bad practice. They make it difficult for keyboard users to navigate predictably.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: element.outerHTML.substring(0, 200),
          suggestion: 'Remove the tabindex attribute if this is a naturally focusable element, or change to tabindex="0" to include it in the natural tab order without disrupting the sequence.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
        });
      }
      
      // Check for negative tabindex on native interactive elements
      const nativeInteractive = ['a', 'button', 'input', 'select', 'textarea'];
      if (tabindexNum === -1 && nativeInteractive.includes(tagName)) {
        // Only flag if it's not a skip link or intentionally hidden for accessibility
        const text = (element.textContent || '').toLowerCase();
        const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
        const isSkipLink = text.includes('skip') || ariaLabel.includes('skip');
        
        if (!isSkipLink) {
          const uniqueId = `violation-${Date.now()}-${index}-negative`;
          element.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `focus-negative-native-${index}`,
            ruleId: 'focus-order',
            principle: WCAGPrinciple.OPERABLE,
            wcagCriteria: '2.4.3',
            level: WCAGLevel.A,
            severity: Severity.MINOR,
            message: 'Native interactive element removed from tab order',
            description: `This ${tagName} element has tabindex="-1", which removes it from the keyboard tab order. Native interactive elements like links and buttons should normally be keyboard accessible.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: element.outerHTML.substring(0, 200),
            suggestion: 'Remove the tabindex="-1" attribute to restore keyboard accessibility, unless this element is intentionally meant to be programmatically focused only (e.g., for focus management in modals or dynamic content).',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
          });
        }
      }
    });
    
    return violations;
  },
};

export default [keyboardAccessible, linkPurpose, bypassBlocks, focusOrder];
