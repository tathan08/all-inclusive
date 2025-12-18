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

export default [keyboardAccessible, linkPurpose, bypassBlocks];
