import { AccessibilityRule, Violation, WCAGPrinciple, WCAGLevel, Severity } from '../../types';
import { getElementSelector, shouldCheckElement, hasAccessibleName } from '../../utils';

/**
 * Check for valid HTML structure
 * WCAG 4.1.1 - Parsing (Level A)
 */
export const validHTML: AccessibilityRule = {
  id: 'valid-html',
  name: 'HTML must be well-formed',
  description: 'HTML should be properly structured with valid markup',
  principle: WCAGPrinciple.ROBUST,
  wcagCriteria: '4.1.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Check for duplicate IDs
    const idsMap = new Map<string, Element[]>();
    const elementsWithId = root.querySelectorAll('[id]');
    
    elementsWithId.forEach(element => {
      const id = element.getAttribute('id');
      if (id) {
        // Skip elements that should not be checked (hidden, aria-hidden, etc.)
        if (!shouldCheckElement(element)) {
          return;
        }
        
        if (!idsMap.has(id)) {
          idsMap.set(id, []);
        }
        idsMap.get(id)!.push(element);
      }
    });
    
    idsMap.forEach((elements, id) => {
      if (elements.length > 1) {
        // Only create one violation per duplicate ID (not one per element)
        // This is better for dynamically generated content
        const firstElement = elements[0];
        const uniqueId = `violation-${Date.now()}-${id}`;
        firstElement.setAttribute('data-violation', uniqueId);
        
        // Collect all element selectors for the description
        const elementLocations = elements.map((el, idx) => {
          const tag = el.tagName.toLowerCase();
          const classes = el.className ? `.${el.className}` : '';
          return `${idx + 1}. <${tag}${classes}>`;
        }).join(', ');
        
        violations.push({
          id: `duplicate-id-${id}`,
          ruleId: 'valid-html',
          principle: WCAGPrinciple.ROBUST,
          wcagCriteria: '4.1.1',
          level: WCAGLevel.A,
          severity: Severity.SERIOUS,
          message: `Duplicate ID: "${id}"`,
          description: `The ID "${id}" is used ${elements.length} times on the page. IDs must be unique. Found in: ${elementLocations}`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: firstElement.outerHTML.substring(0, 200),
          suggestion: 'Ensure each ID is used only once per page. Consider using classes for styling multiple elements, or add unique suffixes to dynamically generated IDs.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/parsing.html',
        });
      }
    });

    return violations;
  },
};

/**
 * Check for proper ARIA usage
 * WCAG 4.1.2 - Name, Role, Value (Level A)
 */
export const ariaUsage: AccessibilityRule = {
  id: 'aria-usage',
  name: 'ARIA attributes must be used correctly',
  description: 'ARIA roles, states, and properties must be valid and properly used',
  principle: WCAGPrinciple.ROBUST,
  wcagCriteria: '4.1.2',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Check for buttons without accessible names
    const buttons = root.querySelectorAll('button, [role="button"]');
    buttons.forEach((button, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(button)) {
        return;
      }
      
      const text = (button.textContent || '').trim();
      
      // Check if button has inner elements with accessible names
      const hasInnerAccessibleContent = 
        button.querySelector('img[alt]') || 
        button.querySelector('[aria-label]') ||
        button.querySelector('[aria-labelledby]');
      
      // Button is accessible if it has:
      // 1. Visible text content
      // 2. aria-label or aria-labelledby (checked via hasAccessibleName)
      // 3. Inner elements with accessible content
      if (text || hasAccessibleName(button) || hasInnerAccessibleContent) {
        return;
      }
      
      const uniqueId = `violation-${Date.now()}-button-${index}`;
      button.setAttribute('data-violation', uniqueId);
      
      violations.push({
        id: `button-no-name-${index}`,
        ruleId: 'aria-usage',
        principle: WCAGPrinciple.ROBUST,
        wcagCriteria: '4.1.2',
        level: WCAGLevel.A,
        severity: Severity.CRITICAL,
        message: 'Button has no accessible name',
        description: 'This button has no visible text or aria-label, making it impossible for screen readers to announce its purpose.',
        element: `[data-violation="${uniqueId}"]`,
        htmlSnippet: button.outerHTML.substring(0, 200),
        suggestion: 'Add visible text inside the button, or use aria-label to provide an accessible name.',
        learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
      });
    });
    
    // Check form inputs for labels
    const inputs = root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    inputs.forEach((input, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(input)) {
        return;
      }
      
      const id = input.getAttribute('id');
      
      let hasLabel = false;
      
      if (id) {
        const label = root.querySelector(`label[for="${id}"]`);
        hasLabel = !!label;
      }
      
      const parentLabel = input.closest('label');
      if (parentLabel) {
        hasLabel = true;
      }
      
      // Skip if input has accessible name via aria-label/aria-labelledby
      if (!hasLabel && hasAccessibleName(input)) {
        return;
      }
      
      if (!hasLabel && !hasAccessibleName(input)) {
        const uniqueId = `violation-${Date.now()}-input-${index}`;
        input.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `input-no-label-${index}`,
          ruleId: 'aria-usage',
          principle: WCAGPrinciple.ROBUST,
          wcagCriteria: '4.1.2',
          level: WCAGLevel.A,
          severity: Severity.CRITICAL,
          message: 'Form input has no label',
          description: 'This form input does not have an associated label, making it difficult for screen reader users to understand what information to provide.',
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: input.outerHTML.substring(0, 200),
          suggestion: 'Add a <label> element associated with this input using the "for" attribute, or use aria-label.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
        });
      }
    });

    return violations;
  },
};

export default [validHTML, ariaUsage];
