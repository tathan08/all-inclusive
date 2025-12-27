import { AccessibilityRule, Violation, WCAGPrinciple, WCAGLevel, Severity } from '../../types';
import { shouldCheckElement, hasAccessibleName } from '../../utils';

/**
 * Check for form labels and instructions
 * WCAG 3.3.2 - Labels or Instructions (Level A)
 */
export const formLabels: AccessibilityRule = {
  id: 'form-labels',
  name: 'Form inputs must have labels or instructions',
  description: 'All form fields must be properly labeled so users know what information to provide',
  principle: WCAGPrinciple.UNDERSTANDABLE,
  wcagCriteria: '3.3.2',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Check all form inputs (excluding hidden, submit, and button types)
    const inputs = root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), textarea, select');
    
    inputs.forEach((input, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(input)) {
        return;
      }
      
      const id = input.getAttribute('id');
      const type = input.getAttribute('type') || 'text';
      
      let hasLabel = false;
      
      // Check for associated label via for attribute
      if (id) {
        const label = root.querySelector(`label[for="${id}"]`);
        hasLabel = !!label;
      }
      
      // Check if input is wrapped in a label
      const parentLabel = input.closest('label');
      if (parentLabel) {
        hasLabel = true;
      }
      
      // Check if input has aria-label/aria-labelledby but no visible label
      const hasAriaLabel = hasAccessibleName(input);
      
      // Flag inputs with only aria-label as moderate violation (best practice)
      if (!hasLabel && hasAriaLabel) {
        const uniqueId = `violation-${Date.now()}-${index}-aria-only`;
        input.setAttribute('data-violation', uniqueId);
        
        const inputName = input.getAttribute('name') || 'unknown';
        const ariaLabel = input.getAttribute('aria-label') || '';
        
        violations.push({
          id: `form-label-aria-only-${index}`,
          ruleId: 'form-labels',
          principle: WCAGPrinciple.UNDERSTANDABLE,
          wcagCriteria: '3.3.2',
          level: WCAGLevel.A,
          severity: Severity.MODERATE,
          message: 'Form input has aria-label but no visible label',
          description: `This ${type} input (name: "${inputName}") uses aria-label="${ariaLabel}" but lacks a visible label. While screen readers can access this, visible labels benefit all users including those with cognitive disabilities, and provide larger click targets.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: input.outerHTML.substring(0, 200),
          suggestion: 'Add a visible &lt;label&gt; element. You can keep the aria-label as supplementary information if needed.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
        });
        return; // Skip the critical violation check
      }
      
      // Skip if input has accessible name via aria-label/aria-labelledby
      if (!hasLabel && hasAriaLabel) {
        return;
      }
      
      if (!hasLabel) {
        const uniqueId = `violation-${Date.now()}-${index}-no-label`;
        input.setAttribute('data-violation', uniqueId);
        
        const inputName = input.getAttribute('name') || 'unknown';
        
        violations.push({
          id: `form-label-${index}`,
          ruleId: 'form-labels',
          principle: WCAGPrinciple.UNDERSTANDABLE,
          wcagCriteria: '3.3.2',
          level: WCAGLevel.A,
          severity: Severity.CRITICAL,
          message: 'Form input missing label',
          description: `This ${type} input (name: "${inputName}") does not have an associated label. Users, especially those using screen readers, need labels to understand what information to enter.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: input.outerHTML.substring(0, 200),
          suggestion: 'Add a &lt;label&gt; element with a "for" attribute that matches the input\'s id, or wrap the input in a &lt;label&gt;. Alternatively, use aria-label or aria-labelledby.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
        });
      }
    });
    
    return violations;
  },
};

/**
 * Check for proper fieldset and legend usage
 * WCAG 1.3.1 - Info and Relationships (Level A)
 */
export const fieldsetLegend: AccessibilityRule = {
  id: 'fieldset-legend',
  name: 'Related form controls must be grouped',
  description: 'Groups of radio buttons and checkboxes should be contained in a fieldset with a legend',
  principle: WCAGPrinciple.UNDERSTANDABLE,
  wcagCriteria: '1.3.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Find all radio button and checkbox groups by name
    const radioGroups = new Map<string, HTMLInputElement[]>();
    const checkboxGroups = new Map<string, HTMLInputElement[]>();
    
    const radios = root.querySelectorAll('input[type="radio"]');
    const checkboxes = root.querySelectorAll('input[type="checkbox"]');
    
    radios.forEach((radio) => {
      if (!shouldCheckElement(radio)) return;
      
      const name = radio.getAttribute('name');
      if (name) {
        if (!radioGroups.has(name)) {
          radioGroups.set(name, []);
        }
        radioGroups.get(name)!.push(radio as HTMLInputElement);
      }
    });
    
    checkboxes.forEach((checkbox) => {
      if (!shouldCheckElement(checkbox)) return;
      
      const name = checkbox.getAttribute('name');
      if (name) {
        if (!checkboxGroups.has(name)) {
          checkboxGroups.set(name, []);
        }
        checkboxGroups.get(name)!.push(checkbox as HTMLInputElement);
      }
    });
    
    // Check radio groups (groups with 2+ radios should be in fieldset)
    radioGroups.forEach((inputs, name) => {
      if (inputs.length >= 2) {
        // Check if all inputs in the group are within the same fieldset
        const fieldsets = inputs.map(input => input.closest('fieldset'));
        const firstFieldset = fieldsets[0];
        
        // If not all in the same fieldset, or no fieldset at all
        if (!firstFieldset || !fieldsets.every(fs => fs === firstFieldset)) {
          const firstInput = inputs[0];
          const uniqueId = `violation-${Date.now()}-radio-${name}`;
          firstInput.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `fieldset-radio-${name}`,
            ruleId: 'fieldset-legend',
            principle: WCAGPrinciple.UNDERSTANDABLE,
            wcagCriteria: '1.3.1',
            level: WCAGLevel.A,
            severity: Severity.SERIOUS,
            message: `Radio button group "${name}" not in fieldset`,
            description: `This group of ${inputs.length} radio buttons (name: "${name}") is not properly grouped with a &lt;fieldset&gt; and &lt;legend&gt;. Screen reader users may not understand that these options are related.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: firstInput.outerHTML.substring(0, 200),
            suggestion: 'Wrap all radio buttons in this group with a &lt;fieldset&gt; element and add a &lt;legend&gt; that describes the group.',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
          });
        } else if (firstFieldset) {
          // Check if the fieldset has a legend
          const legend = firstFieldset.querySelector('legend');
          if (!legend || !legend.textContent?.trim()) {
            const firstInput = inputs[0];
            const uniqueId = `violation-${Date.now()}-legend-${name}`;
            firstInput.setAttribute('data-violation', uniqueId);
            
            violations.push({
              id: `fieldset-legend-${name}`,
              ruleId: 'fieldset-legend',
              principle: WCAGPrinciple.UNDERSTANDABLE,
              wcagCriteria: '1.3.1',
              level: WCAGLevel.A,
              severity: Severity.SERIOUS,
              message: `Fieldset missing legend for group "${name}"`,
              description: `The &lt;fieldset&gt; containing radio buttons (name: "${name}") does not have a &lt;legend&gt; element or the legend is empty. The legend provides a description of the group for screen reader users.`,
              element: `[data-violation="${uniqueId}"]`,
              htmlSnippet: firstFieldset.outerHTML.substring(0, 200),
              suggestion: 'Add a &lt;legend&gt; element as the first child of the &lt;fieldset&gt; with text that describes what this group of options represents.',
              learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
            });
          }
        }
      }
    });
    
    // Check checkbox groups (only if 3+ checkboxes suggest they should be grouped)
    checkboxGroups.forEach((inputs, name) => {
      if (inputs.length >= 3) {
        const fieldsets = inputs.map(input => input.closest('fieldset'));
        const firstFieldset = fieldsets[0];
        
        if (!firstFieldset || !fieldsets.every(fs => fs === firstFieldset)) {
          const firstInput = inputs[0];
          const uniqueId = `violation-${Date.now()}-checkbox-${name}`;
          firstInput.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `fieldset-checkbox-${name}`,
            ruleId: 'fieldset-legend',
            principle: WCAGPrinciple.UNDERSTANDABLE,
            wcagCriteria: '1.3.1',
            level: WCAGLevel.A,
            severity: Severity.MODERATE,
            message: `Checkbox group "${name}" not in fieldset`,
            description: `This group of ${inputs.length} checkboxes (name: "${name}") should be grouped with a &lt;fieldset&gt; and &lt;legend&gt; for better clarity and accessibility.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: firstInput.outerHTML.substring(0, 200),
            suggestion: 'Consider wrapping related checkboxes with a &lt;fieldset&gt; element and add a &lt;legend&gt; that describes the group.',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
          });
        } else if (firstFieldset) {
          const legend = firstFieldset.querySelector('legend');
          if (!legend || !legend.textContent?.trim()) {
            const firstInput = inputs[0];
            const uniqueId = `violation-${Date.now()}-legend-checkbox-${name}`;
            firstInput.setAttribute('data-violation', uniqueId);
            
            violations.push({
              id: `fieldset-legend-checkbox-${name}`,
              ruleId: 'fieldset-legend',
              principle: WCAGPrinciple.UNDERSTANDABLE,
              wcagCriteria: '1.3.1',
              level: WCAGLevel.A,
              severity: Severity.MODERATE,
              message: `Fieldset missing legend for checkbox group "${name}"`,
              description: `The &lt;fieldset&gt; containing checkboxes (name: "${name}") does not have a &lt;legend&gt; element or the legend is empty.`,
              element: `[data-violation="${uniqueId}"]`,
              htmlSnippet: firstFieldset.outerHTML.substring(0, 200),
              suggestion: 'Add a &lt;legend&gt; element as the first child of the &lt;fieldset&gt; with text that describes what this group represents.',
              learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
            });
          }
        }
      }
    });
    
    return violations;
  },
};

/**
 * Check for required field indicators
 * WCAG 3.3.2 - Labels or Instructions (Level A)
 */
export const requiredFields: AccessibilityRule = {
  id: 'required-fields',
  name: 'Required fields must be clearly indicated',
  description: 'Required form fields must be programmatically indicated and not rely solely on visual cues',
  principle: WCAGPrinciple.UNDERSTANDABLE,
  wcagCriteria: '3.3.2',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    
    // Find inputs that have visual indicators of being required (like asterisk or "required" text)
    // but don't have proper programmatic indication
    const inputs = root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), textarea, select');
    
    inputs.forEach((input, index) => {
      if (!shouldCheckElement(input)) return;
      
      const hasRequiredAttribute = input.hasAttribute('required');
      const hasAriaRequired = input.getAttribute('aria-required') === 'true';
      
      // Check if there's a visual indicator of required (asterisk, "required" text, etc.)
      const id = input.getAttribute('id');
      let labelText = '';
      
      if (id) {
        const label = root.querySelector(`label[for="${id}"]`);
        labelText = label?.textContent?.trim() || '';
      } else {
        const parentLabel = input.closest('label');
        labelText = parentLabel?.textContent?.trim() || '';
      }
      
      // Look for common visual required indicators in label
      const hasVisualRequired = /\*|required|mandatory|obligatory/i.test(labelText);
      
      // If there's a visual indicator but no programmatic indication
      if (hasVisualRequired && !hasRequiredAttribute && !hasAriaRequired) {
        const uniqueId = `violation-${Date.now()}-${index}-required`;
        input.setAttribute('data-violation', uniqueId);
        
        const inputName = input.getAttribute('name') || 'unknown';
        const type = input.getAttribute('type') || input.tagName.toLowerCase();
        
        violations.push({
          id: `required-field-${index}`,
          ruleId: 'required-fields',
          principle: WCAGPrinciple.UNDERSTANDABLE,
          wcagCriteria: '3.3.2',
          level: WCAGLevel.A,
          severity: Severity.SERIOUS,
          message: 'Required field not programmatically indicated',
          description: `This ${type} input (name: "${inputName}") appears to be required based on its label ("${labelText.substring(0, 50)}..."), but does not have the required attribute or aria-required="true". Screen reader users may not know this field is required.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: input.outerHTML.substring(0, 200),
          suggestion: 'Add the "required" attribute to the input element, or use aria-required="true". This ensures screen readers announce that the field is required.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
        });
      }
    });
    
    return violations;
  },
};

export default [formLabels, fieldsetLegend, requiredFields];
